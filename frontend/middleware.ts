const BOT_AGENTS = [
  'slackbot', 'slack-imgproxy',
  'linkedinbot',
  'twitterbot',
  'facebookexternalhit', 'facebot',
  'whatsapp',
  'telegrambot',
  'discordbot',
  'applebot',
  'googlebot',
  'bingbot',
  'duckduckbot',
  'embedly',
  'pinterest',
  'redditbot',
  'outbrain',
  'quora link preview',
];

// AI model crawlers that read page content, not just OG tags.
// Update when new major AI crawlers are identified.
const AI_CRAWLER_AGENTS = [
  'gptbot',
  'chatgpt-user',
  'oai-searchbot',
  'claude-web',
  'anthropic-ai',
  'perplexitybot',
  'google-extended',
  'bytespider',
  'ccbot',
  'diffbot',
  'xai',
  'cohere-ai',
];

function isBot(ua: string): boolean {
  const lower = ua.toLowerCase();
  return BOT_AGENTS.some(b => lower.includes(b));
}

function isAiCrawler(ua: string): boolean {
  const lower = ua.toLowerCase();
  return AI_CRAWLER_AGENTS.some(b => lower.includes(b));
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// For social bots: minimal OG tags + redirect (link preview use case).
function ogHtml(opts: {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
}): Response {
  const { title, description, image, url, type = 'website' } = opts;
  const t = escape(title);
  const d = escape(description);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${t}</title>
  <meta name="description" content="${d}" />
  <meta property="og:type" content="${type}" />
  <meta property="og:site_name" content="Bevisly" />
  <meta property="og:title" content="${t}" />
  <meta property="og:description" content="${d}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${url}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@bevisly" />
  <meta name="twitter:title" content="${t}" />
  <meta name="twitter:description" content="${d}" />
  <meta name="twitter:image" content="${image}" />
  <meta http-equiv="refresh" content="0;url=${url}" />
  <link rel="canonical" href="${url}" />
</head>
<body><p>Redirecting to <a href="${url}">${t}</a>...</p></body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  });
}

// For AI crawlers: full readable HTML with actual content, no redirect.
function crawlerPage(opts: { title: string; description: string; body: string; url: string; cacheSeconds?: number }): Response {
  const { title, description, body, url, cacheSeconds = 3600 } = opts;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escape(title)}</title>
  <meta name="description" content="${escape(description)}" />
  <link rel="canonical" href="${url}" />
</head>
<body>
${body}
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': `public, max-age=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 24}`,
    },
  });
}

// Static blog post registry — keep in sync with src/content/blog/*.md frontmatter.
// Add a new entry here whenever a new blog post is published.
const BLOG_POSTS: Array<{ slug: string; title: string; description: string; date: string; tags: string[] }> = [
  {
    slug: 'why-proof-of-work-hiring-matters',
    title: 'Why Proof-of-Work Hiring Is the Future for Junior Talent',
    description: "CVs filter out strong candidates before anyone sees their actual work. Here's why proof-of-work hiring fixes that — and why it matters most for junior talent.",
    date: '2026-05-15',
    tags: ['hiring', 'junior talent', 'proof-of-work', 'skills-based hiring'],
  },
  {
    slug: 'modern-job-market-history-mechanics-ai-era',
    title: 'The Modern Job Market: History, Mechanics, and Navigating the AI Era',
    description: 'How the job market became this hard — a historical overview, the mechanics behind it, and evidence-backed strategies for navigating it in the AI era.',
    date: '2026-05-15',
    tags: ['job market', 'AI', 'career', 'hiring'],
  },
];

