import { describe, it, expect } from 'vitest';
import { taoId, taoMaBenhNhan, taoMaDonThuoc } from '../../src/js/utils/ma.js';

describe('Tiện ích Mã (ma.js)', () => {
  it('tạo ID không bị trùng lặp', () => {
    const id1 = taoId();
    const id2 = taoId();
    expect(id1).not.toBe(id2);
  });

  it('tạo mã bệnh nhân đúng định dạng (bắt đầu bằng BN)', () => {
    const maBN = taoMaBenhNhan();
    // BN-YYYYMMDD-XXXX
    expect(maBN).toMatch(/^BN-\d{8}-[A-Z0-9]{4}$/);
  });

  it('tạo mã đơn thuốc đúng định dạng (bắt đầu bằng DT)', () => {
    const maDT = taoMaDonThuoc();
    // DT-YYYYMMDD-XXXX
    expect(maDT).toMatch(/^DT-\d{8}-[A-Z0-9]{4}$/);
  });

  it('cùng đầu vào xác định sẽ cho kết quả xác định (Mã BN)', () => {
    const fixedDate = new Date('2023-01-15T00:00:00Z');
    const fixedRandom = () => 0.1234; 
    // 0.1234 * 10000 -> 1234
    const maBN = taoMaBenhNhan(fixedDate, fixedRandom);
    
    expect(maBN).toBe('BN-20230115-1234'); 
  });
  
  it('cùng đầu vào xác định sẽ cho kết quả xác định (Mã ĐT)', () => {
    const fixedDate = new Date('2023-01-15T00:00:00Z');
    const fixedRandom = () => 0.5678;
    // 0.5678 * 10000 -> 5678
    const maDT = taoMaDonThuoc(fixedDate, fixedRandom);
    
    expect(maDT).toBe('DT-20230115-5678'); 
  });
});
