<p align="center">
  <img src="frontend/public/bevisly-logo.svg" alt="Bevisly Logo" width="120" height="120" />
</p>

<h1 align="center">Bevisly</h1>

<p align="center">
  <strong>Proof-Based Hiring Platform</strong><br/>
  Transforming real work into verified experience
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Release-v0.1.0_MVP-6C5CE7?style=flat-square" alt="Release v0.1.0 MVP" />
  <img src="https://img.shields.io/badge/Status-v0.2.0_In_Development-4A90E2?style=flat-square" alt="v0.2.0 In Development" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite" alt="Vite" />
</p>

---

## 🚀 Roadmap

Bevisly **v0.1.0** (MVP) is live. The following features are planned for completion before public launch outreach:

| # | Feature | Description | Status |
|---|---------|-------------|--------|
| 1 | **Practice Proofs** | AI-generated practice tasks candidates can attempt immediately after signup — graded by AI, counts toward Leaderboard | Planned |
| 2 | **Application Status Tracker** | Pizza-tracker style timeline on candidate dashboard showing real-time hiring stage updates from employer Kanban | Planned |
| 3 | **Verified Skills from Proofs** | AI extracts skills from completed proof tasks and adds them as "Verified Skills" (distinct from self-claimed) on the candidate profile | Planned |
| 4 | **Stripe Integration** | Subscription checkout, webhook to update plan tier in DB, Stripe Customer Portal for billing management | Planned |

---

## Overview

**Bevisly** is a proof-of-skill platform that creates a fair bridge between
learning and employment. Through short, real-world proof tasks, candidates build
credibility while employers hire based on verified ability — not just résumés.

### The Problem We Solve

| Traditional Hiring       | Bevisly Approach              |
| ------------------------ | ----------------------------- |
| Résumés & keywords       | Verified skill demonstrations |
| Interview anxiety        | Async proof submissions       |
| Bias-prone screening     | Objective work samples        |
| Time-consuming processes | Streamlined evaluation        |

---

## Features

### For Candidates 💜

- **Dashboard** — Track completed proofs, ratings, and credits
- **Proof Workspace** — Submit work samples with reflections
- **Public Profile** — SEO-friendly portfolio at `bevisly.com/@username`
- **LinkedIn Sharing** — Share verified achievements with your network
- **Leaderboard** — Compete and showcase your proof credits

### For Employers 💙

- **Talent Board** — Kanban-style candidate pipeline management
- **Proof Tasks** — Define real-world skill assessments
- **Scorecard Reviews** — Structured feedback with category ratings
- **Talent Pool** — Browse verified candidates with proven skills
- **Side-by-Side Review** — Compare requirements vs submissions

### For Admins 🔧

- **User Management** — Role assignments and oversight
- **Platform Analytics** — System-wide metrics and insights
- **Data Viewer** — Direct database inspection tools

---

## Tech Stack

| Layer           | Technology                           |
| --------------- | ------------------------------------ |
| **Frontend**    | React 18 + TypeScript + Vite         |
| **Styling**     | CSS Variables + Glassmorphism Design |
| **State**       | React Context + React Router v6      |
| **Backend**     | Supabase (PostgreSQL + Auth + RLS)   |
| **UI/UX**       | Framer Motion + Lucide Icons         |
| **Drag & Drop** | @dnd-kit/core + @dnd-kit/sortable    |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

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

### Development

```bash
npm run dev
```

Visit `http://localhost:5173`

---

## Architecture

```
frontend/src/
├── components/
│   ├── common/          # Shared UI components
│   ├── employer/        # Employer-specific components
│   ├── landing/         # Marketing page sections
│   ├── proofs/          # Proof card & modal components
│   ├── sharing/         # Social sharing components
│   └── talent/          # Talent board & Kanban
├── pages/
│   ├── admin/           # Admin dashboard pages
│   ├── auth/            # Authentication pages
│   ├── candidate/       # Candidate portal pages
│   ├── employer/        # Employer portal pages
│   ├── jobs/            # Job listing & detail
│   ├── public/          # Public profile & leaderboard
│   └── shared/          # Cross-role pages
├── lib/
│   └── api/             # Supabase API functions
├── hooks/               # Custom React hooks
├── context/             # Auth context provider
├── layout/              # Layout wrappers
├── routes/              # React Router config
└── types/               # TypeScript definitions
```

---

## Database Schema

### Core Tables

| Table         | Purpose                             |
| ------------- | ----------------------------------- |
| `profiles`    | User data, roles, credits, username |
| `jobs`        | Employer job listings               |
| `proof_tasks` | Skill assessment definitions        |
| `submissions` | Candidate work samples              |
| `feedback`    | Employer reviews & ratings          |
| `proof_cards` | Verified achievement records        |

### Row Level Security

- **Candidates**: Access own submissions and public data
- **Employers**: Access own jobs and related submissions
- **Admins**: Full platform access

---

## Design System

### Color Tokens

| Role      | Primary Color   | Usage          |
| --------- | --------------- | -------------- |
| Candidate | `#6C5CE7`       | Purple accents |
| Employer  | `#4A90E2`       | Blue accents   |
| Neutral   | System defaults | Shared UI      |

### UI Features

- **Glassmorphism** — Modern frosted glass aesthetic
- **Dark Mode** — Full theme support
- **Responsive** — Mobile-first design
- **Animations** — Smooth transitions via Framer Motion

---

## Scripts

| Command             | Description              |
| ------------------- | ------------------------ |
| `npm run dev`       | Start development server |
| `npm run build`     | Build for production     |
| `npm run preview`   | Preview production build |
| `npm run lint`      | Run ESLint               |
| `npm run typecheck` | Run TypeScript checks    |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Branch Strategy

| Branch      | Purpose               |
| ----------- | --------------------- |
| `main`      | Production-ready code |
| `dev`       | Active development    |
| `feature/*` | New features          |
| `fix/*`     | Bug fixes             |

---

## License

© 2025 Bevisly — All rights reserved.

---

<p align="center">
  Built with 💜 by <a href="https://github.com/Taninwat-55">Taninwat "Ice" Kaewpankan</a>
</p>
