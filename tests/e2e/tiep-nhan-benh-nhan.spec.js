import { test, expect } from '@playwright/test';

test.describe('Tiếp nhận bệnh nhân', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
  });

  test('Mở ứng dụng thành công', async ({ page }) => {
    await expect(page).toHaveTitle(/Phòng khám Mini/);
    await expect(page.locator('h1')).toContainText('Phòng khám Mini');
  });

  test('Thêm bệnh nhân hợp lệ', async ({ page }) => {
    await page.getByTestId('input-ho-ten').fill('Nguyễn Văn A');
    await page.getByTestId('input-ngay-sinh').fill('1990-01-01');
    await page.getByTestId('input-so-dien-thoai').fill('0901234567');
    await page.getByTestId('button-luu-benh-nhan').click();
    
    await expect(page.getByTestId('thong-bao-he-thong')).toContainText('Thêm bệnh nhân mới thành công');
    await expect(page.getByTestId('danh-sach-benh-nhan')).toContainText('Nguyễn Văn A');
  });

  test('Hiển thị mã bệnh nhân sau khi thêm', async ({ page }) => {
    await page.getByTestId('input-ho-ten').fill('Trần B');
    await page.getByTestId('input-ngay-sinh').fill('1995-05-05');
    await page.getByTestId('input-so-dien-thoai').fill('0912233445');
    await page.getByTestId('button-luu-benh-nhan').click();
    
    const tableRow = page.locator('tbody#tbody-benh-nhan tr').first();
    await expect(tableRow).toContainText('BN-');
  });

  test('Hiển thị trạng thái chờ khám', async ({ page }) => {
    await page.getByTestId('input-ho-ten').fill('Trần B');
    await page.getByTestId('input-ngay-sinh').fill('1995-05-05');
    await page.getByTestId('input-so-dien-thoai').fill('0912233445');
    await page.getByTestId('button-luu-benh-nhan').click();
    
    const tableRow = page.locator('tbody#tbody-benh-nhan tr').first();
    await expect(tableRow).toContainText('Chờ khám');
  });

  test('Từ chối form thiếu họ tên', async ({ page }) => {
    await page.getByTestId('input-ho-ten').fill('');
    await page.getByTestId('input-ngay-sinh').fill('1995-05-05');
    await page.getByTestId('input-so-dien-thoai').fill('0912233445');
    
    await page.getByTestId('button-luu-benh-nhan').click();
    
    // Check validation HTML5
    const hoTenInput = page.getByTestId('input-ho-ten');
    const isValid = await hoTenInput.evaluate(el => el.checkValidity());
    expect(isValid).toBeFalsy();
  });

  test('Từ chối số điện thoại không hợp lệ', async ({ page }) => {
    await page.getByTestId('input-ho-ten').fill('Nguyễn Văn C');
    await page.getByTestId('input-ngay-sinh').fill('1990-01-01');
    await page.getByTestId('input-so-dien-thoai').fill('123'); // Invalid
    
    // Prevent HTML5 from blocking submission if necessary, or just submit
    // Vì form có type=tel chứ không có regex bắt buộc, JS sẽ check
    await page.getByTestId('button-luu-benh-nhan').click();
    
    await expect(page.locator('#loi-form-benh-nhan')).toContainText('Số điện thoại không hợp lệ');
  });

  test('Từ chối ngày sinh tương lai', async ({ page }) => {
    await page.getByTestId('input-ho-ten').fill('Nguyễn Văn C');
    await page.getByTestId('input-ngay-sinh').fill('3000-01-01'); // Tương lai
    await page.getByTestId('input-so-dien-thoai').fill('0901234567');
    await page.getByTestId('button-luu-benh-nhan').click();
    
    await expect(page.locator('#loi-form-benh-nhan')).toContainText('Ngày sinh không được lớn hơn ngày hiện tại');
  });

  test('Từ chối bệnh nhân trùng', async ({ page }) => {
    // Thêm BN 1
    await page.getByTestId('input-ho-ten').fill('Nguyễn Văn C');
    await page.getByTestId('input-ngay-sinh').fill('1990-01-01');
    await page.getByTestId('input-so-dien-thoai').fill('0901234567');
    await page.getByTestId('button-luu-benh-nhan').click();
    
    // Thêm BN 2 (trùng)
    await page.getByTestId('input-ho-ten').fill('Nguyễn Văn D');
    await page.getByTestId('input-ngay-sinh').fill('1990-01-01');
    await page.getByTestId('input-so-dien-thoai').fill('0901234567');
    await page.getByTestId('button-luu-benh-nhan').click();
    
    await expect(page.locator('#loi-form-benh-nhan')).toContainText('Bệnh nhân đã tồn tại');
  });

  test('Sửa thông tin bệnh nhân', async ({ page }) => {
    await page.getByTestId('input-ho-ten').fill('Nguyễn Văn A');
    await page.getByTestId('input-ngay-sinh').fill('1990-01-01');
    await page.getByTestId('input-so-dien-thoai').fill('0901234567');
    await page.getByTestId('button-luu-benh-nhan').click();
    
    await page.locator('tbody#tbody-benh-nhan tr').first().getByRole('button', { name: 'Sửa' }).click();
    
    await page.getByTestId('input-ho-ten').fill('Nguyễn Văn B');
    await page.getByTestId('button-luu-benh-nhan').click();
    
    await expect(page.getByTestId('thong-bao-he-thong')).toContainText('Cập nhật thông tin');
    await expect(page.getByTestId('danh-sach-benh-nhan')).toContainText('Nguyễn Văn B');
  });

  test('Tìm kiếm theo họ tên', async ({ page }) => {
    await page.getByTestId('input-ho-ten').fill('Lê Văn M');
    await page.getByTestId('input-ngay-sinh').fill('1990-01-01');
    await page.getByTestId('input-so-dien-thoai').fill('0901234567');
    await page.getByTestId('button-luu-benh-nhan').click();
    
    await page.getByTestId('input-ho-ten').fill('Trần Văn N');
    await page.getByTestId('input-ngay-sinh').fill('1991-01-01');
    await page.getByTestId('input-so-dien-thoai').fill('0987654321');
    await page.getByTestId('button-luu-benh-nhan').click();
    
    await page.getByTestId('input-tim-benh-nhan').fill('Lê Văn M');
    
    const rows = page.locator('tbody#tbody-benh-nhan tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Lê Văn M');
  });

  test('Tìm kiếm theo số điện thoại', async ({ page }) => {
    await page.getByTestId('input-ho-ten').fill('Lê Văn M');
    await page.getByTestId('input-ngay-sinh').fill('1990-01-01');
    await page.getByTestId('input-so-dien-thoai').fill('0901234567');
    await page.getByTestId('button-luu-benh-nhan').click();
    
    await page.getByTestId('input-tim-benh-nhan').fill('0901234567');
    
    const rows = page.locator('tbody#tbody-benh-nhan tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Lê Văn M');
  });

  test('Lọc bệnh nhân theo trạng thái', async ({ page }) => {
    await page.getByTestId('input-ho-ten').fill('Lê Văn M');
    await page.getByTestId('input-ngay-sinh').fill('1990-01-01');
    await page.getByTestId('input-so-dien-thoai').fill('0901234567');
    await page.getByTestId('button-luu-benh-nhan').click();
    
    // Trạng thái mới là Chờ khám
    await page.locator('#filter-trang-thai-benh-nhan').selectOption('da_kham');
    await expect(page.getByTestId('danh-sach-benh-nhan')).toContainText('Không tìm thấy bệnh nhân nào');
  });

  test('Xóa bệnh nhân', async ({ page }) => {
    await page.getByTestId('input-ho-ten').fill('Lê Văn M');
    await page.getByTestId('input-ngay-sinh').fill('1990-01-01');
    await page.getByTestId('input-so-dien-thoai').fill('0901234567');
    await page.getByTestId('button-luu-benh-nhan').click();
    
    page.on('dialog', dialog => dialog.accept());
    await page.locator('tbody#tbody-benh-nhan tr').first().getByRole('button', { name: 'Xóa' }).click();
    
    await expect(page.getByTestId('thong-bao-he-thong')).toContainText('Xóa bệnh nhân thành công');
    await expect(page.getByTestId('danh-sach-benh-nhan')).toContainText('Không tìm thấy bệnh nhân nào');
  });

  test('Dữ liệu vẫn tồn tại sau khi reload trang', async ({ page }) => {
    await page.getByTestId('input-ho-ten').fill('Nguyễn Lưu Trữ');
    await page.getByTestId('input-ngay-sinh').fill('1990-01-01');
    await page.getByTestId('input-so-dien-thoai').fill('0901112223');
    await page.getByTestId('button-luu-benh-nhan').click();
    
    await page.reload();
    
    await expect(page.getByTestId('danh-sach-benh-nhan')).toContainText('Nguyễn Lưu Trữ');
  });
});
