import { TRANG_THAI_DON_THUOC } from '../constants/hang-so.js';
import { kiemTraSoDuong, chuanHoaChuoi } from '../utils/kiem-tra.js';

/**
 * Tính tổng số lượng thuốc cần dùng
 * Công thức: số lượng mỗi lần * số lần mỗi ngày * số ngày dùng
 * @param {number|string} soLuongMoiLan 
 * @param {number|string} soLanMoiNgay 
 * @param {number|string} soNgayDung 
 * @returns {number} Tổng số lượng (phải là số dương, mặc định trả về 0 nếu sai)
 */
export function tinhTongSoLuongThuoc(soLuongMoiLan, soLanMoiNgay, soNgayDung) {
  const slMoiLan = Number(soLuongMoiLan);
  const slMoiNgay = Number(soLanMoiNgay);
  const soNgay = Number(soNgayDung);

  if (kiemTraSoDuong(slMoiLan) && kiemTraSoDuong(slMoiNgay) && kiemTraSoDuong(soNgay)) {
    return slMoiLan * slMoiNgay * soNgay;
  }
  return 0;
}

/**
 * Chuẩn hóa và tạo bản ghi thuốc con trong đơn
 * @param {Object} duLieuThuoc Dữ liệu người dùng nhập
 * @param {string} thuocId ID sinh tự động
 * @returns {Object} Object chứa thông tin thuốc đã xử lý
 */
export function taoThuocTrongDon(duLieuThuoc, thuocId) {
  const tongSoLuong = tinhTongSoLuongThuoc(
    duLieuThuoc.soLuongMoiLan,
    duLieuThuoc.soLanMoiNgay,
    duLieuThuoc.soNgayDung
  );

  return {
    id: thuocId,
    tenThuoc: chuanHoaChuoi(duLieuThuoc.tenThuoc),
    hamLuong: chuanHoaChuoi(duLieuThuoc.hamLuong),
    donVi: chuanHoaChuoi(duLieuThuoc.donVi),
    soLuongMoiLan: Number(duLieuThuoc.soLuongMoiLan),
    soLanMoiNgay: Number(duLieuThuoc.soLanMoiNgay),
    soNgayDung: Number(duLieuThuoc.soNgayDung),
    tongSoLuong: tongSoLuong,
    cachDung: chuanHoaChuoi(duLieuThuoc.cachDung),
    thoiDiemDung: chuanHoaChuoi(duLieuThuoc.thoiDiemDung)
  };
}

/**
 * Tạo cấu trúc ban đầu cho một đơn thuốc mới
 * @param {string} id 
 * @param {string} maDonThuoc 
 * @param {string} benhNhanId 
 * @param {Object} thongTinKham 
 * @param {Date|string} thoiGianTao 
 * @returns {Object}
 */
export function taoDonThuocMoi(id, maDonThuoc, benhNhanId, thongTinKham, thoiGianTao) {
  const thoiGianStr = typeof thoiGianTao === 'string' ? thoiGianTao : thoiGianTao.toISOString();
  
  return {
    id: id,
    maDonThuoc: maDonThuoc,
    benhNhanId: benhNhanId,
    tenBacSi: chuanHoaChuoi(thongTinKham.tenBacSi),
    chuanDoan: chuanHoaChuoi(thongTinKham.chuanDoan),
    loiDan: chuanHoaChuoi(thongTinKham.loiDan),
    danhSachThuoc: [],
    trangThai: TRANG_THAI_DON_THUOC.NHAP, // Luôn tạo ở trạng thái Nháp
    thoiGianTao: thoiGianStr,
    thoiGianCapNhat: thoiGianStr
  };
}

/**
 * Thêm một thuốc vào danh sách thuốc
 * @param {Array} danhSachThuocHienTai 
 * @param {Object} thuocMoi 
 * @returns {Array} Mảng mới
 */
