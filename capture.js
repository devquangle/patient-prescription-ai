import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(1000);

  // Allow dialog to be accepted
  page.on('dialog', dialog => dialog.accept());
  
  await page.getByRole('button', { name: 'Xóa toàn bộ dữ liệu' }).click();
  await page.waitForTimeout(500);

  await page.getByRole('button', { name: 'Tạo dữ liệu mẫu' }).click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'docs/tiep-nhan.png', fullPage: true });

  await page.locator('tbody#tbody-benh-nhan tr').first().getByRole('button', { name: 'Khám' }).click();
  await page.waitForTimeout(1000);

  await page.getByTestId('input-chuan-doan').fill('Cảm cúm');
  await page.getByTestId('input-ten-thuoc').fill('Paracetamol');
  await page.locator('#input-so-luong-moi-lan').fill('1');
  await page.locator('#input-so-lan-moi-ngay').fill('2');
  await page.locator('#input-so-ngay-dung').fill('3');
  await page.getByTestId('button-them-thuoc').click();
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'docs/kham-benh.png', fullPage: true });

  await page.locator('#btn-luu-nhap').click();
  await page.waitForTimeout(500);

  await page.getByRole('button', { name: 'Lịch sử đơn thuốc' }).click();
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'docs/lich-su.png', fullPage: true });

  await browser.close();
  console.log("Screenshots captured successfully in docs/ folder.");
  process.exit(0);
})();
