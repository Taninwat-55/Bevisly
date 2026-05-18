# Bevisly — Product Roadmap

> Living document. No deadlines — ship when it's right.
> Last updated: 2026-05-18

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

## Product Principles (Non-Negotiable)

These are the rules every feature on Bevisly must obey. They define what the platform is and what it refuses to be.

1. **AI is decision support, never the decision.** Bevisly never auto-accepts or auto-rejects a candidate. AI ratings, scores, and signals exist to help a human evaluate faster and more consistently — not to replace the human.
2. **Evaluate against a rubric, not vibes.** Every proof task is scored against criteria the employer defined up front. The rubric is the contract between employer and candidate.
3. **Evidence over opinion.** When the platform (or AI) says something about a submission, it must point to the part of the submission that supports it. No abstract "good fit" claims.
4. **Proof quality is separate from hire decision.** A candidate can have a perfect proof and still not get the role (team fit, timing, headcount). The score reflects the work, not the outcome.
5. **Both sides are accountable and visible.** Employer Responsibility Score and Candidate Reliability Score are first-class platform citizens, not afterthoughts.

**Public positioning:** *"Bevisly does not replace human judgment. It makes human judgment more structured, evidence-based, and auditable."*

---

## Core Concept: Proof-of-Work

Inspired by Bitcoin's proof-of-work model: effort produces something verifiable and permanent. On Bevisly:
- Candidates "mine" credentials by completing real tasks
- Each completed proof is a permanent on-profile asset, not a disposable application
- The more proofs a candidate completes, the stronger their Bevisly Score becomes
- Employers get evidence, not promises

---

## 🚀 Launch Date: Wednesday 2026-05-20

Cold email outreach to first employers begins on launch day.

---

## 🔥 Pre-Launch (Must ship before cold email outreach)

| # | Feature | Description | Status |
|---|---------|-------------|--------|
| 1 | **Practice Proofs** | Library of 5–10 AI-generated tasks candidates can attempt immediately after signup. AI grades instantly. Score counts toward Leaderboard ranking. Solves the cold-start empty-state problem for new candidates. | 🟢 |
| 2 | **Application Status Tracker** | Pizza-tracker style timeline on candidate dashboard (`Submitted → Under Review → Interview → Decision`). Syncs in real time when employer moves their Kanban card. Kills the resume black hole. | 🟢 |
| 3 | **Verified Skills from Proof Tasks** | AI extracts skills from completed proofs and adds them as "Verified Skills" on the candidate profile — visually distinct from self-claimed skills (Bevisly checkmark badge). | 🟢 |
| 4 | **Kanban Board → Sidebar** | "Talent Board" link in employer sidebar → `/employer/talent-board`. Job picker grid; click a job to open its Kanban pipeline. Removes the 2-click buried path through the dashboard. | 🟢 |
| 5 | **Stripe Payment Integration** | Subscription checkout for Free/Pro plans, webhook updates `profiles.subscription_tier` in Supabase, Stripe Customer Portal for billing management, Pro feature gating. | 🔴 |
| 6 | **Rejection Email Visual Feedback** | When employer drags a candidate to the Rejected column, the auto-rejection email already sends — but the employer gets no visual confirmation. Show a toast notification and a "Email sent ✓" indicator on the card so employers know it fired. | 🟢 |
| 7 | **AI Framing & Disclaimers (Anti-Bias Hygiene)** | Cheap, defensive copy + UX changes so we never *appear* to be an "AI hiring decision" tool. Three concrete items: (a) rename "AI suggested rating" → "AI evidence summary" everywhere it appears in the employer review flow; (b) add a one-line disclaimer under every AI-generated rating: *"Suggested by AI based on submission content. Final decision is yours."*; (c) add a one-paragraph "How Bevisly uses AI" section to the `/docs` page and link it from the AI suggestion UI. Protects the brand before any employer or journalist asks "is this an AI hiring tool?" | 🟢 |
| 8 | **Locked Rubric Before Submissions Open** | Employer must define 3–5 weighted rubric criteria when creating a proof task (e.g. "Code clarity", "Problem decomposition", "UX polish"). Once the first candidate submits, the rubric locks for that task — changes require a new task version. All AI suggestions and human ratings score against the locked rubric, not a vague 1–5 star. **Why pre-launch:** without locked rubrics, employers improvise scoring post-hoc and the validation question "is the proof system fair and repeatable across employers?" becomes unanswerable. Promoted from post-launch Phase 1 of feature #19 on 2026-05-08. | 🟢 |

### Reprioritization Rationale (2026-05-08)

