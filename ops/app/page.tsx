import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Workboard from "./workboard";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <Workboard email={user.email ?? ""} />;
}
