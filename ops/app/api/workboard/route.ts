import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [leads, drafts, runs] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase.from("email_drafts").select("*").order("created_at", { ascending: false }),
    supabase.from("agent_runs").select("*").order("created_at", { ascending: false }).limit(30),
  ]);
  const failed = [leads, drafts, runs].find((result) => result.error);
  if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 500 });
  return NextResponse.json({ leads: leads.data ?? [], drafts: drafts.data ?? [], runs: runs.data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}