The pre-launch filter is **not** "what fits in our engineering budget." In an AI-era build loop, build cost has collapsed and that filter would let the wrong things in or out. The correct filter is: **"What's absent at launch would distort the validation signal we're trying to collect?"**

- **Locked Rubric** passes that filter — without it, we can't tell whether the proof system actually produces fair, repeatable signal across employers. That's the whole thing we're validating.
- **AI Framing & Disclaimers** passes — if our AI surface looks like an "AI hiring decision" tool, we validate the wrong product (and risk press/regulatory exposure).
- **Blind first review, override justification, consistency dashboard, AI self-audit** do *not* pass — they need volume of real decisions to be useful, and we don't have that yet. They stay in feature #19 for post-launch.

### Pre-Launch Checks (non-feature)
- [ ] Full end-to-end user flow walkthrough as both candidate and employer on the production URL
- [ ] Pricing research — validate plan prices against comparable tools (Workable, Lever, Greenhouse)
- [ 🟢 ] Employer first-login experience — ensure it's immediately clear what to do and what a Proof Task is

---

## 🎯 Next Sprint

Both pre-launch feature sprints are complete. Next: **Stripe Payment Integration** (see Pre-Launch section above).

| Priority | Feature Group | Status |
|----------|--------------|--------|
| **#1** | **Bevisly Score + Featured Proofs** | 🟢 Done |
| **#2** | **Responsibility Score + Employer Brand Page** | 🟢 Done |

---

## 🚀 Post-Launch Features

Concrete, scoped features to build after the first wave of employer feedback.

---

### 1. Bevisly Score (Unified Skill Score)
**Status:** 🟢 Done — Sprint #1

We already have a Leaderboard and a Credits system. The next step is a single, meaningful **Bevisly Score** — a composite number that grows every time a candidate completes a task. Think chess Elo rating, not a follower count.

**Score factors:**
- Number of verified proofs completed
- Average employer rating across all proofs
- Consistency (completing tasks without abandoning)
- Task difficulty weighting (harder tasks = more points)

**Why it matters:** Makes the Leaderboard genuinely competitive and gives candidates a tangible measure of progress. Employers can sort/filter candidates by score.

---

### 2. Verified Proof Certificates (Digital Badges)
**Status:** 🟢

When a candidate completes a proof task and receives a rating, they earn a shareable **Verified Proof Certificate** — not just a card on their profile. Think Coursera or Credly, but for real employer-set tasks.

**Concrete implementation:**
- Downloadable certificate card (PNG/PDF) with candidate name, task, employer rating, date, and Bevisly branding
- Shareable link that renders as a rich preview (for LinkedIn posts, Twitter, etc.)
- "Share this achievement" one-click flow

**Note:** The Proof Vault already stores proofs permanently. This adds portability — candidates can take their credentials off-platform.

> The AI Task Generator for employers already exists (`generate-proof-task` edge function). This builds on top of it.

---

### 3. Featured Proofs ("Staking" Your Best Work)
**Status:** 🟢 Done — Sprint #1

Candidates choose up to 3 of their completed proofs to "feature" at the very top of their public profile — a curated highlight reel, much more powerful than a resume because it shows actual work output.

**Concrete implementation:**
- "Feature this proof" toggle on each vault card
- Max 3 featured at a time; featured proofs appear above the full vault grid on the public profile
- Visual treatment: slightly larger card, gold/amber border, "Featured" label

**Why it matters:** Gives candidates agency over their first impression. A senior developer can put their highest-rated proofs front and center.

---

### 4. Responsibility Score (Anti-Ghosting Accountability)
**Status:** 🟢 Done — Sprint #2

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
**Status:** 🟢

AI detectors are unreliable and ethically risky — don't try to detect AI use, make human thinking visible alongside the output.

**How it works:**
- When an employer creates a proof task, they also write 2–3 specific follow-up questions (e.g. "Why did you structure your database this way?" / "What would you do differently with more time?")
- Candidates answer these *after* submitting — short, 150 words max each — in a separate required step
- Employer can also trigger a **Proof Discussion Request**: a 15-minute video call to discuss the submission (replaces the traditional first-round interview)

**Why it works:** AI can write the code or the marketing plan. It cannot convincingly answer hyper-specific questions about decision-making in a candidate's own voice. The reflection field already exists — this extends it into structured, task-specific accountability.

