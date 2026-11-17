const STORAGE_KEY = "wicked-roots-workboard-v1";
const EMPTY_DATA = { jobs: [], leads: [] };
let data = loadData();
let shownMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedDate = toDateInput(new Date());

function loadData() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!stored || !Array.isArray(stored.jobs) || !Array.isArray(stored.leads)) return structuredClone(EMPTY_DATA);
    return { jobs: stored.jobs, leads: stored.leads };
  } catch {
    return structuredClone(EMPTY_DATA);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  renderAll();
}

function toDateInput(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function safeText(value) {
  return String(value || "");
}

function renderAll() {
  renderCalendar();
  renderDayJobs();
  renderLeads();
  renderStats();
}

function renderCalendar() {
  const calendar = document.querySelector("#calendar");
  calendar.replaceChildren();
  const label = document.querySelector("#month-label");
  label.textContent = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(shownMonth);

  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((day) => {
    const heading = document.createElement("div");
    heading.className = "weekday";
    heading.setAttribute("role", "columnheader");
    heading.textContent = day;
    calendar.append(heading);
  });

  const firstDay = new Date(shownMonth.getFullYear(), shownMonth.getMonth(), 1);
  const offset = firstDay.getDay();
  const today = toDateInput(new Date());
  for (let i = 0; i < 42; i += 1) {
    const date = new Date(shownMonth.getFullYear(), shownMonth.getMonth(), i - offset + 1);
    const dateKey = toDateInput(date);
    const cell = document.createElement("div");
    cell.className = "day-cell";
    cell.setAttribute("role", "gridcell");
    cell.setAttribute("tabindex", "0");
    cell.setAttribute("aria-label", new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(date));
    if (date.getMonth() !== shownMonth.getMonth()) cell.classList.add("outside");
    if (dateKey === today) cell.classList.add("today");
    if (dateKey === selectedDate) cell.classList.add("selected");
    cell.addEventListener("click", () => {
      selectedDate = dateKey;
      document.querySelector('#job-form [name="date"]').value = dateKey;
      renderCalendar();
      renderDayJobs();
    });
    cell.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        cell.click();
      }
    });

    const number = document.createElement("span");
    number.className = "day-number";
    number.textContent = date.getDate();
    cell.append(number);
    data.jobs.filter((job) => job.date === dateKey).sort((a, b) => safeText(a.time).localeCompare(safeText(b.time))).slice(0, 3).forEach((job) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "job-chip";
      chip.textContent = `${job.time ? `${job.time} ` : ""}${job.title}`;
      chip.title = "Edit this job";
      chip.addEventListener("click", (event) => {
        event.stopPropagation();
        editJob(job.id);
      });
      cell.append(chip);
    });
    const extra = data.jobs.filter((job) => job.date === dateKey).length - 3;
    if (extra > 0) {
      const more = document.createElement("span");
      more.className = "hint";
      more.textContent = `+${extra} more`;
      cell.append(more);
    }
    calendar.append(cell);
  }
}

function renderDayJobs() {
  const list = document.querySelector("#day-jobs");
  list.replaceChildren();
  const selected = new Date(`${selectedDate}T12:00:00`);
  document.querySelector("#day-jobs-heading").textContent = `Jobs · ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(selected)}`;
  const jobs = data.jobs.filter((job) => job.date === selectedDate).sort((a, b) => safeText(a.time).localeCompare(safeText(b.time)));
  if (!jobs.length) {
    list.append(emptyState("No jobs on this date yet. Select a date in the calendar and add a job."));
    return;
  }
  jobs.forEach((job) => {
    const item = document.createElement("article");
    item.className = "job-item";
    const time = document.createElement("div");
    time.className = "job-time";
    time.textContent = job.time || "Any time";
    const details = document.createElement("div");
    const title = document.createElement("div");
    title.className = "job-title";
    title.textContent = job.title;
    const meta = document.createElement("div");
    meta.className = "job-meta";
    meta.textContent = [job.customer, job.address, job.service, job.assigned ? `Assigned: ${job.assigned}` : "", job.notes].filter(Boolean).join(" · ");
    details.append(title, meta);
    const actions = document.createElement("div");
    actions.className = "item-actions";
    actions.append(actionButton("Edit", () => editJob(job.id)), actionButton("Delete", () => deleteJob(job.id), true));
    item.append(time, details, actions);
    list.append(item);
  });
}

function emptyState(message) {
  const element = document.createElement("div");
  element.className = "empty-state";
  element.textContent = message;
  return element;
}

function actionButton(label, action, danger = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `text-button${danger ? " danger" : ""}`;
  button.textContent = label;
  button.addEventListener("click", action);
  return button;
}

