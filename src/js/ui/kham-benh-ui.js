import { 
  hienThiThongBaoThanhCong, 
  hienThiThongBaoLoi, 
  hienThiThongBaoCanhBao,
  hienThiLoiForm, 
  xoaLoiForm, 
  xacNhanThaoTac
} from './thong-bao-ui.js';
import { dinhDangNgay } from '../utils/ngay-thang.js';
import { tinhTongSoLuongThuoc } from '../business/don-thuoc-business.js';

let serviceBenhNhan = null;
let serviceDonThuoc = null;
let donThuocHienTaiId = null;
let callbackCapNhatBenhNhan = null;

export function khoiTaoKhamBenhUI(srvBenhNhan, srvDonThuoc, capNhatBenhNhanFn) {
  serviceBenhNhan = srvBenhNhan;
  serviceDonThuoc = srvDonThuoc;
  callbackCapNhatBenhNhan = capNhatBenhNhanFn;
  
  // Tính tổng
  const eventNames = ['input', 'change'];
  const fieldIds = ['input-so-luong-moi-lan', 'input-so-lan-moi-ngay', 'input-so-ngay-dung'];
  fieldIds.forEach(id => {
    const field = document.getElementById(id);
    if (field) eventNames.forEach(evt => field.addEventListener(evt, capNhatTongSoLuong));
  });

  // Thêm thuốc
  const formThemThuoc = document.getElementById('form-them-thuoc');
  if (formThemThuoc) formThemThuoc.addEventListener('submit', xuLyThemThuoc);
  
  // Lưu tạm thông tin khi gõ
  const formKhamBenh = document.getElementById('form-kham-benh');
  if (formKhamBenh) formKhamBenh.addEventListener('change', luuTamThongTinKham);

  // Buttons
  document.getElementById('btn-luu-nhap')?.addEventListener('click', xuLyLuuNhapDonThuoc);
  document.getElementById('btn-hoan-tat-don')?.addEventListener('click', xuLyHoanTatDonThuoc);
  document.getElementById('btn-huy-kham')?.addEventListener('click', xuLyHuyKham);
}

export function chonBenhNhanDeKham(benhNhanId) {
  try {
    const donThuoc = serviceDonThuoc.taoDonThuocNhap(benhNhanId);
    donThuocHienTaiId = donThuoc.id;
    
    hienThiBenhNhanDangKham(benhNhanId);
    
    document.getElementById('form-kham-benh')?.reset();
    document.getElementById('form-them-thuoc')?.reset();
    document.getElementById('input-tong-so-luong').value = '';
    
    xoaLoiForm('loi-form-kham-benh');
    xoaLoiForm('loi-form-thuoc');
    
    hienThiDanhSachThuoc(donThuoc.danhSachThuoc || []);
    
    document.querySelector('button[data-section="kham-benh"]')?.click();
  } catch (error) {
    hienThiThongBaoLoi(error.message);
  }
}

function hienThiBenhNhanDangKham(benhNhanId) {
  try {
    const benhNhan = serviceBenhNhan.layChiTietBenhNhan(benhNhanId);
    
    document.getElementById('info-ma-bn').textContent = benhNhan.maBenhNhan;
    document.getElementById('info-ho-ten').textContent = benhNhan.hoTen;
    document.getElementById('info-ngay-sinh').textContent = dinhDangNgay(benhNhan.ngaySinh);
    document.getElementById('info-sdt').textContent = benhNhan.soDienThoai;
    document.getElementById('info-trieu-chung').textContent = benhNhan.trieuChung || "Không";
    document.getElementById('info-tien-su').textContent = benhNhan.tienSuBenh || "Không";
    document.getElementById('info-di-ung').textContent = benhNhan.diUngThuoc || "Không";
  } catch (error) {
    hienThiThongBaoLoi(error.message);
  }
}

function capNhatTongSoLuong() {
  const slMoiLan = document.getElementById('input-so-luong-moi-lan')?.value;
  const slMoiNgay = document.getElementById('input-so-lan-moi-ngay')?.value;
  const soNgay = document.getElementById('input-so-ngay-dung')?.value;
  
  const tong = tinhTongSoLuongThuoc(slMoiLan, slMoiNgay, soNgay);
  const inputTong = document.getElementById('input-tong-so-luong');
  if (inputTong) inputTong.value = tong > 0 ? tong : '';
}

function luuTamThongTinKham() {
  if (!donThuocHienTaiId) return;
  const tenBacSi = document.getElementById('input-ten-bac-si')?.value;
  const chuanDoan = document.getElementById('input-chuan-doan')?.value;
  const loiDan = document.getElementById('input-loi-dan')?.value;
  
  try {
    serviceDonThuoc.capNhatThongTinKham(donThuocHienTaiId, { tenBacSi, chuanDoan, loiDan });
  } catch (error) {
    // Silent fail auto-save
  }
}

