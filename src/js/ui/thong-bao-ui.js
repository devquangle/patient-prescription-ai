/**
 * Module hiển thị thông báo ra giao diện người dùng
 */

function hienThiToast(thongBao, loai = 'info') {
  const container = document.getElementById('thong-bao-he-thong');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${loai}`;
  toast.textContent = thongBao;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    if (container.contains(toast)) {
      toast.remove();
    }
  }, 3000);
}

export function hienThiThongBaoThanhCong(thongBao) {
  hienThiToast(thongBao, 'success');
}

export function hienThiThongBaoLoi(thongBao) {
  hienThiToast(thongBao, 'error');
}

export function hienThiThongBaoCanhBao(thongBao) {
  hienThiToast(thongBao, 'warning');
}

export function xoaThongBao() {
  const container = document.getElementById('thong-bao-he-thong');
  if (container) {
    container.innerHTML = '';
  }
}

export function hienThiLoiForm(idContainer, thongBao) {
  const container = document.getElementById(idContainer);
  if (container) {
    container.textContent = thongBao;
    container.style.display = 'block';
  }
}

export function xoaLoiForm(idContainer) {
  const container = document.getElementById(idContainer);
  if (container) {
    container.textContent = '';
    container.style.display = 'none';
  }
}

export function xacNhanThaoTac(thongBao) {
  return window.confirm(thongBao);
}