export function themThuocVaoDanhSach(danhSachThuocHienTai, thuocMoi) {
  return [...(danhSachThuocHienTai || []), thuocMoi];
}

/**
 * Xóa một thuốc khỏi danh sách thuốc theo ID
 * @param {Array} danhSachThuocHienTai 
 * @param {string} thuocId 
 * @returns {Array} Mảng mới
 */
export function xoaThuocKhoiDanhSach(danhSachThuocHienTai, thuocId) {
  return (danhSachThuocHienTai || []).filter(t => t.id !== thuocId);
}

/**
 * Quy tắc nghiệp vụ: Đơn thuốc có đủ điều kiện để Hoàn tất không?
 * (Phải có Bác sĩ, Chẩn đoán, và ít nhất 1 thuốc)
 * @param {Object} donThuoc 
 * @returns {boolean}
 */
export function kiemTraDonThuocCoTheHoanTat(donThuoc) {
  const coBacSi = donThuoc.tenBacSi && donThuoc.tenBacSi.trim() !== '';
  const coChuanDoan = donThuoc.chuanDoan && donThuoc.chuanDoan.trim() !== '';
  const coThuoc = Array.isArray(donThuoc.danhSachThuoc) && donThuoc.danhSachThuoc.length > 0;
  
  return Boolean(coBacSi && coChuanDoan && coThuoc);
}

/**
 * Quy tắc nghiệp vụ: Có thể sửa đổi đơn thuốc (thêm/xóa thuốc, đổi chẩn đoán) không?
 * @param {Object} donThuoc 
 * @returns {boolean}
 */
export function coTheSuaDonThuoc(donThuoc) {
  return donThuoc.trangThai === TRANG_THAI_DON_THUOC.NHAP;
}

/**
 * Quy tắc nghiệp vụ: Có thể hủy đơn thuốc không?
 * @param {Object} donThuoc 
 * @returns {boolean}
 */
export function coTheHuyDonThuoc(donThuoc) {
  return donThuoc.trangThai === TRANG_THAI_DON_THUOC.NHAP;
}

/**
 * Lọc và tìm kiếm danh sách đơn thuốc
 * @param {Array} danhSachDonThuoc 
 * @param {Array} danhSachBenhNhan 
 * @param {string} tuKhoa 
 * @param {string} trangThai 
 * @returns {Array}
 */
export function timKiemDonThuoc(danhSachDonThuoc, danhSachBenhNhan, tuKhoa, trangThai) {
  let ketQua = [...danhSachDonThuoc];
  
  if (trangThai) {
    ketQua = ketQua.filter(dt => dt.trangThai === trangThai);
  }
  
  if (tuKhoa && String(tuKhoa).trim() !== '') {
    const keyword = String(tuKhoa).trim().toLowerCase();
    ketQua = ketQua.filter(dt => {
      // Tìm theo mã đơn hoặc tên bác sĩ
      if (dt.maDonThuoc && dt.maDonThuoc.toLowerCase().includes(keyword)) return true;
      if (dt.tenBacSi && dt.tenBacSi.toLowerCase().includes(keyword)) return true;
      
      // Tìm theo tên bệnh nhân bằng cách map ID
      const bn = danhSachBenhNhan.find(b => b.id === dt.benhNhanId);
      if (bn && bn.hoTen && bn.hoTen.toLowerCase().includes(keyword)) return true;
      
      return false;
    });
  }
  
  return ketQua;
}

/**
 * Sắp xếp đơn thuốc mới nhất lên đầu (theo cập nhật hoặc tạo mới)
 * @param {Array} danhSach 
 * @returns {Array}
 */
export function sapXepDonThuocMoiNhat(danhSach) {
  return [...danhSach].sort((a, b) => {
    const timeA = new Date(a.thoiGianCapNhat || a.thoiGianTao).getTime();
    const timeB = new Date(b.thoiGianCapNhat || b.thoiGianTao).getTime();
    return timeB - timeA;
  });
}