**Additional design principle:** The AI task generator should be encouraged to produce hyper-specific tasks (tied to the employer's actual product/data/context) rather than generic ones. Generic tasks are AI-friendly. Specific ones are not.

---

### 7. Employer Verification Badge
**Status:** 🟢

Candidates face scams and fake job postings on open platforms. A verified employer badge builds candidate trust before they invest time in a proof task.

**Implementation:**
- Company email domain check on signup (no gmail/yahoo — must be a business domain)
- Manual review flag for first job posting
- "Verified Employer" badge displayed on all their job listings and their employer profile page

---

### 8. Pay Transparency (Required Salary Range)
**Status:** 🟢

Candidates spend hours on proof tasks for jobs with hidden salaries. This is exploitative and a top complaint in hiring research.

**Implementation:**
- Make salary range required (or at minimum, a clearly visible "Negotiable" flag) on every job posting
- Candidate-facing salary filter on job browse page
- The form fields already exist — enforce and surface them more prominently

---

### 9. Task Time Expectation Label
**Status:** 🟢

Unpaid take-home tasks that consume 6–8+ hours are one of the biggest candidate pain points in modern hiring. Simple fix, high trust signal.

**Implementation:**
- Required "Estimated completion time" field when employer creates a proof task (e.g. "~2 hours")
- Displayed prominently on the task before the candidate starts
- Platform guideline: proof tasks should be scoped to 1–3 hours max. Bevisly enforces this culturally, not technically.

---

### 10. Employer Brand Page
**Status:** 🟢 Done — Sprint #2

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

### 19. Fairness & Evidence Layer (Anti-Bias Tooling)
**Status:** 🔴

Once employers are actually using Bevisly to make hire/reject decisions at volume, we need to enforce the Product Principles in product, not just in copy. This is the post-launch follow-through to the pre-launch "AI Framing & Disclaimers" item.

Build in this order — each one is a small, shippable feature:

**Phase 1 — Locked Rubric Before Submissions Open** ⬆️ **Promoted to Pre-Launch on 2026-05-08.** See pre-launch row #8 for the live spec. Kept here as a reference anchor for the remaining phases.

**Phase 2 — Blind First Review**
- During the first review pass, hide candidate name, photo, university, and demographic-adjacent fields. Show only the submission and the rubric.
- After the employer scores, the identity is revealed for the human conversation phase.
- Toggleable per employer (some will want it off; default on).

**Phase 3 — Required Justification on Override**
- If the employer's rating differs from the AI evidence summary by more than 1.5 points (on a 5-point scale), require a one-sentence written justification before the rating saves.
- Not a punishment — a forcing function that makes the employer articulate their reasoning. The justifications also become training data for improving AI suggestions over time.

**Phase 4 — Employer Consistency Dashboard**
- Per-employer analytics page showing: pass rate by stage, score distributions, rejection patterns, time-to-review.
- Soft "fairness alerts" when patterns look off: e.g. *"You've rejected 80% of submissions in under 2 minutes this week"* or *"Your scores cluster around 2/5 — consider whether the rubric is calibrated correctly."*
- No public scoring of the employer's bias (that's punitive and unhelpful). Private nudges only.

**Phase 5 — AI Self-Audit (Internal)**
- Weekly internal job that re-runs the AI evidence summary on a sample of past submissions and flags drift, inconsistency, or hallucination.
- Not user-facing. Operational hygiene so we can confidently say "we audit our AI."

**Why post-launch (Phases 2–5):** These need real employer decisions at volume to be useful — they observe and correct patterns we don't have data on yet. Phase 1 (Locked Rubric) was promoted to pre-launch on 2026-05-08 because it's a precondition for the validation signal itself, not an optimization on top of it. See pre-launch Reprioritization Rationale for the framing.

---

### 20. AI Chatbot Assistant
**Status:** 🔴

An in-app AI assistant (powered by Gemini) surfaced as a chat widget across both dashboards.

**Candidate-side:** Helps candidates understand proof task requirements, refine their submissions, prep interview answers, and identify skill gaps based on their history.

**Employer-side:** Helps employers draft job descriptions and proof tasks faster, suggests follow-up questions for submissions, and answers platform how-to questions.

**Why it matters:** Reduces the learning curve for new users on both sides and keeps people on-platform rather than switching to ChatGPT mid-task. Long-term, the chatbot becomes a career coach for candidates and a recruitment assistant for employers — a compounding retention feature.

---

### 21. Career Compass (AI Self-Discovery for Candidates)
**Status:** 🟢

Most career tools tell you what jobs exist. Career Compass tells you where *you* fit — and what's in your way. It's a structured AI session that reads a candidate's entire Bevisly history and helps them answer three questions: Where should I go? Am I ready to get there? What's stopping me?

