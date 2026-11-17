import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const input = await request.json(); const action = String(input.action ?? "");
  const { data: draft, error: fetchError } = await supabase.from("email_drafts").select("*").eq("id", params.id).eq("user_id", user.id).single();
  if (fetchError || !draft) return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  if (draft.status !== "pending_approval") return NextResponse.json({ error: "This draft is no longer awaiting approval." }, { status: 409 });

  if (action === "save") {
    const subject = String(input.subject ?? "").trim(); const body = String(input.body ?? "").trim();
    if (!subject || !body || subject.length > 180 || body.length > 5000) return NextResponse.json({ error: "Subject and message are required (within length limits)." }, { status: 400 });
    const { error } = await supabase.from("email_drafts").update({ subject, body }).eq("id", draft.id).eq("user_id", user.id).eq("status", "pending_approval");
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }
  if (action === "reject") {
    const { error } = await supabase.from("email_drafts").update({ status: "rejected" }).eq("id", draft.id).eq("user_id", user.id).eq("status", "pending_approval");
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  }
  if (action !== "send" || input.confirmed !== true) return NextResponse.json({ error: "Explicit owner approval is required." }, { status: 400 });
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return NextResponse.json({ error: "Email sending is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL on the server." }, { status: 503 });
  const subject = String(input.subject ?? "").trim(); const body = String(input.body ?? "").trim();
  if (!subject || !body || subject.length > 180 || body.length > 5000) return NextResponse.json({ error: "Review and provide a valid subject and message." }, { status: 400 });

  // Transition first to prevent concurrent duplicate sends. On provider failure, status remains approved_failed for manual review.
  const { data: approved, error: approveError } = await supabase.from("email_drafts").update({ status: "sending", subject, body, approved_at: new Date().toISOString() }).eq("id", draft.id).eq("user_id", user.id).eq("status", "pending_approval").select().single();
  if (approveError || !approved) return NextResponse.json({ error: "Draft was already changed; refresh before retrying." }, { status: 409 });

  try {
    const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL, to: [draft.recipient], subject, text: body }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Email provider rejected the send.");
    await supabase.from("email_drafts").update({ status: "sent", sent_at: new Date().toISOString(), provider_id: result.id ?? null }).eq("id", draft.id).eq("user_id", user.id);
    await supabase.from("agent_runs").insert({ user_id: user.id, lead_id: draft.lead_id, agent_name: "Owner approval · Email delivery", status: "completed", summary: `Owner-approved message sent to ${draft.recipient}.`, output: { provider_id: result.id ?? null } });
    await supabase.from("leads").update({ status: "Contacted", last_contacted_at: new Date().toISOString() }).eq("id", draft.lead_id).eq("user_id", user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email send failed.";
    await supabase.from("email_drafts").update({ status: "approved_failed", error_message: message }).eq("id", draft.id).eq("user_id", user.id);
    return NextResponse.json({ error: `Send failed; draft marked for manual review: ${message}` }, { status: 502 });
  }
}