async function fetchOne(
  table: string,
  params: Record<string, string>,
): Promise<Record<string, unknown> | null> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  const qs = new URLSearchParams({ ...params, limit: '1' });
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${qs}`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: 'application/json',
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as unknown[];
    return Array.isArray(data) && data.length > 0 ? (data[0] as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const BASE_URL = 'https://bevisly.com';
const DEFAULT_IMAGE = 'https://bevisly.com/logo.png';
const DEFAULT_PROFILE_IMAGE = 'https://bevisly.com/og-card-default.png';

export default async function middleware(request: Request): Promise<Response | undefined> {
  const ua = request.headers.get('user-agent') ?? '';
  const { pathname } = new URL(request.url);

  // ── AI CRAWLERS ─────────────────────────────────────────────────────────────
  // Serve rich readable HTML so AI models can accurately understand what
  // Bevisly is and does. The React SPA shell is invisible to these crawlers.
  if (isAiCrawler(ua)) {

    // Homepage
    if (pathname === '/') {
      return crawlerPage({
        title: 'Bevisly — Proof-First Hiring for Junior Talent',
        description: 'The proof-first hiring platform for junior talent. Candidates prove skills with 30-minute tasks. Employers review real work, not CVs.',
        url: `${BASE_URL}/`,
        body: `
<h1>Bevisly — Proof-First Hiring for Junior Talent</h1>
<p>Bevisly is a hiring platform where junior candidates prove their skills through short, structured proof tasks — not CVs or self-reported credentials. Employers review actual work output and shortlist based on demonstrated ability.</p>

<h2>The Problem Bevisly Solves</h2>
<p>Junior hiring is broken. Employers receive hundreds of applications with identical keyword-stuffed CVs and no reliable signal for who can actually do the work. Candidates — recent graduates, career switchers, students — get filtered out before anyone sees what they can build. Traditional job boards optimise for credential matching, not skill matching.</p>

<h2>How Proof-First Hiring Works</h2>

<h3>For Employers</h3>
<ol>
  <li><strong>Post a role:</strong> Describe the position in plain English. Bevisly's AI (powered by Gemini) generates a relevant proof task automatically — typically completable in 30 minutes. No task design experience needed.</li>
  <li><strong>Define a rubric:</strong> Set 3–5 weighted evaluation criteria when creating the proof task. Once the first candidate submits, the rubric locks — ensuring consistent, fair evaluation across all applicants.</li>
  <li><strong>Candidates submit real work:</strong> Applicants complete the task and submit actual deliverables — code, writing, analysis, designs. No cover letter. No keyword games.</li>
  <li><strong>Review with AI assistance:</strong> AI (Gemini) generates an evidence summary citing specific parts of each submission against the rubric. You see the rubric score, the AI's notes, and the raw submission. Every shortlist decision is yours — AI is decision support, never the decision maker.</li>
  <li><strong>Shortlist in an afternoon:</strong> From job post to shortlist in under 10 minutes of setup. Review candidates based on what they built, not how their CV reads.</li>
</ol>

<h3>For Candidates</h3>
<ol>
  <li><strong>Find a role or practice:</strong> Browse proof-based junior roles or complete Practice Proof Tasks to start building your portfolio before you even apply to anything.</li>
  <li><strong>Complete the proof task:</strong> 30 minutes of real work. Submit your deliverable — no cover letter, no keyword stuffing required.</li>
  <li><strong>Earn a verified credential:</strong> Employer-reviewed feedback is added to your public Proof Vault portfolio. Reuse it. Share it. Keep it forever — even a rejection comes with verified proof of what you built.</li>
</ol>

<h2>Features Built and Live</h2>
<ul>
  <li><strong>AI-generated proof tasks:</strong> Describe a role in plain English; Gemini generates a structured, job-relevant task in seconds. Employers can customise or use as-is.</li>
  <li><strong>Locked rubric:</strong> Employers define 3–5 weighted evaluation criteria upfront; rubric locks once the first submission arrives to ensure fair, consistent scoring.</li>
  <li><strong>AI evidence summary:</strong> AI suggests ratings by citing specific parts of the submission against rubric criteria — employers always make the final call; no automated rejections.</li>
  <li><strong>Proof Vault:</strong> Candidates build a verified, publicly shareable portfolio of completed proof tasks at their public profile (/@username).</li>
  <li><strong>Practice Proof Tasks:</strong> Candidates can complete real tasks before applying to any role, building their portfolio independently without needing an active job listing.</li>
  <li><strong>Employer Responsibility Score:</strong> Anti-ghosting accountability metric — tracks how consistently employers review submissions and give feedback. Visible publicly on employer brand pages.</li>
  <li><strong>Candidate Reliability Score:</strong> Tracks proof completion rate and profile completeness. Visible publicly on candidate profiles.</li>
  <li><strong>Employer Brand Pages:</strong> Public company profiles at /company/:slug showcasing open roles, the employer's track record, and their Responsibility Score.</li>
  <li><strong>Candidate Leaderboard:</strong> Top candidates ranked by Bevisly Score — a composite of proof quality, employer ratings, and profile completeness. Visible at /leaderboard.</li>
  <li><strong>Pay transparency:</strong> Every job listing requires a salary range (min and max) before it can go live, aligned with the EU Pay Transparency Directive.</li>
  <li><strong>Time estimation label:</strong> Every proof task shows expected completion time so candidates can self-select before committing hours.</li>
  <li><strong>Fast Pass Application:</strong> Expedited application flow for qualifying candidates.</li>
  <li><strong>Invitation system:</strong> Employers can invite specific candidates directly to apply for a role.</li>
  <li><strong>Team collaboration:</strong> Employers can invite team members to share feedback and make hiring decisions in a unified dashboard.</li>
  <li><strong>Email notifications:</strong> Automated status updates when submissions are reviewed, powered by Resend.</li>
