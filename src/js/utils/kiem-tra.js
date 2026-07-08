import { laNgayTrongTuongLai } from './ngay-thang.js';

/**
 * Kiểm tra xem chuỗi có rỗng hay không (chỉ chứa khoảng trắng)
 * @param {string} chuoi 
 * @returns {boolean}
 */
export function laChuoiRong(chuoi) {
  if (chuoi === null || chuoi === undefined) return true;
  return String(chuoi).trim() === '';
}

/**
 * Chuẩn hóa chuỗi (loại bỏ khoảng trắng dư thừa)
 * @param {string} chuoi 
 * @returns {string}
 */
export function chuanHoaChuoi(chuoi) {
  if (chuoi === null || chuoi === undefined) return '';
  return String(chuoi).trim().replace(/\s+/g, ' ');
}

/**
 * Kiểm tra định dạng số điện thoại (từ 9 đến 11 chữ số, không chứa ký tự khác)
 * @param {string} soDienThoai 
 * @returns {boolean}
 */
export function kiemTraSoDienThoai(soDienThoai) {
  if (!soDienThoai) return false;
  const sdtChuanHoa = String(soDienThoai).replace(/\s/g, '');
  const regex = /^[0-9]{9,11}$/;
  return regex.test(sdtChuanHoa);
}

/**
 * Kiểm tra giá trị có phải là số dương hợp lệ
 * @param {any} giaTri 
 * @returns {boolean}
 */
export function kiemTraSoDuong(giaTri) {
  if (giaTri === null || giaTri === undefined || giaTri === '') return false;
  const so = Number(giaTri);
  return !isNaN(so) && so > 0;
}

/**
 * Kiểm tra tính hợp lệ của đối tượng Bệnh nhân
 * @param {Object} benhNhan 
 * @returns {Object} { hopLe: boolean, loi: Object }
 */
export function kiemTraBenhNhan(benhNhan) {
  const ketQua = { hopLe: true, loi: {} };
  
  if (laChuoiRong(benhNhan.hoTen)) {
    ketQua.loi.hoTen = "Họ tên không được để trống";
    ketQua.hopLe = false;
  }
  
  if (laChuoiRong(benhNhan.ngaySinh)) {
    ketQua.loi.ngaySinh = "Ngày sinh không được để trống";
    ketQua.hopLe = false;
  } else if (laNgayTrongTuongLai(benhNhan.ngaySinh)) {
    ketQua.loi.ngaySinh = "Ngày sinh không được lớn hơn ngày hiện tại";
    ketQua.hopLe = false;
  }
  
  if (laChuoiRong(benhNhan.soDienThoai)) {
    ketQua.loi.soDienThoai = "Số điện thoại không được để trống";
    ketQua.hopLe = false;
  } else if (!kiemTraSoDienThoai(benhNhan.soDienThoai)) {
    ketQua.loi.soDienThoai = "Số điện thoại không hợp lệ (9-11 chữ số)";
    ketQua.hopLe = false;
  }
  
  return ketQua;
}

/**
 * Kiểm tra tính hợp lệ của một thuốc trong đơn
 * @param {Object} thuoc 
 * @returns {Object} { hopLe: boolean, loi: Object }
 */
export function kiemTraThuocTrongDon(thuoc) {
  const ketQua = { hopLe: true, loi: {} };
  
  if (laChuoiRong(thuoc.tenThuoc)) {
    ketQua.loi.tenThuoc = "Tên thuốc không được để trống";
    ketQua.hopLe = false;
  }
  
  if (!kiemTraSoDuong(thuoc.soLuongMoiLan)) {
    ketQua.loi.soLuongMoiLan = "Số lượng mỗi lần phải lớn hơn 0";
    ketQua.hopLe = false;
  }
  
  if (!kiemTraSoDuong(thuoc.soLanMoiNgay)) {
    ketQua.loi.soLanMoiNgay = "Số lần mỗi ngày phải lớn hơn 0";
    ketQua.hopLe = false;
  }
  
  if (!kiemTraSoDuong(thuoc.soNgayDung)) {
    ketQua.loi.soNgayDung = "Số ngày dùng phải lớn hơn 0";
    ketQua.hopLe = false;
  }
  
  return ketQua;
}

/**
 * Kiểm tra thông tin chung khi bác sĩ khám bệnh (trước khi lưu)
 * @param {Object} thongTinKham 
 * @returns {Object} { hopLe: boolean, loi: Object }
 */
export function kiemTraThongTinKham(thongTinKham) {
  const ketQua = { hopLe: true, loi: {} };
  
  if (laChuoiRong(thongTinKham.tenBacSi)) {
    ketQua.loi.tenBacSi = "Tên bác sĩ không được để trống";
    ketQua.hopLe = false;
  }
  
  if (laChuoiRong(thongTinKham.chuanDoan)) {
    ketQua.loi.chuanDoan = "Chẩn đoán không được để trống";
    ketQua.hopLe = false;
  }
  
  return ketQua;
}