**What makes it Bevisly-native:** Other tools rely on self-reported data. Career Compass reads actual proof submissions, employer ratings, and verified skills — evidence, not claims. A candidate who scored well on "problem decomposition" across three proofs gets told that, with specifics. That's insight no CV-based tool can produce.

---

**Step 1 — Intake form (candidate fills in before first session)**

The AI needs context the profile doesn't capture. A short one-time form asks:
- What kind of work energises you most?
- What's your target role or field in 1 year? In 3 years?
- What feels like your biggest blocker right now? (skills, experience, confidence, location, salary, etc.)
- How do you prefer to work? (team size, remote vs. office, structured vs. flexible)

Answers are saved to the candidate's profile and can be updated any time. Updating triggers a prompt to rerun the analysis.

---

**Step 2 — AI analysis (runs on demand)**

The `career-compass` edge function (Gemini 2.5 Flash) reads:
- Profile fields: bio, claimed skills, education, work experience
- Verified skills extracted from completed proofs
- All proof submissions and their employer ratings and written feedback
- Bevisly Score and score trajectory over time
- Intake form answers

---

**Step 3 — Structured report output**

Not a chat interface — a structured four-section report:

**Section 1 — Profile Snapshot**
"Here's what we know about you from your proofs and profile." Summarises the candidate's demonstrated strengths in plain language, grounded in specific proofs. Acts as a mirror — candidates often don't recognise their own pattern until it's named for them.

**Section 2 — Career Direction**
Three role types the AI recommends based on demonstrated strengths and stated interests. Each one includes: why it fits (linked to specific proofs or ratings), a Bevisly Readiness percentage, and 2–3 real open roles on the platform that match right now.

**Section 3 — Proof Readiness Breakdown**
For each recommended role type: "What employers in this field consistently score on" vs. "What your proofs demonstrate." A clear gap/match comparison per rubric criterion — not abstract, always tied to real submission data.

**Section 4 — Next Actions**
Concrete, prioritised steps: complete this practice proof, fill in this profile field, apply for these two specific open roles. Every action is grounded in the gap identified — no generic advice.

---

**UX rules:**
- **Completeness gate:** Bio filled + at least 1 proof submission required before the tool unlocks. Empty profiles get a prompt to complete those first — generic output on an empty profile erodes trust.
- **Rerun button:** Candidate can rerun the analysis any time after adding proofs or updating their profile. Each run is a fresh analysis, not cached from the last session.
- **Honest labelling:** *"Career Compass is powered by Gemini. These are evidence-based suggestions, not verdicts."* One-line disclaimer on every output.
- **Privacy:** Analysis is private to the candidate. Never surfaced to employers.
- **Follow-up:** After reading the report, the candidate can type a follow-up question (e.g. "What if I want to pivot to UX instead?") — Gemini responds in-context using the same session data.

---

**Placement:**
- Dedicated page at `/candidate/career-compass`
- Linked from candidate sidebar
- Featured as the primary empty-state CTA for new candidates who have no proofs yet ("Start by understanding where you stand")

---

**Tech:**
- New edge function: `career-compass` (Deno, Gemini 2.5 Flash)
- Reads: `profiles`, `proof_submissions`, `employer_ratings`, `verified_skills` tables
- Input: intake form answers + user ID
- Output: structured JSON (snapshot, direction array, readiness breakdown, next actions)
- Frontend: structured report UI with cards per section and expandable details — not a generic chat interface

---

**Relationship to other features:**
- **Feature #11 (Skill Gap Feedback Loop):** Passive — surfaces insights after rejections. Career Compass is active — candidate asks for it on their own terms. They serve different emotional moments and both should exist.
- **Feature #20 (AI Chatbot):** The chatbot is general-purpose Q&A across both dashboards. Career Compass is a structured, guided self-discovery flow with a defined input/output shape. Launch separately — they solve different problems. Longer-term, Career Compass could be surfaced as a deep-link mode within the chatbot.

---

**Why post-launch:**
Output quality scales with proof history. A new candidate with zero submissions gets advice too generic to be useful, which erodes trust in the feature. This is most powerful once candidates have completed at least 2–3 proofs — then the analysis becomes genuinely personal and evidence-grounded. Build after the first wave of candidates has real proof data on the platform.

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
| **Interview Scheduling (In-Platform Calendar)** | Most valuable once real hiring is happening at volume. Deferred until there's usage data showing where employers drop off mid-process. |
| **Proof Call (Built-in Video Interview)** | High build effort, only valuable when real hiring is active. Deferred alongside Scheduling — revisit together once the marketplace has traction. |