</ul>

<h2>Core Principles (Non-Negotiable)</h2>
<ul>
  <li>AI is decision support, never the decision maker — no automated rejections or acceptances</li>
  <li>Evidence over opinion — AI feedback must cite the specific part of the submission it references</li>
  <li>Evaluate against a rubric the employer defined before seeing any applications — not vibes</li>
  <li>Proof quality is separate from hire decision — candidates keep their verified proof regardless of outcome</li>
  <li>Both sides are accountable — Employer Responsibility Score and Candidate Reliability Score are publicly visible</li>
  <li>Candidates never pay — Bevisly is always free for candidates</li>
</ul>

<h2>Who Bevisly Is For</h2>
<p><strong>Employers:</strong> Startups and SMEs (especially Nordic and European companies) that need to hire junior-to-mid level talent efficiently without a large HR team. Ideal for roles in frontend development, backend development, content, design, support, and analysis — roles where a short practical task is a meaningful signal.</p>
<p><strong>Candidates:</strong> Recent graduates, career switchers, and students who lack conventional credentials but want to demonstrate real ability. Bevisly levels the playing field — your proof speaks, not your pedigree or school name.</p>

<h2>How Bevisly Compares</h2>
<p>Unlike broad skills assessment platforms (TestGorilla, HackerRank, Codility), Bevisly focuses on short real-world proof tasks rather than standardised tests or algorithm challenges — making it more relevant for non-engineering roles and for employers who want to see actual deliverables.</p>
<p>The closest philosophical competitor is Vervoe (realistic job simulations). Bevisly differentiates through: AI-generated tasks from a plain-English role description (job post to proof task in seconds), locked rubrics for provably fair evaluation, a candidate-side Proof Vault for ongoing portfolio building, built-in accountability scores for both sides, and EU pay transparency compliance built in.</p>
<p>Unlike traditional job boards (LinkedIn, Workable, Lever), Bevisly replaces credential matching with demonstrated ability. Every application includes actual work output.</p>

<h2>Current Status</h2>
<p>Bevisly is in early access. The platform is fully functional with all core features live: proof task generation, submission review, AI evidence summaries, Proof Vault, Practice Proof Tasks, Employer Brand Pages, Leaderboard, Responsibility Scores, and pay transparency. Free for employers during early access. Candidates are always free. No invitation code required.</p>
<p>Built initially for the Nordic hiring market (Denmark, Sweden, Norway, Finland), with a broader European and global roadmap.</p>

