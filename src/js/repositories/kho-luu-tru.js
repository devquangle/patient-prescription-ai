/**
 * Tạo một đối tượng tương tác với kho lưu trữ.
 * Giúp cô lập logic localStorage, dễ dàng kiểm thử bằng cách truyền storage giả.
 * 
 * @param {Storage} storage - Đối tượng thực hiện API Storage (localStorage, sessionStorage hoặc giả lập)
 * @returns {Object} Các hàm thao tác kho lưu trữ
 */
export function taoKhoLuuTru(storage = window.localStorage) {
  return {
    /**
     * Đọc một danh sách (mảng) từ kho
     * @param {string} khoa - Khóa lưu trữ
     * @returns {Array} Mảng dữ liệu hoặc mảng rỗng nếu lỗi/không có
     */
    docDanhSach(khoa) {
      try {
        const duLieuRaw = storage.getItem(khoa);
        if (!duLieuRaw) return [];
        const duLieuParsed = JSON.parse(duLieuRaw);
        return Array.isArray(duLieuParsed) ? duLieuParsed : [];
      } catch (error) {
        console.error(`[Kho Lưu Trữ] Lỗi phân tích JSON khi đọc khóa '${khoa}':`, error);
        return [];
      }
    },

    /**
     * Ghi một danh sách (mảng) vào kho
     * @param {string} khoa - Khóa lưu trữ
     * @param {Array} danhSach - Danh sách cần ghi
     */
    ghiDanhSach(khoa, danhSach) {
      try {
        if (!Array.isArray(danhSach)) {
          throw new Error('Dữ liệu yêu cầu phải là mảng');
        }
        storage.setItem(khoa, JSON.stringify(danhSach));
      } catch (error) {
        console.error(`[Kho Lưu Trữ] Lỗi ghi danh sách vào khóa '${khoa}':`, error);
        throw error;
      }
    },

    /**
     * Đọc giá trị đơn lẻ (Object, chuỗi, số...)
     * @param {string} khoa - Khóa lưu trữ
     * @param {any} giaTriMacDinh - Giá trị trả về nếu không tồn tại hoặc lỗi
     * @returns {any}
     */
    docGiaTri(khoa, giaTriMacDinh = null) {
      try {
        const duLieuRaw = storage.getItem(khoa);
        if (duLieuRaw === null) return giaTriMacDinh;
        return JSON.parse(duLieuRaw);
      } catch (error) {
        console.error(`[Kho Lưu Trữ] Lỗi phân tích JSON khi đọc khóa '${khoa}':`, error);
        return giaTriMacDinh;
      }
    },

    /**
     * Ghi giá trị đơn lẻ vào kho
     * @param {string} khoa 
     * @param {any} giaTri 
     */
    ghiGiaTri(khoa, giaTri) {
      try {
        storage.setItem(khoa, JSON.stringify(giaTri));
      } catch (error) {
        console.error(`[Kho Lưu Trữ] Lỗi ghi giá trị vào khóa '${khoa}':`, error);
        throw error;
      }
    },

    /**
     * Xóa một khóa cụ thể
     * @param {string} khoa 
     */
    xoaTheoKhoa(khoa) {
      try {
        storage.removeItem(khoa);
      } catch (error) {
        console.error(`[Kho Lưu Trữ] Lỗi xóa khóa '${khoa}':`, error);
        throw error;
      }
    },

    /**
     * Xóa toàn bộ dữ liệu trong kho
     */
    xoaToanBo() {
      try {
        storage.clear();
      } catch (error) {
        console.error('[Kho Lưu Trữ] Lỗi xóa toàn bộ dữ liệu:', error);
        throw error;
      }
    },

    /**
     * Khởi tạo dữ liệu mẫu hàng loạt
     * @param {Object} doiTuongDuLieu - Object chứa key là khóa lưu trữ, value là dữ liệu
     */
    khoiTaoDuLieuMau(doiTuongDuLieu) {
      try {
        for (const khoa in doiTuongDuLieu) {
          if (Object.prototype.hasOwnProperty.call(doiTuongDuLieu, khoa)) {
            storage.setItem(khoa, JSON.stringify(doiTuongDuLieu[khoa]));
          }
        }
      } catch (error) {
        console.error('[Kho Lưu Trữ] Lỗi khởi tạo dữ liệu mẫu:', error);
        throw error;
      }
    }
  };
}
