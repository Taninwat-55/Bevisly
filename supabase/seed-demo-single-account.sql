-- ============================================================
-- BEVISLY DEMO SEED — SINGLE demo_admin ACCOUNT
-- ============================================================
-- Populates both sides of the app for the ONE demo account so a recruiter
-- sees a live experience immediately:
--   • Employer side: a company (Pipebird) with a published job + proof task
--   • Candidate side: a completed profile + an application to that job
--
-- The demo account plays both roles via the in-app Demo Mode switcher, so a
-- single profile carries a company_name (Pipebird) AND a person name (Sofia).
--
-- PREREQUISITE: the auth user demo@bevisly.com exists and its profile row has
--               role = 'demo_admin' (you already did this).
--
-- HOW TO RUN: paste into Supabase Dashboard → SQL Editor → Run.
-- Idempotent: re-running will NOT create duplicates.
-- ============================================================

DO $$
DECLARE
  v_demo_id       UUID;
  v_company_id    UUID;
  v_job_id        UUID;
  v_task_id       UUID;
BEGIN

  -- ── 0. Resolve the demo account ───────────────────────────
  SELECT id INTO v_demo_id FROM auth.users WHERE email = 'demo@bevisly.com';
  IF v_demo_id IS NULL THEN
    RAISE EXCEPTION 'Demo account not found. Create auth user demo@bevisly.com first.';
  END IF;

  -- ── 1. Demo profile — carries BOTH sides ──────────────────
  -- NOTE: role is intentionally left as 'demo_admin' (never overwritten).
  UPDATE profiles SET
    full_name         = 'Sofia Andersen',
    company_name      = 'Pipebird',
    bio               = 'Frontend developer who loves clean UI and real problem-solving — and, wearing the other hat, the team behind Pipebird''s hiring. This is a demo account: use the Demo switcher at the bottom of the screen to explore both the candidate and employer experience.',
    avatar_url        = 'https://api.dicebear.com/9.x/avataaars/svg?seed=SofiaAndersen&backgroundColor=ffd5dc',
    skills            = ARRAY['React', 'TypeScript', 'CSS', 'JavaScript', 'Figma', 'Git'],
    work_status       = 'actively_looking',
    linkedin_url      = 'https://linkedin.com/in/sofia-andersen-dev',
    github_url        = 'https://github.com/sofia-andersen',
    subscription_tier = 'pro_saas',
    is_public         = true,
    is_verified       = true,
    username          = 'demo-sofia'
  WHERE id = v_demo_id;

  -- ── 2. Company (employer side) — create once ──────────────
  SELECT id INTO v_company_id
  FROM companies WHERE owner_id = v_demo_id ORDER BY created_at LIMIT 1;

  IF v_company_id IS NULL THEN
    INSERT INTO companies (id, name, slug, owner_id, description, mission, website_url)
    VALUES (
      gen_random_uuid(),
      'Pipebird',
      'pipebird-demo',
      v_demo_id,
      'Pipebird makes it easy for product teams to sync data between their database and the tools they use — analytics, CRM, data warehouses — without writing custom pipelines. Remote-first, Series A, team of 8.',
      'Data pipelines should be reliable, observable, and effortless to build.',
      'https://pipebird.io'
    )
    RETURNING id INTO v_company_id;

    INSERT INTO company_members (company_id, user_id, role)
    VALUES (v_company_id, v_demo_id, 'owner');
  END IF;

  -- ── 3. Job listing — create once ──────────────────────────
  SELECT id INTO v_job_id
  FROM jobs WHERE employer_id = v_demo_id ORDER BY created_at LIMIT 1;

  IF v_job_id IS NULL THEN
    INSERT INTO jobs (
      id, title, description, requirements,
      employer_id, company_id,
      location, status, job_type, work_mode,
      compensation_type, salary_min, salary_max,
      show_salary_range, pay_period, payment_currency,
      required_skills, is_public, featured
    ) VALUES (
      gen_random_uuid(),
      'Frontend Developer (React / TypeScript)',
      E'We''re looking for a frontend developer to join our product team. You''ll work closely with our designer and backend engineers to build the data pipeline monitoring dashboard that our customers rely on every day.\n\nThis is a real role — not a "do everything" startup job. Your focus is the frontend: React components, state management, performance, and making sure our UI stays snappy even when handling large data sets.\n\nWe care about craft. You''ll own features end-to-end, from design handoff to deployment.',
      E'— 1+ years of React experience (internship, freelance, or personal projects count)\n— TypeScript comfort — you don''t need to be an expert, but you can''t be scared of it\n— Strong eye for UI quality\n— You ship things and take responsibility for them\n— Bonus: experience with data visualisation (charts, graphs, tables)',
      v_demo_id,
      v_company_id,
      'Remote (Europe)',
      'active',
      'full-time',
      'remote',
      'salary',
      480000,
      650000,
      true,
      'yearly',
      'EUR',
      ARRAY['React', 'TypeScript', 'CSS', 'JavaScript'],
      true,
      true
    )
    RETURNING id INTO v_job_id;

    -- ── 4. Proof task for the job ───────────────────────────
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

    -- ── 5. Sample application (candidate side → employer review) ──
    -- The demo applies to its own job so the employer review board opens with
    -- one applicant to look at. Single-account demo: applicant = the demo.
    INSERT INTO submissions (
      id, user_id, job_id, proof_task_id,
      status, hiring_stage,
      submission_link, text_response,
      offer_email_sent, rejection_email_sent,
      created_at, updated_at, started_at, completed_at
    ) VALUES (
      gen_random_uuid(),
      v_demo_id,
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
    );
  END IF;

  RAISE NOTICE '✅ Single-account demo seed complete!';
  RAISE NOTICE '   Demo    ID : %', v_demo_id;
  RAISE NOTICE '   Company ID : %', v_company_id;
  RAISE NOTICE '   Job     ID : %', v_job_id;

END $$;
