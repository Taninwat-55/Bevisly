# Bevisly MVP — CLAUDE.md

## Vision

Bevisly is a recruitment platform where **recent graduates, career switchers, and students** find jobs and prove their skills by completing employer-set tasks. **Employers (startups & SMEs)** post jobs, manage candidates, and get high-competency matches while saving recruitment time. The core differentiator is the **Proof Task** system — candidates don't just apply, they demonstrate capability.

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

## Workflow Orchestration

### 1. Plan Node Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately - don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One tack per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessions.md` with the pattern
- Write rules for yourself that prevent the same mistakes
- Ruthlessly iterate on these lessions until mistake rate drops
- Review lessions at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?". 
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution."
- Skip this for simple, obvious fixes - don't over-engineer.
- Challenge your own work before presenting it.

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding.
- Point at logs, errors, failing tests - then resolve them.
- Zero context switching required from the user
- Go fix failing CI tests without being told how.

---

## Task Management

1. **Plan First**: Write a plan to `tasks/todo.md` with checkable items.
2. **Verify Plan**: Check in before starting implementation.
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step.
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessions***: Update `tasks/lessions.md` after correction

---

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root cause. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

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

Pre-launch sprint work is complete. Next step: Stripe integration before cold outreach.

- **Sprint #1 (done):** Bevisly Score + Featured Proofs — unified score and pinned proof highlights on candidate profiles.
- **Sprint #2 (done):** Responsibility Score + Employer Brand Page — anti-ghosting accountability scores (employer + candidate) via DB triggers, public `/company/:slug` brand pages, score badges on job cards and profiles, Docs & Help page, navbar/footer polish.

---

## Pre-Launch Roadmap

Features still pending before sending cold emails to employers. Shipped features are recorded in `CHANGELOG.md`.

### ⬜ Stripe Payment Integration
Wire up Stripe before sending cold emails — a pricing page with no working checkout undermines credibility.
- Stripe Checkout for subscription plans (Free / Pro)
- Webhook → updates `profiles.subscription_tier` in Supabase on payment
- "Manage Billing" button → Stripe Customer Portal
- Gate Pro features behind subscription check

---

## Post-Launch Roadmap

Features to build after launch and initial traction.

### ⬜ AI Chatbot
In-app AI assistant powered by Gemini. Dual-purpose: helps candidates refine applications, understand proof task requirements, and prep for interviews; helps employers draft job descriptions and proof tasks faster. Surfaced as a chat widget available across both dashboards.

---

## Additional Pre-Launch Checks
- Full user flow walkthrough for both candidate and employer roles
- Pricing research: validate plan prices against comparable tools (Workable, Lever, etc.)
- ✅ Onboarding experience: employer and candidate first-login guidance — done via WelcomeBanner with role-specific steps and action links
