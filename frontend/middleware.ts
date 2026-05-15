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

function isBot(ua: string): boolean {
  const lower = ua.toLowerCase();
  return BOT_AGENTS.some(b => lower.includes(b));
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

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
  if (!isBot(ua)) return undefined;

  const { pathname } = new URL(request.url);

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
  matcher: ['/jobs/:path+', '/company/:path+', '/@:path+'],
};
