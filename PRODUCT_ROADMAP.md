# Bevisly — Product Roadmap

> Living document. No deadlines — ship when it's right.
> Last updated: 2026-05-01

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| 🔴 | Not started |
| 🟡 | In progress |
| 🟢 | Done / shipped |
| ⏸️ | Parked / deferred |

---

## Vision

To become the world's primary "one-stop" ecosystem for talent — where skills are the currency and potential is never wasted. A community bigger than LinkedIn or Indeed, where even the largest corporations come because it is the most efficient way to find people who can actually do the work.

---

## Mission

To empower job seekers — especially students and career switchers — to prove their value through practical tasks, while providing employers with a streamlined, evidence-based hiring process.

The **"how"** is the Proof-of-Work concept: instead of sending a CV (just words), candidates complete a task (actual proof). This helps SMEs, startups, and eventually large corporations save time and cost in hiring, while giving candidates a permanent, growing record of their real capabilities — regardless of whether they got the job.

Bevisly replaces **trust-based hiring** (resumes, interviews, gut feel) with **proof-based hiring** (tasks, results, verified credentials). It acts as a bridge for people who lack traditional experience but have high skill levels. Every completed task, whether it leads to a job or not, is saved as a permanent digital asset — a "digital trophy" — that strengthens the candidate's profile for every future application.

---

## Core Concept: Proof-of-Work

Inspired by Bitcoin's proof-of-work model: effort produces something verifiable and permanent. On Bevisly:
- Candidates "mine" credentials by completing real tasks
- Each completed proof is a permanent on-profile asset, not a disposable application
- The more proofs a candidate completes, the stronger their Bevisly Score becomes
- Employers get evidence, not promises

---

## 🔥 Pre-Launch (Must ship before cold email outreach)

| # | Feature | Description | Status |
|---|---------|-------------|--------|
| 1 | **Practice Proofs** | Library of 5–10 AI-generated tasks candidates can attempt immediately after signup. AI grades instantly. Score counts toward Leaderboard ranking. Solves the cold-start empty-state problem for new candidates. | 🔴 |
| 2 | **Application Status Tracker** | Pizza-tracker style timeline on candidate dashboard (`Submitted → Under Review → Interview → Decision`). Syncs in real time when employer moves their Kanban card. Kills the resume black hole. | 🔴 |
| 3 | **Verified Skills from Proof Tasks** | AI extracts skills from completed proofs and adds them as "Verified Skills" on the candidate profile — visually distinct from self-claimed skills (Bevisly checkmark badge). | 🔴 |
| 4 | **Stripe Payment Integration** | Subscription checkout for Free/Pro plans, webhook updates `profiles.subscription_tier` in Supabase, Stripe Customer Portal for billing management, Pro feature gating. | 🔴 |

| 5 | **Rejection Email Visual Feedback** | When employer drags a candidate to the Rejected column, the auto-rejection email already sends — but the employer gets no visual confirmation. Show a toast notification and a "Email sent ✓" indicator on the card so employers know it fired. | 🔴 |

### Pre-Launch Checks (non-feature)
- [ ] Full end-to-end user flow walkthrough as both candidate and employer on the production URL
- [ ] Pricing research — validate plan prices against comparable tools (Workable, Lever, Greenhouse)
- [ ] Employer first-login experience — ensure it's immediately clear what to do and what a Proof Task is

---

## 🚀 Post-Launch Features

Concrete, scoped features to build after the first wave of employer feedback.

---

### 1. Bevisly Score (Unified Skill Score)
**Status:** 🔴

We already have a Leaderboard and a Credits system. The next step is a single, meaningful **Bevisly Score** — a composite number that grows every time a candidate completes a task. Think chess Elo rating, not a follower count.

**Score factors:**
- Number of verified proofs completed
- Average employer rating across all proofs
- Consistency (completing tasks without abandoning)
- Task difficulty weighting (harder tasks = more points)

**Why it matters:** Makes the Leaderboard genuinely competitive and gives candidates a tangible measure of progress. Employers can sort/filter candidates by score.

