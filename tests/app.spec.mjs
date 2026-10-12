import { test, expect } from '@playwright/test';

test.describe('Pocket Calculator E2E Testing Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Truy cập trực tiếp trang chủ máy tính
    await page.goto('/');
  });

  test('[SC-01] Basic Operations', async ({ page }) => {
    // 1. Phép cộng: 12 + 35 = 47
    await page.click('#btn-1');
    await page.click('#btn-2');
    await page.click('#btn-add');
    await page.click('#btn-3');
    await page.click('#btn-5');
    await page.click('#btn-equals');
    await expect(page.locator('#main-display')).toHaveText('47');

    // 2. Phép trừ và float-point: 47 - 0.2 = 46.8
    await page.click('#btn-subtract');
    await page.click('#btn-0');
    await page.click('#btn-decimal');
    await page.click('#btn-2');
    await page.click('#btn-equals');
    await expect(page.locator('#main-display')).toHaveText('46.8');

    // 3. Phép nhân: 46.8 * 2 = 93.6
    await page.click('#btn-multiply');
    await page.click('#btn-2');
    await page.click('#btn-equals');
    await expect(page.locator('#main-display')).toHaveText('93.6');
  });

  test('[SC-02] Handling Edge Cases and Exceptions', async ({ page }) => {
    // 1. Chia cho 0 (Division by zero)
    await page.click('#btn-5');
    await page.click('#btn-divide');
    await page.click('#btn-0');
    await page.click('#btn-equals');
    await expect(page.locator('#main-display')).toHaveText('Error: Division by zero');

    // Kiểm tra xem nút phép tính khác có bị khóa (disabled) sau khi lỗi không
    const plusBtn = page.locator('#btn-add');
    await expect(plusBtn).toBeDisabled();

    // Reset lại bằng nút C
    await page.click('#btn-clear');
    await expect(page.locator('#main-display')).toHaveText('0');
    await expect(plusBtn).not.toBeDisabled();

    // 2. Chặn nhập nhiều dấu chấm thập phân (ví dụ: 1..2 -> chỉ cho phép 1.2)
    await page.click('#btn-1');
    await page.click('#btn-decimal');
    await page.click('#btn-decimal'); // Bấm lần 2 vô hiệu
    await page.click('#btn-2');
    await expect(page.locator('#main-display')).toHaveText('1.2');
  });

  test('[SC-03] History Panel & LocalStorage Persistence', async ({ page }) => {
    // Thực hiện phép tính để ghi vào lịch sử: 8 * 9 = 72
    await page.click('#btn-8');
    await page.click('#btn-multiply');
    await page.click('#btn-9');
    await page.click('#btn-equals');
    await expect(page.locator('#main-display')).toHaveText('72');

    // Chờ lịch sử render ra UI
    const historyItem = page.locator('#history-container >> text=8 * 9 =');
    await expect(historyItem).toBeVisible();

    // Kiểm tra tính khôi phục: Reset máy tính về 0, rồi click lịch sử để tải lại kết quả cũ
    await page.click('#btn-clear');
    await expect(page.locator('#main-display')).toHaveText('0');

    // Click vào item lịch sử vừa lưu
    await page.locator('#history-container >> text=72').click();
    await expect(page.locator('#main-display')).toHaveText('72');

    // Kiểm tra nút Xóa lịch sử
    await page.click('#btn-clear-history');
    await expect(page.locator('#empty-history-msg')).toBeVisible();
  });

  test('[SC-04] Keyboard Inputs Support', async ({ page }) => {
    // Focus vào màn hình/body để nhận sự kiện bàn phím
    await page.focus('body');

    // Nhấn tổ hợp phím ảo: 4 5 + 5 = (kết quả mong muốn: 50)
    await page.keyboard.press('4');
    await page.keyboard.press('5');
    await page.keyboard.press('+');
    await page.keyboard.press('5');
    await page.keyboard.press('Enter');

    await expect(page.locator('#main-display')).toHaveText('50');

    // Thử nút Backspace cơ học để xóa số 0 vừa sinh ra, quay lại trạng thái trước
    await page.keyboard.press('Backspace');
    await expect(page.locator('#main-display')).toHaveText('5');
  });

});