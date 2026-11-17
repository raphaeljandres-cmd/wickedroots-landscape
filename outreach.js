const KEY = "wicked-roots-outreach-v1";
const STATUSES = ["New", "Contacted", "Follow-up", "Estimate", "Won", "Closed"];
let state = readState();
const $ = (selector) => document.querySelector(selector);
const form = $("#lead-form");

function readState() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "null");
    return value && Array.isArray(value.leads) && Array.isArray(value.drafts) ? value : { leads: [], drafts: [] };
  } catch { return { leads: [], drafts: [] }; }
}
function save() { localStorage.setItem(KEY, JSON.stringify(state)); render(); }
function id() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }
function node(tag, className, text) { const el = document.createElement(tag); if (className) el.className = className; if (text !== undefined) el.textContent = text; return el; }
function button(text, fn, danger = false) { const el = node("button", `text-button${danger ? " danger" : ""}`, text); el.type = "button"; el.addEventListener("click", fn); return el; }
function localDate(date = new Date()) { return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }

function renderLeads() {
  const list = $("#lead-list"); list.replaceChildren();
  const query = $("#search").value.trim().toLowerCase(); const filter = $("#status-filter").value;
  const leads = state.leads.filter((lead) => (filter === "all" || lead.status === filter) && [lead.name, lead.email, lead.phone, lead.source, lead.context].some((value) => String(value || "").toLowerCase().includes(query)));
  if (!leads.length) { list.append(node("div", "empty", state.leads.length ? "No leads match your search." : "No leads yet. Add a referral or relevant public business contact.")); return; }
  leads.sort((a, b) => String(a.followUp || "9999").localeCompare(String(b.followUp || "9999"))).forEach((lead) => {
    const card = node("article", "lead-card"); const content = node("div");
    content.append(node("h3", "lead-name", lead.name));
    const meta = node("div", "lead-meta");
    if (lead.email) { const a = node("a", "", lead.email); a.href = `mailto:${encodeURIComponent(lead.email)}`; meta.append(a); }
    if (lead.phone) { const a = node("a", "", lead.phone); a.href = `tel:${lead.phone.replace(/[^\d+]/g, "")}`; meta.append(a); }
    if (lead.source) meta.append(node("span", "", `Source: ${lead.source}`));
    if (lead.followUp) meta.append(node("span", "", `Follow-up: ${lead.followUp}`));
    content.append(meta);
    if (lead.context) content.append(node("p", "lead-context", lead.context));
    const tools = node("div", "lead-tools"); const status = document.createElement("select"); status.setAttribute("aria-label", `Status for ${lead.name}`);
    STATUSES.forEach((value) => { const option = node("option", "", value); option.value = value; option.selected = lead.status === value; status.append(option); });
    status.addEventListener("change", () => { lead.status = status.value; save(); });
    tools.append(status, button("Draft email", () => { $("#draft-lead").value = lead.id; $("#draft-form").scrollIntoView({ behavior: "smooth", block: "center" }); }));
    tools.append(button("Edit", () => editLead(lead.id)), button("Delete", () => deleteLead(lead.id), true));
    card.append(content, tools); list.append(card);
  });
}

function renderLeadOptions() {
  const select = $("#draft-lead"); const previous = select.value; select.replaceChildren();
  const prompt = node("option", "", "Choose a lead with an email"); prompt.value = ""; select.append(prompt);
  state.leads.filter((lead) => lead.email && !["Won", "Closed"].includes(lead.status)).forEach((lead) => { const option = node("option", "", `${lead.name} — ${lead.email}`); option.value = lead.id; select.append(option); });
  if ([...select.options].some((option) => option.value === previous)) select.value = previous;
}

