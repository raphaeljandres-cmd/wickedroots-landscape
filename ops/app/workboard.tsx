"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Lead = { id: string; name: string; email: string | null; phone: string | null; source: string | null; context: string | null; status: string; follow_up: string | null; created_at: string };
type Draft = { id: string; lead_id: string; lead_name: string; recipient: string; subject: string; body: string; status: string; created_at: string };
type Run = { id: string; agent_name: string; status: string; summary: string; created_at: string };
type Data = { leads: Lead[]; drafts: Draft[]; runs: Run[] };

export default function Workboard({ email }: { email: string }) {
  const [data, setData] = useState<Data>({ leads: [], drafts: [], runs: [] });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState("");
  const [service, setService] = useState("");
  const [context, setContext] = useState("");

  const refresh = useCallback(async () => {
    const response = await fetch("/api/workboard", { cache: "no-store" });
    if (!response.ok) { setError((await response.json()).error || "Could not load workboard."); return; }
    const result = await response.json() as Data;
    setData(result);
    setSelected((current) => current || result.leads.find((lead) => lead.email && !["Won", "Closed"].includes(lead.status))?.id || "");
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  async function addLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form.entries())) });
    const result = await response.json();
    if (!response.ok) { setError(result.error || "Could not save lead."); return; }
    event.currentTarget.reset(); setNotice("Lead saved."); await refresh();
  }

  async function runAgents(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected || !service) return;
    setBusy(true); setError(""); setNotice("Agents are working through qualification, email drafting, and safety review…");
    const response = await fetch("/api/agents/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId: selected, service, context }) });
    const result = await response.json(); setBusy(false);
    if (!response.ok) setError(result.error || "Agent workflow failed.");
    else setNotice("Draft added to the approval queue. Review it before sending.");
    await refresh();
  }

  async function updateDraft(draft: Draft, action: "save" | "send" | "reject", subject?: string, body?: string) {
    setError("");
    if (action === "send" && !window.confirm(`Approve this email to ${draft.recipient}? It will be sent now from the configured business email account.`)) return;
    const response = await fetch(`/api/drafts/${draft.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, subject, body }) });
    const result = await response.json();
    if (!response.ok) setError(result.error || "Draft action failed.");
    else setNotice(action === "send" ? "Approved email sent and logged." : action === "reject" ? "Draft rejected." : "Draft saved.");
    await refresh();
  }

  const visibleLeads = data.leads.filter((lead) => (filter === "all" || lead.status === filter) && [lead.name, lead.email, lead.source, lead.context].some((value) => (value || "").toLowerCase().includes(search.toLowerCase())));
  const pending = data.drafts.filter((draft) => draft.status === "pending_approval");
  const due = data.leads.filter((lead) => lead.follow_up && lead.follow_up <= new Date().toISOString().slice(0, 10) && !["Won", "Closed"].includes(lead.status)).length;

  return <>
    <header className="topbar"><a className="brand" href="/"><span className="brand-mark">W</span><span><small>WICKED ROOTS</small><strong>OPS WORKSPACE</strong></span></a><div className="user-actions"><span>{email}</span><button className="link-button" onClick={async () => { await createClient().auth.signOut(); window.location.href = "/login"; }}>Sign out</button><a href="https://github.com/raphaeljandres-cmd/wickedroots-landscape" target="_blank" rel="noreferrer">Website repo ↗</a></div></header>
    <main className="wrap">
      <section className="hero"><div><p className="eyebrow">PRIVATE OWNER WORKSPACE · RALEIGH, NC</p><h1>Good work, <em>well organized.</em></h1><p className="muted">Run visible AI specialists on leads you provide, review their work, and approve each email before it sends.</p></div><div className="stats"><div><span>LEADS</span><strong>{data.leads.length}</strong></div><div><span>NEEDS APPROVAL</span><strong>{pending.length}</strong></div><div><span>FOLLOW-UPS DUE</span><strong>{due}</strong></div></div></section>
      <div className="notice"><strong>Owner-controlled:</strong> Agents only process leads you add. No autonomous web scraping or bulk outreach. Emails send only after you click Approve & send and confirm. Configure private Supabase, OpenAI, and Resend credentials before use; see <code>ops/README.md</code>.</div>
      {notice && <p className="notice success" role="status">{notice}</p>}{error && <p className="notice error" role="alert">{error}</p>}
      <div className="main-grid">
        <section className="panel"><div className="panel-heading"><div><p className="eyebrow">PROSPECTS</p><h2>Lead board</h2></div><div className="filters"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search leads" aria-label="Search leads" /><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All statuses</option>{["New","Contacted","Follow-up","Estimate","Won","Closed"].map((status) => <option key={status}>{status}</option>)}</select></div></div>
          <form onSubmit={addLead} className="form lead-form"><h3>Add a lead</h3><div className="two-col"><label>Business/contact<input name="name" required maxLength={100} /></label><label>Public business email<input name="email" type="email" /></label></div><div className="two-col"><label>Source<input name="source" placeholder="Referral or public business source" /></label><label>Follow-up<input name="follow_up" type="date" /></label></div><label>Verified reason it may be a fit<textarea name="context" rows={2} placeholder="Truthful detail you confirmed; never invent a relationship or site visit." /></label><button className="button">Save lead</button></form>
          <div className="lead-list">{visibleLeads.length ? visibleLeads.map((lead) => <article className={`lead-card ${selected === lead.id ? "chosen" : ""}`} key={lead.id}><div><strong>{lead.name}</strong><span className="status">{lead.status}</span><p>{lead.email || "No email"} · {lead.source || "Source not recorded"}</p>{lead.context && <small>{lead.context}</small>}</div><div className="lead-controls"><button className="link-button" onClick={() => setSelected(lead.id)}>Use for agents</button><select aria-label={`Set status for ${lead.name}`} value={lead.status} onChange={async (event) => { await fetch(`/api/leads/${lead.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: event.target.value }) }); await refresh(); }}>{["New","Contacted","Follow-up","Estimate","Won","Closed"].map((status) => <option key={status}>{status}</option>)}</select></div></article>) : <p className="empty">Add a lead to start. Use relevant referrals or appropriate public business contacts.</p>}</div>
        </section>
        <aside className="right-column">
          <section className="panel agent-panel"><p className="eyebrow">VISIBLE SPECIALIST WORKFLOW</p><h2>Run the agents</h2><p className="muted small">A three-stage AI workflow on one lead: fit reviewer → email writer → compliance reviewer. Results and activity are logged below.</p><form onSubmit={runAgents} className="form"><label>Lead<select value={selected} onChange={(event) => setSelected(event.target.value)} required><option value="">Choose a lead</option>{data.leads.filter((lead) => lead.email && !["Won","Closed"].includes(lead.status)).map((lead) => <option key={lead.id} value={lead.id}>{lead.name}</option>)}</select></label><label>Service you actually provide<input value={service} onChange={(event) => setService(event.target.value)} required placeholder="e.g. planting-bed refresh" /></label><label>Extra verified context<textarea value={context} onChange={(event) => setContext(event.target.value)} rows={2} placeholder="Optional accurate detail" /></label><button className="button" disabled={busy || !selected}>{busy ? "Agents working…" : "Run 3 specialist agents"}</button></form></section>
          <section className="panel activity-panel"><div className="panel-heading"><div><p className="eyebrow">OBSERVABILITY</p><h2>Agent activity</h2></div></div>{data.runs.length ? data.runs.map((run) => <article className="activity" key={run.id}><span className={`run-dot ${run.status}`} /><div><strong>{run.agent_name}</strong><p>{run.summary}</p><small>{new Date(run.created_at).toLocaleString()}</small></div></article>) : <p className="empty">No agent runs yet. Add a lead, then run the specialists to watch their logged work appear here.</p>}</section>
        </aside>
      </div>
      <section className="panel queue"><div className="panel-heading"><div><p className="eyebrow">HUMAN APPROVAL REQUIRED</p><h2>Approval queue <span className="count">{pending.length}</span></h2><p className="muted small">Edit and review each draft. Approve & send requires confirmation and sends through your configured Resend account.</p></div></div>{pending.length ? pending.map((draft) => <DraftCard key={draft.id} draft={draft} onAction={updateDraft} />) : <p className="empty">No drafts are waiting. Run the agents to create a draft for review.</p>}</section>
      <footer>Private workspace starter · Leads and agent runs are isolated by Supabase row-level security.</footer>
    </main>
  </>;
}

function DraftCard({ draft, onAction }: { draft: Draft; onAction: (draft: Draft, action: "save" | "send" | "reject", subject?: string, body?: string) => Promise<void> }) {
  const [subject, setSubject] = useState(draft.subject); const [body, setBody] = useState(draft.body);
  return <article className="draft-card"><div className="draft-head"><strong>{draft.lead_name}</strong><span>To: {draft.recipient}</span></div><label>Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={180} /></label><label>Message<textarea rows={8} value={body} onChange={(event) => setBody(event.target.value)} maxLength={5000} /></label><div className="button-row"><button className="button quiet" onClick={() => void onAction(draft,"save",subject,body)}>Save edits</button><button className="button" onClick={() => void onAction(draft,"send",subject,body)}>Approve & send</button><button className="link-button danger" onClick={() => void onAction(draft,"reject")}>Reject</button></div></article>;
}
