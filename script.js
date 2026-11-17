document.addEventListener("DOMContentLoaded", () => {
  const year = document.querySelector("#current-year");
  if (year) year.textContent = new Date().getFullYear();

  const form = document.querySelector("#estimate-form");
  const status = document.querySelector("#form-status");
  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const subject = `Landscape project inquiry — ${data.get("location")}`;
    const body = [
      `Name: ${data.get("name")}`,
      `Email: ${data.get("email")}`,
      `Phone: ${data.get("phone") || "Not provided"}`,
      `Project type: ${data.get("project-type")}`,
      `Project location: ${data.get("location")}`,
      "",
      "Project details:",
      data.get("message"),
    ].join("\n");

    status.textContent = "Your email app should open with your project details. Send that email to complete your inquiry.";
    window.location.href = `mailto:wickedrootslandscaping@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
});
