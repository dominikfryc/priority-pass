import { test, expect } from '@playwright/test'

test.describe('Priority Pass Application', () => {
  test('should support the complete user journey (Empty state -> Crop fallback -> Full CRUD)', async ({
    page,
  }) => {
    // ---------------------------------------------------------
    // 1. INITIALIZATION & EMPTY STATE
    // ---------------------------------------------------------
    await page.goto('/')

    // Verify the title and header
    await expect(page).toHaveTitle(/Priority Pass/)
    await expect(page.getByRole('heading', { name: 'Passes', exact: true })).toBeVisible()
    await expect(page.getByText('Manage your boarding passes')).toBeVisible()

    // Verify empty state
    await expect(page.getByRole('heading', { name: 'No passes yet' })).toBeVisible()
    await expect(page.getByText('Add a screenshot of your boarding pass')).toBeVisible()

    // Verify Add pass button exists
    const addButton = page.getByRole('button', { name: 'Add pass' })
    await expect(addButton).toBeVisible()

    // ---------------------------------------------------------
    // 2. UNHAPPY PATH (Fallback to PassCropper)
    // ---------------------------------------------------------
    let fileChooserPromise = page.waitForEvent('filechooser')
    await addButton.click()
    let fileChooser = await fileChooserPromise

    // Upload the empty image that lacks a barcode
    await fileChooser.setFiles('./e2e/fixtures/empty.png')

    // It should fall back to the PassCropper dialog
    await expect(page.getByRole('heading', { name: 'Crop boarding pass' })).toBeVisible()

    // Click cancel to close the fallback dialog
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByRole('heading', { name: 'Crop boarding pass' })).not.toBeVisible()

    // ---------------------------------------------------------
    // 3. CREATE PASS (Happy Path)
    // ---------------------------------------------------------
    fileChooserPromise = page.waitForEvent('filechooser')
    await addButton.click()
    fileChooser = await fileChooserPromise

    // Upload the real boarding pass
    await fileChooser.setFiles('./e2e/fixtures/pass.jpg')

    // It should successfully read the barcode and show the "Select boarding time" dialog
    await expect(page.getByRole('heading', { name: 'Select boarding time' })).toBeVisible()

    // Pick a custom time (18:30) and confirm
    const timeInput = page.locator('input[type="time"]')
    await timeInput.fill('18:30')
    await page.getByRole('button', { name: 'Confirm' }).click()

    // The router should navigate to /pass/:id automatically
    const menuTrigger = page.getByRole('button', { name: /Open menu/i })
    await expect(menuTrigger).toBeVisible()

    // Verify the custom time was set and the barcode canvas rendered
    await expect(page.locator('text=/18:30|6:30/i')).toBeVisible()
    await expect(page.locator('canvas')).toBeVisible()

    // ---------------------------------------------------------
    // 4. UPDATE PASS
    // ---------------------------------------------------------
    await menuTrigger.click()
    await page.getByRole('menuitem', { name: /Edit pass/i }).click()
    await expect(page.getByRole('heading', { name: 'Edit boarding pass' })).toBeVisible()

    // Change Passenger Name
    const passengerInput = page.locator('input[name="passengerName"]')
    await passengerInput.clear()
    await passengerInput.fill('Playwright Tester')

    // Save changes
    await page.getByRole('button', { name: /Save Changes/i }).click()

    // Dialog closes and new name is visible on the PassDetail
    await expect(page.getByRole('heading', { name: 'Edit boarding pass' })).not.toBeVisible()
    await expect(page.getByText('Playwright Tester')).toBeVisible()

    // ---------------------------------------------------------
    // 5. READ PASS (Home Screen)
    // ---------------------------------------------------------
    await page.getByRole('link', { name: 'Back to home' }).click()
    await expect(page.getByRole('heading', { name: 'Passes', exact: true })).toBeVisible()

    // The edited passenger name should be visible on the Home PassCard
    const passLink = page.getByRole('link', { name: /Playwright Tester/i })
    await expect(passLink).toBeVisible()

    // ---------------------------------------------------------
    // 6. DELETE PASS
    // ---------------------------------------------------------
    await passLink.click()

    // Open menu again on PassDetail
    const menuTrigger2 = page.getByRole('button', { name: /Open menu/i })
    await expect(menuTrigger2).toBeVisible()
    await menuTrigger2.click()

    // Click Remove pass and confirm
    await page.getByRole('menuitem', { name: /Remove pass/i }).click()
    await expect(page.getByRole('heading', { name: 'Remove boarding pass' })).toBeVisible()
    await page.getByRole('button', { name: 'Remove' }).click()

    // Should gracefully redirect to Home with the empty state restored
    await expect(page.getByRole('heading', { name: 'No passes yet' })).toBeVisible()
  })
})
