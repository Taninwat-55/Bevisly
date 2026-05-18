# Changelog

All notable features and changes to Bevisly are recorded here in plain language, most recent first.

---

## 2026-05-18 — Career Compass + GDPR Compliance + Employer Profile

### Career Compass (AI Self-Discovery)
A new candidate-facing feature at `/career-compass` that reads the candidate's profile, proof submission history, rubric scores, and projects, then delivers three outputs via Gemini 2.5 Flash: Career Direction (role types that fit based on demonstrated strengths), Proof Readiness (percentage score for specific roles), and Skills Gap Analysis (what's in the way, grounded in real data). The session uses a 3-step intake form, an AI-loading analysis screen, and a results screen. Results are stored in a new `career_compass_sessions` table with RLS so they remain private to the candidate. Education is now stored as a structured multi-entry array in `profiles.education` — candidates can add and remove degrees in their profile edit modal, displayed on both the private and public profile.

### GDPR Compliance
Full GDPR compliance package shipped:
- Terms of Service page (`/terms`) with Denmark/EU governing law
- Privacy Policy rewritten with Article 22 AI disclosures, data processor list, retention periods, and full GDPR rights sections
- Consent checkbox at signup — `consented_at` and `tos_version` written to the user's profile on account creation
- Full account deletion: wipes all storage files across every bucket before calling the `delete_user_account` RPC
- Email notification preferences (`email_notif`, `marketing_emails`) in User Settings with auto-save; the `notify` edge function honours `email_notif` so silenced users don't get system emails
- EU AI Act transparency notice added to the proof submission confirmation modal

### Company Country Field + Employer Profile Preview
A country field added to company settings — stored on the `companies` table, shown on the public brand page with a map pin. Dropdown is Nordic-first (DK/SE/NO/FI/IS) then broader Europe, US/CA, and Other. Employers now also have a "Preview Profile" button in settings that opens `/company/:slug` in a new tab so they can see exactly what candidates see before publishing.

---

## 2026-05-17 — Employer Onboarding, Screening Questions + Security Hardening

### Employer Signup Confirmation Screen
Employers who sign up via invite now land on a "Confirmation Pending" screen instead of silently switching to the login view. Gives clear feedback that the account exists and the confirmation email is on its way — previously the transition was silent and confusing.

### Submission Type/Format + Standalone Screening Questions
Employers can now specify a submission type (text, file upload, link, video) and a format (Markdown, plain text, PDF) when configuring a proof task. Screening questions are now also configurable as standalone items independent of the proof task, allowing employers to collect pre-qualification answers before the candidate starts the task. DKK set as the default currency platform-wide (aligns with Danish market focus).

### Mission/Culture as Markdown + Contact Person on Job Preview
The mission and culture sections on the public brand page now render as rich Markdown (bold, lists, links) instead of plain text. Job preview on the job detail page now also shows the contact person's name and the company website.

### Security Hardening (Round 2)
Three additional security fixes applied via DB migrations:
- RLS policies tightened on additional tables
- Dangerous RPC functions revoked from public access
- Employer invite role assignment corrected — role now assigned correctly via `emailRedirectTo` callback, and the `prevent_role_change` guard patched to stop it from blocking legitimate role transitions on invite acceptance

---

## 2026-05-16 — AI Feature Expansion + Brand Page Media

### Zero Setup Mode (Employer Quick Launch)
Employers with no jobs posted see a "Zero Setup" card on their dashboard. One click triggers Gemini to draft a full job listing based on the company's existing profile data — title, description, requirements, proof task, and rubric — that the employer can review and publish directly. Removes the blank-page problem for first-time employers.

### AI Review Summary (One-Click)
The one-click AI review on the submission review panel polished: output now includes a structured evidence summary with rubric-by-rubric breakdown, cleaner formatting, and a clearer disclaimer separating AI evidence from human judgment.

### Interview Probe Questions (Auto-Generated)
After an employer completes an AI review of a submission, the platform auto-generates 3–5 tailored interview probe questions based on what the AI flagged in the submission analysis — weak points, strong signals, and ambiguous areas. Employers get interview prep baked in without leaving the review panel.

### AI-Drafted Candidate Feedback Letter
When an employer rates and leaves written feedback on a proof submission, a second AI-generated block drafts a full feedback letter addressed to the candidate — polite, structured, and grounded in the rubric. The employer can edit or discard it. Reduces the effort barrier to sending quality feedback.

### Submission Breakdown Card (Auto-Gen)
A new `SubmissionBreakdownCard` auto-generates a structured breakdown of the candidate's submission — key highlights, approach summary, and evidence quotes — directly in the review panel. Gives employers a scannable summary before diving into the raw submission.

### Unseen Feedback Badge
A badge counter appears on the "My Proofs" navigation item and on individual proof cards when the candidate has unread employer feedback. Clears when the candidate opens the feedback. Removes the need for candidates to manually check each proof.

