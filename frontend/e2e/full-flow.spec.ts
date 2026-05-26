import { expect, test, type Page } from "@playwright/test";

// Test credentials loaded from frontend/.env.test.local (git-ignored).
// Copy .env.test.local.example and fill in your own Supabase test accounts.
const EMPLOYER_EMAIL = process.env.E2E_EMPLOYER_EMAIL ?? "";
const EMPLOYER_PASSWORD = process.env.E2E_EMPLOYER_PASSWORD ?? "";
const CANDIDATE_EMAIL = process.env.E2E_CANDIDATE_EMAIL ?? "";
const CANDIDATE_PASSWORD = process.env.E2E_CANDIDATE_PASSWORD ?? "";

function employerPassword() { return EMPLOYER_PASSWORD; }
function candidatePassword() { return CANDIDATE_PASSWORD; }

// Shared login helper — fills the auth form and waits for redirect.
async function loginAs(
    page: Page,
    email: string,
    password: string,
    role: "employer" | "candidate",
) {
    await page.goto("/auth");
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole("button", { name: "Sign In", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/${role}`), { timeout: 15000 });
}

// Clear the welcome-banner dismissal flag so it shows again.
async function clearOnboardingFlag(page: Page) {
    await page.evaluate(() =>
        localStorage.removeItem("bevisly_onboarding_dismissed")
    );
}

// ──────────────────────────────────────────────────────────────
// EMPLOYER: Navigation health
// Each route: log in, navigate directly, confirm the protected
// page renders (not redirected back to /auth).
// ──────────────────────────────────────────────────────────────
test.describe("Employer — navigation health", () => {
    const employerRoutes = [
        { label: "Dashboard", path: "/employer" },
        { label: "Review Queue", path: "/employer/inbox" },
        { label: "My Jobs", path: "/employer/jobs" },
        { label: "Pipeline Board", path: "/employer/talent-board" },
        { label: "Talent Directory", path: "/employer/candidates" },
    ];

    for (const { label, path } of employerRoutes) {
        test(`${label} page loads when authenticated`, async ({ page }) => {
            await loginAs(page, EMPLOYER_EMAIL, employerPassword(), "employer");
            await page.goto(path);
            // Must stay on the employer route — not kicked to /auth
            await expect(page).toHaveURL(new RegExp(path.replace("/", "\\/")), { timeout: 10000 });
            // Sidebar link for this route exists in the DOM
            await expect(page.locator(`a[href="${path}"]`).first()).toBeAttached({ timeout: 8000 });
        });
    }
});

// ──────────────────────────────────────────────────────────────
// CANDIDATE: Navigation health
// ──────────────────────────────────────────────────────────────
test.describe("Candidate — navigation health", () => {
    const candidateRoutes = [
        { label: "Dashboard", path: "/candidate" },
        { label: "Find Jobs", path: "/candidate/jobs" },
        { label: "My Proofs", path: "/candidate/proofs" },
        { label: "Practice", path: "/candidate/practice" },
        { label: "Leaderboard", path: "/candidate/leaderboard" },
        { label: "Public Profile", path: "/candidate/profile" },
    ];

    for (const { label, path } of candidateRoutes) {
        test(`${label} page loads when authenticated`, async ({ page }) => {
            await loginAs(page, CANDIDATE_EMAIL, candidatePassword(), "candidate");
            await page.goto(path);
            await expect(page).toHaveURL(new RegExp(path.replace("/", "\\/")), { timeout: 10000 });
            await expect(page.locator(`a[href="${path}"]`).first()).toBeAttached({ timeout: 8000 });
        });
    }
});

// ──────────────────────────────────────────────────────────────
// Welcome banner
// ──────────────────────────────────────────────────────────────
test.describe("Welcome banner", () => {
    test("shows for employer on first login", async ({ page }) => {
        await loginAs(page, EMPLOYER_EMAIL, employerPassword(), "employer");
        await clearOnboardingFlag(page);
        await page.reload();
        await expect(page.getByText(/welcome to bevisly/i)).toBeVisible({
            timeout: 8000,
        });
    });

    test("stays dismissed after reload", async ({ page }) => {
        await loginAs(page, EMPLOYER_EMAIL, employerPassword(), "employer");
        await clearOnboardingFlag(page);
        await page.reload();

        // Dismiss the banner
        await page.getByRole("button", { name: /dismiss|got it|close/i }).first()
            .click();

        // Reload — banner must not reappear
        await page.reload();
        await page.waitForTimeout(1500);
        await expect(page.getByText(/welcome to bevisly/i)).not.toBeVisible();
    });

    test("shows for candidate on first login", async ({ page }) => {
        await loginAs(page, CANDIDATE_EMAIL, candidatePassword(), "candidate");
        await clearOnboardingFlag(page);
        await page.reload();
        await expect(page.getByText(/welcome to bevisly/i)).toBeVisible({
            timeout: 8000,
        });
    });
});

// ──────────────────────────────────────────────────────────────
// Job detail page — Sprint #3 features visible
// ──────────────────────────────────────────────────────────────
test.describe("Job detail page", () => {
    test("shows salary range, rubric, and time estimate on seeded job", async ({ page }) => {
        await page.goto("/jobs");
        // Wait for the seeded job to appear — Supabase fetch can be slow
        await expect(page.getByText(/Frontend Developer/i).first()).toBeVisible({ timeout: 15000 });
        await page.getByText(/Frontend Developer/i).first().click();
        await expect(page).toHaveURL(/\/jobs\//, { timeout: 10000 });

        // Salary range — seed has 480000/650000 yearly in EUR
        await expect(page.getByText(/480|650|€|salary/i).first()).toBeVisible({ timeout: 12000 });

        // Proof task time estimate — seed has "2–3 hours"
        await expect(page.getByText(/hours/i).first()).toBeVisible({ timeout: 12000 });

        // Rubric — seed has "Code Quality" criterion
        await expect(page.getByText(/Code Quality/i).first()).toBeVisible({ timeout: 12000 });
    });
});

// ──────────────────────────────────────────────────────────────
// Employer job form — Featured placeholder (Sprint #3 bug fix)
// ──────────────────────────────────────────────────────────────
test.describe("Employer job form", () => {
    test.beforeEach(async ({ page }) => {
        await loginAs(page, EMPLOYER_EMAIL, employerPassword(), "employer");
    });

    test("Featured Job placeholder is visible and disabled", async ({ page }) => {
        // ?post=true on the employer URL opens the slide-over directly
        await page.goto("/employer?post=true");
        // Mode selection step — click "Start from Scratch" to reach the manual form
        await page.getByText("Start from Scratch").click({ timeout: 10000 });

        // EmployerJobForm Step 1 should now be visible with the Featured Job card
        await expect(page.getByText("Featured Job").first()).toBeVisible({ timeout: 10000 });
        const checkbox = page.locator('input[type="checkbox"][disabled]');
        await expect(checkbox).toBeVisible();
        await expect(checkbox).toBeDisabled();
    });

    test("salary validation blocks advance without min/max salary", async ({ page }) => {
        await page.goto("/employer?post=true");
        await page.getByText("Start from Scratch").click({ timeout: 10000 });

        // Fill title only, leave salary blank, try to advance
        await page.getByRole("button", { name: /next.*proof/i }).click();
        await expect(page.getByText(/salary|min salary|required/i).first()).toBeVisible({ timeout: 5000 });
    });
});

// ──────────────────────────────────────────────────────────────
// Candidate — proof submission flow
// ──────────────────────────────────────────────────────────────
test.describe("Candidate — proof submissions", () => {
    test("submitted proof appears in /candidate/proofs", async ({ page }) => {
        await loginAs(page, CANDIDATE_EMAIL, candidatePassword(), "candidate");
        await page.goto("/candidate/proofs");

        // Seeded submission's job title should appear
        await expect(
            page.getByText(/Frontend Developer|Pipeline Status/i).first()
        ).toBeVisible({ timeout: 8000 });
    });

    test("jobs page renders for authenticated candidate", async ({ page }) => {
        await loginAs(page, CANDIDATE_EMAIL, candidatePassword(), "candidate");
        await page.goto("/candidate/jobs");
        // Page must load — either shows jobs or empty state, never /auth
        await expect(page).toHaveURL(/\/candidate\/jobs/, { timeout: 10000 });
        await expect(page.locator("#root")).toBeVisible();
    });
});

// ──────────────────────────────────────────────────────────────
// Employer — review panel reachable
// ──────────────────────────────────────────────────────────────
test.describe("Employer — submission review", () => {
    test("inbox shows the seeded candidate submission", async ({ page }) => {
        await loginAs(page, EMPLOYER_EMAIL, employerPassword(), "employer");
        await page.goto("/employer/inbox");

        // The seeded candidate name or job title should appear
        await expect(
            page.getByText(/Frontend Developer|Pipeline Status|sofia/i).first()
        ).toBeVisible({ timeout: 10000 });
    });
});

// ──────────────────────────────────────────────────────────────
// Public routes — no auth required
// ──────────────────────────────────────────────────────────────
test.describe("Public routes", () => {
    const publicRoutes = [
        { path: "/", label: /bevisly/i },
        { path: "/jobs", label: /jobs|listings/i },
        { path: "/leaderboard", label: /leaderboard/i },
        { path: "/pricing", label: /pricing|plan/i },
        { path: "/docs", label: /docs|help/i },
        { path: "/company/pipebird", label: /pipebird/i },
    ];

    for (const { path, label } of publicRoutes) {
        test(`${path} renders without error`, async ({ page }) => {
            await page.goto(path);
            await expect(page.getByText(label).first()).toBeVisible({
                timeout: 10000,
            });
        });
    }

    test("/docs has AI usage section (Sprint #3)", async ({ page }) => {
        await page.goto("/docs#how-ai-works");
        await expect(page.getByText(/how bevisly uses ai/i).first()).toBeVisible({
            timeout: 8000,
        });
    });
});
