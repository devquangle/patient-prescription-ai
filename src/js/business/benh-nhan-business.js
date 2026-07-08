import { TRANG_THAI_BENH_NHAN, TRANG_THAI_DON_THUOC } from '../constants/hang-so.js';
import { chuanHoaChuoi } from '../utils/kiem-tra.js';

/**
 * Tạo một bản sao chuẩn hóa của bệnh nhân (bỏ khoảng trắng thừa)
 * @param {Object} benhNhan 
 * @returns {Object} Bản sao đã được chuẩn hóa
 */
export function chuanHoaBenhNhan(benhNhan) {
  return {
    ...benhNhan,
    hoTen: chuanHoaChuoi(benhNhan.hoTen),
    soDienThoai: chuanHoaChuoi(benhNhan.soDienThoai).replace(/\s/g, ''),
    diaChi: chuanHoaChuoi(benhNhan.diaChi),
    trieuChung: chuanHoaChuoi(benhNhan.trieuChung),
    tienSuBenh: chuanHoaChuoi(benhNhan.tienSuBenh),
    diUngThuoc: chuanHoaChuoi(benhNhan.diUngThuoc)
  };
}

/**
 * Tạo mới một đối tượng bệnh nhân hoàn chỉnh với ID, Mã và Trạng thái mặc định
 * @param {Object} duLieuBenhNhan Dữ liệu từ form đã kiểm tra hợp lệ
 * @param {string} id ID sinh ngẫu nhiên
 * @param {string} maBenhNhan Mã sinh theo nghiệp vụ
 * @param {Date|string} thoiGianTao Thời gian tạo
 * @returns {Object} 
 */
export function taoBenhNhanMoi(duLieuBenhNhan, id, maBenhNhan, thoiGianTao) {
  const benhNhanChuanHoa = chuanHoaBenhNhan(duLieuBenhNhan);
  const thoiGianStr = typeof thoiGianTao === 'string' ? thoiGianTao : thoiGianTao.toISOString();
  
  return {
    ...benhNhanChuanHoa,
    id: id,
    maBenhNhan: maBenhNhan,
    trangThai: TRANG_THAI_BENH_NHAN.CHO_KHAM,
    thoiGianTao: thoiGianStr,
    thoiGianCapNhat: thoiGianStr
  };
}

/**
 * Kiểm tra xem bệnh nhân có trùng lặp trong hệ thống không
 * (Trùng khi cùng số điện thoại và ngày sinh)
 * @param {Object} benhNhanKiemTra 
 * @param {Array} danhSachBenhNhan 
 * @returns {Object|null} Trả về đối tượng trùng lặp hoặc null
 */
export function timBenhNhanTrung(benhNhanKiemTra, danhSachBenhNhan) {
  const sdtChuanHoa = benhNhanKiemTra.soDienThoai.replace(/\s/g, '');
  return danhSachBenhNhan.find(bn => 
    bn.id !== benhNhanKiemTra.id && 
    bn.soDienThoai === sdtChuanHoa && 
    bn.ngaySinh === benhNhanKiemTra.ngaySinh
  ) || null;
}

/**
 * Lọc danh sách bệnh nhân theo từ khóa (Mã, Tên, SĐT)
 * @param {Array} danhSach 
 * @param {string} tuKhoa 
 * @returns {Array} Danh sách đã lọc
 */
export function locBenhNhanTheoTuKhoa(danhSach, tuKhoa) {
  if (!tuKhoa || String(tuKhoa).trim() === '') return [...danhSach];
  
  const tuKhoaThuong = String(tuKhoa).trim().toLowerCase();
  return danhSach.filter(bn => {
    return (
      (bn.maBenhNhan && bn.maBenhNhan.toLowerCase().includes(tuKhoaThuong)) ||
      (bn.hoTen && bn.hoTen.toLowerCase().includes(tuKhoaThuong)) ||
      (bn.soDienThoai && bn.soDienThoai.includes(tuKhoaThuong))
    );
  });
}

/**
 * Lọc danh sách bệnh nhân theo trạng thái
 * @param {Array} danhSach 
 * @param {string} trangThai 
 * @returns {Array} Danh sách đã lọc
 */
export function locBenhNhanTheoTrangThai(danhSach, trangThai) {
  if (!trangThai) return [...danhSach];
  return danhSach.filter(bn => bn.trangThai === trangThai);
}

/**
 * Sắp xếp danh sách bệnh nhân: Mới nhất lên đầu
 * Dựa vào thoiGianCapNhat hoặc thoiGianTao
 * @param {Array} danhSach 
 * @returns {Array} Mảng mới đã được sắp xếp
 */
export function sapXepBenhNhanMoiNhat(danhSach) {
  return [...danhSach].sort((a, b) => {
    const timeA = new Date(a.thoiGianCapNhat || a.thoiGianTao).getTime();
    const timeB = new Date(b.thoiGianCapNhat || b.thoiGianTao).getTime();
    return timeB - timeA;
  });
}

/**
 * Quy tắc nghiệp vụ: Có được phép xóa bệnh nhân không?
 * (Không được xóa nếu bệnh nhân có đơn thuốc Đã hoàn tất)
 * @param {Object} benhNhan 
 * @param {Array} danhSachDonThuocCuaBenhNhan 
 * @returns {boolean}
 */
export function coTheXoaBenhNhan(benhNhan, danhSachDonThuocCuaBenhNhan) {
  const coDonHoanTat = danhSachDonThuocCuaBenhNhan.some(
    dt => dt.trangThai === TRANG_THAI_DON_THUOC.DA_HOAN_TAT
  );
  return !coDonHoanTat;
}

/**
 * Quy tắc nghiệp vụ: Có thể bắt đầu khám không?
 * (Chỉ cho bắt đầu khám khi bệnh nhân có trạng thái Chờ khám)
 * @param {Object} benhNhan 
 * @returns {boolean}
 */
export function coTheBatDauKham(benhNhan) {
  return benhNhan.trangThai === TRANG_THAI_BENH_NHAN.CHO_KHAM;
}

/**
 * Quy tắc nghiệp vụ: Có thể lập đơn thuốc cho bệnh nhân này không?
 * (Chỉ cho lập đơn khi ở trạng thái Chờ khám hoặc Đang khám)
 * @param {Object} benhNhan 
 * @returns {boolean}
 */
export function coTheLapDonThuoc(benhNhan) {
  return (
    benhNhan.trangThai === TRANG_THAI_BENH_NHAN.CHO_KHAM || 
    benhNhan.trangThai === TRANG_THAI_BENH_NHAN.DANG_KHAM
  );
}