### Team Photo Layout on Brand Page
Company brand pages now support a multi-image team section with an editorial layout: the first image displays as a full-width banner; additional images appear in a supporting grid below. Employers upload images in Settings under "Images". Replaces the old single-photo placeholder.

### Pricing Page → Early Access Placeholder
The full pricing page is replaced with a minimal "Early Access — Coming Soon" placeholder while the platform is in pre-launch validation mode. Pricing logic and Stripe integration remain post-launch.

---

## 2026-05-15 — SEO/GEO, Blog + E2E Test Suite

### Blog with Article Schema
A blog section added to the marketing site with full SEO/GEO-optimised Article schema markup. Structured to help AI crawlers and search engines understand and surface content. Each post uses `react-helmet-async` for per-page meta tags.

### SEO and GEO Improvements
Comprehensive SEO and GEO pass across the platform — improved meta descriptions, canonical tags, Open Graph tags, Twitter card support, and structured data for job listings and candidate profiles. A Vercel middleware layer added so shared proof links and company pages generate proper OG previews for social sharing instead of falling back to the generic app shell.

### Full E2E Test Suite
A complete Playwright end-to-end test suite covering both candidate and employer golden paths: signup, profile setup, job browsing, proof task submission, employer review, and pipeline stage transitions. Covers the full pre-launch user flow audit. Pre-launch bugs caught during this pass were fixed inline.

---

## 2026-05-14 — Email Loop + Navigation Unification

### Complete Email Pipeline
Every major candidate-facing pipeline event now triggers an email: application received, shortlisted, interview invitation, offer sent, and rejection. Employer emails use `hello@bevisly.com` as sender and set the responsible recruiter as reply-to so candidates can respond directly without logging in. The `notify` edge function now handles all status transitions cleanly.

### Email Provider Switch to Google Workspace
Email sending migrated from the Resend test sender to a verified Google Workspace account at `hello@bevisly.com`. All outbound platform email now delivers to any real address, not just the Resend account owner.

### Candidate Navigation Unification
The candidate sidebar, navbar, and profile pages unified into a consistent navigation system. Profile UX refined: avatar uploads, username changes, and section editing all work from one location without layout inconsistencies or duplicate entry points.

### "Come Back to Finish" — Proof Task Resume
Candidates who have started but not submitted a proof task now see a persistent "Come Back to Finish" reminder card on their dashboard and in the proof task list. Clicking it takes them directly back to their in-progress workspace. Prevents incomplete submissions from being silently abandoned.

---

## 2026-05-10 — Major Redesign + Feature Additions

### Major Visual Redesign
Full visual overhaul across both candidate and employer sides — typography, spacing, colour usage, component consistency, and layout density all revised. Mobile responsiveness fixed across the board: dashboards, sidebars, modals, and job cards all reflow correctly at tablet and phone breakpoints.

### Saved Jobs
Candidates can now save job listings and access them from a dedicated "Saved Jobs" section in the sidebar. Persisted in the database so the list survives sessions.

### Companies Tab in Navbar
"About" in the main navigation replaced with "Companies" — linking to a browsable list of employer brand pages. More useful discovery surface for candidates than a static about page.

### Logo/Profile Image Sync + Work Mode
Company logos and candidate profile images now sync across all surfaces (cards, sidebars, review panels) without needing a hard refresh. A work availability mode toggle added to candidate profiles (`Open to Work`, `Casually Looking`, `Not Available`) — displayed publicly so employers can see at a glance.

### Improved Job Search
Job listing search now filters across title, company name, and location simultaneously. Results update in real time without a page reload.

---

## 2026-05-08–09 — Sprint #3: AI Framing, Locked Rubric, Pay Transparency + Time Estimation (Complete)

### AI Framing & Disclaimers (Anti-Bias Hygiene)
"AI suggested rating" renamed to "AI evidence summary" across the platform. A one-line disclaimer added under every AI-generated output clarifying it is decision support, not a decision. A dedicated "How Bevisly uses AI" section added to `/docs`.

### Locked Rubric Before Submissions Open
Employers define 3–5 weighted rubric criteria when creating a proof task. Once the first candidate submits, the rubric locks — criteria and weights can no longer be changed. Edits after lock require creating a new task version. All AI suggestions and human ratings score against the locked rubric, preventing retroactive rule changes.

### Pay Transparency (EU Compliance)
A salary range (min/max + currency) is now required on every job listing — employers cannot publish without it. Aligns with EU Pay Transparency Directive expectations. Salary shown consistently on job cards, job detail pages, and the application flow.

### Time Estimation Label
Employers set an estimated time-to-complete when configuring a proof task (e.g. "2–4 hours"). Displayed prominently on the proof task page so candidates can self-select before committing time. Helps filter out mismatches before they become abandoned submissions.

