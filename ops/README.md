# Wicked Roots Ops — private production starter

This is a separate Next.js application in `ops/`. It provides a private, login-protected lead board, a visible three-specialist AI run (lead-fit reviewer → email writer → outreach safety reviewer), persistent activity logs, an editable approval queue, and owner-approved email delivery through Resend.

## Important scope

This is a deployable starter, not a fully configured live service. You must create/configure the Supabase, AI, and email-provider accounts and add their credentials privately. No API credentials are included in this repository. It processes only leads entered by the owner; it does not scrape or discover contacts. The AI drafts and reviews only; it cannot send. An authenticated user must explicitly click **Approve & send**, confirm the prompt, and the server checks that the draft is still pending before sending. You still need to review compliance, recipient, personalization, and any required business address. Avoid bulk outreach and honor opt-outs.

Initial access is account-scoped: each authenticated account sees only its own records. This starter is not yet a multi-user shared workspace or a 30-agent fleet. Add invitations/workspaces and role-based approvals before sharing data with multiple users. Agent activity in the dashboard shows real provider calls after configuration; without keys, the workflow reports the missing setup instead of pretending to run.

## Run locally

1. Install Node.js 20 or newer.
2. Create a Supabase project. In its SQL Editor, run `ops/supabase/schema.sql`.
3. Create the first user in Supabase Dashboard → Authentication → Users.
4. Copy `ops/.env.example` to `ops/.env.local` and fill in the project URL and public anon key. Add the OpenAI API key, model, Resend API key, and a sender address on a domain verified with Resend. Keep secret values only in `.env.local` or your deployment's encrypted environment settings; never put them in browser code or commit them.
5. From `ops/`, run:

   ```bash
   npm install
   npm run dev
   ```

6. Visit `http://localhost:3000`, sign in, add a relevant lead, and run the specialist workflow. Review the activity entries and generated draft. Configure Resend before testing **Approve & send**; that button sends real email only after the confirmation dialog.

## Deploy privately

Deploy the `ops/` directory as the project root on a Node.js host such as Vercel. Add the same environment variables in the host's private project settings. In Supabase Auth settings, configure the production site URL and allowed redirect URLs. Keep sign-up disabled or invitation-only; this app expects the owner account to be provisioned from Supabase. Test using a non-customer test address before sending to a real contact.

## Security and operations checklist before real customer use

- Configure provider domain verification, SPF/DKIM/DMARC, permitted sender identity, and a monitored reply-to address.
- Review applicable email and privacy rules, add required business mailing address and opt-out handling, and maintain a do-not-contact list. The code is not legal advice.
- Add rate limiting, CSRF/origin checks, audit retention policy, backups, monitoring, and a tested incident response before production scale.
- RLS currently isolates each user's rows; it does not implement team workspaces or roles. Do not share one login. Add an explicit workspace/member schema and owner-only send policy for a team deployment.
- OpenAI and Resend are external processors. Review their data policies and send only the minimum business-contact data needed.
- The three stages are a small observable workflow, not 30 independent autonomous agents. Scale roles only when there's a clear task and human owner; keep sending behind approval.

## Files

- `app/workboard.tsx` — dashboard, lead board, activity view, approval queue.
- `app/api/agents/run/route.ts` — server-side AI specialist workflow.
- `app/api/drafts/[id]/route.ts` — edit/reject/explicitly approved send endpoint.
- `supabase/schema.sql` — database tables, indexes, and row-level security policies.
