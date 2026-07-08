import { test, expect } from '@playwright/test';

test.describe('Lịch sử đơn thuốc', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
  });

  async function hoanTatDonThuocMau(page) {
    // Helper function tạo đơn thuốc nhanh để test Lịch sử
    await page.getByRole('button', { name: 'Tạo dữ liệu mẫu' }).click();
    await page.locator('tbody#tbody-benh-nhan tr').first().getByRole('button', { name: 'Khám' }).click();
    
    await page.getByTestId('input-ten-bac-si').fill('Dr. Strange');
    await page.getByTestId('input-chuan-doan').fill('Cảm cúm');
    
    await page.getByTestId('input-ten-thuoc').fill('Viên ngậm');
    await page.locator('#input-so-luong-moi-lan').fill('1');
    await page.locator('#input-so-lan-moi-ngay').fill('1');
    await page.locator('#input-so-ngay-dung').fill('1');
    await page.getByTestId('button-them-thuoc').click();
    
    await page.getByTestId('button-hoan-tat-don').click();
  }

  test('Tạo và hoàn tất một đơn thuốc', async ({ page }) => {
    await hoanTatDonThuocMau(page);
    // UI tự chuyển qua Lịch sử
    await expect(page.getByTestId('danh-sach-don-thuoc')).toBeVisible();
  });

  test('Hiển thị đúng mã đơn, bệnh nhân, bác sĩ', async ({ page }) => {
    await hoanTatDonThuocMau(page);
    
    const row = page.locator('tbody#tbody-don-thuoc tr').first();
    await expect(row).toContainText('DT-');
    await expect(row).toContainText('Nguyễn Văn Tuấn'); // Data mẫu
    await expect(row).toContainText('Dr. Strange');
  });

  test('Xem chi tiết đơn thuốc', async ({ page }) => {
    await hoanTatDonThuocMau(page);
    
    await page.locator('tbody#tbody-don-thuoc tr').first().getByRole('button', { name: 'Xem chi tiết' }).click();
    
    const modal = page.locator('#modal-chi-tiet-don');
    await expect(modal).toBeVisible();
    await expect(modal.locator('#chi-tiet-ten-bs')).toContainText('Dr. Strange');
    await expect(modal.locator('#chi-tiet-chuan-doan')).toContainText('Cảm cúm');
    await expect(modal.locator('#tbody-modal-thuoc')).toContainText('Viên ngậm');
  });

  test('Đóng modal chi tiết', async ({ page }) => {
    await hoanTatDonThuocMau(page);
    await page.locator('tbody#tbody-don-thuoc tr').first().getByRole('button', { name: 'Xem chi tiết' }).click();
    
    await page.locator('#btn-dong-modal-don').click();
    // HTML5 dialog hidden
    const isVisible = await page.locator('#modal-chi-tiet-don').isVisible();
    expect(isVisible).toBeFalsy();
  });

  test('Tìm kiếm theo tên bệnh nhân', async ({ page }) => {
    await hoanTatDonThuocMau(page);
    await page.locator('#input-tim-don-thuoc').fill('Tuấn');
    
    const rows = page.locator('tbody#tbody-don-thuoc tr');
    await expect(rows).toHaveCount(1);
    
    await page.locator('#input-tim-don-thuoc').fill('ABCXYZ');
    await expect(page.locator('tbody#tbody-don-thuoc')).toContainText('Chưa có đơn thuốc nào.');
  });

  test('Tìm kiếm theo tên bác sĩ', async ({ page }) => {
    await hoanTatDonThuocMau(page);
    await page.locator('#input-tim-don-thuoc').fill('Strange');
    
    const rows = page.locator('tbody#tbody-don-thuoc tr');
    await expect(rows).toHaveCount(1);
  });

  test('Lọc đơn đã hoàn tất', async ({ page }) => {
    await hoanTatDonThuocMau(page);
    
    await page.locator('#filter-trang-thai-don').selectOption('da_hoan_tat');
    let rows = page.locator('tbody#tbody-don-thuoc tr');
    await expect(rows).toHaveCount(1);
    
    await page.locator('#filter-trang-thai-don').selectOption('nhap');
    await expect(page.locator('tbody#tbody-don-thuoc')).toContainText('Chưa có đơn thuốc nào.');
  });

  test('Đơn đã hoàn tất không có nút hủy', async ({ page }) => {
    await hoanTatDonThuocMau(page);
    const row = page.locator('tbody#tbody-don-thuoc tr').first();
    const btnHuy = row.getByRole('button', { name: 'Hủy' });
    await expect(btnHuy).toHaveCount(0);
  });

  test('Đơn nháp có thể hủy', async ({ page }) => {
    await page.getByRole('button', { name: 'Tạo dữ liệu mẫu' }).click();
    await page.locator('tbody#tbody-benh-nhan tr').first().getByRole('button', { name: 'Khám' }).click();
    
    await page.locator('#btn-luu-nhap').click();
    await page.getByRole('button', { name: 'Lịch sử đơn thuốc' }).click();
    
    const row = page.locator('tbody#tbody-don-thuoc tr').first();
    await expect(row).toContainText('Nháp');
    
    // Accept dialog
    page.on('dialog', dialog => dialog.accept());
    
    await row.getByRole('button', { name: 'Hủy' }).click();
    await expect(page.getByTestId('thong-bao-he-thong')).toContainText('Đã hủy đơn');
    
    const rowUpdated = page.locator('tbody#tbody-don-thuoc tr').first();
    await expect(rowUpdated).toContainText('Đã hủy');
  });

  test('Xác nhận window.print được gọi sau khi bấm nút in', async ({ page }) => {
    await hoanTatDonThuocMau(page);
    await page.locator('tbody#tbody-don-thuoc tr').first().getByRole('button', { name: 'Xem chi tiết' }).click();
    
    // Thay thế window.print bằng hàm giả
    let isPrinted = false;
    await page.exposeFunction('mockPrint', () => { isPrinted = true; });
    await page.evaluate(() => {
      window.print = window.mockPrint;
    });
    
    await page.locator('#btn-in-don').click();
    
    // Kiểm tra xem hàm đã được gọi chưa
    expect(isPrinted).toBe(true);
  });
});