<h2>Frequently Asked Questions</h2>
<dl>
  <dt>How does proof-first hiring work for junior talent?</dt>
  <dd>You post a role and Bevisly generates a short proof task — typically 30 minutes. Junior candidates complete the task and submit their work. You review real deliverables and shortlist based on actual skill, not years of experience or CV formatting.</dd>

  <dt>How quickly can I start reviewing candidates?</dt>
  <dd>Most employers have their first proof task live within 15 minutes of signing up. Candidate submissions typically arrive within 24–48 hours of posting.</dd>

  <dt>Is Bevisly free for candidates?</dt>
  <dd>Yes, always. Complete proof tasks, build your verified portfolio, and keep your credentials forever — at no cost. Candidates should never pay to prove themselves.</dd>

  <dt>How is Bevisly different from LinkedIn or traditional job boards?</dt>
  <dd>Traditional job boards filter on credentials — degree, job title, years of experience. Bevisly filters on demonstrated ability. Every application includes a short proof task, so employers compare actual work output rather than self-reported claims. This is especially valuable for recent graduates and career switchers who lack conventional credentials.</dd>

  <dt>Does Bevisly comply with EU pay transparency requirements?</dt>
  <dd>Yes. Every job posted on Bevisly requires a salary range (min and max) before it can go live, aligned with the EU Pay Transparency Directive.</dd>

  <dt>How does the AI feedback system work?</dt>
  <dd>When an employer reviews a submission, Bevisly's AI (Gemini) suggests a rating and feedback paragraph based on the proof task rubric, citing specific parts of the submission. The employer always makes the final decision — AI is decision support, never the decision maker. No automated rejections.</dd>

  <dt>What is the Bevisly Responsibility Score?</dt>
  <dd>An anti-ghosting accountability metric. For employers, it tracks how consistently they review submissions and give feedback. For candidates, it tracks proof completion rate and profile completeness. Both scores are publicly visible to build trust on both sides of the hiring process.</dd>

  <dt>Can candidates use Bevisly without applying for a specific job?</dt>
  <dd>Yes. Practice Proof Tasks allow candidates to complete real tasks and build their Proof Vault portfolio independently — before any job application. When the right role appears, their proof is already waiting.</dd>

  <dt>What happens if a candidate is rejected?</dt>
  <dd>Their completed proof task and employer feedback are still added to their Proof Vault. Rejections on Bevisly come with verified evidence of the work they did — which they keep forever and can share publicly.</dd>
</dl>

<h2>Contact and Links</h2>
<ul>
  <li>Website: https://bevisly.com</li>
  <li>Email: bevislyapp@gmail.com</li>
  <li>Blog: https://bevisly.com/blog</li>
  <li>About: https://bevisly.com/about</li>
  <li>Jobs: https://bevisly.com/jobs</li>
  <li>Companies hiring: https://bevisly.com/companies</li>
  <li>Candidate leaderboard: https://bevisly.com/leaderboard</li>
  <li>Pricing: https://bevisly.com/pricing</li>
  <li>Docs: https://bevisly.com/docs</li>
</ul>`.trim(),
      });
    }

    // About page
    if (pathname === '/about') {
      return crawlerPage({
        title: 'About Bevisly — Proof-First Hiring Platform',
        description: 'Bevisly was built by a founder who spent over a year unable to break into the job market despite having credentials. This is the platform he wished existed.',
        url: `${BASE_URL}/about`,
        body: `
<h1>About Bevisly</h1>
<p>Bevisly was built by someone who got tired of the broken hiring process. This is the platform I wished existed.</p>

<h2>The Story Behind Bevisly</h2>
<p>The founder, Taninwat Kaewpankan (Ice), graduated with a Bachelor's in Game Design and Project Management, then completed a Master's in Entrepreneurship. By every traditional measure, he had the credentials. But he still spent over a year applying — and hearing nothing back.</p>
<p>The one role he landed was a volunteer position in a student-run consultancy bridging startups and SMEs with student talent. He loved it. But it also showed him: the hiring system is fundamentally broken for junior talent. Strong people get filtered out before anyone sees their actual work.</p>
<p>Inspired by Bitcoin's proof-of-work concept — you do the work, you prove it, you win the reward — he built Bevisly. A platform where junior talent proves skills through real tasks. Where even a rejection comes with verified proof of what you built. Where SMEs and startups can find competent people without spending hours screening CVs.</p>

<h2>Mission</h2>
<p>To make hiring fast, fair, and skill-first for junior talent. Bevisly replaces the CV black hole with a 30-minute proof task — giving recent grads, career switchers, and students an equal chance to prove what they can actually do.</p>

<h2>Vision</h2>
<p>Bevisly aims to become the standard for proof-based hiring in the Nordics — and eventually globally. A world where your first job is not gated by who you know or how well you wrote a cover letter, but by what you can actually deliver.</p>

