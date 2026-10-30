import {
  arrayBufferToBase64,
  exportPassbookStatement,
} from '../../src/features/admin/accounting/services/passbook-export.api';
import { axiosInstance } from '../../src/core/api/client';
import { Platform } from 'react-native';

const mockWriteFile = jest.fn().mockResolvedValue(true);
const mockScanFile = jest.fn().mockResolvedValue(true);
const mockShareOpen = jest.fn().mockResolvedValue({ success: true });

jest.mock('../../src/core/api/client', () => ({
  axiosInstance: {
    get: jest.fn(),
  },
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('react-native-blob-util', () => ({
  default: {
    fs: {
      dirs: {
        DownloadDir: '/mock/downloads',
        DocumentDir: '/mock/documents',
      },
      writeFile: mockWriteFile,
      scanFile: mockScanFile,
    },
  },
  fs: {
    dirs: {
      DownloadDir: '/mock/downloads',
      DocumentDir: '/mock/documents',
    },
    writeFile: mockWriteFile,
    scanFile: mockScanFile,
  },
}));

jest.mock('react-native-share', () => ({
  default: {
    open: mockShareOpen,
  },
}));

describe('Passbook Export API & File Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('arrayBufferToBase64', () => {
    it('accurately converts ArrayBuffer to valid Base64 string', () => {
      const text = 'HRSJM Official Passbook Export';
      const encoder = new TextEncoder();
      const uint8 = encoder.encode(text);
      const base64 = arrayBufferToBase64(uint8.buffer);
      const decoded = Buffer.from(base64, 'base64').toString('utf-8');
      expect(decoded).toBe(text);
    });

    it('handles empty buffer without crashing', () => {
      const buffer = new ArrayBuffer(0);
      const base64 = arrayBufferToBase64(buffer);
      expect(base64).toBe('');
    });
  });

  describe('exportPassbookStatement API integration', () => {
    it('requests ALL transactions as PDF with query parameters', async () => {
      const dummyBuffer = new TextEncoder().encode('DUMMY_PDF_PAYLOAD').buffer;

      (axiosInstance.get as jest.Mock).mockResolvedValue({
        data: dummyBuffer,
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': 'attachment; filename="HRSJM_Passbook_all_Statement.pdf"',
        },
      });

      const result = await exportPassbookStatement({
        transactionType: 'ALL',
        format: 'PDF',
        fromDate: '2026-10-01',
        toDate: '2026-10-31',
      });

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/passbook/export',
        expect.objectContaining({
          params: {
            transactionType: 'ALL',
            format: 'PDF',
            fromDate: '2026-10-01',
            toDate: '2026-10-31',
          },
          responseType: 'arraybuffer',
        }),
      );
      expect(result.filename).toBe('HRSJM_Passbook_all_Statement.pdf');
      expect(result.bytesCount).toBe(dummyBuffer.byteLength);
      expect(mockWriteFile).toHaveBeenCalled();
    });

    it('requests PAYMENT_IN transactions as Excel (XLSX)', async () => {
      const dummyBuffer = new TextEncoder().encode('DUMMY_XLSX_PAYLOAD').buffer;

      (axiosInstance.get as jest.Mock).mockResolvedValue({
        data: dummyBuffer,
        headers: {
          'content-type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'content-disposition':
            'attachment; filename="HRSJM_Passbook_payment_in_2026-10-01_to_2026-10-31.xlsx"',
        },
      });

      const result = await exportPassbookStatement({
        transactionType: 'PAYMENT_IN',
        format: 'XLSX',
        fromDate: '2026-10-01',
        toDate: '2026-10-31',
      });

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/passbook/export',
        expect.objectContaining({
          params: {
            transactionType: 'PAYMENT_IN',
            format: 'XLSX',
            fromDate: '2026-10-01',
            toDate: '2026-10-31',
          },
          responseType: 'arraybuffer',
        }),
      );
      expect(result.filename).toContain('payment_in');
      expect(result.filename.endsWith('.xlsx')).toBe(true);
      expect(mockWriteFile).toHaveBeenCalled();
    });

    it('requests PAYMENT_OUT transactions as CSV', async () => {
      const dummyBuffer = new TextEncoder().encode('\uFEFFDate,Voucher').buffer;

      (axiosInstance.get as jest.Mock).mockResolvedValue({
        data: dummyBuffer,
        headers: {
          'content-type': 'text/csv; charset=utf-8',
          'content-disposition':
            'attachment; filename="HRSJM_Passbook_payment_out_Statement.csv"',
        },
      });

      const result = await exportPassbookStatement({
        transactionType: 'PAYMENT_OUT',
        format: 'CSV',
      });

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/passbook/export',
        expect.objectContaining({
          params: {
            transactionType: 'PAYMENT_OUT',
            format: 'CSV',
          },
          responseType: 'arraybuffer',
        }),
      );
      expect(result.filename).toBe('HRSJM_Passbook_payment_out_Statement.csv');
      expect(mockWriteFile).toHaveBeenCalled();
    });

    it('throws error when server responds with JSON error inside buffer', async () => {
      const errorJson = JSON.stringify({
        statusCode: 400,
        message: 'fromDate cannot be after toDate',
      });
      const errorBuffer = new TextEncoder().encode(errorJson).buffer;

      (axiosInstance.get as jest.Mock).mockResolvedValue({
        data: errorBuffer,
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
      });

      await expect(
        exportPassbookStatement({
          transactionType: 'ALL',
          format: 'PDF',
          fromDate: '2026-10-31',
          toDate: '2026-10-01',
        }),
      ).rejects.toThrow('fromDate cannot be after toDate');
    });
  });
});
