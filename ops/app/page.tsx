import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CartoonlandNav from "./cartoonland-nav";
import IslandWorkshop from "./island-workshop";
import Workboard from "./workboard";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <><section className="cartoonland-shell" id="island-map"><IslandWorkshop /><CartoonlandNav /></section><Workboard email={user.email ?? ""} /></>;
}
