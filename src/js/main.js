import { taoKhoLuuTru } from './repositories/kho-luu-tru.js';
import { taoBenhNhanRepository } from './repositories/benh-nhan-repository.js';
import { taoDonThuocRepository } from './repositories/don-thuoc-repository.js';
import { taoBenhNhanService } from './services/benh-nhan-service.js';
import { taoDonThuocService } from './services/don-thuoc-service.js';
import { khoiTaoBenhNhanUI, hienThiDanhSachBenhNhan } from './ui/benh-nhan-ui.js';
import { khoiTaoKhamBenhUI, chonBenhNhanDeKham } from './ui/kham-benh-ui.js';
import { khoiTaoDonThuocUI, hienThiDanhSachDonThuoc } from './ui/don-thuoc-ui.js';
import { hienThiThongBaoLoi, hienThiThongBaoThanhCong, xacNhanThaoTac } from './ui/thong-bao-ui.js';

document.addEventListener('DOMContentLoaded', khoiTaoUngDung);

function khoiTaoUngDung() {
  try {
    // 1. Kho lưu trữ
    const kho = taoKhoLuuTru();
    
    // 2. Repository
    const benhNhanRepo = taoBenhNhanRepository(kho);
    const donThuocRepo = taoDonThuocRepository(kho);
    
    // 3. Service
    const benhNhanService = taoBenhNhanService({
      benhNhanRepository: benhNhanRepo,
      donThuocRepository: donThuocRepo
    });
    
    const donThuocService = taoDonThuocService({
      donThuocRepository: donThuocRepo,
      benhNhanRepository: benhNhanRepo
    });
    
    const capNhatDuLieuUI = () => {
      hienThiDanhSachBenhNhan();
      hienThiDanhSachDonThuoc();
    };

    // 4 & 6. Gắn UI
    khoiTaoBenhNhanUI(benhNhanService, (id) => chonBenhNhanDeKham(id));
    khoiTaoKhamBenhUI(benhNhanService, donThuocService, capNhatDuLieuUI);
    khoiTaoDonThuocUI(donThuocService, benhNhanService);
    
    // 5. Navigation
    khoiTaoDieuHuong(capNhatDuLieuUI);
    
    // 7. Tạo dữ liệu mẫu
    document.getElementById('btn-tao-du-lieu-mau')?.addEventListener('click', () => {
      try {
        benhNhanService.taoDuLieuBenhNhanMau();
        hienThiThongBaoThanhCong("Đã tạo bệnh nhân mẫu!");
        
        // Tạo thêm vài thuốc giả lập vào localStorage cho nhanh (chỉ phục vụ test)
        // Không gọi trực tiếp DOM để điền, mock backend logic qua service
        
        capNhatDuLieuUI();
      } catch (error) {
        hienThiThongBaoLoi(error.message);
      }
    });
    
    // 8. Xóa toàn bộ
    document.getElementById('btn-xoa-du-lieu')?.addEventListener('click', () => {
      if (xacNhanThaoTac("Bạn có chắc chắn XÓA TOÀN BỘ dữ liệu?")) {
        kho.xoaToanBo();
        hienThiThongBaoThanhCong("Đã xóa trắng dữ liệu hệ thống.");
        capNhatDuLieuUI();
      }
    });

  } catch (error) {
    hienThiThongBaoLoi("Lỗi hệ thống: " + error.message);
  }
}

function khoiTaoDieuHuong(hamCapNhat) {
  const dsNhomDieuHuong = document.querySelectorAll('nav button');
  const dsKhungHienThi = document.querySelectorAll('main section');
  
  dsNhomDieuHuong.forEach(btn => {
    btn.addEventListener('click', (e) => {
      dsNhomDieuHuong.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      dsKhungHienThi.forEach(sec => sec.classList.remove('active'));
      document.getElementById(`section-${e.target.dataset.section}`)?.classList.add('active');
      
      hamCapNhat();
    });
  });
  
  // 9. Mặc định mở tab
  document.querySelector('nav button[data-section="tiep-nhan"]')?.click();
}

// 10. Bắt lỗi toàn cục
window.addEventListener('error', function(e) {
  hienThiThongBaoLoi("Lỗi chưa xử lý: " + (e.error?.message || e.message));
});
