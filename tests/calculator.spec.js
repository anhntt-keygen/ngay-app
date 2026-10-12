const { test, expect } = require('@playwright/test');

const TARGET_URL = 'http://localhost:3000';

test.describe('Pocket Calculator E2E Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(TARGET_URL);
  });

  test('[SC-01] Perform simple arithmetic calculation successfully', async ({ page }) => {
    // Phép tính: 7 + 8 * 2 = 30
    await page.click('button[data-val="7"]');
    await page.click('button[id="btn-add"]');
    await page.click('button[data-val="8"]');
    await page.click('button[id="btn-equals"]'); // 15
    await page.click('button[id="btn-multiply"]');
    await page.click('button[data-val="2"]');
    await page.click('button[id="btn-equals"]'); // 30

    const currentDisplay = await page.textContent('#display-current');
    expect(currentDisplay.trim()).toBe('30');
  });

  test('[SC-01] Handle floating point precisions perfectly', async ({ page }) => {
    // 0.1 + 0.2 = 0.3 (Không được là 0.30000000000000004)
    await page.click('button[data-val="0"]');
    await page.click('button[id="btn-decimal"]');
    await page.click('button[data-val="1"]');
    await page.click('button[id="btn-add"]');
    await page.click('button[data-val="0"]');
    await page.click('button[id="btn-decimal"]');
    await page.click('button[data-val="2"]');
    await page.click('button[id="btn-equals"]');

    const currentDisplay = await page.textContent('#display-current');
    expect(currentDisplay.trim()).toBe('0.3');
  });

  test('[SC-02] Division by zero triggers exception display', async ({ page }) => {
    // Phép tính: 9 / 0
    await page.click('button[data-val="9"]');
    await page.click('button[id="btn-divide"]');
    await page.click('button[data-val="0"]');
    await page.click('button[id="btn-equals"]');

    const currentDisplay = await page.textContent('#display-current');
    expect(currentDisplay.trim()).toBe('Error: Division by zero');

    // Các phím số/phép tính khác phải bị disabled
    const numBtn = page.locator('button[data-val="5"]');
    await expect(numBtn).toBeDisabled();

    // Nhấn Clear 'C' để khôi phục
    await page.click('button[id="btn-clear"]');
    await expect(numBtn).toBeEnabled();
    const resetDisplay = await page.textContent('#display-current');
    expect(resetDisplay.trim()).toBe('0');
  });

  test('[SC-02] Avoid multiple decimal points in one operand', async ({ page }) => {
    // Nhập "5..3" chỉ được nhận là "5.3"
    await page.click('button[data-val="5"]');
    await page.click('button[id="btn-decimal"]');
    await page.click('button[id="btn-decimal"]');
    await page.click('button[data-val="3"]');

    const currentDisplay = await page.textContent('#display-current');
    expect(currentDisplay.trim()).toBe('5.3');
  });

  test('[SC-03] Computation History is recorded and interactive', async ({ page }) => {
    // Phép tính: 12 - 4 = 8
    await page.click('button[data-val="1"]');
    await page.click('button[data-val="2"]');
    await page.click('button[id="btn-subtract"]');
    await page.click('button[data-val="4"]');
    await page.click('button[id="btn-equals"]');

    // Chờ phần tử lịch sử xuất hiện
    const historyItem = page.locator('#history-list > div').first();
    await expect(historyItem).toBeVisible();

    const exprText = await historyItem.locator('div').first().textContent();
    const resText = await historyItem.locator('[data-result-val]').textContent();

    expect(exprText.trim()).toContain('12 − 4');
    expect(resText.trim()).toBe('8');

    // Clear màn hình và bấm vào lịch sử để nạp lại kết quả
    await page.click('button[id="btn-clear"]');
    await historyItem.click();

    const currentDisplay = await page.textContent('#display-current');
    expect(currentDisplay.trim()).toBe('8');
  });

  test('[SC-04] Physical Keyboard keys work seamlessly', async ({ page }) => {
    await page.focus('body');
    
    // Gõ phím "3", "*", "7", "Enter"
    await page.keyboard.press('3');
    await page.keyboard.press('*');
    await page.keyboard.press('7');
    await page.keyboard.press('Enter');

    const currentDisplay = await page.textContent('#display-current');
    expect(currentDisplay.trim()).toBe('21');
  });
});