---

### 2. Verified Proof Certificates (Digital Badges)
**Status:** 🔴

When a candidate completes a proof task and receives a rating, they earn a shareable **Verified Proof Certificate** — not just a card on their profile. Think Coursera or Credly, but for real employer-set tasks.

**Concrete implementation:**
- Downloadable certificate card (PNG/PDF) with candidate name, task, employer rating, date, and Bevisly branding
- Shareable link that renders as a rich preview (for LinkedIn posts, Twitter, etc.)
- "Share this achievement" one-click flow

**Note:** The Proof Vault already stores proofs permanently. This adds portability — candidates can take their credentials off-platform.

> The AI Task Generator for employers already exists (`generate-proof-task` edge function). This builds on top of it.

---

### 3. Featured Proofs ("Staking" Your Best Work)
**Status:** 🔴

Candidates choose up to 3 of their completed proofs to "feature" at the very top of their public profile — a curated highlight reel, much more powerful than a resume because it shows actual work output.

**Concrete implementation:**
- "Feature this proof" toggle on each vault card
- Max 3 featured at a time; featured proofs appear above the full vault grid on the public profile
- Visual treatment: slightly larger card, gold/amber border, "Featured" label

**Why it matters:** Gives candidates agency over their first impression. A senior developer can put their highest-rated proofs front and center.

---

### 4. Responsibility Score (Anti-Ghosting Accountability)
**Status:** 🔴

Ghosting is one of the biggest complaints in hiring — from both sides. Bevisly can solve this because all interactions happen on the platform.

**Two-sided score:**

**Employer Responsibility Score:**
- Based on: response rate to submitted proofs, average time to review, percentage of submissions that receive feedback
- Displayed on their job listings so candidates know what to expect
- Employers who ghost submissions see their score drop, making it harder to attract good candidates

**Candidate Reliability Score:**
- Based on: task completion rate (started vs submitted), profile completeness, consistency
- Encourages serious applicants only

**Why it matters:** Creates a marketplace of serious, accountable people on both sides. A core differentiator from LinkedIn and traditional job boards where ghosting has no consequences.

---

### 5. Bounty Board
**Status:** 🔴 (needs business model scoping before building)

Instead of only traditional job postings, companies can post **Bounties** — small, real problems with a defined reward or fast-track benefit.

**Example:** "We need a logo redesigned. Best submission gets $200 or a fast-track interview for our Design role."

**How it differs from current Proof Tasks:**
- Current: candidate applies for a job → completes a task → employer decides
- Bounty: open to anyone → best result wins → winner gets reward or interview priority

**Why it matters:** Bridges the gap between freelance work and full-time roles. Companies get real value immediately. Candidates get paid exposure even without being hired.

**Needs scoping:**
- Who holds the reward payment (escrow)?
- Dispute resolution if employer disputes result quality
- IP/ownership of submitted work
- Whether this is a separate product mode or integrated into existing job flow

---

### 6. Submission Follow-up Questions (Anti-AI Authenticity Layer)
**Status:** 🔴

AI detectors are unreliable and ethically risky — don't try to detect AI use, make human thinking visible alongside the output.

**How it works:**
- When an employer creates a proof task, they also write 2–3 specific follow-up questions (e.g. "Why did you structure your database this way?" / "What would you do differently with more time?")
- Candidates answer these *after* submitting — short, 150 words max each — in a separate required step
- Employer can also trigger a **Proof Discussion Request**: a 15-minute video call to discuss the submission (replaces the traditional first-round interview)

**Why it works:** AI can write the code or the marketing plan. It cannot convincingly answer hyper-specific questions about decision-making in a candidate's own voice. The reflection field already exists — this extends it into structured, task-specific accountability.

