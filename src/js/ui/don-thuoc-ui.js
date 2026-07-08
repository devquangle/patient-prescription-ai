import { 
  hienThiThongBaoLoi, 
  hienThiThongBaoThanhCong,
  xacNhanThaoTac 
} from './thong-bao-ui.js';
import { dinhDangNgayGio } from '../utils/ngay-thang.js';
import { TRANG_THAI_DON_THUOC } from '../constants/hang-so.js';

let serviceDonThuoc = null;
let serviceBenhNhan = null;

export function khoiTaoDonThuocUI(srvDonThuoc, srvBenhNhan) {
  serviceDonThuoc = srvDonThuoc;
  serviceBenhNhan = srvBenhNhan;
  
  document.getElementById('input-tim-don-thuoc')?.addEventListener('input', xuLyTimKiemDonThuoc);
  document.getElementById('filter-trang-thai-don')?.addEventListener('change', xuLyTimKiemDonThuoc);
  
  document.getElementById('btn-dong-modal-don')?.addEventListener('click', dongChiTietDonThuoc);
  document.getElementById('btn-in-don')?.addEventListener('click', xuLyInDonThuoc);
  
  hienThiDanhSachDonThuoc();
}

export function xuLyTimKiemDonThuoc() {
  const tuKhoa = document.getElementById('input-tim-don-thuoc')?.value || '';
  const trangThai = document.getElementById('filter-trang-thai-don')?.value || '';
  
  const danhSach = serviceDonThuoc.timKiemDonThuoc(tuKhoa, trangThai);
  renderDanhSachDonThuoc(danhSach);
}

export function hienThiDanhSachDonThuoc() {
  xuLyTimKiemDonThuoc();
}

function renderDanhSachDonThuoc(danhSach) {
  const tbody = document.getElementById('tbody-don-thuoc');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  if (danhSach.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="6" style="text-align: center;">Chưa có đơn thuốc nào.</td>`;
    tbody.appendChild(tr);
    return;
  }
  
  danhSach.forEach(dt => {
    const tr = document.createElement('tr');
    
    let hoTenBN = "Không rõ";
    try {
      const bn = serviceBenhNhan.layChiTietBenhNhan(dt.benhNhanId);
      hoTenBN = bn.hoTen;
    } catch (e) {}
    
    const tdMa = document.createElement('td'); tdMa.textContent = dt.maDonThuoc;
    const tdNgay = document.createElement('td'); tdNgay.textContent = dinhDangNgayGio(dt.thoiGianCapNhat || dt.thoiGianTao);
    const tdBN = document.createElement('td'); tdBN.textContent = hoTenBN;
    const tdBacSi = document.createElement('td'); tdBacSi.textContent = dt.tenBacSi || '-';
    
    const tdTrangThai = document.createElement('td');
    const spanTrangThai = document.createElement('span');
    spanTrangThai.className = `badge ${dt.trangThai}`;
    spanTrangThai.textContent = layTenTrangThai(dt.trangThai);
    tdTrangThai.appendChild(spanTrangThai);
    
    const tdThaoTac = document.createElement('td');
    
    const btnXem = document.createElement('button');
    btnXem.type = 'button';
    btnXem.className = 'btn-sm btn-view';
    btnXem.textContent = 'Xem chi tiết';
    btnXem.addEventListener('click', () => hienThiChiTietDonThuoc(dt.id));
    tdThaoTac.appendChild(btnXem);
    
    if (dt.trangThai === TRANG_THAI_DON_THUOC.NHAP) {
      const btnHuy = document.createElement('button');
      btnHuy.type = 'button';
      btnHuy.className = 'btn-sm btn-delete';
      btnHuy.style.marginLeft = '0.5rem';
      btnHuy.textContent = 'Hủy';
      btnHuy.addEventListener('click', () => xuLyHuyDonThuoc(dt.id));
      tdThaoTac.appendChild(btnHuy);
    }
    
    tr.append(tdMa, tdNgay, tdBN, tdBacSi, tdTrangThai, tdThaoTac);
    tbody.appendChild(tr);
  });
}

function hienThiChiTietDonThuoc(id) {
  try {
    const donThuoc = serviceDonThuoc.layDonThuocTheoId(id);
    let bn = { hoTen: "Không rõ" };
    try { bn = serviceBenhNhan.layChiTietBenhNhan(donThuoc.benhNhanId); } catch (e) {}
    
    document.getElementById('chi-tiet-ma-don').textContent = donThuoc.maDonThuoc;
    document.getElementById('chi-tiet-ngay-ke').textContent = dinhDangNgayGio(donThuoc.thoiGianCapNhat || donThuoc.thoiGianTao);
    document.getElementById('chi-tiet-ten-bn').textContent = bn.hoTen;
    document.getElementById('chi-tiet-ten-bs').textContent = donThuoc.tenBacSi || '';
    document.getElementById('chi-tiet-chuan-doan').textContent = donThuoc.chuanDoan || '';
    document.getElementById('chi-tiet-loi-dan').textContent = donThuoc.loiDan || '';
    
    const tbody = document.getElementById('tbody-modal-thuoc');
    if (tbody) {
      tbody.innerHTML = '';
      (donThuoc.danhSachThuoc || []).forEach((thuoc, index) => {
        const tr = document.createElement('tr');
        
        const tdStt = document.createElement('td'); tdStt.textContent = index + 1;
        const tdTen = document.createElement('td'); tdTen.textContent = thuoc.tenThuoc;
        const tdHamLuong = document.createElement('td'); tdHamLuong.textContent = thuoc.hamLuong || '-';
        const tdSoLuong = document.createElement('td'); tdSoLuong.textContent = `${thuoc.tongSoLuong} ${thuoc.donVi || ''}`;
        const tdCachDung = document.createElement('td'); 
        tdCachDung.textContent = `Ngày ${thuoc.soLanMoiNgay} lần, mỗi lần ${thuoc.soLuongMoiLan} ${thuoc.donVi || ''}. ${thuoc.cachDung}, ${thuoc.thoiDiemDung}`;
        
        tr.append(tdStt, tdTen, tdHamLuong, tdSoLuong, tdCachDung);
        tbody.appendChild(tr);
      });
    }
    
    document.getElementById('modal-chi-tiet-don')?.showModal();
  } catch (error) {
    hienThiThongBaoLoi(error.message);
  }
}

function dongChiTietDonThuoc() {
  document.getElementById('modal-chi-tiet-don')?.close();
}

function xuLyHuyDonThuoc(id) {
  if (!xacNhanThaoTac("Hủy đơn thuốc nháp này?")) return;
  try {
    serviceDonThuoc.huyDonThuoc(id);
    hienThiThongBaoThanhCong("Đã hủy đơn.");
    hienThiDanhSachDonThuoc();
  } catch (error) {
    hienThiThongBaoLoi(error.message);
  }
}

function xuLyInDonThuoc() {
  window.print();
}

function layTenTrangThai(maTrangThai) {
  const map = {
    [TRANG_THAI_DON_THUOC.NHAP]: "Nháp",
    [TRANG_THAI_DON_THUOC.DA_HOAN_TAT]: "Đã hoàn tất",
    [TRANG_THAI_DON_THUOC.DA_HUY]: "Đã hủy"
  };
  return map[maTrangThai] || maTrangThai;
}
