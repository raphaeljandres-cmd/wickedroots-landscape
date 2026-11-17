import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
const ALLOWED = ["New", "Contacted", "Follow-up", "Estimate", "Won", "Closed"];

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { status } = await request.json();
  if (!ALLOWED.includes(status)) return NextResponse.json({ error: "Invalid lead status." }, { status: 400 });
  const { error } = await supabase.from("leads").update({ status }).eq("id", params.id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
