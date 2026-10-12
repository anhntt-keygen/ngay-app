const { test, expect } = require('@playwright/test');

test.describe('Pocket Calculator Test Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Tải ứng dụng máy tính lên môi trường kiểm thử
    await page.goto('http://localhost:8080');
  });

  test('[SC-01] Thực hiện phép tính cộng trừ nhân chia cơ bản', async ({ page }) => {
    // 5 + 7 = 12
    await page.click('button[data-val="5"]');
    await page.click('button[data-val="+"]');
    await page.click('button[data-val="7"]');
    await page.click('button[data-type="equals"]');
    await expect(page.locator('#main-display')).toHaveText('12');

    // 12 * 3 = 36
    await page.click('button[data-val="*"]');
    await page.click('button[data-val="3"]');
    await page.click('button[data-type="equals"]');
    await expect(page.locator('#main-display')).toHaveText('36');

    // 36 / 10 = 3.6
    await page.click('button[data-val="/"]');
    await page.click('button[data-val="1"]');
    await page.click('button[data-val="0"]');
    await page.click('button[data-type="equals"]');
    await expect(page.locator('#main-display')).toHaveText('3.6');
  });

  test('[SC-02] Xử lý ngoại lệ chia cho 0 và ngăn nhập nhiều dấu chấm', async ({ page }) => {
    // Case 1: Chia cho 0
    await page.click('button[data-val="9"]');
    await page.click('button[data-val="/"]');
    await page.click('button[data-val="0"]');
    await page.click('button[data-type="equals"]');
    await expect(page.locator('#main-display')).toHaveText('Error: Division by zero');

    // Màn hình chuyển sang màu đỏ báo lỗi và block các phím toán tử
    await expect(page.locator('#main-display')).toHaveClass(/text-rose-400/);

    // Bấm Clear để reset lại trạng thái bình thường
    await page.click('button[data-type="clear"]');
    await expect(page.locator('#main-display')).toHaveText('0');

    // Case 2: Tránh nhập nhiều dấu chấm thập phân
    await page.click('button[data-val="1"]');
    await page.click('button[data-type="decimal"]');
    await page.click('button[data-val="5"]');
    await page.click('button[data-type="decimal"]'); // Thử bấm thêm dấu chấm lần nữa
    await page.click('button[data-val="2"]');
    await expect(page.locator('#main-display')).toHaveText('1.52'); // Kết quả đúng chỉ có một dấu chấm
  });

  test('[SC-03] Quản lý Lịch sử phép tính (History & LocalStorage)', async ({ page }) => {
    // Thực hiện phép tính 8 * 9 = 72 để kích hoạt lưu lịch sử
    await page.click('button[data-val="8"]');
    await page.click('button[data-val="*"]');
    await page.click('button[data-val="9"]');
    await page.click('button[data-type="equals"]');

    // Check hiển thị lịch sử ở thanh bên cạnh
    const historyItem = page.locator('.history-item').first();
    await expect(historyItem.locator('.digital-font').first()).toHaveText('8 × 9 =');
    await expect(historyItem.locator('.text-indigo-300')).toHaveText('72');

    // Click nút Clear trên máy tính
    await page.click('button[data-type="clear"]');
    await expect(page.locator('#main-display')).toHaveText('0');

    // Click vào item lịch sử để khôi phục lại kết quả 72 lên màn hình chính
    await historyItem.click();
    await expect(page.locator('#main-display')).toHaveText('72');

    // Kiểm tra tính năng Clear History
    await page.click('#clear-history-btn');
    await expect(page.locator('#history-empty-state')).toBeVisible();
  });

  test('[SC-04] Sử dụng phím tắt bàn phím vật lý', async ({ page }) => {
    // Focus vào bất kỳ vị trí nào trong trang để nhận event keydown
    await page.click('body');

    // Gõ phím "2", "*", "3", "Enter"
    await page.keyboard.press('2');
    await page.keyboard.press('*');
    await page.keyboard.press('3');
    await page.keyboard.press('Enter');

    await expect(page.locator('#main-display')).toHaveText('6');
  });

});