function renderQueue() {
  const list = $("#queue-list"); list.replaceChildren();
  const pending = state.drafts.filter((draft) => draft.status === "Needs review").length;
  $("#pending-count").textContent = pending;
  const drafts = $("#queue-filter").value === "pending" ? state.drafts.filter((draft) => draft.status === "Needs review") : state.drafts;
  if (!drafts.length) { list.append(node("div", "empty", state.drafts.length ? "No drafts need review." : "No email drafts yet. Create one above from a lead.")); return; }
  [...drafts].reverse().forEach((draft) => {
    const card = node("article", "draft-card");
    const top = node("div", "draft-top"); const info = node("div");
    info.append(node("strong", "", draft.leadName)); info.append(node("div", "draft-recipient", draft.email));
    top.append(info, node("span", `draft-state${draft.status === "Approved — opened in email" ? " approved" : ""}`, draft.status)); card.append(top);
    const subjectLabel = node("label", "", "Subject"); const subject = document.createElement("input"); subject.value = draft.subject; subject.maxLength = 180; subjectLabel.append(subject);
    const bodyLabel = node("label", "", "Message — edit to ensure all details are accurate"); const body = document.createElement("textarea"); body.value = draft.body; body.maxLength = 5000; bodyLabel.append(body);
    card.append(subjectLabel, bodyLabel);
    const actions = node("div", "draft-actions");
    const saveDraft = () => { draft.subject = subject.value.trim(); draft.body = body.value; save(); };
    const saveButton = node("button", "button quiet", "Save edits"); saveButton.type = "button"; saveButton.addEventListener("click", saveDraft); actions.append(saveButton);
    if (draft.status === "Needs review") {
      const approve = node("button", "button", "Approve & open email"); approve.type = "button"; approve.addEventListener("click", () => {
        if (!subject.value.trim() || !body.value.trim()) { window.alert("Add a subject and message before approval."); return; }
        if (!window.confirm(`Approve this message to ${draft.email}? This opens your email app; you must review it and press Send there.`)) return;
        draft.subject = subject.value.trim(); draft.body = body.value; draft.status = "Approved — opened in email"; draft.approvedAt = new Date().toISOString(); save();
        window.location.href = `mailto:${encodeURIComponent(draft.email)}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
        window.alert("Your email app should open. Review the recipient and message, then press Send yourself. If it did not open, use your email app to send the approved draft.");
      }); actions.append(approve);
    }
    const remove = node("button", "text-button danger", "Delete draft"); remove.type = "button"; remove.addEventListener("click", () => { if (window.confirm("Delete this email draft?")) { state.drafts = state.drafts.filter((item) => item.id !== draft.id); save(); } }); actions.append(remove);
    card.append(actions); list.append(card);
  });
}

function render() {
  renderLeads(); renderLeadOptions(); renderQueue();
  const today = localDate(); $("#due-count").textContent = state.leads.filter((lead) => lead.followUp && lead.followUp <= today && !["Won", "Closed"].includes(lead.status)).length;
}
function editLead(leadId) {
  const lead = state.leads.find((item) => item.id === leadId); if (!lead) return;
  Object.entries(lead).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; });
  $("#lead-form-title").textContent = "Edit lead"; $("#lead-save").textContent = "Save changes"; $("#lead-cancel").classList.remove("hidden"); form.scrollIntoView({ behavior: "smooth", block: "center" });
}
function resetForm() { form.reset(); form.elements.id.value = ""; $("#lead-form-title").textContent = "Add a lead"; $("#lead-save").textContent = "Save lead"; $("#lead-cancel").classList.add("hidden"); }
function deleteLead(leadId) { if (!window.confirm("Delete this lead and keep its existing email drafts?")) return; state.leads = state.leads.filter((lead) => lead.id !== leadId); save(); resetForm(); }

form.addEventListener("submit", (event) => {
  event.preventDefault(); const fields = Object.fromEntries(new FormData(form).entries());
  const existing = state.leads.find((lead) => lead.id === fields.id);
  const lead = { ...fields, id: fields.id || id(), status: fields.status || "New" };
  if (existing) Object.assign(existing, lead); else state.leads.push(lead);
  save(); resetForm();
});
$("#lead-cancel").addEventListener("click", resetForm);
$("#search").addEventListener("input", renderLeads);
$("#status-filter").addEventListener("change", renderLeads);
$("#queue-filter").addEventListener("change", renderQueue);

$("#draft-form").addEventListener("submit", (event) => {
  event.preventDefault(); const fields = Object.fromEntries(new FormData(event.currentTarget).entries());
  const lead = state.leads.find((item) => item.id === fields.leadId);
  if (!lead || !lead.email) { window.alert("Choose a lead with an email address."); return; }
  const context = fields.context.trim() || lead.context.trim();
  const subject = `Landscaping help for ${lead.name}`;
  const personalization = context ? `I’m reaching out because ${context.replace(/[.!?]+$/, "")}.` : "I’m reaching out to introduce my local landscaping business.";
  const body = `Hi ${lead.name},\n\nI’m Raphael with Wicked Roots Landscape in Raleigh. ${personalization}\n\nI offer ${fields.service.trim()}. If you have an upcoming project that may be a fit, would it be useful to discuss the scope and whether an estimate makes sense?\n\nIf this isn’t relevant, please let me know and I won’t follow up.\n\nBest,\nRaphael\nWicked Roots Landscape\n(919) 780-9603\nwickedrootslandscaping@gmail.com\n\n[Review this draft. Add any legally required business mailing address before sending.]`;
  state.drafts.push({ id: id(), leadId: lead.id, leadName: lead.name, email: lead.email, subject, body, status: "Needs review", createdAt: new Date().toISOString() });
  event.currentTarget.reset(); save(); $("#queue-filter").value = "pending"; renderQueue(); $("#queue-list").scrollIntoView({ behavior: "smooth", block: "start" });
});

render();
