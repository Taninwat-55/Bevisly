# Changelog

All notable features and changes to Bevis MVP are recorded here in plain language, most recent first.

---

## 2026-05-02 — Platform Polish & Infrastructure

### Employer Reply-To Email Fix
Offer and feedback emails sent to candidates now set the employer's email as the reply-to address. When a candidate hits "Reply" on any platform email, it goes directly to the employer's inbox — no platform login required to continue the conversation. Falls back to the Bevisly support address if the employer email cannot be resolved. Also switched the `notify` edge function sender from Resend's test address (`onboarding@resend.dev`) to the verified custom domain (`hello@bevisly.com`), so submission and review notifications now deliver to all real users, not just the account owner.

### First-Login Onboarding (Both Roles)
Candidates and employers both now see a guided welcome banner on first login with three actionable steps and direct navigation links. Each step card links to the relevant part of the platform (e.g. "Browse Jobs", "Try a Practice Proof" for candidates; "Post a Job", "Open Talent Board" for employers). Banner is dismissible and only shown once per role via localStorage.

### Auth Email Templates (Branded)
All six Supabase auth emails — Confirm Sign Up, Invite User, Magic Link, Change Email, Reset Password, and Reauthentication — now use Bevisly's brand colours and typography instead of Supabase's default template. Consistent with the rest of the platform experience.

### Security Hardening (3 Criticals Resolved)
Fixed all three critical security advisories flagged in the Supabase dashboard:
- `ai_usage_logs` — RLS enabled. Table was previously fully open; edge functions continue to work via service role key which bypasses RLS.
- `proof_cards` view — Rebuilt with `security_invoker = true` so queries run under the calling user's RLS context rather than the view owner's. All underlying tables already had appropriate public-read policies so the proof vault and public profiles are unaffected.
- `employer_job_summary` view — Same fix. Employers now only see submission counts for their own jobs, which is the intended behaviour.

---

## 2026-05-02 — Sprint #1: Bevisly Score + Featured Proofs (Complete)

### Bevisly Score (Candidate Signal System)
A unified score (0–100) calculated from proof task ratings, practice proof grades, and submission quality. Displayed prominently on candidate profiles and the leaderboard to give employers a fast signal of overall competency. Score updates automatically as new ratings come in.

### Featured Proofs (Portfolio Highlights)
Candidates can pin up to 3 of their best proof submissions as "Featured Proofs" on their public profile. Only proofs with a completed submission are eligible. Featured proofs appear at the top of the profile with star ratings and employer feedback visible, giving employers a curated showcase before digging into the full history.

---

## 2026-05-02 — Pre-Launch Feature Sprint

### Practice Proofs (Candidate Cold-Start Fix)
Candidates no longer need an employer invite to prove their skills. A library of AI-generated "Practice Proof" tasks (e.g. "Build a login form", "Write a marketing email") is available immediately after signup. Gemini grades each submission instantly and the score counts toward Leaderboard ranking. Entry point is "Practice & Improve" on the candidate dashboard.

### Talent Board in Sidebar (Navigation Improvement)
Moved the Kanban board entry point from a buried 2-click path through the dashboard into the employer sidebar as "Talent Board" (`/employer/talent-board`). Employers now land on a job picker grid and click directly into any job's existing Kanban board.

### Application Status Tracker (Candidate-Side Pipeline View)
Candidates can now see exactly where they stand in each application. A visual step timeline on the candidate overview shows the current hiring stage in real time: Applied → Under Review → Shortlisted → Interview → Offer → Decision. Solves the "resume black hole" problem where candidates submitted and heard nothing.

### Send Offer (Employer Flow Completion)
Employers can now formally send an offer from within the platform rather than moving a candidate straight to "Hired" with no communication. A new `offer_sent` stage sits between Interview and Hired, and an offer email is automatically sent to the candidate when the stage is set. A deduplication flag prevents duplicate emails.

### Verified Employer Badge (Candidate Trust Signal)
Employers verified by the Bevis team now display a trust badge (✓) on job cards and job detail pages. Admins can toggle `is_verified` on any employer profile. Gives candidates a signal that the opportunity is legitimate.

### Verified Skills from Proof Tasks (AI Skill Extraction)
Skills demonstrated in proof tasks rated 4★ or above are automatically extracted and shown as "Verified Skills" on candidate profiles — visually distinct from self-declared skills. Visible on both the private candidate profile and the public `/@:username` profile.

---

## Earlier — Core Platform (Pre-Roadmap Baseline)

- **Proof Task Workspace** — candidates complete a real employer-set task to prove skills instead of just submitting a resume
- **Submission Review Panel** — employers rate submissions and leave written feedback
- **AI Feedback Suggestion** — Gemini suggests a rating and feedback paragraph to reduce employer effort
- **Notify Webhook** — automated email notifications to candidates when their submission status changes (via Resend)
- **Fast Pass Application** — expedited flow for high-scoring candidates
- **Proof Vault** — candidates can share and publicly verify their submitted proofs
- **Leaderboard & Public Profiles** — candidates ranked publicly; shareable profiles at `/@:username`
- **Invitation System** — employers can invite specific candidates to apply
