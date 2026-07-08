import { KHOA_LUU_TRU } from '../constants/hang-so.js';
import { taoKhoLuuTru } from './kho-luu-tru.js';

/**
 * Tạo repository quản lý dữ liệu Bệnh nhân
 * @param {Object} kho - Đối tượng kho lưu trữ (dependency injection)
 * @returns {Object}
 */
export function taoBenhNhanRepository(kho = taoKhoLuuTru()) {
  return {
    /**
     * Lấy toàn bộ danh sách bệnh nhân
     * @returns {Array}
     */
    layTatCaBenhNhan() {
      return kho.docDanhSach(KHOA_LUU_TRU.BENH_NHAN);
    },
    
    /**
     * Tìm kiếm một bệnh nhân theo ID
     * @param {string} id 
     * @returns {Object|null}
     */
    timBenhNhanTheoId(id) {
      const danhSach = this.layTatCaBenhNhan();
      return danhSach.find(bn => bn.id === id) || null;
    },
    
    /**
     * Thêm mới một bệnh nhân
     * @param {Object} benhNhan 
     * @returns {Object} Bệnh nhân đã được thêm
     */
    themBenhNhan(benhNhan) {
      const danhSach = this.layTatCaBenhNhan();
      danhSach.push(benhNhan);
      kho.ghiDanhSach(KHOA_LUU_TRU.BENH_NHAN, danhSach);
      return benhNhan;
    },
    
    /**
     * Cập nhật thông tin bệnh nhân đã tồn tại
     * @param {Object} benhNhanCungCap - Thông tin mới (cần chứa id)
     * @returns {Object} Bệnh nhân sau khi cập nhật
     */
    capNhatBenhNhan(benhNhanCungCap) {
      const danhSach = this.layTatCaBenhNhan();
      const viTri = danhSach.findIndex(bn => bn.id === benhNhanCungCap.id);
      
      if (viTri === -1) {
        throw new Error(`Không tìm thấy bệnh nhân có ID ${benhNhanCungCap.id} để cập nhật`);
      }
      
      danhSach[viTri] = { ...danhSach[viTri], ...benhNhanCungCap };
      kho.ghiDanhSach(KHOA_LUU_TRU.BENH_NHAN, danhSach);
      
      return danhSach[viTri];
    },
    
    /**
     * Xóa bệnh nhân khỏi hệ thống
     * @param {string} id 
     * @returns {boolean} True nếu xóa thành công
     */
    xoaBenhNhan(id) {
      const danhSach = this.layTatCaBenhNhan();
      const danhSachMoi = danhSach.filter(bn => bn.id !== id);
      
      if (danhSachMoi.length === danhSach.length) {
        throw new Error(`Không tìm thấy bệnh nhân có ID ${id} để xóa`);
      }
      
      kho.ghiDanhSach(KHOA_LUU_TRU.BENH_NHAN, danhSachMoi);
      return true;
    },
    
    /**
     * Đổi trạng thái khám của bệnh nhân
     * @param {string} id 
     * @param {string} trangThaiMoi 
     * @param {string} ngayCapNhat (Tùy chọn)
     * @returns {Object} Bệnh nhân sau khi đổi trạng thái
     */
    thayDoiTrangThaiBenhNhan(id, trangThaiMoi, ngayCapNhat = new Date().toISOString()) {
      const danhSach = this.layTatCaBenhNhan();
      const viTri = danhSach.findIndex(bn => bn.id === id);
      
      if (viTri === -1) {
        throw new Error(`Không tìm thấy bệnh nhân có ID ${id} để đổi trạng thái`);
      }
      
      danhSach[viTri].trangThai = trangThaiMoi;
      danhSach[viTri].ngayCapNhat = ngayCapNhat;
      
      kho.ghiDanhSach(KHOA_LUU_TRU.BENH_NHAN, danhSach);
      return danhSach[viTri];
    }
  };
}
