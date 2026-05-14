-- ============================================================
-- BEVISLY DEMO SEED — LinkedIn Video
-- ============================================================
-- Run this in Supabase Dashboard → SQL Editor AFTER signing up:
--   Employer : thaninwatice+employer@gmail.com
--   Candidate: thaninwatice+candidate@gmail.com
-- ============================================================

DO $$
DECLARE
  v_employer_id   UUID;
  v_candidate_id  UUID;
  v_company_id    UUID;
  v_job_id        UUID;
  v_task_id       UUID;
  v_submission_id UUID;
BEGIN

  -- ── 0. Resolve auth user IDs ──────────────────────────────
  SELECT id INTO v_employer_id  FROM auth.users WHERE email = 'thaninwatice+employer@gmail.com';
  SELECT id INTO v_candidate_id FROM auth.users WHERE email = 'thaninwatice+candidate@gmail.com';

  IF v_employer_id IS NULL THEN
    RAISE EXCEPTION 'Employer account not found. Sign up first at the app with thaninwatice+employer@gmail.com';
  END IF;
  IF v_candidate_id IS NULL THEN
    RAISE EXCEPTION 'Candidate account not found. Sign up first at the app with thaninwatice+candidate@gmail.com';
  END IF;

  -- ── 1. Employer profile ───────────────────────────────────
  UPDATE profiles SET
    full_name         = 'Marcus Webb',
    email             = 'thaninwatice+employer@gmail.com',
    role              = 'employer',
    bio               = 'CTO & Co-founder at Pipebird. We build data pipeline tools that developers actually love. Looking for sharp junior talent who can prove their skills — not just their credentials.',
    avatar_url        = 'https://api.dicebear.com/9.x/avataaars/svg?seed=MarcusWebb&backgroundColor=b6e3f4',
    company_name      = 'Pipebird',
    subscription_tier = 'pro_saas',
    is_public         = true,
    is_verified       = true,
    username          = 'marcus-webb'
  WHERE id = v_employer_id;

  -- ── 2. Candidate profile ──────────────────────────────────
  UPDATE profiles SET
    full_name    = 'Sofia Andersen',
    email        = 'thaninwatice+candidate@gmail.com',
    role         = 'candidate',
    bio          = 'Frontend developer with a passion for clean UI and real problem-solving. Built 3 production features during my internship at a Copenhagen fintech. Currently open to full-time roles in product-focused teams.',
    avatar_url   = 'https://api.dicebear.com/9.x/avataaars/svg?seed=SofiaAndersen&backgroundColor=ffd5dc',
    skills       = ARRAY['React', 'TypeScript', 'CSS', 'JavaScript', 'Figma', 'Git'],
    work_status  = 'actively_looking',
    linkedin_url = 'https://linkedin.com/in/sofia-andersen-dev',
    github_url   = 'https://github.com/sofia-andersen',
    is_public    = true,
    username     = 'sofia-andersen'
  WHERE id = v_candidate_id;

  -- ── 3. Company ────────────────────────────────────────────
  INSERT INTO companies (id, name, slug, owner_id, description, mission, website_url)
  VALUES (
    gen_random_uuid(),
    'Pipebird',
    'pipebird',
    v_employer_id,
    'Pipebird makes it easy for product teams to sync data between their database and the tools they use — analytics, CRM, data warehouses — without writing custom pipelines. Remote-first, Series A, team of 8.',
    'Data pipelines should be reliable, observable, and effortless to build.',
    'https://pipebird.io'
  )
  RETURNING id INTO v_company_id;

  -- Add employer as company owner
  INSERT INTO company_members (company_id, user_id, role)
  VALUES (v_company_id, v_employer_id, 'owner');

  -- ── 4. Job listing ────────────────────────────────────────
  INSERT INTO jobs (
    id, title, description, requirements,
    employer_id, company_id,
    location, status, job_type, work_mode,
    compensation_type, salary_min, salary_max,
    show_salary_range, pay_period,
    required_skills, is_public, featured
  ) VALUES (
    gen_random_uuid(),
    'Frontend Developer (React / TypeScript)',
    E'We''re looking for a frontend developer to join our product team. You''ll work closely with our designer and backend engineers to build the data pipeline monitoring dashboard that our customers rely on every day.\n\nThis is a real role — not a "do everything" startup job. Your focus is the frontend: React components, state management, performance, and making sure our UI stays snappy even when handling large data sets.\n\nWe care about craft. You''ll own features end-to-end, from design handoff to deployment.',
    E'— 1+ years of React experience (internship, freelance, or personal projects count)\n— TypeScript comfort — you don''t need to be an expert, but you can''t be scared of it\n— Strong eye for UI quality\n— You ship things and take responsibility for them\n— Bonus: experience with data visualisation (charts, graphs, tables)',
    v_employer_id,
    v_company_id,
    'Remote (Europe)',
    'open',
    'full-time',
    'remote',
    'salary',
    480000,
    650000,
    true,
    'yearly',
    ARRAY['React', 'TypeScript', 'CSS', 'JavaScript'],
    true,
    true
  )
  RETURNING id INTO v_job_id;

  -- ── 5. Proof task ─────────────────────────────────────────
  INSERT INTO proof_tasks (
    id, job_id, title, description, instructions,
    submission_format, expected_time, ai_tools_allowed,
    rubric_criteria
  ) VALUES (
    gen_random_uuid(),
    v_job_id,
    'Build a Pipeline Status Dashboard Component',
    'Build a React + TypeScript component that displays the live status of multiple data pipelines.',
    E'Create a component called PipelineStatusBoard that:\n\n1. Accepts a list of pipeline objects (name, status, last_run, success_rate)\n2. Displays each pipeline as a card with a status indicator (green = healthy, yellow = warning, red = failed)\n3. Shows last run time as a relative timestamp ("2 hours ago")\n4. Includes a filter to show only failed pipelines\n5. Has a Refresh button that simulates re-fetching (1s setTimeout is fine)\n\nUse mock data. No backend needed. Style however you like — we care about code quality and UX thinking, not pixel perfection.\n\nSubmit a GitHub repo link with a short README explaining your approach.',
    'link',
    '2–3 hours',
    true,
    '[
      {"name": "Code Quality",   "weight": 30, "description": "Clean, readable TypeScript. Proper component structure. No unnecessary complexity."},
      {"name": "Functionality",  "weight": 35, "description": "All specified features work correctly. Edge cases handled."},
      {"name": "UX Thinking",    "weight": 20, "description": "Layout is intuitive. Status indicators are clear. Loading and empty states considered."},
      {"name": "Documentation",  "weight": 15, "description": "README explains the approach and any decisions made."}
    ]'::jsonb
  )
  RETURNING id INTO v_task_id;

  -- ── 6. Candidate submission (already submitted) ───────────
  INSERT INTO submissions (
    id, user_id, job_id, proof_task_id,
    status, hiring_stage,
    submission_link, text_response,
    offer_email_sent, rejection_email_sent,
    created_at, updated_at, started_at, completed_at
  ) VALUES (
    gen_random_uuid(),
    v_candidate_id,
    v_job_id,
    v_task_id,
    'submitted',
    'new',
    'https://github.com/sofia-andersen/pipeline-status-board',
    E'I focused on keeping the component API minimal — just pass in an array of pipeline objects and the component handles the rest. I used a custom usePipelines hook to separate the filtering logic from the display, which makes it easy to swap in a real API later.\n\nThe status colours follow WCAG contrast ratios so it stays accessible at a glance. The hardest part was the relative timestamp — I wrote a small utility rather than pulling in a library since it was only a few lines.\n\nIf I had more time I''d add a skeleton loading state and animate the status badge transitions.',
    false,
    false,
    NOW() - INTERVAL '5 hours',
    NOW() - INTERVAL '5 hours',
    NOW() - INTERVAL '8 hours',
    NOW() - INTERVAL '5 hours'
  )
  RETURNING id INTO v_submission_id;

  -- ── Done ──────────────────────────────────────────────────
  RAISE NOTICE '✅ Demo seed complete!';
  RAISE NOTICE '   Employer  ID : %', v_employer_id;
  RAISE NOTICE '   Candidate ID : %', v_candidate_id;
  RAISE NOTICE '   Company   ID : %', v_company_id;
  RAISE NOTICE '   Job       ID : %', v_job_id;
  RAISE NOTICE '   Task      ID : %', v_task_id;
  RAISE NOTICE '   Submission ID: %', v_submission_id;

END $$;