function renderLeads() {
  const list = document.querySelector("#lead-list");
  list.replaceChildren();
  const query = document.querySelector("#lead-search").value.trim().toLowerCase();
  const filter = document.querySelector("#lead-filter").value;
  const leads = data.leads.filter((lead) => {
    const matchesText = [lead.name, lead.email, lead.phone, lead.source, lead.notes].some((value) => safeText(value).toLowerCase().includes(query));
    return matchesText && (filter === "all" || lead.status === filter);
  }).sort((a, b) => safeText(a.followUp).localeCompare(safeText(b.followUp)));

  if (!leads.length) {
    list.append(emptyState(data.leads.length ? "No leads match your search or status filter." : "No leads yet. Add a relevant referral or business contact using the form."));
    return;
  }
  leads.forEach((lead) => {
    const card = document.createElement("article");
    card.className = "lead-card";
    const content = document.createElement("div");
    const name = document.createElement("h3");
    name.className = "lead-name";
    name.textContent = lead.name;
    const source = document.createElement("div");
    source.className = "lead-company";
    source.textContent = lead.source ? `Source: ${lead.source}` : "Source not recorded";
    const details = document.createElement("div");
    details.className = "lead-details";
    if (lead.email) {
      const email = document.createElement("a");
      email.href = `mailto:${encodeURIComponent(lead.email)}`;
      email.textContent = lead.email;
      details.append(email);
    }
    if (lead.phone) {
      const phone = document.createElement("a");
      phone.href = `tel:${lead.phone.replace(/[^\d+]/g, "")}`;
      phone.textContent = lead.phone;
      details.append(phone);
    }
    if (lead.followUp) {
      const due = document.createElement("span");
      due.textContent = `Follow up: ${lead.followUp}`;
      details.append(due);
    }
    content.append(name, source, details);
    if (lead.notes) {
      const notes = document.createElement("p");
      notes.className = "lead-notes";
      notes.textContent = lead.notes;
      content.append(notes);
    }
    const controls = document.createElement("div");
    controls.className = "lead-actions";
    const status = document.createElement("select");
    status.setAttribute("aria-label", `Status for ${lead.name}`);
    ["New", "Contacted", "Follow-up", "Estimate", "Won", "Closed"].forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      option.selected = lead.status === value;
      status.append(option);
    });
    status.addEventListener("change", () => {
      lead.status = status.value;
      saveData();
    });
    controls.append(status);
    if (lead.email) controls.append(actionButton("Draft email", () => draftEmail(lead)));
    controls.append(actionButton("Edit", () => editLead(lead.id)), actionButton("Delete", () => deleteLead(lead.id), true));
    card.append(content, controls);
    list.append(card);
  });
}

function renderStats() {
  const monthJobs = data.jobs.filter((job) => job.date && job.date.startsWith(`${shownMonth.getFullYear()}-${String(shownMonth.getMonth() + 1).padStart(2, "0")}`)).length;
  const openLeads = data.leads.filter((lead) => !["Won", "Closed"].includes(lead.status)).length;
  const today = toDateInput(new Date());
  const due = data.leads.filter((lead) => lead.followUp && lead.followUp <= today && !["Won", "Closed"].includes(lead.status)).length;
  document.querySelector("#jobs-count").textContent = monthJobs;
  document.querySelector("#leads-count").textContent = openLeads;
  document.querySelector("#followups-count").textContent = due;
  document.querySelector("#today-label").textContent = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(new Date());
}

function resetJobForm() {
  const form = document.querySelector("#job-form");
  form.reset();
  form.elements.id.value = "";
  form.elements.date.value = selectedDate;
  document.querySelector("#job-form-heading").textContent = "Add a job";
  document.querySelector("#job-submit").textContent = "Add to schedule";
  document.querySelector("#job-cancel").classList.add("hidden");
}

