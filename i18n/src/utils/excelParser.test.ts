import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseExcelFile, findDuplicateKeys, validateUniqueKeys } from './excelParser';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { I18nItem, I18nMap } from '../types';

// Mock XLSX和fs模块
vi.mock('xlsx');
vi.mock('fs');

describe('excelParser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseExcelFile', () => {
    it('应该正确解析Excel文件并返回国际化配置映射', () => {
      // 模拟Excel数据
      const mockData = [
        ['key', 'IContent', 'Remark', 'Last Update Date'],
        ['hello', 'Hello World', 'Admin', '2024-01-01'],
        ['welcome', 'Welcome', 'Admin', '2024-01-01']
      ];

      // 模拟XLSX方法
      (XLSX.readFile as vi.Mock).mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: {
          'Sheet1': {} as any
        }
      });
      (XLSX.utils.sheet_to_json as vi.Mock).mockReturnValue(mockData);
      (fs.existsSync as vi.Mock).mockReturnValue(false);
      (fs.mkdirSync as vi.Mock).mockImplementation(() => {});
      (fs.writeFileSync as vi.Mock).mockImplementation(() => {});

      // 执行测试
      const result = parseExcelFile({
        filePath: 'test.xlsx',
        outputPath: 'output.json'
      });

      // 验证结果
      expect(result).toEqual({
        hello: 'Hello World',
        welcome: 'Welcome'
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'output.json',
        JSON.stringify({ hello: 'Hello World', welcome: 'Welcome' }, null, 2),
        'utf-8'
      );
    });

    it('应该跳过不完整的行数据', () => {
      const mockData = [
        ['key', 'IContent', 'Remark', 'Last Update Date'],
        ['hello', 'Hello World', 'Admin', '2024-01-01'],
        ['', '', '', ''], // 空行
        ['welcome', '', 'Admin', '2024-01-01'] // 缺少内容
      ];

      (XLSX.readFile as vi.Mock).mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: {
          'Sheet1': {} as any
        }
      });
      (XLSX.utils.sheet_to_json as vi.Mock).mockReturnValue(mockData);
      (fs.existsSync as vi.Mock).mockReturnValue(false);
      (fs.mkdirSync as vi.Mock).mockImplementation(() => {});
      (fs.writeFileSync as vi.Mock).mockImplementation(() => {});

      const result = parseExcelFile({
        filePath: 'test.xlsx',
        outputPath: 'output.json'
      });

      expect(result).toEqual({
        hello: 'Hello World'
      });
    });
  });

  describe('findDuplicateKeys', () => {
    it('应该正确找出重复的key', () => {
      const items: I18nItem[] = [
        { key: 'hello', IContent: 'Hello World' },
        { key: 'welcome', IContent: 'Welcome' },
        { key: 'hello', IContent: 'Hello Again' }
      ];

      const result = findDuplicateKeys(items);
      expect(result).toEqual(['hello']);
    });

    it('应该返回空数组当没有重复key时', () => {
      const items: I18nItem[] = [
        { key: 'hello', IContent: 'Hello World' },
        { key: 'welcome', IContent: 'Welcome' }
      ];

      const result = findDuplicateKeys(items);
      expect(result).toEqual([]);
    });
  });

  describe('validateUniqueKeys', () => {
    it('应该验证通过当没有重复key时', () => {
      const i18nMap: I18nMap = {
        hello: 'Hello World',
        welcome: 'Welcome'
      };

      const result = validateUniqueKeys(i18nMap);
      expect(result).toBe(true);
    });

    it('应该处理边界情况', () => {
      // 测试空对象
      const emptyMap: I18nMap = {};
      const result1 = validateUniqueKeys(emptyMap);
      expect(result1).toBe(true);
      
      // 测试只有一个key的对象
      const singleKeyMap: I18nMap = {
        hello: 'Hello World'
      };
      const result2 = validateUniqueKeys(singleKeyMap);
      expect(result2).toBe(true);
    });
  });
});
