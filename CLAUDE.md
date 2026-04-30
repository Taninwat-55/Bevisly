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

Features planned before sending cold emails to employers. Build in this order:

### 1. Practice Proofs (Candidate Cold-Start Fix)
Candidates currently need an employer invite to prove any skills. Build a library of 5–10 AI-generated "Practice Proof" tasks (e.g. "Build a login form", "Write a marketing email") that any candidate can attempt immediately after signup. AI grades the submission instantly and the score counts toward Leaderboard ranking. Removes the empty-state problem for new candidates and creates immediate engagement.
- New `practice_tasks` table (generic, not job-specific)
- AI grading edge function (Gemini) — returns score + written feedback
- Candidate dashboard entry point: "Practice & Improve"

### 2. Transparent Application Status Tracker (Candidate-Side Kanban)
Candidates experience a "resume black hole" — they submit and hear nothing. Build a pizza-tracker style timeline on the candidate dashboard showing their active applications: `Submitted → Under Review → Interview → Decision`. When the employer moves a candidate's card on their Talent Board (Kanban), the candidate's tracker updates in real time. Transparency is a key trust differentiator.
- Read-only view for candidates derived from `submissions.hiring_stage`
- Real-time updates via Supabase Realtime subscription
- Visual step indicator component on candidate dashboard

### 3. Verified Skills from Proof Tasks (AI Skill Extraction)
When a candidate completes a Proof Task involving React, Tailwind, or Supabase, the AI should automatically extract and add those as "Verified Skills" on their profile — visually distinct from self-claimed skills. Separate: **Self-Claimed Skills** (anyone can add) vs **Verified Skills** (earned via a completed Proof Task, marked with a Bevisly checkmark).
- New `verified_skills` column on `profiles` (or a separate `profile_skills` table with `source: 'self' | 'verified'`)
- AI extraction step added to the feedback/grading flow
- UI update on profile and public profile pages to distinguish the two

### 4. Stripe Payment Integration
Wire up Stripe before sending cold emails — a pricing page with no working checkout undermines credibility. Scope:
- Stripe Checkout for subscription plans (Free / Pro)
- Webhook → updates `profiles.subscription_tier` in Supabase on payment
- "Manage Billing" button → Stripe Customer Portal
- Gate Pro features behind subscription check

---

## Additional Pre-Launch Checks
- Full user flow walkthrough for both candidate and employer roles
- Pricing research: validate plan prices against comparable tools (Workable, Lever, etc.)
- Onboarding experience: employer first-login guidance (what to do first, how proof tasks work)
