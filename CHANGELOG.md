# Changelog

All notable features and changes to Bevis MVP are recorded here in plain language, most recent first.

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
