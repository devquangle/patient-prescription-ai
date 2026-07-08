import { TRANG_THAI_BENH_NHAN, TRANG_THAI_DON_THUOC } from '../constants/hang-so.js';
import { kiemTraThongTinKham, kiemTraThuocTrongDon } from '../utils/kiem-tra.js';
import { taoId, taoMaDonThuoc } from '../utils/ma.js';
import { coTheLapDonThuoc } from '../business/benh-nhan-business.js';
import { 
  taoDonThuocMoi, 
  taoThuocTrongDon, 
  themThuocVaoDanhSach, 
  xoaThuocKhoiDanhSach, 
  coTheSuaDonThuoc, 
  coTheHuyDonThuoc, 
  kiemTraDonThuocCoTheHoanTat, 
  timKiemDonThuoc, 
  sapXepDonThuocMoiNhat 
} from '../business/don-thuoc-business.js';

export class LoiNghiepVu extends Error {
  constructor(thongBao) {
    super(thongBao);
    this.name = 'LoiNghiepVu';
  }
}

/**
 * Factory tạo service xử lý quy trình cho Đơn thuốc
 * @param {Object} dependencies 
 * @returns {Object} Service Đơn Thuốc
 */
export function taoDonThuocService({
  donThuocRepository,
  benhNhanRepository,
  hamTaoId = taoId,
  hamTaoMaDonThuoc = taoMaDonThuoc,
  hamLayThoiGianHienTai = () => new Date()
}) {
  return {
    /**
     * Tạo đơn thuốc nháp mới (Bắt đầu khám)
     * @param {string} benhNhanId 
     * @param {Object} thongTinKham 
     * @returns {Object}
     */
    taoDonThuocNhap(benhNhanId, thongTinKham = {}) {
      const benhNhan = benhNhanRepository.timBenhNhanTheoId(benhNhanId);
      if (!benhNhan) {
        throw new LoiNghiepVu("Bệnh nhân không tồn tại.");
      }

      // Validate Business Rule: Tình trạng Bệnh nhân
      if (!coTheLapDonThuoc(benhNhan)) {
        throw new LoiNghiepVu("Bệnh nhân phải ở trạng thái 'Chờ khám' hoặc 'Đang khám' mới được lập đơn thuốc.");
      }

      // Đổi trạng thái Bệnh nhân sang Đang Khám
      if (benhNhan.trangThai === TRANG_THAI_BENH_NHAN.CHO_KHAM) {
        benhNhanRepository.thayDoiTrangThaiBenhNhan(
          benhNhanId, 
          TRANG_THAI_BENH_NHAN.DANG_KHAM, 
          hamLayThoiGianHienTai().toISOString()
        );
      }

      const idMoi = hamTaoId();
      const thoiGian = hamLayThoiGianHienTai();
      const maMoi = hamTaoMaDonThuoc(thoiGian);
      
      const donThuocNhap = taoDonThuocMoi(idMoi, maMoi, benhNhanId, thongTinKham, thoiGian);
      return donThuocRepository.themDonThuoc(donThuocNhap);
    },

    /**
     * Lấy chi tiết đơn thuốc
     * @param {string} id 
     * @returns {Object}
     */
    layDonThuocTheoId(id) {
      const donThuoc = donThuocRepository.timDonThuocTheoId(id);
      if (!donThuoc) {
        throw new LoiNghiepVu("Không tìm thấy đơn thuốc.");
      }
      return donThuoc;
    },

    /**
     * Lấy toàn bộ danh sách đơn thuốc
     * @returns {Array}
     */
    layDanhSachDonThuoc() {
      const danhSach = donThuocRepository.layTatCaDonThuoc();
      return sapXepDonThuocMoiNhat(danhSach);
    },

    /**
     * Thêm một loại thuốc vào đơn thuốc
     * @param {string} donThuocId 
     * @param {Object} duLieuThuoc 
     * @returns {Object} Đơn thuốc sau khi cập nhật
     */
    themThuocVaoDon(donThuocId, duLieuThuoc) {
      const donThuoc = this.layDonThuocTheoId(donThuocId);
      
      if (!coTheSuaDonThuoc(donThuoc)) {
        throw new LoiNghiepVu("Không thể sửa đổi đơn thuốc đã hoàn tất hoặc đã hủy.");
      }

      const ketQuaKiemTra = kiemTraThuocTrongDon(duLieuThuoc);
      if (!ketQuaKiemTra.hopLe) {
        const loiDauTien = Object.values(ketQuaKiemTra.loi)[0];
        throw new LoiNghiepVu(loiDauTien);
      }

      const thuocIdMoi = hamTaoId();
      const thuocMoi = taoThuocTrongDon(duLieuThuoc, thuocIdMoi);
      
      donThuoc.danhSachThuoc = themThuocVaoDanhSach(donThuoc.danhSachThuoc, thuocMoi);
      donThuoc.thoiGianCapNhat = hamLayThoiGianHienTai().toISOString();
      
      return donThuocRepository.capNhatDonThuoc(donThuoc);
    },

    /**
     * Xóa một loại thuốc khỏi đơn thuốc
     * @param {string} donThuocId 
     * @param {string} thuocId 
     * @returns {Object} Đơn thuốc sau khi cập nhật
     */
    xoaThuocKhoiDon(donThuocId, thuocId) {
      const donThuoc = this.layDonThuocTheoId(donThuocId);
      
      if (!coTheSuaDonThuoc(donThuoc)) {
        throw new LoiNghiepVu("Không thể xóa thuốc khỏi đơn thuốc đã hoàn tất hoặc đã hủy.");
      }
      
      donThuoc.danhSachThuoc = xoaThuocKhoiDanhSach(donThuoc.danhSachThuoc, thuocId);
      donThuoc.thoiGianCapNhat = hamLayThoiGianHienTai().toISOString();
      
      return donThuocRepository.capNhatDonThuoc(donThuoc);
    },

    /**
     * Cập nhật thông tin bác sĩ, chẩn đoán, lời dặn
     * @param {string} donThuocId 
     * @param {Object} thongTinKham 
     * @returns {Object}
     */
    capNhatThongTinKham(donThuocId, thongTinKham) {
      const donThuoc = this.layDonThuocTheoId(donThuocId);
      
      if (!coTheSuaDonThuoc(donThuoc)) {
        throw new LoiNghiepVu("Không thể sửa đổi thông tin của đơn thuốc đã hoàn tất hoặc đã hủy.");
      }
      
      if (thongTinKham.tenBacSi !== undefined) donThuoc.tenBacSi = thongTinKham.tenBacSi;
      if (thongTinKham.chuanDoan !== undefined) donThuoc.chuanDoan = thongTinKham.chuanDoan;
      if (thongTinKham.loiDan !== undefined) donThuoc.loiDan = thongTinKham.loiDan;
      
      donThuoc.thoiGianCapNhat = hamLayThoiGianHienTai().toISOString();
      return donThuocRepository.capNhatDonThuoc(donThuoc);
    },

    /**
     * Lưu nháp đơn thuốc (thực chất đã lưu từ trước, chỉ trigger lại save)
     * @param {string} donThuocId 
     * @returns {Object}
     */
    luuNhapDonThuoc(donThuocId) {
      const donThuoc = this.layDonThuocTheoId(donThuocId);
      if (!coTheSuaDonThuoc(donThuoc)) {
        throw new LoiNghiepVu("Chỉ lưu nháp được đối với đơn thuốc đang soạn.");
      }
      return donThuoc; // Dữ liệu đã tự động save qua từng bước thêm/xóa
    },

    /**
     * Hoàn tất quá trình kê đơn
     * @param {string} donThuocId 
     * @returns {Object}
     */
    hoanTatDonThuoc(donThuocId) {
      const donThuoc = this.layDonThuocTheoId(donThuocId);
      
      if (!coTheSuaDonThuoc(donThuoc)) {
        throw new LoiNghiepVu("Đơn thuốc này không ở trạng thái Nháp, không thể hoàn tất.");
      }

      if (!kiemTraDonThuocCoTheHoanTat(donThuoc)) {
        throw new LoiNghiepVu("Đơn hoàn tất bắt buộc phải có tên bác sĩ, chẩn đoán và ít nhất một loại thuốc.");
      }

      // Thay đổi trạng thái bệnh nhân
      const benhNhan = benhNhanRepository.timBenhNhanTheoId(donThuoc.benhNhanId);
      if (benhNhan) {
        benhNhanRepository.thayDoiTrangThaiBenhNhan(
          benhNhan.id, 
          TRANG_THAI_BENH_NHAN.DA_KHAM, 
          hamLayThoiGianHienTai().toISOString()
        );
      }

      donThuoc.trangThai = TRANG_THAI_DON_THUOC.DA_HOAN_TAT;
      donThuoc.thoiGianCapNhat = hamLayThoiGianHienTai().toISOString();
      
      return donThuocRepository.capNhatDonThuoc(donThuoc);
    },

    /**
     * Hủy bỏ đơn thuốc nháp
     * @param {string} donThuocId 
     * @returns {Object}
     */
    huyDonThuoc(donThuocId) {
      const donThuoc = this.layDonThuocTheoId(donThuocId);
      
      if (!coTheHuyDonThuoc(donThuoc)) {
        throw new LoiNghiepVu("Không thể hủy đơn thuốc đã hoàn tất hoặc đơn đã hủy từ trước.");
      }

      const benhNhan = benhNhanRepository.timBenhNhanTheoId(donThuoc.benhNhanId);
      // Nếu hủy khám, trả bệnh nhân về trạng thái Chờ khám (Nếu BN đang ở trạng thái Đang khám)
      if (benhNhan && benhNhan.trangThai === TRANG_THAI_BENH_NHAN.DANG_KHAM) {
        benhNhanRepository.thayDoiTrangThaiBenhNhan(
          benhNhan.id, 
          TRANG_THAI_BENH_NHAN.CHO_KHAM, 
          hamLayThoiGianHienTai().toISOString()
        );
      }

      donThuoc.trangThai = TRANG_THAI_DON_THUOC.DA_HUY;
      donThuoc.thoiGianCapNhat = hamLayThoiGianHienTai().toISOString();
      
      return donThuocRepository.capNhatDonThuoc(donThuoc);
    },

    /**
     * Tìm kiếm và lọc
     * @param {string} tuKhoa 
     * @param {string} trangThai 
     * @returns {Array}
     */
    timKiemDonThuoc(tuKhoa, trangThai) {
      const danhSachDon = donThuocRepository.layTatCaDonThuoc();
      const danhSachBenhNhan = benhNhanRepository.layTatCaBenhNhan();
      
      const ketQua = timKiemDonThuoc(danhSachDon, danhSachBenhNhan, tuKhoa, trangThai);
      return sapXepDonThuocMoiNhat(ketQua);
    }
  };
}