function xuLyThemThuoc(event) {
  event.preventDefault();
  xoaLoiForm('loi-form-thuoc');
  
  if (!donThuocHienTaiId) {
    hienThiLoiForm('loi-form-thuoc', 'Vui lòng chọn bệnh nhân ở mục Tiếp nhận trước.');
    return;
  }
  
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());
  
  try {
    const donThuoc = serviceDonThuoc.themThuocVaoDon(donThuocHienTaiId, data);
    hienThiDanhSachThuoc(donThuoc.danhSachThuoc || []);
    
    // Clear the specific inputs
    document.getElementById('input-ten-thuoc').value = '';
    document.getElementById('input-ham-luong').value = '';
    document.getElementById('input-don-vi').value = '';
    document.getElementById('input-so-luong-moi-lan').value = '';
    document.getElementById('input-so-lan-moi-ngay').value = '';
    document.getElementById('input-so-ngay-dung').value = '';
    document.getElementById('input-tong-so-luong').value = '';
    document.getElementById('input-ten-thuoc').focus();
    
    hienThiThongBaoThanhCong("Đã thêm thuốc.");
  } catch (error) {
    hienThiLoiForm('loi-form-thuoc', error.message);
  }
}

function xuLyXoaThuoc(thuocId) {
  if (!donThuocHienTaiId) return;
  try {
    const donThuoc = serviceDonThuoc.xoaThuocKhoiDon(donThuocHienTaiId, thuocId);
    hienThiDanhSachThuoc(donThuoc.danhSachThuoc || []);
  } catch (error) {
    hienThiThongBaoLoi(error.message);
  }
}

function hienThiDanhSachThuoc(danhSachThuoc) {
  const tbody = document.getElementById('tbody-chi-tiet-don');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (danhSachThuoc.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="8" style="text-align: center;">Chưa có thuốc nào.</td>`;
    tbody.appendChild(tr);
    return;
  }
  
  danhSachThuoc.forEach((thuoc, index) => {
    const tr = document.createElement('tr');
    
    const tdStt = document.createElement('td'); tdStt.textContent = index + 1;
    const tdTen = document.createElement('td'); tdTen.textContent = thuoc.tenThuoc;
    const tdHamLuong = document.createElement('td'); tdHamLuong.textContent = thuoc.hamLuong || '-';
    const tdLieuDung = document.createElement('td'); 
    tdLieuDung.textContent = `${thuoc.soLuongMoiLan} ${thuoc.donVi || ''} x ${thuoc.soLanMoiNgay} lần/ngày`;
    
    const tdSoNgay = document.createElement('td'); tdSoNgay.textContent = thuoc.soNgayDung;
    const tdTong = document.createElement('td'); tdTong.textContent = `${thuoc.tongSoLuong} ${thuoc.donVi || ''}`;
    const tdCachDung = document.createElement('td'); 
    tdCachDung.textContent = `${thuoc.cachDung}, ${thuoc.thoiDiemDung}`;
    
    const tdThaoTac = document.createElement('td');
    const btnXoa = document.createElement('button');
    btnXoa.type = 'button';
    btnXoa.className = 'btn-sm btn-delete';
    btnXoa.textContent = 'Xóa';
    btnXoa.addEventListener('click', () => xuLyXoaThuoc(thuoc.id));
    tdThaoTac.appendChild(btnXoa);
    
    tr.append(tdStt, tdTen, tdHamLuong, tdLieuDung, tdSoNgay, tdTong, tdCachDung, tdThaoTac);
    tbody.appendChild(tr);
  });
}

function xuLyLuuNhapDonThuoc() {
  if (!donThuocHienTaiId) {
    hienThiThongBaoCanhBao("Không có đơn thuốc nào để lưu nháp.");
    return;
  }
  luuTamThongTinKham();
  try {
    serviceDonThuoc.luuNhapDonThuoc(donThuocHienTaiId);
    hienThiThongBaoThanhCong("Đã lưu nháp.");
  } catch (error) {
    hienThiThongBaoLoi(error.message);
  }
}

function xuLyHoanTatDonThuoc() {
  if (!donThuocHienTaiId) {
    hienThiThongBaoCanhBao("Chưa có đơn thuốc.");
    return;
  }
  luuTamThongTinKham();
  xoaLoiForm('loi-form-kham-benh');
  
  try {
    serviceDonThuoc.hoanTatDonThuoc(donThuocHienTaiId);
    hienThiThongBaoThanhCong("Đã hoàn tất đơn thuốc!");
    if (callbackCapNhatBenhNhan) callbackCapNhatBenhNhan();
    donThuocHienTaiId = null;
    document.querySelector('button[data-section="lich-su"]')?.click();
  } catch (error) {
    hienThiLoiForm('loi-form-kham-benh', error.message);
  }
}

function xuLyHuyKham() {
  if (!donThuocHienTaiId) return;
  if (!xacNhanThaoTac("Chắc chắn muốn hủy thao tác khám bệnh này?")) return;
  
  try {
    serviceDonThuoc.huyDonThuoc(donThuocHienTaiId);
    hienThiThongBaoThanhCong("Đã hủy quá trình khám.");
    if (callbackCapNhatBenhNhan) callbackCapNhatBenhNhan();
    donThuocHienTaiId = null;
    document.querySelector('button[data-section="tiep-nhan"]')?.click();
  } catch (error) {
    hienThiThongBaoLoi(error.message);
  }
}
