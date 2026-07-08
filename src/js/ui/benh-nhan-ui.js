import { 
  hienThiThongBaoThanhCong, 
  hienThiThongBaoLoi, 
  xacNhanThaoTac, 
  hienThiLoiForm, 
  xoaLoiForm 
} from './thong-bao-ui.js';
import { dinhDangNgay } from '../utils/ngay-thang.js';
import { TRANG_THAI_BENH_NHAN } from '../constants/hang-so.js';

let serviceBenhNhan = null;
let callbackChonKham = null;

export function khoiTaoBenhNhanUI(service, hamChuyenSangKham) {
  serviceBenhNhan = service;
  callbackChonKham = hamChuyenSangKham;
  
  const formBenhNhan = document.getElementById('form-benh-nhan');
  if (formBenhNhan) {
    formBenhNhan.addEventListener('submit', xuLyLuuBenhNhan);
    formBenhNhan.addEventListener('reset', lamMoiFormBenhNhan);
  }
  
  const inputTimKiem = document.getElementById('input-tim-benh-nhan');
  const selectTrangThai = document.getElementById('filter-trang-thai-benh-nhan');
  
  if (inputTimKiem) inputTimKiem.addEventListener('input', xuLyTimKiemBenhNhan);
  if (selectTrangThai) selectTrangThai.addEventListener('change', xuLyTimKiemBenhNhan);
  
  hienThiDanhSachBenhNhan();
}

function xuLyLuuBenhNhan(event) {
  event.preventDefault();
  xoaLoiForm('loi-form-benh-nhan');
  
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData.entries());
  
  try {
    if (data.id) {
      serviceBenhNhan.capNhatBenhNhan(data.id, data);
      hienThiThongBaoThanhCong("Cập nhật thông tin bệnh nhân thành công!");
    } else {
      delete data.id; 
      serviceBenhNhan.themBenhNhan(data);
      hienThiThongBaoThanhCong("Thêm bệnh nhân mới thành công!");
    }
    
    lamMoiFormBenhNhan();
    hienThiDanhSachBenhNhan();
  } catch (error) {
    hienThiLoiForm('loi-form-benh-nhan', error.message);
  }
}

function xuLyTimKiemBenhNhan() {
  const tuKhoa = document.getElementById('input-tim-benh-nhan')?.value || '';
  const trangThai = document.getElementById('filter-trang-thai-benh-nhan')?.value || '';
  
  const danhSach = serviceBenhNhan.timKiemBenhNhan(tuKhoa, trangThai);
  renderDanhSachBenhNhan(danhSach);
}

export function hienThiDanhSachBenhNhan() {
  xuLyTimKiemBenhNhan();
}

function renderDanhSachBenhNhan(danhSach) {
  const tbody = document.getElementById('tbody-benh-nhan');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (danhSach.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="6" style="text-align: center;">Không tìm thấy bệnh nhân nào.</td>`;
    tbody.appendChild(tr);
    return;
  }
  
  danhSach.forEach(bn => {
    const tr = document.createElement('tr');
    
    const tdMa = document.createElement('td');
    tdMa.textContent = bn.maBenhNhan;
    
    const tdTen = document.createElement('td');
    tdTen.textContent = bn.hoTen;
    
    const tdSdt = document.createElement('td');
    tdSdt.textContent = bn.soDienThoai;
    
    const tdNgaySinh = document.createElement('td');
    tdNgaySinh.textContent = dinhDangNgay(bn.ngaySinh);
    
    const tdTrangThai = document.createElement('td');
    const spanTrangThai = document.createElement('span');
    spanTrangThai.className = `badge ${bn.trangThai}`;
    spanTrangThai.textContent = layTenTrangThai(bn.trangThai);
    tdTrangThai.appendChild(spanTrangThai);
    
    const tdThaoTac = document.createElement('td');
    
    const btnSua = document.createElement('button');
    btnSua.type = 'button';
    btnSua.className = 'btn-sm btn-edit';
    btnSua.textContent = 'Sửa';
    btnSua.addEventListener('click', () => dienDuLieuBenhNhanVaoForm(bn.id));
    
    const btnXoa = document.createElement('button');
    btnXoa.type = 'button';
    btnXoa.className = 'btn-sm btn-delete';
    btnXoa.style.marginLeft = '0.25rem';
    btnXoa.textContent = 'Xóa';
    btnXoa.addEventListener('click', () => xuLyXoaBenhNhan(bn.id));
    
    tdThaoTac.appendChild(btnSua);
    tdThaoTac.appendChild(btnXoa);
    
    if (bn.trangThai === TRANG_THAI_BENH_NHAN.CHO_KHAM) {
      const btnKham = document.createElement('button');
      btnKham.type = 'button';
      btnKham.className = 'btn-sm btn-action';
      btnKham.style.marginLeft = '0.25rem';
      btnKham.textContent = 'Khám';
      btnKham.addEventListener('click', () => {
        if (callbackChonKham) callbackChonKham(bn.id);
      });
      tdThaoTac.appendChild(btnKham);
    }
    
    tr.appendChild(tdMa);
    tr.appendChild(tdTen);
    tr.appendChild(tdSdt);
    tr.appendChild(tdNgaySinh);
    tr.appendChild(tdTrangThai);
    tr.appendChild(tdThaoTac);
    
    tbody.appendChild(tr);
  });
}

function dienDuLieuBenhNhanVaoForm(id) {
  try {
    const benhNhan = serviceBenhNhan.layChiTietBenhNhan(id);
    
    document.getElementById('benh-nhan-id').value = benhNhan.id;
    document.getElementById('input-ho-ten').value = benhNhan.hoTen;
    document.getElementById('input-ngay-sinh').value = benhNhan.ngaySinh;
    document.getElementById('input-gioi-tinh').value = benhNhan.gioiTinh;
    document.getElementById('input-so-dien-thoai').value = benhNhan.soDienThoai;
    document.getElementById('input-dia-chi').value = benhNhan.diaChi || '';
    document.getElementById('input-trieu-chung').value = benhNhan.trieuChung || '';
    document.getElementById('input-tien-su-benh').value = benhNhan.tienSuBenh || '';
    document.getElementById('input-di-ung-thuoc').value = benhNhan.diUngThuoc || '';
    
    document.getElementById('form-benh-nhan').scrollIntoView({ behavior: 'smooth' });
    xoaLoiForm('loi-form-benh-nhan');
  } catch (error) {
    hienThiThongBaoLoi(error.message);
  }
}

function xuLyXoaBenhNhan(id) {
  if (!xacNhanThaoTac("Bạn có chắc chắn muốn xóa bệnh nhân này không?")) return;
  
  try {
    serviceBenhNhan.xoaBenhNhan(id);
    hienThiThongBaoThanhCong("Xóa bệnh nhân thành công.");
    lamMoiFormBenhNhan();
    hienThiDanhSachBenhNhan();
  } catch (error) {
    hienThiThongBaoLoi(error.message);
  }
}

export function lamMoiFormBenhNhan() {
  const form = document.getElementById('form-benh-nhan');
  if (form) form.reset();
  
  const idInput = document.getElementById('benh-nhan-id');
  if (idInput) idInput.value = '';
  
  xoaLoiForm('loi-form-benh-nhan');
}

function layTenTrangThai(maTrangThai) {
  const map = {
    [TRANG_THAI_BENH_NHAN.CHO_KHAM]: "Chờ khám",
    [TRANG_THAI_BENH_NHAN.DANG_KHAM]: "Đang khám",
    [TRANG_THAI_BENH_NHAN.DA_KHAM]: "Đã khám"
  };
  return map[maTrangThai] || maTrangThai;
}
