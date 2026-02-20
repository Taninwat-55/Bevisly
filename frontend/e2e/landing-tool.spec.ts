import { expect, test } from "@playwright/test";

test.describe("Tool-First Landing Page", () => {
    test("should generate a Job and Proof Task from the hero search bar without logging in", async ({ page }) => {
        // 1. Mock the external AI API call and add a small delay to test the loading state
        await page.route(
            "**/functions/v1/generate-job-listing",
            async (route) => {
                await page.waitForTimeout(1000); // Simulate network latency so "Analyzing..." appears
                await route.fulfill({
                    status: 200,
                    contentType: "application/json",
                    body: JSON.stringify({
                        title: "Python Backend Engineer",
                        description:
                            "We are looking for a Python Backend Engineer.",
                        requirements: ["FastAPI", "PostgreSQL"],
                        proof_tasks: [
                            {
                                title: "Build a REST API",
                                description:
                                    "Build a simple API using FastAPI and Postgres.",
                                expected_time: "45 mins",
                                submission_format: "GitHub Repo",
                            },
                        ],
                    }),
                });
            },
        );

        // 2. Go to the landing page
        await page.goto("/");

        // 3. Ensure we see the default hero search bar
        const searchInput = page.getByPlaceholder(
            "e.g. Need a Senior React Developer...",
        );
        await expect(searchInput).toBeVisible();

        // 4. Enter a prompt
        await searchInput.fill(
            "Looking for a Python Backend Engineer who knows FastAPI and PostgreSQL.",
        );

        // 5. Click Generate
        const generateBtn = page.getByRole("button", { name: "Generate" });
        await expect(generateBtn).toBeVisible();
        await generateBtn.click({ force: true });

        // 6. Verify the Loading Skeleton appears
        await expect(page.getByText("Analyzing Requirements...")).toBeVisible();

        // 7. Wait for the Success Output to render (this will now happen instantly)
        await expect(page.getByText("AI Generated")).toBeVisible();

        // 8. Verify the conversion CTA appears
        const convertBtn = page.getByRole("button", {
            name: /Post this Job for Free/i,
        });
        await expect(convertBtn).toBeVisible();

        // 9. Clicking the CTA should redirect to Signup
        await convertBtn.click();
        await expect(page).toHaveURL(/.*\/auth\?tab=signup&role=employer.*/);
    });
});
