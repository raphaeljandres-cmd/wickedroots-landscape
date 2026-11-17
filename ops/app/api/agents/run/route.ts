import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type AgentLog = { user_id: string; lead_id: string; agent_name: string; status: string; summary: string; output: Record<string, unknown> };
async function callAgent(system: string, userPrompt: string) {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured in the server environment.");
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", temperature: 0.3, response_format: { type: "json_object" }, messages: [{ role: "system", content: system }, { role: "user", content: userPrompt }] }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message || "AI provider request failed.");
  const content = result.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI provider returned an empty response.");
  return JSON.parse(content) as Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const input = await request.json();
  const leadId = String(input.leadId ?? ""); const service = String(input.service ?? "").trim().slice(0, 160); const extraContext = String(input.context ?? "").trim().slice(0, 1000);
  if (!leadId || !service) return NextResponse.json({ error: "Choose a lead and a service you actually provide." }, { status: 400 });
  const { data: lead, error: leadError } = await supabase.from("leads").select("*").eq("id", leadId).eq("user_id", user.id).single();
  if (leadError || !lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  if (!lead.email) return NextResponse.json({ error: "This lead needs an email before an outreach draft can be created." }, { status: 400 });

  const log = async (agent_name: string, summary: string, output: Record<string, unknown>, status = "completed") => {
    const row: AgentLog = { user_id: user.id, lead_id: lead.id, agent_name, status, summary, output };
    const { error } = await supabase.from("agent_runs").insert(row);
    if (error) console.error("Could not persist agent activity", error.message);
  };
  try {
    const verifiedContext = [lead.context, extraContext].filter(Boolean).join("\n");
    const qualifier = await callAgent("You are the lead-fit reviewer for a small landscaping business. Analyze only supplied facts. Never invent research, credentials, prior contact, a site visit, or business needs. Return JSON: {fit: 'possible'|'unclear'|'poor', reason: string, cautions: string[]}. Be conservative. This is a draft-assistance workflow, not permission to contact.", JSON.stringify({ business: lead.name, source: lead.source, verified_context: verifiedContext, service }));
    await log("1 · Lead fit reviewer", `${String(qualifier.fit || "unclear")}: ${String(qualifier.reason || "Reviewed supplied context only.")}`, qualifier);

    const email = await callAgent("You write one concise, respectful, individually personalized business email for Wicked Roots Landscape in Raleigh. Use only supplied facts. No fabricated observations or relationship. Clearly identify sender. Do not imply consent or urgency. Return JSON {subject:string, body:string}. Include a polite no-pressure close. Never send the email.", JSON.stringify({ business: lead.name, recipient: lead.email, supplied_context: verifiedContext, service, fit_review: qualifier, signature: "Raphael, Wicked Roots Landscape, (919) 780-9603, wickedrootslandscaping@gmail.com" }));
    const subject = String(email.subject ?? "").slice(0, 180); const body = String(email.body ?? "").slice(0, 5000);
    if (!subject || !body) throw new Error("Email writer did not return a usable subject and body.");
    await log("2 · Email writer", `Drafted a message for ${lead.name}; waiting for owner review.`, { subject, body });

    const review = await callAgent("You are a conservative outreach safety reviewer. Check only the supplied draft. Flag unsupported claims, false personalization, deceptive subject, pressure, or missing opt-out-respectful language. Return JSON {safe_to_review:boolean, issues:string[], suggested_body:string}. This is not legal advice. Never send. If a concern exists, preserve the draft but explain it.", JSON.stringify({ source_context: verifiedContext, subject, body }));
    await log("3 · Outreach safety reviewer", review.safe_to_review ? "Reviewed draft; owner still must verify facts and approve." : `Flagged for owner attention: ${Array.isArray(review.issues) ? review.issues.join("; ") : "review recommended"}`, review, review.safe_to_review ? "completed" : "needs_attention");

    const { data: draft, error: draftError } = await supabase.from("email_drafts").insert({ user_id: user.id, lead_id: lead.id, lead_name: lead.name, recipient: lead.email, subject, body, status: "pending_approval", review_notes: review }).select().single();
    if (draftError) throw new Error(draftError.message);
    return NextResponse.json({ draftId: draft.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Agent workflow failed.";
    await log("Agent workflow", message, {}, "failed");
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
