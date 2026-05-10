<p align="center">
  <img src="frontend/public/bevisly-logo.svg" alt="Bevisly Logo" width="120" height="120" />
</p>

<h1 align="center">Bevisly</h1>

<p align="center">
  <strong>Proof-Based Hiring Platform</strong><br/>
  Candidates prove skills with real tasks. Employers hire based on evidence, not résumés.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#roadmap">Roadmap</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Pre--Launch-F59E0B?style=flat-square" alt="Pre-Launch" />
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?logo=react&style=flat-square" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&style=flat-square" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&style=flat-square" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&style=flat-square" alt="Tailwind v4" />
</p>

---

## Overview

**Bevisly** is a proof-of-skill hiring platform that bridges the gap between learning and employment. Instead of filtering by résumés, employers post real-world proof tasks — candidates complete them and submit. Structured rubrics, AI-assisted review, and accountability scores replace guesswork on both sides.

**Positioning:** *"Bevisly does not replace human judgment. It makes human judgment more structured, evidence-based, and auditable."*

### The Problem We Solve

| Traditional Hiring | Bevisly Approach |
|--------------------|-----------------|
| Résumés and keywords | Verified skill demonstrations |
| Bias-prone screening | Rubric-based objective evaluation |
| Employer ghosting after effort | Employer Responsibility Score with accountability |
| No proof of effort for candidates | Public Proof Vault — a verifiable portfolio |
| Vague "culture fit" decisions | AI evidence summaries tied to submission content |

---

## Features

### For Candidates

- **Proof Workspace** — Complete real-world tasks set by employers, submit with reflections
- **Public Profile** — Portfolio at `bevisly.com/@username` — SEO-friendly, shareable
- **Bevisly Score** — Unified performance score calculated from completed proofs
- **Featured Proofs** — Pin your best submissions to the top of your profile
- **Candidate Reliability Score** — Accountability metric visible to employers
- **Proof Vault** — Verified, shareable proof of completed tasks
- **Saved Jobs** — Bookmark jobs to apply later
- **Leaderboard** — Ranked public standings across the candidate pool
- **LinkedIn Sharing** — One-click sharing of verified achievements

### For Employers

- **Job Listings** — Post jobs with required salary range (pay transparency) and proof task time estimates
- **Proof Tasks** — Define real-world assessments with weighted rubric criteria
- **AI Feedback Suggestion** — Gemini generates an evidence-based rating suggestion and feedback draft; final decision is always the employer's
- **Talent Board** — Kanban-style candidate pipeline (Applied → Reviewing → Interview → Hired/Rejected)
- **Employer Brand Page** — Public company page at `/company/:slug` showcasing open roles and ratings
- **Employer Responsibility Score** — Anti-ghosting accountability score, visible to candidates
- **Candidate Invitation System** — Invite specific candidates directly to apply
- **Fast Pass Applications** — Expedited flow for qualifying candidates
- **Side-by-Side Review** — Compare proof task requirements against candidate submission in one view

### For Admins

- **User Management** — Role assignments and oversight
- **Platform Analytics** — System-wide metrics
- **Data Viewer** — Direct database inspection tools
- **Feedback Review** — Moderation and quality checks on employer feedback

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, React Router v7, TypeScript, Vite |
| **Styling** | Tailwind CSS v4 |
| **Backend** | Supabase (Auth, PostgreSQL, Storage, Realtime) |
| **Edge Functions** | Deno (Supabase Edge Runtime) |
| **Email** | Resend (via `send-email` / `notify` edge functions) |
| **AI** | Gemini 2.5 Flash (feedback suggestions, job/task generation) |
| **Testing** | Vitest (unit), Playwright (e2e) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase account
- Supabase CLI (`npm install -g supabase`)

### Installation

```bash
# Clone the repository
git clone https://github.com/Taninwat-55/bevis-mvp.git
cd bevis-mvp/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Edge functions require additional vars set in Supabase dashboard:
- `RESEND_API_KEY`
- `GEMINI_API_KEY`

### Development

```bash
# Frontend
cd frontend && npm run dev          # http://localhost:5173

# Edge functions (from repo root)
supabase functions serve
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript checks |
| `npm test` | Run unit tests (Vitest) |
| `npm run e2e` | Run end-to-end tests (Playwright) |
| `npm run gen:types` | Regenerate TypeScript types from Supabase schema |

---

## Architecture

```
bevis-mvp/
├── frontend/
│   └── src/
│       ├── components/        # UI components (common, employer, jobs, profile, proofs, ui)
│       ├── context/           # React context providers
│       ├── hooks/             # Custom hooks
│       ├── layout/            # CandidateLayout, DashboardLayout, AdminLayout, PublicLayout
│       ├── lib/               # Supabase client, utilities, API functions
│       ├── pages/             # Route-level pages by role (admin, auth, candidate, employer, jobs, landing, public, shared)
│       ├── routes/            # Routes.tsx, ProtectedRoute.tsx
│       └── types/             # TypeScript definitions
└── supabase/
    ├── functions/
    │   ├── notify/            # Submission status webhook → Resend email
    │   ├── send-email/        # Generic email sender
    │   ├── suggest-feedback/  # AI feedback generation (Gemini)
    │   ├── generate-job-listing/   # AI job listing generation
    │   └── generate-proof-task/    # AI proof task generation
    ├── migrations/            # SQL migrations (timestamp-prefixed)
    ├── email-templates/       # HTML email templates
    └── config.toml            # Supabase config (project_id: bevis-mvp)
```

---

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User data, roles, scores, username, subscription tier |
| `jobs` | Employer job listings (with salary range, work mode) |
| `proof_tasks` | Skill assessment definitions with rubric |
| `submissions` | Candidate work samples |
| `feedback` | Employer reviews and ratings |
| `proof_cards` | Verified achievement records |
| `applications` | Job applications and pipeline stage |
| `company_pages` | Employer brand page content |

### Row Level Security

- **Candidates** — access own submissions and public data
- **Employers** — access own jobs and related submissions
- **Admins** — full platform access

---

## Roadmap

### Pre-Launch (In Progress)

| Feature | Description | Status |
|---------|-------------|--------|
| **Stripe Integration** | Subscription checkout, webhook → `subscription_tier` in DB, Customer Portal | Planned |
| **AI Framing & Disclaimers** | Rename "AI rating" → "AI evidence summary", add disclaimers, update `/docs` | Done |
| **Locked Rubric** | Rubric locks once first submission is received; prevents post-hoc scoring changes | Done |
| **Paid Promotion** | Placeholder UI for employers to mark jobs as "Featured" on paid plans | Done |

### Post-Launch

- **AI Chatbot** — In-app assistant for candidates (task prep) and employers (job/task drafting)
- **Fairness & Evidence Layer** — Blind first review, override justification, consistency dashboard, AI self-audit

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `dev` | Active development |
| `feature/*` | New features |
| `fix/*` | Bug fixes |

---

## License

© 2026 Bevisly — All rights reserved.

---

<p align="center">
  Built by <a href="https://github.com/Taninwat-55">Taninwat "Ice" Kaewpankan</a>
</p>