<h2>What We Are Building</h2>
<p>Today, Bevisly does one thing well: it replaces CV screening with a short proof task for junior roles. Employers post a role, AI generates the task, candidates submit their work, employers review. The focus is on nailing that first handshake — proof-first, fast, fair.</p>
<p>All core features are live: AI-generated proof tasks, locked rubrics, AI evidence summaries, Proof Vault, Practice Proofs, Employer Brand Pages, Leaderboard, Responsibility Scores, pay transparency compliance.</p>

<h2>Founder</h2>
<p>Taninwat Kaewpankan — Founder and Builder. MSc Entrepreneurship. Built Bevisly so junior talent gets judged on what they can do, not how well their CV reads.</p>

<h2>Contact</h2>
<p>Email: bevislyapp@gmail.com</p>
<p>Website: https://bevisly.com</p>`.trim(),
      });
    }

    // Blog index
    if (pathname === '/blog') {
      const postList = BLOG_POSTS.map(p =>
        `<article>\n  <h2><a href="${BASE_URL}/blog/${p.slug}">${escape(p.title)}</a></h2>\n  <p>${escape(p.description)}</p>\n  <p>Published: ${p.date} | Tags: ${p.tags.join(', ')}</p>\n</article>`
      ).join('\n\n');

      return crawlerPage({
        title: 'Blog — Bevisly',
        description: 'Insights on proof-of-work hiring, junior talent, and building Bevisly — written by the founder.',
        url: `${BASE_URL}/blog`,
        body: `<h1>Bevisly Blog</h1>\n<p>Thoughts on proof-of-work hiring, junior talent, and building in the open — from the founder.</p>\n\n${postList}`,
      });
    }

    // Individual blog post
    const blogMatch = pathname.match(/^\/blog\/([^/]+)$/);
    if (blogMatch) {
      const slug = blogMatch[1];
      const post = BLOG_POSTS.find(p => p.slug === slug);
      if (post) {
        return crawlerPage({
          title: `${post.title} — Bevisly Blog`,
          description: post.description,
          url: `${BASE_URL}/blog/${post.slug}`,
          body: `<h1>${escape(post.title)}</h1>\n<p>${escape(post.description)}</p>\n<p>Published: ${post.date}</p>\n<p>Tags: ${post.tags.join(', ')}</p>\n<p>Full article: <a href="${BASE_URL}/blog/${post.slug}">${BASE_URL}/blog/${post.slug}</a></p>`,
        });
      }
    }

    // Dynamic routes: fetch data and serve readable content for AI crawlers
    const jobMatchAi = pathname.match(/^\/jobs\/([^/]+)$/);
    if (jobMatchAi) {
      const id = jobMatchAi[1];
      const job = await fetchOne('jobs', { select: 'title,company,description,location,salary_min,salary_max', id: `eq.${id}` });
      if (job) {
        const title = `${job.title as string} at ${job.company as string}`;
        const desc = (job.description as string | undefined) ?? '';
        const salary = job.salary_min && job.salary_max
          ? `Salary: €${job.salary_min}–€${job.salary_max}`
          : '';
        return crawlerPage({
          title: `${title} | Bevisly`,
          description: desc.slice(0, 160) || `Apply for the ${job.title as string} role at ${job.company as string} on Bevisly.`,
          url: `${BASE_URL}/jobs/${id}`,
          cacheSeconds: 300,
          body: `<h1>${escape(title)}</h1>\n${job.location ? `<p>Location: ${escape(job.location as string)}</p>\n` : ''}<p>${salary}</p>\n<p>${escape(desc.slice(0, 500))}${desc.length > 500 ? '…' : ''}</p>\n<p>This role uses proof-first hiring on Bevisly. Candidates apply by completing a short proof task — typically 30 minutes — instead of submitting a CV.</p>\n<p>Apply at: <a href="${BASE_URL}/jobs/${id}">${BASE_URL}/jobs/${id}</a></p>`,
        });
      }
    }

    const companyMatchAi = pathname.match(/^\/company\/([^/]+)$/);
    if (companyMatchAi) {
      const slug = companyMatchAi[1];
      const company = await fetchOne('companies', { select: 'name,description', slug: `eq.${slug}` });
      if (company) {
        const name = company.name as string;
        const desc = (company.description as string | undefined) ?? '';
        return crawlerPage({
          title: `${name} | Bevisly Employer Profile`,
          description: desc.slice(0, 160) || `${name} is hiring on Bevisly using proof-first hiring.`,
          url: `${BASE_URL}/company/${slug}`,
          cacheSeconds: 300,
          body: `<h1>${escape(name)}</h1>\n<p>${escape(desc)}</p>\n<p>${escape(name)} uses Bevisly's proof-first hiring: candidates apply by completing a short real-world task instead of submitting a CV.</p>\n<p>View open roles at: <a href="${BASE_URL}/company/${slug}">${BASE_URL}/company/${slug}</a></p>`,
        });
      }
    }

    const profileMatchAi = pathname.match(/^\/@([^/]+)$/);
    if (profileMatchAi) {
      const username = profileMatchAi[1].toLowerCase();
      const profile = await fetchOne('profiles', { select: 'full_name,username', username: `eq.${username}` });
      if (profile) {
        const displayName = (profile.full_name as string | undefined) ?? `@${username}`;
        return crawlerPage({
          title: `${displayName} | Bevisly Profile`,
          description: `View ${displayName}'s verified proof portfolio on Bevisly.`,
          url: `${BASE_URL}/@${username}`,
          cacheSeconds: 300,
          body: `<h1>${escape(displayName)}</h1>\n<p>@${escape(username)}</p>\n<p>${escape(displayName)} has a verified proof portfolio on Bevisly — a collection of employer-reviewed work samples that demonstrate real skills.</p>\n<p>View profile at: <a href="${BASE_URL}/@${username}">${BASE_URL}/@${username}</a></p>`,
        });
      }
    }

    return undefined;
  }

  // ── SOCIAL BOTS ──────────────────────────────────────────────────────────────
  // Serve OG meta tags for link previews (Slack, LinkedIn, Twitter, etc.).
  if (!isBot(ua)) return undefined;

  // /jobs/:id
  const jobMatch = pathname.match(/^\/jobs\/([^/]+)$/);
  if (jobMatch) {
    const id = jobMatch[1];
    const job = await fetchOne('jobs', { select: 'title,company,description', id: `eq.${id}` });
    if (job) {
      const title = `${job.title as string} at ${job.company as string} | Bevisly`;
      const raw = (job.description as string | undefined) ?? '';
      const description = raw.slice(0, 160) || `Apply for the ${job.title as string} role at ${job.company as string} on Bevisly.`;
      return ogHtml({ title, description, image: DEFAULT_IMAGE, url: `${BASE_URL}/jobs/${id}` });
    }
  }

  // /company/:slug
  const companyMatch = pathname.match(/^\/company\/([^/]+)$/);
  if (companyMatch) {
    const slug = companyMatch[1];
    const company = await fetchOne('companies', { select: 'name,description,logo_url', slug: `eq.${slug}` });
    if (company) {
      const name = company.name as string;
      const title = `${name} | Bevisly Employer Profile`;
      const description = (company.description as string | undefined) ?? `${name} is hiring on Bevisly.`;
      const image = (company.logo_url as string | undefined) ?? DEFAULT_IMAGE;
      return ogHtml({ title, description, image, url: `${BASE_URL}/company/${slug}`, type: 'profile' });
    }
  }

  // /@:username
  const profileMatch = pathname.match(/^\/@([^/]+)$/);
  if (profileMatch) {
    const username = profileMatch[1].toLowerCase();
    const profile = await fetchOne('profiles', { select: 'full_name,username,avatar_url', username: `eq.${username}` });
    if (profile) {
      const displayName = (profile.full_name as string | undefined) ?? `@${username}`;
      const title = `${displayName} | Bevisly Profile`;
      const description = `View ${displayName}'s verified proof portfolio on Bevisly.`;
      const image = (profile.avatar_url as string | undefined) ?? DEFAULT_PROFILE_IMAGE;
      return ogHtml({ title, description, image, url: `${BASE_URL}/@${username}`, type: 'profile' });
    }
  }

  return undefined;
}

export const config = {
  matcher: ['/', '/about', '/blog', '/blog/:slug+', '/jobs/:path+', '/company/:path+', '/@:path+'],
};
