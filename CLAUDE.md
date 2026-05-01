# Bevis MVP — CLAUDE.md

## Vision

Bevis is a recruitment platform where **recent graduates, career switchers, and students** find jobs and prove their skills by completing employer-set tasks. **Employers (startups & SMEs)** post jobs, manage candidates, and get high-competency matches while saving recruitment time. The core differentiator is the **Proof Task** system — candidates don't just apply, they demonstrate capability.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7, TypeScript, Tailwind CSS v4, Vite |
| Backend | Supabase (Auth, PostgreSQL, Storage, Realtime) |
| Edge Functions | Deno (Supabase Edge Runtime) |
| Email | Resend (via `send-email` / `notify` edge functions) |
| AI | Gemini 2.5 Flash (feedback suggestions, job/task generation) |
| Testing | Vitest (unit), Playwright (e2e) |

---

## Project Structure

```
bevis-mvp/
├── frontend/                  # React SPA
│   └── src/
│       ├── components/        # UI components (Navbar, Sidebar, common, employer, jobs, profile, proofs, ui...)
│       ├── context/           # React context providers
│       ├── hooks/             # Custom hooks
│       ├── layout/            # CandidateLayout, DashboardLayout, AdminLayout, PublicLayout
│       ├── lib/               # Supabase client, utilities
│       ├── pages/             # Route-level pages by role (admin, auth, candidate, employer, jobs, landing, public, shared)
│       ├── routes/            # Routes.tsx (router config), ProtectedRoute.tsx
│       └── types/             # TypeScript types
├── supabase/
│   ├── functions/             # Edge Functions (Deno)
│   │   ├── notify/            # Submission status webhook → Resend email
│   │   ├── send-email/        # Generic email sender via Resend
│   │   ├── suggest-feedback/  # AI feedback generation (Gemini)
│   │   ├── generate-job-listing/  # AI job listing generation (Gemini)
│   │   └── generate-proof-task/   # AI proof task generation (Gemini)
│   ├── migrations/            # Ordered SQL migrations
│   ├── email-templates/       # HTML email templates
│   └── config.toml            # Supabase local config (project_id: bevis-mvp)
└── backend/                   # Supporting backend scripts/utilities
```

---

## User Roles

- **candidate** — applies for jobs, completes proof tasks, views feedback, has a public profile
- **employer** — posts jobs, reviews submissions, gives ratings/feedback, manages candidates via inbox
- **admin** — platform oversight, user management, job moderation, feedback review

---

## Key Features

- **Proof Task Workspace** — candidates complete a real task set by the employer to prove skills
- **Submission Review Panel** — employers rate and give written feedback on proof submissions
- **AI Feedback Suggestion** — Gemini suggests a rating and feedback paragraph to help employers
- **Notify Webhook** — `notify` edge function fires on submission UPDATE events to send email notifications via Resend
- **Fast Pass Application** — expedited application flow for qualifying candidates
- **Proof Vault** — candidates can share/verify their submitted proofs publicly
- **Leaderboard & Public Profiles** — candidates ranked publicly; profiles at `/@:username`
- **Invitation System** — employers can invite candidates

---

## Common Commands

```bash
# Frontend dev
cd frontend && npm run dev

# Run unit tests
cd frontend && npm test

# Run e2e tests (Playwright)
cd frontend && npm run e2e

# Build
cd frontend && npm run build

# Regenerate TypeScript types from Supabase schema
cd frontend && npm run gen:types

# Serve all edge functions locally
supabase functions serve

# Deploy a specific edge function
supabase functions deploy <function-name>

# Push DB migrations to remote
supabase db push

# New migration
supabase migration new <migration-name>
```

---

## Edge Function Conventions

- All functions use Deno and `Deno.serve()`
- CORS headers block included in every function (`Access-Control-Allow-Origin: *`)
- Handle `OPTIONS` preflight before any logic
- Env vars accessed via `Deno.env.get("VAR_NAME")`
- Required env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `GEMINI_API_KEY`
- AI calls use Gemini 2.5 Flash at `v1beta` with `responseMimeType: "application/json"`
- Always return HTTP 200 even on handled errors (frontend parses the JSON error field)
- Register new functions in `supabase/config.toml` under `[functions.<name>]`

