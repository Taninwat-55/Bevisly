import { expect, test } from "@playwright/test";

test("homepage loads correctly", async ({ page }) => {
    await page.goto("/");

    // The app's title is "Bevisly - Hire Proven Talent, Not Resumes"
    await expect(page).toHaveTitle(/Bevisly/);

    // Look for the logo or a core heading
    await expect(page.locator("text=Bevisly").first()).toBeVisible();
});