**Additional design principle:** The AI task generator should be encouraged to produce hyper-specific tasks (tied to the employer's actual product/data/context) rather than generic ones. Generic tasks are AI-friendly. Specific ones are not.

---

### 7. Employer Verification Badge
**Status:** 🔴

Candidates face scams and fake job postings on open platforms. A verified employer badge builds candidate trust before they invest time in a proof task.

**Implementation:**
- Company email domain check on signup (no gmail/yahoo — must be a business domain)
- Manual review flag for first job posting
- "Verified Employer" badge displayed on all their job listings and their employer profile page

---

### 8. Pay Transparency (Required Salary Range)
**Status:** 🔴

Candidates spend hours on proof tasks for jobs with hidden salaries. This is exploitative and a top complaint in hiring research.

**Implementation:**
- Make salary range required (or at minimum, a clearly visible "Negotiable" flag) on every job posting
- Candidate-facing salary filter on job browse page
- The form fields already exist — enforce and surface them more prominently

---

### 9. Task Time Expectation Label
**Status:** 🔴

Unpaid take-home tasks that consume 6–8+ hours are one of the biggest candidate pain points in modern hiring. Simple fix, high trust signal.

**Implementation:**
- Required "Estimated completion time" field when employer creates a proof task (e.g. "~2 hours")
- Displayed prominently on the task before the candidate starts
- Platform guideline: proof tasks should be scoped to 1–3 hours max. Bevisly enforces this culturally, not technically.

---

### 10. Employer Brand Page
**Status:** 🔴

Candidates should be able to research an employer before committing time to a proof task — just as employers research candidates.

**Implementation:**
- Public employer profile page showing: company name, open jobs, Responsibility Score, average review turnaround time, verified status, and a short company description
- Candidates can see employer track record before applying
- Flips the trust equation: both parties are accountable and visible

---

### 11. Skill Gap Feedback Loop (Candidate Intelligence)
**Status:** 🔴

Rejection with no guidance is one of the most damaging parts of the job search. Bevisly has the data to do something no other platform does: turn rejection into an actionable growth path.

**Implementation:**
- Based on employer feedback patterns across a candidate's submissions, surface insights like: "Employers in your target field are rating your React submissions lower — here are practice tasks to strengthen it"
- Aggregate (anonymized) skill demand data: "The most requested skills in Marketing roles this month are X, Y, Z"
- Turns the platform into a career coach, not just a job board

---

### 12. Proof Call (Built-in Video Interview)
**Status:** 🔴

The employer has reviewed the proof, is interested, and wants to talk. Right now they have to leave Bevisly to schedule a Zoom or Google Meet. Proof Call keeps the entire hiring conversation inside the platform — making Bevisly genuinely one-stop.

**Implementation:**
- Embed video call via Daily.co or Whereby API (both have simple embed SDKs)
- Employer sends a "Proof Call Request" from the candidate's submission page
- Candidate gets notified and accepts a time slot (integrated scheduling)
- Call happens inside Bevisly — employer can reference the proof submission on one side, video on the other
- Call summary / notes saved to the candidate's record

**Why it's powerful:** The employer can literally have the proof open while talking to the candidate. "Walk me through why you made this choice here." That's a fundamentally better interview than a cold Zoom call.

---

### 13. Personality & Culture Fit Layer
**Status:** 🔴

Most screening calls today are just "getting to know you" conversations — personality checks, not skill checks. Bevisly should capture this layer without resorting to rigid tests candidates resent.

**Three-phase approach (build in order):**

**Phase 1 — Video Introduction (simplest, most authentic)**
- 60–90 second "Introduce yourself" video on the candidate profile — no prompt, no script
- Gives employers communication style, energy, and personality signal before they even open the proof
- Low complexity: just a video upload field on the profile

**Phase 2 — Work Style Profile (self-reported)**
- Short structured preference section on the candidate profile: how they work best, communication style, async vs sync preference, team vs solo, structured vs flexible
- Not scored, not a test — just a transparent personality window alongside skills and proofs
- Employers see it during review without it feeling like surveillance

**Phase 3 — Culture Fit Matching (both sides fill in)**
- Employers set team culture preferences when posting a job
- Candidates set their work preferences on their profile
- Platform computes a compatibility score shown to employers during review
- Build this after Phase 1 and 2 are validated with real users

---

### 14. Interview Scheduling (In-Platform Calendar)
**Status:** 🔴

Employers currently have to leave Bevisly to schedule any call (Calendly, email back-and-forth). A built-in scheduling flow completes the one-stop story.

**Implementation:**
- Employer sets available time slots from within the platform
- Candidate receives a scheduling link and picks a time
- Confirmation + calendar invite sent automatically via email
- Integrates with Google Calendar / Outlook via standard APIs
- Used for both Proof Calls (feature 12) and external interviews

---

### 15. Digital Offer Letter
**Status:** 🔴

The final hiring step — making and accepting an offer — still happens outside the platform today. Bringing it in completes the full hiring lifecycle inside Bevisly.

**Implementation:**
- Employer creates an offer letter from a template (role, salary, start date, terms)
- Candidate receives it inside Bevisly and signs digitally (e-signature)
- Signed copy saved to both parties' records
- This makes Bevisly the last tool in the hiring chain, not just the first

**Full hiring flow when this is built:** Post Job → Proof Task → Review → Proof Call → Offer Letter → Done. Everything in one tab.

---

### 16. Reference Check Automation
**Status:** 🔴

Currently manual and awkward — candidate gives email addresses, employer sends separate emails. Automate this inside the platform.

**Implementation:**
- Employer clicks "Request References" from the candidate's profile
- System emails the candidate's listed references with structured questions
- References fill in a short form inside Bevisly
- Responses collected and shown to the employer in the candidate record

---

### 17. Background Check Integration
**Status:** 🔴 (partner-dependent)

One-click background check from the candidate's profile page. Partner with an existing provider (Checkr, Sterling, or a regional equivalent) rather than building in-house.

**Note:** Enterprise / later-stage feature. Adds compliance complexity. Revisit once you have corporate clients asking for it.

---

### 18. Featured Jobs (Paid Promotion)
**Status:** 🔴

An additional revenue stream beyond subscriptions. Employers pay to have their job listing featured prominently on the landing page and at the top of the job browse page — giving them more visibility and faster applicant flow.

**Implementation:**
- Dedicated "Featured Jobs" section on the landing page showcasing 3–6 highlighted listings with a richer card design (company logo, badge, highlighted border)
- Employers purchase a featured slot via Stripe (one-time or weekly/monthly fee — separate from subscription)
- `jobs` table gets a `featured: boolean` and `featured_until: timestamp` column; featured status expires automatically
- Featured badge shown on job cards sitewide while active
- Admin dashboard control to manually feature jobs if needed (for early partners / negotiations)

**Why it works:** Employers who are actively hiring are willing to pay for faster results. This also incentivizes platform quality — featured employers want to look credible, so they'll fill out their profile and Responsibility Score properly.

---

## 💡 Ideas Backlog (Unfiltered)

Ideas captured but not yet scoped or prioritized. Nothing here is committed.

| Idea | Raw thought |
|------|-------------|
| **Community Peer Review** | Experienced users verify work from newer users, earn reputation points. Bitcoin "nodes" analogy — community validates the proof. Needs anti-gaming design before it's viable. |
| **Internal talent mobility** | Employers use Bevisly to identify internal staff ready for promotion via internal proof tasks. Enterprise play, long-term. |
| **Re-skilling pathways** | Partner with learning platforms (Coursera, Udemy) to suggest specific courses based on skill gap data. Affiliate revenue opportunity. |

---

## ⏸️ Considered & Parked

| Feature | Reason parked |
|---------|--------------|
| **Proof Chat (in-app messaging)** | Kept as a long-term reminder. For now, mailto + email notifications cover the use case. Once Proof Call (feature 12) is built, in-app messaging becomes the natural complement. Revisit after Proof Call ships. |
| **Interactive onboarding tutorial** | Takes weeks to build well and most users skip it. Replaced by: Practice Proofs (candidates learn by doing) + first-login checklist prompt for employers. |
| **Community Peer Review** | High gaming/collusion risk (friends reviewing friends). AI grading is more consistent and scalable at this stage. Revisit once the community is large enough to have meaningful social accountability. |
