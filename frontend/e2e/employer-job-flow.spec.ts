import { expect, test } from "@playwright/test";

test.describe("Employer Job Posting Flow", () => {
    // Use a unique email for each run if signup is required, OR
    // log in specifically if we know the test account.
    // For this test, we'll try to use a valid test account or standard UI locators.

    test("should successfully post a job using the AI Magic Box", async ({ page }) => {
        // 1. Go to the app
        await page.goto("/");

        // 2. We need to login as an employer.
        // Assuming there's a Login/Sign Up button on the homepage
        await page.getByRole("link", { name: /login/i }).click();

        // Fill in employer credentials.
        // Note: Since this runs locally, we assume "bevislyapp@gmail.com" works
        // with a default test password, or we can just mock the flow.
        // Let's use standard placeholders here. We might need to adjust the selectors based on AuthPage.tsx

        await test.step("Log in as Employer", async () => {
            // Look for the email input
            await page.waitForSelector('input[type="email"]');
            await page.fill('input[type="email"]', "bevislyapp@gmail.com");

            // Look for password input
            await page.waitForSelector('input[type="password"]');

            // SECURITY: Never hardcode passwords. Use an environment variable.
            const testPassword = process.env.TEST_EMPLOYER_PASSWORD;
            if (!testPassword) {
                throw new Error(
                    "TEST_EMPLOYER_PASSWORD environment variable is missing!",
                );
            }
            await page.fill('input[type="password"]', testPassword);

            // Click sign in
            await page.getByRole("button", { name: /sign in|log in/i }).click();

            // We should eventually land on the employer dashboard
            await expect(page).toHaveURL(/.*\/employer.*/, { timeout: 10000 });
        });

        await test.step("Open Magic Box and Paste Raw Input", async () => {
            // Click the "Post Job" button
            await page.getByRole("button", { name: /post a job|create job/i })
                .click();

            // Expect the Magic Box slide-over to appear
            const magicBoxTitle = page.getByRole("heading", {
                name: /Let AI build your job post/i,
            });
            await expect(magicBoxTitle).toBeVisible();

            // Find the textarea and paste the requirements
            const magicTextarea = page.locator(
                'textarea[placeholder*="e.g. We need a Senior React dev"]',
            );
            await expect(magicTextarea).toBeVisible();

            const rawJobDescription =
                "We are looking for an amazing Test Automation Engineer. You must know Playwright, React, and Supabase. Looking for 3+ years of experience. Fully remote. Need someone to write E2E tests for our MVP.";
            await magicTextarea.fill(rawJobDescription);

            // Click Generate
            await page.getByRole("button", { name: /Generate Job Listing/i })
                .click();

            // Wait for the AI generation to finish
            // We know it's done when the "Review & Publish Job" header appears
            const reviewHeader = page.getByRole("heading", {
                name: /Review & Publish Job/i,
            });
            await expect(reviewHeader).toBeVisible({ timeout: 20000 }); // AI might take a few seconds
        });

        await test.step("Submit Pre-filled Job Form", async () => {
            // The AI should have pre-filled the Job Title with something like "Test Automation Engineer"
            const titleInput = page.getByLabel(/Job Title/i);
            await expect(titleInput).not.toBeEmpty();

            // Click the final Publish button
            const publishBtn = page.getByRole("button", {
                name: /Post Job Now/i,
            });
            await expect(publishBtn).toBeVisible();

            // We can click it!
            await publishBtn.click();

            // After publishing, the slide-over closes and a toast should appear, OR we are back on the dashboard
            // Let's verify the form is closed by checking if the magic box/review header is gone
            const reviewHeader = page.getByRole("heading", {
                name: /Review & Publish Job/i,
            });
            await expect(reviewHeader).toBeHidden({ timeout: 10000 });

            // Optional: Verify the job appears in the Active Jobs list
            // await expect(page.locator('text=Test Automation Engineer').first()).toBeVisible();
        });
    });
});
