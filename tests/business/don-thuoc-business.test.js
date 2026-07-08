import { describe, it, expect } from 'vitest';
import { 
  tinhTongSoLuongThuoc, 
  themThuocVaoDanhSach, 
  xoaThuocKhoiDanhSach,
  kiemTraDonThuocCoTheHoanTat,
  coTheSuaDonThuoc
} from '../../src/js/business/don-thuoc-business.js';
import { TRANG_THAI_DON_THUOC } from '../../src/js/constants/hang-so.js';

describe('Đơn Thuốc Business (don-thuoc-business.js)', () => {
  describe('Tính tổng số lượng', () => {
    it('tính tổng số lượng thuốc đúng', () => {
      // 2 viên/lần * 3 lần/ngày * 5 ngày = 30
      expect(tinhTongSoLuongThuoc(2, 3, 5)).toBe(30);
      expect(tinhTongSoLuongThuoc('2', '3', '5')).toBe(30);
    });

    it('từ chối số lượng mỗi lần bằng 0', () => {
      expect(tinhTongSoLuongThuoc(0, 3, 5)).toBe(0);
    });

    it('từ chối số lần mỗi ngày âm', () => {
      expect(tinhTongSoLuongThuoc(2, -3, 5)).toBe(0);
    });

    it('từ chối số ngày dùng bằng 0', () => {
      expect(tinhTongSoLuongThuoc(2, 3, 0)).toBe(0);
    });
    
    it('trả về 0 với dữ liệu null, undefined hoặc chuỗi rỗng', () => {
      expect(tinhTongSoLuongThuoc(null, 3, 5)).toBe(0);
      expect(tinhTongSoLuongThuoc('', 3, 5)).toBe(0);
      expect(tinhTongSoLuongThuoc(undefined, 3, 5)).toBe(0);
    });
  });

  describe('Quản lý danh sách thuốc', () => {
    const list = [{ id: '1', ten: 'Thuoc A' }, { id: '2', ten: 'Thuoc B' }];

    it('thêm thuốc vào danh sách không thay đổi mảng gốc (pure function)', () => {
      const newList = themThuocVaoDanhSach(list, { id: '3', ten: 'Thuoc C' });
      
      expect(newList.length).toBe(3);
      expect(list.length).toBe(2); // Mảng gốc không bị biến đổi
      expect(newList[2].id).toBe('3');
    });

    it('xóa thuốc khỏi danh sách không thay đổi mảng gốc (pure function)', () => {
      const newList = xoaThuocKhoiDanhSach(list, '1');
      
      expect(newList.length).toBe(1);
      expect(list.length).toBe(2); // Mảng gốc không bị biến đổi
      expect(newList[0].id).toBe('2');
    });
  });

  describe('Luật nghiệp vụ hoàn tất đơn', () => {
    it('đơn không có thuốc không thể hoàn tất', () => {
      const dt = { tenBacSi: 'BS A', chuanDoan: 'Sốt', danhSachThuoc: [] };
      expect(kiemTraDonThuocCoTheHoanTat(dt)).toBe(false);
      
      const dtNull = { tenBacSi: 'BS A', chuanDoan: 'Sốt', danhSachThuoc: null };
      expect(kiemTraDonThuocCoTheHoanTat(dtNull)).toBe(false);
    });

    it('đơn thiếu bác sĩ không thể hoàn tất', () => {
      const dt = { tenBacSi: '', chuanDoan: 'Sốt', danhSachThuoc: [{ id: 1 }] };
      expect(kiemTraDonThuocCoTheHoanTat(dt)).toBe(false);
      
      const dtKhoangTrang = { tenBacSi: '   ', chuanDoan: 'Sốt', danhSachThuoc: [{ id: 1 }] };
      expect(kiemTraDonThuocCoTheHoanTat(dtKhoangTrang)).toBe(false);
    });

    it('đơn thiếu chẩn đoán không thể hoàn tất', () => {
      const dt = { tenBacSi: 'BS A', chuanDoan: '', danhSachThuoc: [{ id: 1 }] };
      expect(kiemTraDonThuocCoTheHoanTat(dt)).toBe(false);
    });

    it('đơn hợp lệ có thể hoàn tất', () => {
      const dt = { tenBacSi: 'BS A', chuanDoan: 'Cảm cúm', danhSachThuoc: [{ id: 1 }] };
      expect(kiemTraDonThuocCoTheHoanTat(dt)).toBe(true);
    });
  });

  describe('Luật nghiệp vụ sửa đơn', () => {
    it('đơn đã hoàn tất không thể sửa', () => {
      expect(coTheSuaDonThuoc({ trangThai: TRANG_THAI_DON_THUOC.DA_HOAN_TAT })).toBe(false);
    });

    it('đơn đã hủy không thể sửa', () => {
      expect(coTheSuaDonThuoc({ trangThai: TRANG_THAI_DON_THUOC.DA_HUY })).toBe(false);
    });
    
    it('đơn nháp có thể sửa', () => {
      expect(coTheSuaDonThuoc({ trangThai: TRANG_THAI_DON_THUOC.NHAP })).toBe(true);
    });
  });
});
