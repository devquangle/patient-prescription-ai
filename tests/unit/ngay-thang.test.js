import { describe, it, expect } from 'vitest';
import { laNgayTrongTuongLai, tinhTuoi, dinhDangNgay } from '../../src/js/utils/ngay-thang.js';

describe('Tiện ích Ngày tháng (ngay-thang.js)', () => {
  const fixedCurrentDate = new Date('2023-05-20T00:00:00Z');

  it('nhận biết ngày trong tương lai', () => {
    const futureDate = '2023-05-21';
    expect(laNgayTrongTuongLai(futureDate, fixedCurrentDate)).toBe(true);
  });

  it('ngày hiện tại không phải ngày tương lai', () => {
    const currentDate = '2023-05-20';
    expect(laNgayTrongTuongLai(currentDate, fixedCurrentDate)).toBe(false);
  });
  
  it('ngày quá khứ không phải ngày tương lai', () => {
    const pastDate = '2023-05-19';
    expect(laNgayTrongTuongLai(pastDate, fixedCurrentDate)).toBe(false);
  });

  it('tính đúng tuổi trước sinh nhật', () => {
    // Sinh năm 1990, ngày sinh tháng 10. Hiện tại là tháng 5/2023 -> Chưa qua sinh nhật -> Tuổi = 32
    expect(tinhTuoi('1990-10-15', fixedCurrentDate)).toBe(32);
  });

  it('tính đúng tuổi sau sinh nhật', () => {
    // Sinh năm 1990, ngày sinh tháng 2. Hiện tại là tháng 5/2023 -> Đã qua sinh nhật -> Tuổi = 33
    expect(tinhTuoi('1990-02-15', fixedCurrentDate)).toBe(33);
  });

  it('xử lý ngày không hợp lệ', () => {
    expect(laNgayTrongTuongLai('invalid-date')).toBe(false);
    expect(tinhTuoi('invalid-date')).toBe(null);
    expect(dinhDangNgay('invalid-date')).toBe('');
    expect(dinhDangNgay(null)).toBe('');
    expect(dinhDangNgay(undefined)).toBe('');
    expect(dinhDangNgay('')).toBe('');
  });

  it('định dạng ngày đúng (DD/MM/YYYY)', () => {
    expect(dinhDangNgay('2023-05-20')).toBe('20/05/2023');
    expect(dinhDangNgay('2023-12-05')).toBe('05/12/2023');
  });
});
