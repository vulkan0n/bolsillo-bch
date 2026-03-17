import { test, expect } from "./helpers/fixtures";
import { walletView, historyPage } from "./helpers/selectors";

test.describe("History", () => {
  test.beforeEach(async ({ appPage: page }) => {
    const historyBtn = page.locator(walletView.historyButton);
    await expect(historyBtn).toBeVisible();
    await historyBtn.click();
    await page.waitForURL("**/wallet/history**");
  });

  test("history page renders", async ({ appPage: page }) => {
    const container = page.locator(historyPage.container);
    await expect(container).toBeVisible();
  });

  test("shows Recent Transactions header", async ({ appPage: page }) => {
    await expect(
      page.getByText("Recent Transactions", { exact: false })
    ).toBeVisible();
  });

  test("search input is visible and accepts text", async ({
    appPage: page,
  }) => {
    const searchInput = page.locator(
      'input[type="text"][placeholder*="Search"]'
    );
    await expect(searchInput).toBeVisible();

    // Type a search query
    await searchInput.fill("test query");
    await expect(searchInput).toHaveValue("test query");

    // Clear button should appear when search has text
    const clearBtn = page.locator('button[aria-label*="Clear"]');
    await expect(clearBtn).toBeVisible();
    await clearBtn.click();
    await expect(searchInput).toHaveValue("");
  });

  test("filter panel toggles open and closed", async ({ appPage: page }) => {
    // Filter button is the icon-only button next to the search input
    // FilterOutlined icon renders inside a button
    const filterBtn = page
      .locator("button")
      .filter({ has: page.locator('[role="img"][aria-label="filter"]') });
    await expect(filterBtn).toBeVisible();

    // Filter panel should not be visible initially
    const sortByLabel = page.getByText("Sort By", { exact: false });
    await expect(sortByLabel).toBeHidden();

    // Click filter button to open panel
    await filterBtn.click();
    await expect(sortByLabel).toBeVisible();

    // Click again to close
    await filterBtn.click();
    await expect(sortByLabel).toBeHidden();
  });

  test("filter panel has sort controls", async ({ appPage: page }) => {
    // Open filter panel
    const filterBtn = page
      .locator("button")
      .filter({ has: page.locator('[role="img"][aria-label="filter"]') });
    await filterBtn.click();

    // Sort By select with options
    const sortSelect = page.locator("select").first();
    await expect(sortSelect).toBeVisible();

    // Verify sort options exist
    await expect(sortSelect.locator("option")).toHaveCount(3);

    // Sort direction toggle button (ascending/descending icon)
    const sortDirBtn = page
      .locator("button")
      .filter({
        has: page.locator(
          '[role="img"][aria-label="sort-ascending"], [role="img"][aria-label="sort-descending"]'
        ),
      });
    await expect(sortDirBtn).toBeVisible();

    // Click to toggle direction
    await sortDirBtn.click();
    // Button should still be visible (direction just changed)
    await expect(sortDirBtn).toBeVisible();
  });

  test("filter panel has direction radio buttons", async ({
    appPage: page,
  }) => {
    // Open filter panel
    const filterBtn = page
      .locator("button")
      .filter({ has: page.locator('[role="img"][aria-label="filter"]') });
    await filterBtn.click();

    // Direction section
    await expect(
      page.getByText("Direction", { exact: true })
    ).toBeVisible();

    // Radio buttons for All, Incoming, Outgoing
    const allRadio = page.locator('input[name="direction"][type="radio"]');
    const radioCount = await allRadio.count();
    expect(radioCount).toBe(3);

    // "All" should be selected by default
    await expect(allRadio.first()).toBeChecked();

    // Click "Incoming"
    await allRadio.nth(1).click();
    await expect(allRadio.nth(1)).toBeChecked();
    await expect(allRadio.first()).not.toBeChecked();

    // Click "Outgoing"
    await allRadio.nth(2).click();
    await expect(allRadio.nth(2)).toBeChecked();

    // Labels should be visible
    await expect(page.getByText("Incoming")).toBeVisible();
    await expect(page.getByText("Outgoing")).toBeVisible();
  });

  test("filter panel has token and NFT filters", async ({
    appPage: page,
  }) => {
    // Open filter panel
    const filterBtn = page
      .locator("button")
      .filter({ has: page.locator('[role="img"][aria-label="filter"]') });
    await filterBtn.click();

    // Token filter section
    await expect(page.getByText("Tokens", { exact: true })).toBeVisible();
    const tokenRadios = page.locator('input[name="hasToken"][type="radio"]');
    expect(await tokenRadios.count()).toBe(3);
    await expect(page.getByText("Has Tokens")).toBeVisible();
    await expect(page.getByText("No Tokens")).toBeVisible();

    // NFT filter section
    await expect(page.getByText("NFTs", { exact: true })).toBeVisible();
    const nftRadios = page.locator('input[name="hasNFT"][type="radio"]');
    expect(await nftRadios.count()).toBe(3);
    await expect(page.getByText("Has NFTs")).toBeVisible();
    await expect(page.getByText("No NFTs")).toBeVisible();
  });

  test("reset filters button clears selections", async ({
    appPage: page,
  }) => {
    // Open filter panel
    const filterBtn = page
      .locator("button")
      .filter({ has: page.locator('[role="img"][aria-label="filter"]') });
    await filterBtn.click();

    // Change a filter (select "Incoming")
    const directionRadios = page.locator(
      'input[name="direction"][type="radio"]'
    );
    await directionRadios.nth(1).click();
    await expect(directionRadios.nth(1)).toBeChecked();

    // Click reset
    const resetBtn = page.getByText("Reset Filters", { exact: true });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // "All" should be selected again
    await expect(directionRadios.first()).toBeChecked();
  });

  test("empty wallet shows empty state", async ({ appPage: page }) => {
    // On a fresh default wallet with no transactions, the list should show
    // the empty state marker or a syncing indicator
    const emptyMarker = page.getByText("-----");
    const syncIndicator = page.locator(
      '[data-testid="sync-indicator"][data-syncing="true"]'
    );

    // One of these should be visible
    await expect(emptyMarker.or(syncIndicator).first()).toBeVisible({
      timeout: 5_000,
    });
  });

  test("search with no results shows feedback", async ({
    appPage: page,
  }) => {
    const searchInput = page.locator(
      'input[type="text"][placeholder*="Search"]'
    );
    await searchInput.fill("zzzznonexistenttxid");

    // Should show "no results" or empty state after debounce
    const noResults = page.getByText("no results", { exact: false });
    const emptyMarker = page.getByText("-----");

    await expect(noResults.or(emptyMarker).first()).toBeVisible({
      timeout: 3_000,
    });
  });

  test.skip("export CSV button visible when experimental enabled", () => {
    // Export CSV requires isExperimental flag enabled via Debug settings.
    // On a fresh wallet, the button would be disabled (no transactions).
    // Testing this requires navigating to /debug, enabling experimental,
    // then returning to history — skipped for now as it couples to debug flow.
  });

  test.skip("infinite scroll loads more transactions", () => {
    // Requires a wallet with enough transactions to trigger pagination.
    // The IntersectionObserver on the sentinel element fires txHistoryFetchMore.
    // Cannot test meaningfully on an empty wallet.
  });
});
