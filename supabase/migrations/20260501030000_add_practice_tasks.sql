-- Practice tasks library
CREATE TABLE IF NOT EXISTS practice_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  difficulty text NOT NULL DEFAULT 'beginner',
  submission_format text NOT NULL DEFAULT 'text',
  expected_time text NOT NULL DEFAULT '30 min',
  skills text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Candidate attempts
CREATE TABLE IF NOT EXISTS practice_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  practice_task_id uuid REFERENCES practice_tasks(id) ON DELETE CASCADE NOT NULL,
  submission_content text,
  submission_link text,
  ai_score integer,
  ai_feedback text,
  ai_strengths text,
  ai_improvements text,
  credits_awarded integer DEFAULT 0,
  graded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, practice_task_id)
);

ALTER TABLE practice_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read practice_tasks" ON practice_tasks FOR SELECT USING (true);
CREATE POLICY "Candidates insert own practice_submissions" ON practice_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Candidates read own practice_submissions" ON practice_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Candidates update own practice_submissions" ON practice_submissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access practice_submissions" ON practice_submissions USING (true) WITH CHECK (true);

-- Seed: 6 practice tasks
INSERT INTO practice_tasks (title, description, category, difficulty, submission_format, expected_time, skills) VALUES
(
  'Write a Cold Email to a Potential Customer',
  'You are a salesperson at a B2B SaaS startup. Write a compelling cold email to a Head of Marketing at a mid-size e-commerce company, pitching a tool that helps them automate their social media scheduling.

Your email should:
- Have a compelling subject line
- Open with a personalised, non-generic hook
- Clearly explain the value proposition in 2-3 sentences
- Include a low-friction call-to-action
- Be under 150 words

Paste the full email (including subject line) into the text field.',
  'Marketing', 'beginner', 'text', '30 min', ARRAY['copywriting', 'sales', 'communication']
),
(
  'Critique a Landing Page UX',
  'Visit any publicly available SaaS product landing page of your choice (e.g. Notion, Linear, Loom, or any product you use).

Write a structured UX critique covering:
1. First impression (what is clear / unclear above the fold)
2. Value proposition clarity — does a first-time visitor understand what the product does in 5 seconds?
3. Call-to-action effectiveness
4. One specific improvement you would make and why

Include the URL of the page you reviewed at the top of your response. Aim for 200–350 words.',
  'Design', 'beginner', 'text', '45 min', ARRAY['UX', 'design thinking', 'product sense']
),
(
  'Build a Responsive Hero Section',
  'Build the hero section of a landing page for a fictional product called "Flowly" — a productivity app for remote teams.

Requirements:
- Responsive (mobile + desktop)
- Headline, subheadline, CTA button
- Clean, modern styling (Tailwind, plain CSS, or any framework)
- At least one simple animation or hover effect

Submit a GitHub repo link or a live preview link (CodeSandbox, StackBlitz, etc.).',
  'Frontend', 'intermediate', 'link', '60 min', ARRAY['HTML', 'CSS', 'JavaScript', 'responsive design']
),
(
  'Write a Product Requirements Document',
  'Write a mini PRD (Product Requirements Document) for the following feature:

**Feature:** "Saved Searches" for a job board — users can save a search query and get notified when new matching jobs are posted.

Your PRD should include:
- Problem statement (2–3 sentences)
- User stories (at least 3, in "As a... I want... so that..." format)
- Acceptance criteria for each story
- Out of scope (at least 2 things you are explicitly NOT building)
- Open questions (at least 2)

Aim for clarity over length.',
  'Product', 'intermediate', 'text', '60 min', ARRAY['product thinking', 'requirements', 'communication']
),
(
  'Analyze Customer Reviews and Summarize Insights',
  'Below are 10 fictional customer reviews for a project management tool called "TaskFlow". Read them and write a structured analysis.

Reviews:
1. "Finally a tool that doesn''t overwhelm me. The simple board view is perfect."
2. "Integrations with Slack are broken half the time. Super frustrating."
3. "Love the Kanban view but I wish there was a Gantt chart option."
4. "Onboarding took 5 minutes. My team was up and running same day."
5. "The mobile app crashes constantly on Android. Deal breaker."
6. "Customer support responded in under an hour. Rare these days."
7. "Pricing jumped 40% with no warning. Considering switching."
8. "Best tool for small teams. Would not recommend for enterprises."
9. "The recurring task feature saved us hours every week."
10. "Dashboard analytics are too basic. Need more filtering options."

Write:
- Top 3 strengths (with evidence from reviews)
- Top 3 problems (with evidence)
- One prioritized recommendation for the product team',
  'Data', 'beginner', 'text', '45 min', ARRAY['data analysis', 'communication', 'product sense']
),
(
  'Design a REST API for a Bookmarking App',
  'Design the REST API for a simple bookmarking app where users can save links, organize them into collections, and tag them.

Provide:
1. List of endpoints (method + path + brief description), e.g. `GET /bookmarks — returns all bookmarks for authenticated user`
2. The request body and response shape for 2 endpoints of your choice (JSON format)
3. How you would handle authentication (just describe the approach, no code needed)
4. One edge case you considered and how your API handles it

You do not need to write any code — this is a design exercise.',
  'Backend', 'intermediate', 'text', '60 min', ARRAY['API design', 'REST', 'system design']
);
