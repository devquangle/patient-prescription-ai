import { TRANG_THAI_BENH_NHAN } from '../constants/hang-so.js';
import { kiemTraBenhNhan } from '../utils/kiem-tra.js';
import { taoId, taoMaBenhNhan } from '../utils/ma.js';
import { 
  chuanHoaBenhNhan, 
  taoBenhNhanMoi, 
  timBenhNhanTrung, 
  locBenhNhanTheoTuKhoa, 
  locBenhNhanTheoTrangThai, 
  sapXepBenhNhanMoiNhat, 
  coTheXoaBenhNhan, 
  coTheBatDauKham 
} from '../business/benh-nhan-business.js';

/**
 * Lớp lỗi đại diện cho lỗi nghiệp vụ
 */
export class LoiNghiepVu extends Error {
  constructor(thongBao) {
    super(thongBao);
    this.name = 'LoiNghiepVu';
  }
}

/**
 * Factory tạo service xử lý quy trình cho Bệnh nhân.
 * Service này nhận repository và các hàm phụ trợ thông qua dependency injection.
 * 
 * @param {Object} dependencies 
 * @returns {Object} Service Bệnh Nhân
 */
export function taoBenhNhanService({
  benhNhanRepository,
  donThuocRepository,
  hamTaoId = taoId,
  hamTaoMaBenhNhan = taoMaBenhNhan,
  hamLayThoiGianHienTai = () => new Date()
}) {
  return {
    /**
     * Lấy toàn bộ danh sách bệnh nhân, sắp xếp mới nhất lên đầu
     * @returns {Array}
     */
    layDanhSachBenhNhan() {
      const danhSach = benhNhanRepository.layTatCaBenhNhan();
      return sapXepBenhNhanMoiNhat(danhSach);
    },

    /**
     * Lấy chi tiết bệnh nhân theo ID
     * @param {string} id 
     * @returns {Object}
     * @throws {LoiNghiepVu} Nếu không tìm thấy
     */
    layChiTietBenhNhan(id) {
      const benhNhan = benhNhanRepository.timBenhNhanTheoId(id);
      if (!benhNhan) {
        throw new LoiNghiepVu("Không tìm thấy dữ liệu bệnh nhân này.");
      }
      return benhNhan;
    },

    /**
     * Thêm mới một bệnh nhân
     * @param {Object} duLieu Dữ liệu nhập từ người dùng
     * @returns {Object} Bệnh nhân mới được lưu
     * @throws {LoiNghiepVu} Nếu dữ liệu không hợp lệ hoặc bị trùng
     */
    themBenhNhan(duLieu) {
      // 1. Kiểm tra tính hợp lệ cơ bản
      const ketQuaKiemTra = kiemTraBenhNhan(duLieu);
      if (!ketQuaKiemTra.hopLe) {
        // Lấy thông báo lỗi đầu tiên để ném ra
        const loiDauTien = Object.values(ketQuaKiemTra.loi)[0];
        throw new LoiNghiepVu(loiDauTien);
      }

      // 2. Chuẩn hóa khoảng trắng
      const duLieuChuanHoa = chuanHoaBenhNhan(duLieu);

      // 3. Kiểm tra trùng lặp trong hệ thống (Quy tắc Business)
      const danhSachHienTai = benhNhanRepository.layTatCaBenhNhan();
      const benhNhanTrung = timBenhNhanTrung(duLieuChuanHoa, danhSachHienTai);
      if (benhNhanTrung) {
        throw new LoiNghiepVu("Bệnh nhân đã tồn tại. Không thể thêm do trùng số điện thoại và ngày sinh.");
      }

      // 4. Sinh ID, Mã và thời gian
      const idMoi = hamTaoId();
      const thoiGian = hamLayThoiGianHienTai();
      const maMoi = hamTaoMaBenhNhan(thoiGian);
      
      // 5. Khởi tạo Object
      const benhNhanMoi = taoBenhNhanMoi(duLieuChuanHoa, idMoi, maMoi, thoiGian);

      // 6. Lưu qua Repository
      return benhNhanRepository.themBenhNhan(benhNhanMoi);
    },

    /**
     * Cập nhật thông tin bệnh nhân hiện tại
     * @param {string} id 
     * @param {Object} duLieu 
     * @returns {Object} Bệnh nhân sau khi cập nhật
     * @throws {LoiNghiepVu} Nếu không hợp lệ hoặc trùng lặp với người khác
     */
    capNhatBenhNhan(id, duLieu) {
      const benhNhanGoc = benhNhanRepository.timBenhNhanTheoId(id);
      if (!benhNhanGoc) {
        throw new LoiNghiepVu("Không tìm thấy bệnh nhân để cập nhật.");
      }

      const ketQuaKiemTra = kiemTraBenhNhan(duLieu);
      if (!ketQuaKiemTra.hopLe) {
        const loiDauTien = Object.values(ketQuaKiemTra.loi)[0];
        throw new LoiNghiepVu(loiDauTien);
      }

      const duLieuChuanHoa = chuanHoaBenhNhan({ ...duLieu, id });

      const danhSachHienTai = benhNhanRepository.layTatCaBenhNhan();
      const benhNhanTrung = timBenhNhanTrung(duLieuChuanHoa, danhSachHienTai);
      if (benhNhanTrung && benhNhanTrung.id !== id) {
        throw new LoiNghiepVu("Bệnh nhân đã tồn tại. Bạn đang cập nhật thông tin trùng với người khác.");
      }

      const duLieuCapNhat = {
        ...benhNhanGoc,
        ...duLieuChuanHoa,
        thoiGianCapNhat: hamLayThoiGianHienTai().toISOString()
      };

      return benhNhanRepository.capNhatBenhNhan(duLieuCapNhat);
    },

    /**
     * Xóa bệnh nhân
     * @param {string} id 
     * @returns {boolean} True nếu thành công
     * @throws {LoiNghiepVu} Nếu có đơn thuốc hoàn tất hoặc không tìm thấy
     */
    xoaBenhNhan(id) {
      const benhNhan = benhNhanRepository.timBenhNhanTheoId(id);
      if (!benhNhan) {
        throw new LoiNghiepVu("Không tìm thấy bệnh nhân cần xóa.");
      }

      const donThuocCuaBenhNhan = donThuocRepository.timDonThuocTheoBenhNhan(id);
      
      if (!coTheXoaBenhNhan(benhNhan, donThuocCuaBenhNhan)) {
        throw new LoiNghiepVu("Không thể xóa bệnh nhân đã có đơn thuốc hoàn tất.");
      }

      // Xóa tất cả các đơn thuốc (nháp, hủy) thuộc về bệnh nhân này trước
      donThuocCuaBenhNhan.forEach(dt => {
        donThuocRepository.xoaDonThuoc(dt.id);
      });

      return benhNhanRepository.xoaBenhNhan(id);
    },

    /**
     * Tìm kiếm và lọc
     * @param {string} tuKhoa Từ khóa tìm kiếm (Mã, Tên, SĐT)
     * @param {string} trangThai Trạng thái (cho_kham, dang_kham...)
     * @returns {Array} Danh sách kết quả
     */
    timKiemBenhNhan(tuKhoa, trangThai) {
      let danhSach = benhNhanRepository.layTatCaBenhNhan();
      
      danhSach = locBenhNhanTheoTuKhoa(danhSach, tuKhoa);
      danhSach = locBenhNhanTheoTrangThai(danhSach, trangThai);
      
      return sapXepBenhNhanMoiNhat(danhSach);
    },

    /**
     * Đổi trạng thái bệnh nhân sang Đang khám
     * @param {string} id 
     * @returns {Object} 
     * @throws {LoiNghiepVu} Nếu không cho phép
     */
    batDauKham(id) {
      const benhNhan = benhNhanRepository.timBenhNhanTheoId(id);
      if (!benhNhan) {
        throw new LoiNghiepVu("Không tìm thấy dữ liệu bệnh nhân.");
      }

      if (!coTheBatDauKham(benhNhan)) {
        throw new LoiNghiepVu("Bệnh nhân không còn ở trạng thái chờ khám.");
      }

      return benhNhanRepository.thayDoiTrangThaiBenhNhan(
        id, 
        TRANG_THAI_BENH_NHAN.DANG_KHAM, 
        hamLayThoiGianHienTai().toISOString()
      );
    },

    /**
     * Hủy thao tác khám, đưa trạng thái về Chờ khám
     * @param {string} id 
     * @returns {Object}
     */
    duaVeChoKham(id) {
      const benhNhan = benhNhanRepository.timBenhNhanTheoId(id);
      if (!benhNhan) {
        throw new LoiNghiepVu("Không tìm thấy dữ liệu bệnh nhân.");
      }

      return benhNhanRepository.thayDoiTrangThaiBenhNhan(
        id, 
        TRANG_THAI_BENH_NHAN.CHO_KHAM, 
        hamLayThoiGianHienTai().toISOString()
      );
    },
    
    /**
     * Tiện ích: Tạo dữ liệu bệnh nhân mẫu
     */
    taoDuLieuBenhNhanMau() {
      const now = hamLayThoiGianHienTai();
      
      const bn1 = taoBenhNhanMoi(
        { hoTen: "Nguyễn Văn Tuấn", ngaySinh: "1990-05-15", gioiTinh: "nam", soDienThoai: "0901234567", diaChi: "Quận 1, TP.HCM", trieuChung: "Sốt cao, ho khan", tienSuBenh: "Không", diUngThuoc: "Không" },
        hamTaoId(), hamTaoMaBenhNhan(now), now
      );
      
      const bn2 = taoBenhNhanMoi(
        { hoTen: "Trần Thị Mai", ngaySinh: "1985-10-20", gioiTinh: "nu", soDienThoai: "0987654321", diaChi: "Quận 3, TP.HCM", trieuChung: "Đau đầu, chóng mặt", tienSuBenh: "Huyết áp thấp", diUngThuoc: "Penicillin" },
        hamTaoId(), hamTaoMaBenhNhan(now), now
      );
      
      benhNhanRepository.themBenhNhan(bn1);
      benhNhanRepository.themBenhNhan(bn2);
      
      return [bn1, bn2];
    }
  };
}
