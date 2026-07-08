/**
 * Lấy đối tượng ngày hiện tại
 * @returns {Date}
 */
export function layNgayHienTai() {
  return new Date();
}

/**
 * Định dạng ngày theo chuẩn DD/MM/YYYY
 * @param {string|Date} giaTriNgay 
 * @returns {string}
 */
export function dinhDangNgay(giaTriNgay) {
  if (!giaTriNgay) return '';
  try {
    const date = new Date(giaTriNgay);
    if (isNaN(date.getTime())) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    return '';
  }
}

/**
 * Định dạng ngày giờ theo chuẩn DD/MM/YYYY HH:mm
 * @param {string|Date} giaTriNgay 
 * @returns {string}
 */
export function dinhDangNgayGio(giaTriNgay) {
  if (!giaTriNgay) return '';
  try {
    const date = new Date(giaTriNgay);
    if (isNaN(date.getTime())) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    return '';
  }
}

/**
 * Kiểm tra xem ngày truyền vào có phải là trong tương lai không
 * @param {string|Date} giaTriNgay 
 * @param {Date} ngayHienTai (mặc định lấy hệ thống, để test có thể truyền vào)
 * @returns {boolean}
 */
export function laNgayTrongTuongLai(giaTriNgay, ngayHienTai = new Date()) {
  if (!giaTriNgay) return false;
  try {
    const date = new Date(giaTriNgay);
    if (isNaN(date.getTime())) return false;
    
    // Đặt giờ phút giây của ngày hiện tại về 23:59:59 để so sánh công bằng
    const homNay = new Date(ngayHienTai);
    homNay.setHours(23, 59, 59, 999);
    
    return date.getTime() > homNay.getTime();
  } catch (error) {
    return false;
  }
}

/**
 * Tính tuổi dựa trên ngày sinh
 * @param {string|Date} ngaySinh 
 * @param {Date} ngayHienTai 
 * @returns {number|null} Trả về null nếu ngày không hợp lệ
 */
export function tinhTuoi(ngaySinh, ngayHienTai = new Date()) {
  if (!ngaySinh) return null;
  try {
    const birthDate = new Date(ngaySinh);
    if (isNaN(birthDate.getTime())) return null;
    
    let age = ngayHienTai.getFullYear() - birthDate.getFullYear();
    const m = ngayHienTai.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && ngayHienTai.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    return null;
  }
}

/**
 * Chuyển đổi ngày sang định dạng ISO (YYYY-MM-DD) dùng cho input type="date"
 * @param {string|Date} giaTriNgay 
 * @returns {string}
 */
export function chuyenNgaySangISO(giaTriNgay) {
  if (!giaTriNgay) return '';
  try {
    const date = new Date(giaTriNgay);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    return '';
  }
}
