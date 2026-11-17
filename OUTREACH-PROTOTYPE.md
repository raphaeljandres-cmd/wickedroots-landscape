# Lead board and email approval queue prototype

Open `outreach.html` from the published site to use the lead board and outreach approval queue. The existing job calendar is at `dashboard.html`.

## What this prototype does

- Keeps a browser-local list of leads and follow-up dates.
- Creates editable, template-based email drafts from lead details and context you provide.
- Stores drafts in an approval queue.
- Requires a deliberate confirmation before opening an approved draft in the user's default email app.
- Does not send automatically. The user must review the message and press Send in their email app.

## Important limitations

This is a static front-end prototype, not a shared or production system. Data is saved in `localStorage` in one browser profile and is not synchronized to other devices or users. There is no login, server database, AI provider, Gmail OAuth, automatic lead research, reply tracking, or background agent runtime. The draft generator is a simple template, not AI. Never enter sensitive customer information here or rely on it as the sole copy of business records.

A production shared version requires a private backend, authenticated users, database access controls, secure server-side AI integration, and an email provider integration. Keep API keys and OAuth credentials on the server—never in front-end JavaScript. Email sending should remain limited to individually reviewed, consent/compliance-aware messages; honor opt-outs and applicable laws.