function editJob(id) {
  const job = data.jobs.find((item) => item.id === id);
  if (!job) return;
  const form = document.querySelector("#job-form");
  Object.entries(job).forEach(([key, value]) => {
    if (form.elements[key]) form.elements[key].value = value;
  });
  selectedDate = job.date;
  shownMonth = new Date(`${job.date}T12:00:00`);
  document.querySelector("#job-form-heading").textContent = "Edit job";
  document.querySelector("#job-submit").textContent = "Save changes";
  document.querySelector("#job-cancel").classList.remove("hidden");
  renderCalendar();
  renderDayJobs();
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

function deleteJob(id) {
  if (!window.confirm("Delete this scheduled job?")) return;
  data.jobs = data.jobs.filter((job) => job.id !== id);
  saveData();
  resetJobForm();
}

function resetLeadForm() {
  const form = document.querySelector("#lead-form");
  form.reset();
  form.elements.id.value = "";
  document.querySelector("#lead-form-heading").textContent = "Add a lead";
  document.querySelector("#lead-submit").textContent = "Save lead";
  document.querySelector("#lead-cancel").classList.add("hidden");
}

function editLead(id) {
  const lead = data.leads.find((item) => item.id === id);
  if (!lead) return;
  const form = document.querySelector("#lead-form");
  Object.entries(lead).forEach(([key, value]) => {
    if (form.elements[key]) form.elements[key].value = value;
  });
  document.querySelector("#lead-form-heading").textContent = "Edit lead";
  document.querySelector("#lead-submit").textContent = "Save changes";
  document.querySelector("#lead-cancel").classList.remove("hidden");
  form.scrollIntoView({ behavior: "smooth", block: "center" });
}

function deleteLead(id) {
  if (!window.confirm("Delete this lead?")) return;
  data.leads = data.leads.filter((lead) => lead.id !== id);
  saveData();
  resetLeadForm();
}

function draftEmail(lead) {
  const subject = `Landscaping project in Raleigh — ${lead.name}`;
  const body = `Hi ${lead.name},\n\nI’m Raphael with Wicked Roots Landscape in Raleigh. I’m reaching out about landscaping services for local properties. If you have an upcoming project that may be a fit, would it be useful to discuss the scope and whether an estimate makes sense?\n\nIf this isn’t relevant, let me know and I won’t follow up.\n\nBest,\nRaphael\nWicked Roots Landscape\n(919) 780-9603\nwickedrootslandscaping@gmail.com\n\nPlease review and personalize this draft before sending. Add any legally required business mailing address. Contact only relevant prospects through appropriate channels and honor opt-outs.`;
  window.location.href = `mailto:${encodeURIComponent(lead.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

document.querySelector("#job-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const fields = Object.fromEntries(new FormData(form).entries());
  const existing = data.jobs.find((job) => job.id === fields.id);
  const job = { ...fields, id: fields.id || makeId() };
  if (existing) Object.assign(existing, job);
  else data.jobs.push(job);
  selectedDate = job.date;
  shownMonth = new Date(`${job.date}T12:00:00`);
  saveData();
  resetJobForm();
});

document.querySelector("#lead-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const fields = Object.fromEntries(new FormData(form).entries());
  const existing = data.leads.find((lead) => lead.id === fields.id);
  const lead = { ...fields, id: fields.id || makeId() };
  if (existing) Object.assign(existing, lead);
  else data.leads.push(lead);
  saveData();
  resetLeadForm();
});

document.querySelector("#prev-month").addEventListener("click", () => { shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() - 1, 1); renderAll(); });
document.querySelector("#next-month").addEventListener("click", () => { shownMonth = new Date(shownMonth.getFullYear(), shownMonth.getMonth() + 1, 1); renderAll(); });
document.querySelector("#today-button").addEventListener("click", () => { const today = new Date(); shownMonth = new Date(today.getFullYear(), today.getMonth(), 1); selectedDate = toDateInput(today); document.querySelector('#job-form [name="date"]').value = selectedDate; renderAll(); });
document.querySelector("#job-cancel").addEventListener("click", resetJobForm);
document.querySelector("#lead-cancel").addEventListener("click", resetLeadForm);
document.querySelector("#lead-search").addEventListener("input", renderLeads);
document.querySelector("#lead-filter").addEventListener("change", renderLeads);

document.querySelector("#export-button").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ...data }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `wicked-roots-workboard-${toDateInput(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

document.querySelector("#import-file").addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    if (!Array.isArray(parsed.jobs) || !Array.isArray(parsed.leads)) throw new Error("This file doesn't look like a workboard backup.");
    if (!window.confirm("Importing replaces the data saved in this browser. Export a backup first if you need to keep it. Continue?")) return;
    data = {
      jobs: parsed.jobs.filter((item) => item && typeof item === "object" && item.date && item.title).map((item) => ({ ...item, id: item.id || makeId() })),
      leads: parsed.leads.filter((item) => item && typeof item === "object" && item.name).map((item) => ({ ...item, id: item.id || makeId() })),
    };
    saveData();
    window.alert("Workboard backup imported.");
  } catch (error) {
    window.alert(`Could not import that file: ${error.message}`);
  } finally {
    event.target.value = "";
  }
});

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  // No service worker: keep this static prototype simple and avoid caching customer-entered records.
}
document.querySelector('#job-form [name="date"]').value = selectedDate;
renderAll();
