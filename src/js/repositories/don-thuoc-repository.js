import { KHOA_LUU_TRU } from '../constants/hang-so.js';
import { taoKhoLuuTru } from './kho-luu-tru.js';

/**
 * Tạo repository quản lý dữ liệu Đơn thuốc
 * @param {Object} kho - Đối tượng kho lưu trữ (dependency injection)
 * @returns {Object}
 */
export function taoDonThuocRepository(kho = taoKhoLuuTru()) {
  return {
    /**
     * Lấy toàn bộ danh sách đơn thuốc
     * @returns {Array}
     */
    layTatCaDonThuoc() {
      return kho.docDanhSach(KHOA_LUU_TRU.DON_THUOC);
    },
    
    /**
     * Tìm một đơn thuốc theo ID
     * @param {string} id 
     * @returns {Object|null}
     */
    timDonThuocTheoId(id) {
      const danhSach = this.layTatCaDonThuoc();
      return danhSach.find(dt => dt.id === id) || null;
    },
    
    /**
     * Tìm tất cả đơn thuốc của một bệnh nhân cụ thể
     * @param {string} benhNhanId 
     * @returns {Array}
     */
    timDonThuocTheoBenhNhan(benhNhanId) {
      const danhSach = this.layTatCaDonThuoc();
      return danhSach.filter(dt => dt.benhNhanId === benhNhanId);
    },
    
    /**
     * Thêm mới một đơn thuốc
     * @param {Object} donThuoc 
     * @returns {Object} Đơn thuốc đã thêm
     */
    themDonThuoc(donThuoc) {
      const danhSach = this.layTatCaDonThuoc();
      danhSach.push(donThuoc);
      kho.ghiDanhSach(KHOA_LUU_TRU.DON_THUOC, danhSach);
      return donThuoc;
    },
    
    /**
     * Cập nhật thông tin đơn thuốc
     * @param {Object} donThuocCungCap - Thông tin mới (cần chứa id)
     * @returns {Object} Đơn thuốc sau khi cập nhật
     */
    capNhatDonThuoc(donThuocCungCap) {
      const danhSach = this.layTatCaDonThuoc();
      const viTri = danhSach.findIndex(dt => dt.id === donThuocCungCap.id);
      
      if (viTri === -1) {
        throw new Error(`Không tìm thấy đơn thuốc có ID ${donThuocCungCap.id} để cập nhật`);
      }
      
      danhSach[viTri] = { ...danhSach[viTri], ...donThuocCungCap };
      kho.ghiDanhSach(KHOA_LUU_TRU.DON_THUOC, danhSach);
      
      return danhSach[viTri];
    },
    
    /**
     * Xóa đơn thuốc khỏi hệ thống
     * @param {string} id 
     * @returns {boolean}
     */
    xoaDonThuoc(id) {
      const danhSach = this.layTatCaDonThuoc();
      const danhSachMoi = danhSach.filter(dt => dt.id !== id);
      
      if (danhSachMoi.length === danhSach.length) {
        throw new Error(`Không tìm thấy đơn thuốc có ID ${id} để xóa`);
      }
      
      kho.ghiDanhSach(KHOA_LUU_TRU.DON_THUOC, danhSachMoi);
      return true;
    }
  };
}
