import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const input = await request.json();
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim().toLowerCase();
  if (!name || name.length > 100) return NextResponse.json({ error: "Enter a lead name (100 characters max)." }, { status: 400 });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  const { data, error } = await supabase.from("leads").insert({ user_id: user.id, name, email: email || null, source: String(input.source ?? "").slice(0, 200), context: String(input.context ?? "").slice(0, 1000), follow_up: input.follow_up || null, status: "New" }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ lead: data }, { status: 201 });
}
