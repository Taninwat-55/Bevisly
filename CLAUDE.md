# Bevisly MVP — CLAUDE.md

## Vision

Bevisly is a recruitment platform where **recent graduates, career switchers, and students** find jobs and prove their skills by completing employer-set tasks. **Employers (startups & SMEs)** post jobs, manage candidates, and get high-competency matches while saving recruitment time. The core differentiator is the **Proof Task** system — candidates don't just apply, they demonstrate capability.

**Positioning:** *"Bevisly does not replace human judgment. It makes human judgment more structured, evidence-based, and auditable."*

---

## Product Principles (Non-Negotiable)

Every feature must obey these. Full rationale lives in `PRODUCT_ROADMAP.md` → "Product Principles".

1. **AI is decision support, never the decision** — no auto-accept, no auto-reject.
2. **Evaluate against a rubric** the employer defined up front, not vibes.
3. **Evidence over opinion** — when AI makes a claim it must point to the part of the submission it's referring to.
4. **Proof quality is separate from hire decision.**
5. **Both sides are accountable and visible** (Employer Responsibility Score + Candidate Reliability Score).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7, TypeScript, Tailwind CSS v4, Vite |
| Backend | Supabase (Auth, PostgreSQL, Storage, Realtime) |
| Edge Functions | Deno (Supabase Edge Runtime) |
| Email | Google Workspace (`hello@bevisly.com`) via Resend |
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
│   │   ├── notify/            # Submission status webhook → email via hello@bevisly.com
│   │   ├── send-email/        # Generic email sender
│   │   ├── suggest-feedback/  # AI feedback generation (Gemini)
│   │   ├── generate-job-listing/  # AI job listing generation (Gemini)
│   │   ├── generate-proof-task/   # AI proof task generation (Gemini)
│   │   └── career-compass/    # AI career guidance session (Gemini)
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

- **Proof Task Workspace** — candidates complete a real employer-set task to prove skills; supports text, file, link, and video submission types
- **Submission Review Panel** — employers rate submissions against a locked rubric; AI evidence summary + interview probe questions auto-generated
- **Locked Rubric** — employer defines weighted criteria up front; rubric locks once the first candidate submits
- **AI Feedback Suggestion** — Gemini generates an evidence summary and a draft feedback letter per submission
- **Notify Webhook** — `notify` edge function sends email on all pipeline stage changes (applied → shortlisted → interview → offer → decision)
- **Career Compass** — candidate AI session: reads proof history and delivers career direction, readiness score, and skills gap analysis
- **Proof Vault & Certificates** — candidates share verified proofs publicly; shareable digital badge per completed proof
- **Bevisly Score + Leaderboard** — unified 0–100 candidate score; public leaderboard and profiles at `/@:username`
- **Employer Brand Page** — public `/company/:slug` with team photos, Responsibility Score, open roles, and markdown mission/culture
- **Application Status Tracker** — real-time pipeline timeline visible to candidates (Applied → Offer → Decision)
- **Fast Pass Application** — expedited flow for qualifying candidates
- **Invitation System** — employers can invite specific candidates to apply
- **Practice Proofs** — AI-generated tasks candidates can attempt immediately; Gemini grades instantly
- **Blog + SEO/GEO** — markdown blog with Article schema; structured data for job listings and profiles

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
- Required env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `GEMINI_API_KEY` (email sends via `hello@bevisly.com` — Google Workspace domain, Resend for delivery)
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

## Current Status

Pre-launch build is complete. E2E test suite shipped. All pre-launch features done — see `CHANGELOG.md` for the full record.

**Launch date: Wednesday 2026-05-20.** One pre-launch check still open: pricing validation (see below).

---

## Pre-Launch Roadmap

All pre-launch features shipped. Full detail in `CHANGELOG.md`.

The remaining Fairness & Evidence Layer phases (blind first review, override justification, consistency dashboard, AI self-audit) stay post-launch — see `PRODUCT_ROADMAP.md` feature #19.

---

## Post-Launch Roadmap

Features to build after launch and initial traction. Full list in `PRODUCT_ROADMAP.md`.

### ⬜ Stripe Payment Integration
Wire up once there's real traffic and validated demand — a pricing page without working checkout is acceptable at launch while we test the product.
- Stripe Checkout for subscription plans (Free / Pro)
- Webhook → updates `profiles.subscription_tier` in Supabase on payment
- "Manage Billing" button → Stripe Customer Portal
- Gate Pro features behind subscription check

### ⬜ Fairness & Evidence Layer
Four remaining phases that operationalise the Product Principles once we have real employer usage data: blind first review, required justification on override, employer consistency dashboard with fairness alerts, and weekly AI self-audit. (Phase 1 — Locked Rubric — was promoted to pre-launch on 2026-05-08.) See `PRODUCT_ROADMAP.md` feature #19.

### ✅ Career Compass (AI Self-Discovery)
Candidate-facing AI session that reads their profile information, proof history, employer ratings, and a short intake form to deliver three things: career direction (role types that fit them based on demonstrated strengths), proof readiness (how ready they are for specific roles with a percentage score), and skills gap analysis (what's in their way, grounded in real submission data). Powered by Gemini. Private to the candidate — never shared with employers. Gated behind minimum profile completeness. Post-launch because output quality scales with real proof data. Full spec in `PRODUCT_ROADMAP.md` feature #21.

### ⬜ AI Chatbot
In-app AI assistant powered by Gemini. Dual-purpose: helps candidates refine applications, understand proof task requirements, and prep for interviews; helps employers draft job descriptions and proof tasks faster. Surfaced as a chat widget available across both dashboards.

---

## Additional Pre-Launch Checks
- ✅ Full user flow walkthrough for both candidate and employer roles — Playwright E2E suite shipped 2026-05-15
- ⬜ Pricing research: validate plan prices against comparable tools (Workable, Lever, etc.)
- ✅ Onboarding experience: employer and candidate first-login guidance — done via WelcomeBanner with role-specific steps and action links
