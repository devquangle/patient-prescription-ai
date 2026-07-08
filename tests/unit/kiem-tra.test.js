import { describe, it, expect } from 'vitest';
import { kiemTraBenhNhan, kiemTraThongTinKham, kiemTraThuocTrongDon } from '../../src/js/utils/kiem-tra.js';

describe('Tiện ích Kiểm tra Validation (kiem-tra.js)', () => {
  describe('Bệnh nhân', () => {
    const baseBenhNhan = {
      hoTen: 'Nguyễn Văn A',
      ngaySinh: '1990-01-01',
      soDienThoai: '0901234567'
    };

    it('bệnh nhân hợp lệ', () => {
      const result = kiemTraBenhNhan(baseBenhNhan);
      expect(result.hopLe).toBe(true);
      expect(Object.keys(result.loi).length).toBe(0);
    });

    it('báo lỗi khi họ tên rỗng', () => {
      const bn = { ...baseBenhNhan, hoTen: '' };
      const result = kiemTraBenhNhan(bn);
      expect(result.hopLe).toBe(false);
      expect(result.loi.hoTen).toBeDefined();
    });

    it('báo lỗi khi họ tên chỉ có khoảng trắng', () => {
      const bn = { ...baseBenhNhan, hoTen: '   ' };
      const result = kiemTraBenhNhan(bn);
      expect(result.hopLe).toBe(false);
      expect(result.loi.hoTen).toBeDefined();
    });

    it('báo lỗi khi ngày sinh ở tương lai', () => {
      // Dùng năm 3000 để đảm bảo là tương lai dù không cần mock thời gian
      const bn = { ...baseBenhNhan, ngaySinh: '3000-01-01' };
      const result = kiemTraBenhNhan(bn);
      expect(result.hopLe).toBe(false);
      expect(result.loi.ngaySinh).toBeDefined();
    });

    it('báo lỗi khi số điện thoại không hợp lệ', () => {
      const invalidPhones = ['123', '09012345', '090123456789', 'abcdefghij', ''];
      
      invalidPhones.forEach(phone => {
        const bn = { ...baseBenhNhan, soDienThoai: phone };
        const result = kiemTraBenhNhan(bn);
        expect(result.hopLe).toBe(false);
        expect(result.loi.soDienThoai).toBeDefined();
      });
    });
  });

  describe('Đơn thuốc và Khám bệnh', () => {
    it('báo lỗi khi tên bác sĩ rỗng', () => {
      const result = kiemTraThongTinKham({ tenBacSi: ' ', chuanDoan: 'Sốt' });
      expect(result.hopLe).toBe(false);
      expect(result.loi.tenBacSi).toBeDefined();
    });

    it('báo lỗi khi chẩn đoán rỗng', () => {
      const result = kiemTraThongTinKham({ tenBacSi: 'Dr. A', chuanDoan: '' });
      expect(result.hopLe).toBe(false);
      expect(result.loi.chuanDoan).toBeDefined();
    });

    const baseThuoc = {
      tenThuoc: 'Paracetamol',
      soLuongMoiLan: 1,
      soLanMoiNgay: 2,
      soNgayDung: 3
    };

    it('thuốc hợp lệ', () => {
      const result = kiemTraThuocTrongDon(baseThuoc);
      expect(result.hopLe).toBe(true);
    });

    it('báo lỗi khi tên thuốc rỗng', () => {
      const result = kiemTraThuocTrongDon({ ...baseThuoc, tenThuoc: '' });
      expect(result.hopLe).toBe(false);
      expect(result.loi.tenThuoc).toBeDefined();
    });

    it('báo lỗi khi số lượng mỗi lần bằng 0 hoặc âm', () => {
      expect(kiemTraThuocTrongDon({ ...baseThuoc, soLuongMoiLan: 0 }).hopLe).toBe(false);
      expect(kiemTraThuocTrongDon({ ...baseThuoc, soLuongMoiLan: -1 }).hopLe).toBe(false);
    });

    it('báo lỗi khi số lần mỗi ngày âm hoặc 0', () => {
      expect(kiemTraThuocTrongDon({ ...baseThuoc, soLanMoiNgay: 0 }).hopLe).toBe(false);
      expect(kiemTraThuocTrongDon({ ...baseThuoc, soLanMoiNgay: -2 }).hopLe).toBe(false);
    });

    it('báo lỗi khi số ngày dùng không phải số (hoặc âm)', () => {
      expect(kiemTraThuocTrongDon({ ...baseThuoc, soNgayDung: 'abc' }).hopLe).toBe(false);
      expect(kiemTraThuocTrongDon({ ...baseThuoc, soNgayDung: -1 }).hopLe).toBe(false);
      expect(kiemTraThuocTrongDon({ ...baseThuoc, soNgayDung: 0 }).hopLe).toBe(false);
    });
  });
});
