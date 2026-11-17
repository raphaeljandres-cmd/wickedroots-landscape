"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) });
    setBusy(false);
    if (error) setMessage(error.message); else window.location.href = "/";
  }
  return <main className="login-wrap"><div className="login-card"><p className="eyebrow">WICKED ROOTS LANDSCAPE</p><h1>Private workboard</h1><p className="muted">Sign in to manage leads and review outreach drafts.</p><form onSubmit={submit} className="form"><label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required /></label><button className="button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>{message && <p className="error" role="alert">{message}</p>}</form><p className="small muted">Create the first owner account from Supabase Authentication, then sign in here.</p></div></main>;
}
