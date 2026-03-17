import { test, expect } from "./helpers/fixtures";
import { nav } from "./helpers/selectors";
import { accordionControl } from "./helpers/wallet";

test.describe("Explore", () => {
  test("explore page renders", async ({ appPage: page }) => {
    // Explore tab may be hidden based on user preferences
    const exploreTab = page.locator(nav.explore);
    const isVisible = await exploreTab
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (!isVisible) {
      test.skip();
      return;
    }

    await exploreTab.click();
    await page.waitForURL("**/explore");
    const main = page.locator("main");
    await expect(main).toBeVisible();
  });

  test("explore tab visibility toggles from settings", async ({
    appPage: page,
  }) => {
    // Explore tab should be visible by default (displayExploreTab: "true")
    const exploreTab = page.locator(nav.explore);
    await expect(exploreTab).toBeVisible();

    // Navigate to Settings > User Interface accordion
    await page.click(nav.settings);
    await page.waitForURL("**/settings**");

    const uiAccordion = page.locator("button", {
      hasText: "User Interface",
    });
    await expect(uiAccordion).toBeVisible();
    await uiAccordion.click();

    const checkbox = accordionControl(
      page,
      "Display Explore tab",
      "input[type='checkbox']"
    );
    await expect(checkbox).toBeChecked();

    // Uncheck — explore tab should disappear
    await checkbox.click();
    await expect(checkbox).not.toBeChecked();
    await expect(page.locator(nav.explore)).toBeHidden();

    // Re-check — explore tab should reappear
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    await expect(page.locator(nav.explore)).toBeVisible();
  });
});
