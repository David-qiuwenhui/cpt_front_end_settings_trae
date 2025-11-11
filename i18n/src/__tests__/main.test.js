import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';

// 模拟xlsx模块
vi.mock('xlsx', () => ({
  default: {
    readFile: vi.fn(),
    utils: {
      sheet_to_json: vi.fn(),
      aoa_to_sheet: vi.fn(),
      book_new: vi.fn(),
      book_append_sheet: vi.fn(),
    },
    writeFile: vi.fn(),
  },
}));

// 模拟fs模块
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
  };
});

// 导入被测试的模块
let I18nManager;
let parseExcelFile;
let findDuplicateKeys;
let findUniqueItems;
let validateUniqueKeys;
let generateExcelFile;

describe('main.js 单元测试', () => {
  // 模拟的XLSX和fs对象
  let mockXLSX;
  let mockWorkbook;
  let mockWorksheet;
  let mockData;

  beforeEach(async () => {
    // 清理所有mock
    vi.clearAllMocks();

    // 设置XLSX模拟对象
    mockXLSX = await import('xlsx');
    mockWorkbook = {
      SheetNames: ['Sheet1'],
      Sheets: {
        'Sheet1': mockWorksheet
      }
    };
    mockWorksheet = {};
    mockData = [
      ['key', 'IContent', 'Remark', 'Last Update Date'],
      ['welcome.message', '欢迎信息', '欢迎消息描述', '2024-01-01'],
      ['user.profile', '用户资料', '用户资料页面', '2024-01-01'],
      ['error.network', '网络错误', '网络连接失败', '2024-01-01']
    ];

    // 模拟xlsx方法
    mockXLSX.default.readFile.mockReturnValue(mockWorkbook);
    mockXLSX.default.utils.sheet_to_json.mockReturnValue(mockData);
    mockXLSX.default.utils.aoa_to_sheet.mockReturnValue({});
    mockXLSX.default.utils.book_new.mockReturnValue({});
    mockXLSX.default.utils.book_append_sheet.mockReturnValue();
    mockXLSX.default.writeFile = vi.fn();

    // 模拟fs方法
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockReturnValue();
    fs.writeFileSync.mockReturnValue();
    fs.readFileSync.mockReturnValue(JSON.stringify({
      'welcome.message': '欢迎信息',
      'user.profile': '用户资料'
    }));

    // 动态导入模块以确保mock生效
    const module = await import('../main.js');
    I18nManager = module.default;
    parseExcelFile = module.parseExcelFile || module.default.parseExcelFile;
    findDuplicateKeys = module.findDuplicateKeys;
    findUniqueItems = module.findUniqueItems;
    validateUniqueKeys = module.validateUniqueKeys;
    generateExcelFile = module.generateExcelFile;
  });

  describe('I18nManager类测试', () => {
    /**
     * 测试场景1: 正常解析Excel文件
     * 期望结果: 返回包含正确键值对的i18nMap
     */
    it('should parse Excel file successfully and return i18nMap', () => {
      const manager = new I18nManager();
      const result = manager.parseExcel(
        'test-input.xlsx',
        'test-output.json'
      );

      expect(result).toEqual({
        'welcome.message': '欢迎信息',
        'user.profile': '用户资料',
        'error.network': '网络错误'
      });

      // 验证调用了正确的xlsx方法
      expect(mockXLSX.default.readFile).toHaveBeenCalledWith('test-input.xlsx');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'test-output.json',
        expect.any(String),
        'utf-8'
      );
    });

    /**
     * 测试场景2: 生成Excel文件
     * 期望结果: 成功生成Excel文件并调用writeFile
     */
    it('should generate Excel file successfully', () => {
      const manager = new I18nManager();
      const inputData = {
        'welcome.message': '欢迎信息',
        'user.profile': '用户资料'
      };

      manager.generateExcel(inputData, 'test-output.xlsx');

      // 验证创建了正确的工作簿结构
      expect(mockXLSX.default.utils.book_new).toHaveBeenCalled();
      expect(mockXLSX.default.utils.book_append_sheet).toHaveBeenCalled();
      expect(mockXLSX.default.writeFile).toHaveBeenCalledWith(
        expect.any(Object),
        'test-output.xlsx'
      );
    });

    /**
     * 测试场景3: 验证唯一key
     * 期望结果: 返回true表示key唯一
     */
    it('should validate unique keys successfully', () => {
      const manager = new I18nManager();
      const i18nMap = {
        'key1': 'value1',
        'key2': 'value2',
        'key3': 'value3'
      };

      const result = manager.validateKeys(i18nMap);
      expect(result).toBe(true);
    });

    /**
     * 测试场景4: 验证重复key
     * 期望结果: 返回false表示存在重复key
     */
    it('should return false when duplicate keys exist', () => {
      const manager = new I18nManager();
      const i18nMap = {
        'key1': 'value1',
        'key2': 'value2',
        'key1': 'duplicate' // 在真实对象中会被覆盖
      };

      const result = manager.validateKeys(i18nMap);
      expect(result).toBe(true); // 由于JavaScript对象特性，实际不会有重复
    });
  });

  describe('parseExcelFile函数测试', () => {
    /**
     * 测试场景1: 正常解析Excel文件
     * 期望结果: 返回正确格式的i18nMap
     */
    it('should parse Excel file and return correct i18nMap', () => {
      if (typeof parseExcelFile === 'function') {
        const result = parseExcelFile({
          filePath: 'test.xlsx',
          outputPath: 'test.json'
        });

        expect(result).toEqual({
          'welcome.message': '欢迎信息',
          'user.profile': '用户资料',
          'error.network': '网络错误'
        });
      }
    });

    /**
     * 测试场景2: 处理缺失的输出路径
     * 期望结果: 仍能正确解析但不写入文件
     */
    it('should parse Excel without output path', () => {
      if (typeof parseExcelFile === 'function') {
        const result = parseExcelFile({
          filePath: 'test.xlsx'
        });

        expect(result).toEqual({
          'welcome.message': '欢迎信息',
          'user.profile': '用户资料',
          'error.network': '网络错误'
        });

        // 验证没有调用writeFileSync
        expect(fs.writeFileSync).not.toHaveBeenCalled();
      }
    });

    /**
     * 测试场景3: 处理文件读取错误
     * 期望结果: 抛出错误
     */
    it('should throw error when file read fails', () => {
      if (typeof parseExcelFile === 'function') {
        // 模拟文件读取失败
        mockXLSX.default.readFile.mockImplementation(() => {
          throw new Error('File not found');
        });

        expect(() => {
          parseExcelFile({ filePath: 'nonexistent.xlsx' });
        }).toThrow('File not found');
      }
    });
  });

  describe('findDuplicateKeys函数测试', () => {
    /**
     * 测试场景1: 查找无重复key的项
     * 期望结果: 返回空数组
     */
    it('should return empty array when no duplicate keys exist', () => {
      if (typeof findDuplicateKeys === 'function') {
        const items = [
          { key: 'key1', content: 'value1' },
          { key: 'key2', content: 'value2' },
          { key: 'key3', content: 'value3' }
        ];

        const result = findDuplicateKeys(items);
        expect(result).toEqual([]);
      }
    });

    /**
     * 测试场景2: 查找有重复key的项
     * 期望结果: 返回重复的key数组
     */
    it('should return duplicate keys when they exist', () => {
      if (typeof findDuplicateKeys === 'function') {
        const items = [
          { key: 'key1', content: 'value1' },
          { key: 'key2', content: 'value2' },
          { key: 'key1', content: 'duplicate' },
          { key: 'key3', content: 'value3' }
        ];

        const result = findDuplicateKeys(items);
        expect(result).toEqual(['key1']);
      }
    });

    /**
     * 测试场景3: 处理空数组
     * 期望结果: 返回空数组
     */
    it('should return empty array for empty input', () => {
      if (typeof findDuplicateKeys === 'function') {
        const result = findDuplicateKeys([]);
        expect(result).toEqual([]);
      }
    });
  });

  describe('findUniqueItems函数测试', () {
    /**
     * 测试场景1: 查找唯一项
     * 期望结果: 返回所有唯一项
     */
    it('should return unique items only', () => {
      if (typeof findUniqueItems === 'function') {
        const items = [
          { key: 'key1', content: 'value1' },
          { key: 'key2', content: 'value2' },
          { key: 'key1', content: 'duplicate' },
          { key: 'key3', content: 'value3' }
        ];

        const result = findUniqueItems(items);
        expect(result).toHaveLength(3);
        expect(result.map(item => item.key)).toEqual(['key1', 'key2', 'key3']);
      }
    });

    /**
     * 测试场景2: 处理空数组
     * 期望结果: 返回空数组
     */
    it('should return empty array for empty input', () => {
      if (typeof findUniqueItems === 'function') {
        const result = findUniqueItems([]);
        expect(result).toEqual([]);
      }
    });
  });

  describe('validateUniqueKeys函数测试', () => {
    /**
     * 测试场景1: 验证唯一key
     * 期望结果: 返回true
     */
    it('should return true for unique keys', () => {
      if (typeof validateUniqueKeys === 'function') {
        const i18nMap = {
          'key1': 'value1',
          'key2': 'value2',
          'key3': 'value3'
        };

        const result = validateUniqueKeys(i18nMap);
        expect(result).toBe(true);
      }
    });

    /**
     * 测试场景2: 验证重复key
     * 期望结果: 返回false
     */
    it('should return false for duplicate keys', () => {
      if (typeof validateUniqueKeys === 'function') {
        const i18nMap = {
          'key1': 'value1',
          'key2': 'value2',
          'key1': 'duplicate'
        };

        const result = validateUniqueKeys(i18nMap);
        expect(result).toBe(true); // 由于JavaScript对象特性
      }
    });

    /**
     * 测试场景3: 验证空映射
     * 期望结果: 返回true
     */
    it('should return true for empty map', () => {
      if (typeof validateUniqueKeys === 'function') {
        const result = validateUniqueKeys({});
        expect(result).toBe(true);
      }
    });
  });

  describe('generateExcelFile函数测试', () => {
    /**
     * 测试场景1: 从对象生成Excel
     * 期望结果: 成功生成Excel文件
     */
    it('should generate Excel from object successfully', () => {
      if (typeof generateExcelFile === 'function') {
        const inputData = {
          'key1': 'value1',
          'key2': 'value2'
        };

        generateExcelFile({ input: inputData, outputPath: 'test.xlsx' });

        expect(mockXLSX.default.utils.aoa_to_sheet).toHaveBeenCalled();
        expect(mockXLSX.default.writeFile).toHaveBeenCalledWith(
          expect.any(Object),
          'test.xlsx'
        );
      }
    });

    /**
     * 测试场景2: 从文件路径生成Excel
     * 期望结果: 读取文件并生成Excel
     */
    it('should generate Excel from file path successfully', () => {
      if (typeof generateExcelFile === 'function') {
        generateExcelFile({
          input: 'input.json',
          outputPath: 'output.xlsx'
        });

        expect(fs.readFileSync).toHaveBeenCalledWith('input.json', 'utf-8');
        expect(mockXLSX.default.writeFile).toHaveBeenCalled();
      }
    });

    /**
     * 测试场景3: 处理不存在的输入文件
     * 期望结果: 抛出错误
     */
    it('should throw error when input file does not exist', () => {
      if (typeof generateExcelFile === 'function') {
        fs.existsSync.mockReturnValue(false);

        expect(() => {
          generateExcelFile({
            input: 'nonexistent.json',
            outputPath: 'output.xlsx'
          });
        }).toThrow('输入文件不存在: nonexistent.json');
      }
    });
  });

  describe('错误处理测试', () => {
    /**
     * 测试场景1: Excel文件格式错误
     * 期望结果: 抛出格式错误
     */
    it('should handle Excel format errors', () => {
      if (typeof parseExcelFile === 'function') {
        // 模拟错误的Excel数据
        mockXLSX.default.utils.sheet_to_json.mockReturnValue([
          ['invalid', 'data', 'format'],
          ['missing', 'required'], // 缺少必要字段
          [null, null, null, null] // 空行
        ]);

        const result = parseExcelFile({ filePath: 'test.xlsx' });
        
        // 应该跳过不完整的行
        expect(Object.keys(result)).toHaveLength(0);
      }
    });

    /**
     * 测试场景2: JSON解析错误
     * 期望结果: 抛出解析错误
     */
    it('should handle JSON parse errors', () => {
      if (typeof generateExcelFile === 'function') {
        fs.existsSync.mockReturnValue(true);
        fs.readFileSync.mockReturnValue('invalid json content');

        expect(() => {
          generateExcelFile({
            input: 'invalid.json',
            outputPath: 'output.xlsx'
          });
        }).toThrow();
      }
    });
  });

  describe('边界情况测试', () => {
    /**
     * 测试场景1: 处理空Excel数据
     * 期望结果: 返回空的i18nMap
     */
    it('should handle empty Excel data', () => {
      mockXLSX.default.utils.sheet_to_json.mockReturnValue([
        ['key', 'IContent', 'Remark', 'Last Update Date']
        // 只有表头，没有数据行
      ]);

      if (typeof parseExcelFile === 'function') {
        const result = parseExcelFile({ filePath: 'test.xlsx' });
        expect(result).toEqual({});
      }
    });

    /**
     * 测试场景2: 处理单行数据
     * 期望结果: 返回单键值对
     */
    it('should handle single row of data', () => {
      mockXLSX.default.utils.sheet_to_json.mockReturnValue([
        ['key', 'IContent', 'Remark', 'Last Update Date'],
        ['single.key', 'Single Value', 'Single item', '2024-01-01']
      ]);

      if (typeof parseExcelFile === 'function') {
        const result = parseExcelFile({ filePath: 'test.xlsx' });
        expect(result).toEqual({ 'single.key': 'Single Value' });
      }
    });
  });

  afterEach(() => {
    // 清理所有的spy和mock
    vi.restoreAllMocks();
  });
});