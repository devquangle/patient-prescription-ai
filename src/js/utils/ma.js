/**
 * Tạo ID ngẫu nhiên định dạng UUID v4 đơn giản
 * @param {function} randomGenerator - Hàm sinh số ngẫu nhiên (mặc định Math.random)
 * @returns {string} Chuỗi UUID
 */
export function taoId(randomGenerator = Math.random) {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = randomGenerator() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Sinh chuỗi ngẫu nhiên 4 ký tự từ số
 * @param {function} randomGenerator 
 * @returns {string} Chuỗi 4 chữ số
 */
const sinhBonKyTuRandom = (randomGenerator) => {
  return Math.floor(randomGenerator() * 10000).toString().padStart(4, '0');
};

/**
 * Tạo mã bệnh nhân
 * @param {Date} dateObj - Đối tượng ngày (mặc định new Date())
 * @param {function} randomGenerator - Hàm sinh số ngẫu nhiên
 * @returns {string} Mã dạng BN-YYYYMMDD-XXXX
 */
export function taoMaBenhNhan(dateObj = new Date(), randomGenerator = Math.random) {
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  const randomPart = sinhBonKyTuRandom(randomGenerator);
  return `BN-${year}${month}${day}-${randomPart}`;
}

/**
 * Tạo mã đơn thuốc
 * @param {Date} dateObj - Đối tượng ngày (mặc định new Date())
 * @param {function} randomGenerator - Hàm sinh số ngẫu nhiên
 * @returns {string} Mã dạng DT-YYYYMMDD-XXXX
 */
export function taoMaDonThuoc(dateObj = new Date(), randomGenerator = Math.random) {
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  const randomPart = sinhBonKyTuRandom(randomGenerator);
  return `DT-${year}${month}${day}-${randomPart}`;
}