---

## Database Conventions

- Migrations go in `supabase/migrations/` with timestamp prefix: `YYYYMMDDHHMMSS_description.sql`
- RLS is enabled on all tables — always write policies explicitly
- Service role key is used inside edge functions for admin-level DB access
- Type generation: `npm run gen:types` writes to `frontend/src/lib/Database.ts`

---

## Current Task

Pre-launch polish pass and feature completion before outreach to startups/organizations.

---

## Pre-Launch Roadmap

Features planned before sending cold emails to employers. ✅ = shipped, ⬜ = pending.

### ✅ Verified Skills from Proof Tasks (AI Skill Extraction)
Skills from proof tasks rated ≥4★ are automatically extracted from `required_skills` and shown as Verified Skills on candidate profiles — visually distinct from self-claimed skills. Both candidate profile and public `/@:username` profile display the distinction.

### ✅ Send Offer (Employer Flow Completion)
Employers can currently move candidates to "Hired" but have no formal offer action. Add:
- `offer_sent` hiring stage between Interview and Hired
- Auto-send offer email to candidate on stage move (via `send-email` edge function)
- `offer_email_sent` flag on submissions to prevent duplicates
- Migration: `20260501010000_add_offer_email_sent_to_submissions.sql`

### ✅ Verified Employer Badge (Candidate Trust Signal)
Candidates see no trust indicator for employers. Add:
- `is_verified` boolean on `profiles` table (default false, admin-settable)
- Verified badge (✓) on `JobCard` and `JobDetailPage`
- Migration: `20260501020000_add_is_verified_to_profiles.sql`

### ✅ Application Status Tracker (Candidate-Side Pipeline View)
Candidates experience a "resume black hole" — they submit and hear nothing. Build a visual step timeline on the candidate overview showing each active application's current stage: `Applied → Under Review → Shortlisted → Interview → Offer → Decision`. Derived from `submissions.hiring_stage` in real time.
- `getCandidateApplications()` API function returning submissions + `hiring_stage` + job/company info
- `ApplicationStatusTracker` component replacing the placeholder in `CandidateOverview.tsx`
- Stage mapping: new/submitted → Under Review, shortlisted → Shortlisted, interview → Interview, offer_sent → Offer, hired/rejected → Decision

### ⬜ Kanban Board → Sidebar (Navigation Improvement)
Kanban stays job-scoped (no change to the board itself). Move the entry point to the sidebar:
- Add "Talent Board" link in employer sidebar → `/employer/talent-board`
- New page: job picker grid, click a job to open its existing Kanban
- Removes the 2-click buried path through the dashboard

### ⬜ Practice Proofs (Candidate Cold-Start Fix)
Candidates currently need an employer invite to prove any skills. Build a library of 5–10 AI-generated "Practice Proof" tasks (e.g. "Build a login form", "Write a marketing email") that any candidate can attempt immediately after signup. AI grades the submission instantly and the score counts toward Leaderboard ranking.
- New `practice_tasks` table (generic, not job-specific)
- AI grading edge function (Gemini) — returns score + written feedback
- Candidate dashboard entry point: "Practice & Improve"

### ⬜ Stripe Payment Integration
Wire up Stripe before sending cold emails — a pricing page with no working checkout undermines credibility.
- Stripe Checkout for subscription plans (Free / Pro)
- Webhook → updates `profiles.subscription_tier` in Supabase on payment
- "Manage Billing" button → Stripe Customer Portal
- Gate Pro features behind subscription check

---

## Additional Pre-Launch Checks
- Full user flow walkthrough for both candidate and employer roles
- Pricing research: validate plan prices against comparable tools (Workable, Lever, etc.)
- Onboarding experience: employer first-login guidance (what to do first, how proof tasks work)
