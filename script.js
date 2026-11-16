// Configure this with the real business inbox before publishing.
const BUSINESS_EMAIL = "wickedrootslandscaping@gmail.com";

document.addEventListener("DOMContentLoaded", () => {
  const year = document.querySelector("#current-year");
  if (year) year.textContent = new Date().getFullYear();

  const form = document.querySelector("#estimate-form");
  const status = document.querySelector("#form-status");
  if (!form || !status) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!BUSINESS_EMAIL || BUSINESS_EMAIL === "REPLACE_WITH_YOUR_EMAIL") {
      status.textContent = "The form is not connected yet. Replace BUSINESS_EMAIL in script.js with your real business email, then test it again.";
      return;
    }

    const data = new FormData(form);
    const subject = `Landscape estimate request — ${data.get("location")}`;
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

    status.textContent = "Your email app should open with the estimate request. Please send the message there to complete your inquiry.";
    window.location.href = `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
});