### Submission Follow-Up Questions
Employers can add follow-up questions that appear after a candidate completes their proof task submission — clarifying questions, rationale requests, or reflection prompts. Answers are attached to the submission record and visible in the review panel.

### Markdown Editor Improvements
The rich text editor in the proof task workspace and the employer review submission panel upgraded: better toolbar, cleaner preview toggle, consistent rendering on both sides of the review flow.

### Verified Proof Certificates
Completed and rated proof submissions now generate a shareable digital badge/certificate at a unique URL. Candidates can link to their certificate from LinkedIn or a portfolio. The badge displays the task name, employer, rating, and a Bevisly verification URL.

### Platform Stats on Landing
Live platform statistics (number of candidates, jobs posted, proofs submitted) added to the landing page as social proof. Pulled from a read-only DB view to keep the query fast.

---

## 2026-05-07 — Dashboard Polish + Employer First-Login

### Dashboard UI Polish
Employer and candidate dashboards polished: consistent badge sizing, corrected sidebar labels, job detail page max-width fixed, and score badges aligned across views. Design system cleaned up — hardcoded colour values replaced with design tokens.

### Employer First-Login Experience
Employers who sign up and complete company setup now land on a tailored welcome screen showing three guided next steps: post your first job, preview your brand page, and invite a team member. Separate from the candidate welcome flow.

### Profile Badge for Subscription Tier
A tier badge (Free / Pro) added to candidate and employer profile headers. Billing placeholder added to User Settings linking to a coming Stripe Customer Portal integration.

### Username Change for Candidates
Candidates can now update their `@username` directly from profile settings. The public profile URL (`/@:username`) updates immediately and old URLs no longer resolve, preventing stale links from leaking.

---

## 2026-05-04 — Bevisly Rebrand + Onboarding Polish

### Bevis → Bevisly
The platform name updated to "Bevisly" everywhere — UI labels, page titles, email templates, auth flows, and documentation.

### Onboarding UX Fixes
Several first-login onboarding defects fixed: step completion state now persists correctly, action links in the welcome banner navigate to the right pages, and the banner dismisses cleanly without leaving orphaned state.

### User Flow Improvements
Miscellaneous flow fixes across both roles: empty state handling, missing redirects after key actions, and several dead-end screens that left users with no clear next step.

---

## 2026-05-03 — Sprint #2: Responsibility Score + Employer Brand Page (Complete)

### Employer Responsibility Score
A 0–100 score auto-calculated for every employer from three signals: response rate (50 pts), review speed (30 pts), and feedback quality (20 pts). Calculated via a DB trigger on the `companies` table so it stays current without manual intervention. Displayed as a badge on job cards, the job detail page, the employer dashboard, and the public company brand page. Gives candidates a concrete anti-ghosting signal before they invest time in a proof task.

### Candidate Reliability Score
A 0–100 score auto-calculated on candidate profiles from task completion rate and profile completeness. Updated via DB trigger. Displayed as a badge on the candidate's own overview and their public profile.

### Public Employer Brand Page (`/company/:slug`)
Employers now have a public-facing page at `/company/:slug` showing the company description, mission, culture, website, open roles, and Responsibility Score. Company data columns (`description`, `mission`, `culture`, `website_url`) added to the schema and made publicly readable. Gives candidates a way to research employers before applying.

### Docs & Help Page (`/docs`)
A new `/docs` route with a feature guide for both candidates and employers, an FAQ, and a platform overview tab. Linked from the navbar ("Help") and the landing page footer.

### Navbar & Footer Polish
Navbar trimmed from 6 items to 4 (Jobs, About, Pricing, Help) to prevent overflow. Footer restructured to a 4-column layout with a new "Learn More" column (For Candidates, For Employers, How It Works).

---

## 2026-05-02 — Dedicated Pricing Page

Replaced the shallow pricing section on the landing page with a full `/pricing` route. The new page covers:
- **Employer plans**: Free ($0), Starter ($149/mo or $119 annual), Growth ($299/mo or $239 annual). Annual billing is on by default.
- **Candidate plans**: Always free core tier; Bevisly Plus ($9/mo or $7 annual) for advanced profile features.
- Monthly/annual billing toggle with live price switching and a "Save 20%" badge.
- Full feature comparison table (collapsible by category: Hiring, Signals & Trust, Pipeline & Discovery, Support).
- Add-ons section: Featured Job Boost at $99/job/30 days.
- Value anchor: "One bad hire costs $15,000+" to anchor plan cost against real business risk.
- 6-question FAQ tailored separately for employer and candidate modes.
- Bottom CTA strip with 14-day free trial callout.
- All plan CTAs route to `/auth?mode=signup` — payment not wired yet (Stripe pending).

The landing page pricing section replaced with a lean teaser pointing to `/pricing`. Navbar, footer, and route config all updated.

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
