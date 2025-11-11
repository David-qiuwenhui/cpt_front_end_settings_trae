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
  };
});

// 模拟fileURLToPath和dirname
vi.mock('url', () => ({
  fileURLToPath: vi.fn(),
}));

vi.mock('path', () => ({
  join: vi.fn((...args) => args.join('/')),
  dirname: vi.fn((path) => path.split('/').slice(0, -1).join('/')),
}));

describe('parseExcel.js 单元测试', () => {
  let parseExcelFile;
  let findDuplicateKeys;
  let findUniqueItems;
  let mockXLSX;
  let mockData;

  beforeEach(async () => {
    // 清理所有mock
    vi.clearAllMocks();

    // 设置模拟数据
    mockData = [
      ['key', 'IContent', 'Remark', 'Last Update Date'],
      ['welcome.message', '欢迎信息', '欢迎消息', '2024-01-01'],
      ['user.profile', '用户资料', '用户资料页面', '2024-01-01'],
      ['error.network', '网络错误', '网络连接错误', '2024-01-01']
    ];

    // 设置XLSX模拟
    mockXLSX = await import('xlsx');
    const mockWorkbook = {
      SheetNames: ['Sheet1'],
      Sheets: {
        'Sheet1': {}
      }
    };
    mockXLSX.default.readFile.mockReturnValue(mockWorkbook);
    mockXLSX.default.utils.sheet_to_json.mockReturnValue(mockData);
    mockXLSX.default.utils.aoa_to_sheet.mockReturnValue({});
    mockXLSX.default.utils.book_new.mockReturnValue({});
    mockXLSX.default.utils.book_append_sheet.mockReturnValue();
    mockXLSX.default.writeFile = vi.fn();

    // 设置fs模拟
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockReturnValue();
    fs.writeFileSync.mockReturnValue();

    // 模拟路径函数
    const { join, dirname } = await import('path');
    path.join = join;
    path.dirname = dirname;
    const { fileURLToPath } = await import('url');
    import.meta.url = 'file:///test/path/parseExcel.js';
    fileURLToPath.mockReturnValue('/test/path/parseExcel.js');

    // 导入被测试的函数
    const module = await import('../parseExcel.js');
    parseExcelFile = module.parseExcelFile;
    findDuplicateKeys = module.findDuplicateKeys;
    findUniqueItems = module.findUniqueItems;
  });

  describe('parseExcelFile函数测试', () => {
    /**
     * 测试场景1: 正常解析Excel文件
     * 期望结果: 返回包含所有键值对的i18nMap
     */
    it('should parse Excel file and return complete i18nMap', () => {
      const result = parseExcelFile({
        filePath: 'test-input.xlsx',
        outputPath: 'test-output.json'
      });

      expect(result).toEqual({
        'welcome.message': '欢迎信息',
        'user.profile': '用户资料',
        'error.network': '网络错误'
      });

      // 验证调用了正确的xlsx方法
      expect(mockXLSX.default.readFile).toHaveBeenCalledWith('test-input.xlsx');
      expect(mockXLSX.default.utils.sheet_to_json).toHaveBeenCalledWith(
        expect.any(Object),
        { header: 1, raw: false }
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'test-output.json',
        expect.stringContaining('welcome.message'),
        'utf-8'
      );
    });

    /**
     * 测试场景2: 不指定输出路径
     * 期望结果: 正确解析但不写入文件
     */
    it('should parse Excel without output path', () => {
      const result = parseExcelFile({
        filePath: 'test-input.xlsx'
      });

      expect(result).toEqual({
        'welcome.message': '欢迎信息',
        'user.profile': '用户资料',
        'error.network': '网络错误'
      });

      // 验证没有调用writeFileSync
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    /**
     * 测试场景3: 处理包含不完整数据的行
     * 期望结果: 跳过不完整的行，只处理有效数据
     */
    it('should skip incomplete rows and process valid data', () => {
      // 模拟包含不完整数据的Excel
      const incompleteData = [
        ['key', 'IContent', 'Remark', 'Last Update Date'],
        ['valid.key', 'Valid Content', 'Valid remark', '2024-01-01'],
        [null, null, null, null], // 空行
        ['incomplete', null, 'Missing content', '2024-01-01'], // 缺少IContent
        [null, 'Missing key', 'Has content', '2024-01-01'], // 缺少key
        ['another.valid', 'Another content', 'Another remark', '2024-01-01']
      ];

      mockXLSX.default.utils.sheet_to_json.mockReturnValue(incompleteData);

      const result = parseExcelFile({
        filePath: 'test-input.xlsx'
      });

      expect(result).toEqual({
        'valid.key': 'Valid Content',
        'another.valid': 'Another content'
      });
    });

    /**
     * 测试场景4: 处理重复的key
     * 期望结果: 抛出错误，提示重复的key
     */
    it('should throw error when duplicate keys exist', () => {
      const duplicateData = [
        ['key', 'IContent', 'Remark', 'Last Update Date'],
        ['duplicate.key', 'First content', 'First remark', '2024-01-01'],
        ['duplicate.key', 'Second content', 'Second remark', '2024-01-01'],
        ['unique.key', 'Unique content', 'Unique remark', '2024-01-01']
      ];

      mockXLSX.default.utils.sheet_to_json.mockReturnValue(duplicateData);

      expect(() => {
        parseExcelFile({ filePath: 'test-input.xlsx' });
      }).toThrow('存在重复的国际化key: duplicate.key');
    });

    /**
     * 测试场景5: 处理文件读取错误
     * 期望结果: 抛出读取错误
     */
    it('should throw error when file read fails', () => {
      mockXLSX.default.readFile.mockImplementation(() => {
        throw new Error('File not found or corrupted');
      });

      expect(() => {
        parseExcelFile({ filePath: 'nonexistent.xlsx' });
      }).toThrow('File not found or corrupted');
    });

    /**
     * 测试场景6: 处理只有表头的Excel文件
     * 期望结果: 返回空的i18nMap
     */
    it('should return empty i18nMap for Excel with only headers', () => {
      const headerOnlyData = [
        ['key', 'IContent', 'Remark', 'Last Update Date']
        // 只有表头，没有数据行
      ];

      mockXLSX.default.utils.sheet_to_json.mockReturnValue(headerOnlyData);

      const result = parseExcelFile({ filePath: 'test-input.xlsx' });

      expect(result).toEqual({});
      expect(Object.keys(result)).toHaveLength(0);
    });

    /**
     * 测试场景7: 验证输出目录创建
     * 期望结果: 如果目录不存在，自动创建
     */
    it('should create output directory if it does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      parseExcelFile({
        filePath: 'test-input.xlsx',
        outputPath: 'new/directory/output.json'
      });

      expect(fs.mkdirSync).toHaveBeenCalledWith('new/directory', { recursive: true });
    });
  });

  describe('findDuplicateKeys函数测试', () => {
    /**
     * 测试场景1: 查找无重复key的项
     * 期望结果: 返回空数组
     */
    it('should return empty array when no duplicate keys exist', () => {
      const items = [
        { key: 'key1', IContent: 'content1' },
        { key: 'key2', IContent: 'content2' },
        { key: 'key3', IContent: 'content3' }
      ];

      const result = findDuplicateKeys(items);
      expect(result).toEqual([]);
    });

    /**
     * 测试场景2: 查找一个重复key
     * 期望结果: 返回包含该key的数组
     */
    it('should return array with duplicate key when one key appears twice', () => {
      const items = [
        { key: 'unique1', IContent: 'content1' },
        { key: 'duplicate', IContent: 'content2' },
        { key: 'duplicate', IContent: 'content3' },
        { key: 'unique2', IContent: 'content4' }
      ];

      const result = findDuplicateKeys(items);
      expect(result).toEqual(['duplicate']);
    });

    /**
     * 测试场景3: 查找多个重复key
     * 期望结果: 返回包含所有重复key的数组
     */
    it('should return array with all duplicate keys', () => {
      const items = [
        { key: 'key1', IContent: 'content1' },
        { key: 'key1', IContent: 'duplicate1' },
        { key: 'key2', IContent: 'content2' },
        { key: 'key2', IContent: 'duplicate2' },
        { key: 'key3', IContent: 'content3' },
        { key: 'key3', IContent: 'duplicate3' }
      ];

      const result = findDuplicateKeys(items);
      expect(result).toEqual(['key1', 'key2', 'key3']);
    });

    /**
     * 测试场景4: 处理空数组
     * 期望结果: 返回空数组
     */
    it('should return empty array for empty input array', () => {
      const result = findDuplicateKeys([]);
      expect(result).toEqual([]);
    });

    /**
     * 测试场景5: 处理包含null或undefined key的项
     * 期望结果: 忽略null/undefined key，正常处理其他key
     */
    it('should ignore null or undefined keys and process valid ones', () => {
      const items = [
        { key: null, IContent: 'content1' },
        { key: 'valid.key', IContent: 'content2' },
        { key: undefined, IContent: 'content3' },
        { key: 'valid.key', IContent: 'duplicate' }
      ];

      const result = findDuplicateKeys(items);
      expect(result).toEqual(['valid.key']);
    });
  });

  describe('findUniqueItems函数测试', () */
  /**
   * 测试场景1: 查找唯一项，无重复
   * 期望结果: 返回所有原始项
   */
  it('should return all items when all keys are unique', () => {
    const items = [
      { key: 'key1', IContent: 'content1' },
      { key: 'key2', IContent: 'content2' },
      { key: 'key3', IContent: 'content3' }
    ];

    const result = findUniqueItems(items);
    expect(result).toHaveLength(3);
    expect(result).toEqual(items);
  });

  /**
   * 测试场景2: 过滤重复项
   * 期望结果: 只返回第一次出现的项
   */
  it('should return only first occurrence of duplicate keys', () => {
    const items = [
      { key: 'key1', IContent: 'first content' },
      { key: 'key2', IContent: 'second content' },
      { key: 'key1', IContent: 'duplicate content' },
      { key: 'key3', IContent: 'third content' },
      { key: 'key2', IContent: 'another duplicate' }
    ];

    const result = findUniqueItems(items);
    expect(result).toHaveLength(3);
    expect(result[0].key).toBe('key1');
    expect(result[1].key).toBe('key2');
    expect(result[2].key).toBe('key3');
  });

  /**
   * 测试场景3: 处理空数组
   * 期望结果: 返回空数组
   */
  it('should return empty array for empty input', () => {
    const result = findUniqueItems([]);
    expect(result).toEqual([]);
  });

  /**
   * 测试场景4: 过滤null或undefined key的项
   * 期望结果: 忽略无效key，只返回有效项
   */
  it('should filter out items with null or undefined keys', () => {
    const items = [
      { key: null, IContent: 'content1' },
      { key: 'valid.key', IContent: 'content2' },
      { key: undefined, IContent: 'content3' },
      { key: 'another.valid', IContent: 'content4' }
    ];

    const result = findUniqueItems(items);
    expect(result).toHaveLength(2);
    expect(result.map(item => item.key)).toEqual(['valid.key', 'another.valid']);
  });

  describe('错误处理测试', () => {
    /**
     * 测试场景1: Excel文件格式损坏
     * 期望结果: 抛出格式错误
     */
    it('should handle corrupted Excel file', () => {
      mockXLSX.default.readFile.mockImplementation(() => {
        throw new Error('Excel file is corrupted');
      });

      expect(() => {
        parseExcelFile({ filePath: 'corrupted.xlsx' });
      }).toThrow('Excel file is corrupted');
    });

    /**
     * 测试场景2: JSON写入失败
     * 期望结果: 抛出写入错误
     */
    it('should handle JSON file write failure', () => {
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => {
        parseExcelFile({
          filePath: 'test.xlsx',
          outputPath: 'restricted/output.json'
        });
      }).toThrow('Permission denied');
    });
  });

  afterEach(() => {
    // 清理所有的spy和mock
    vi.restoreAllMocks();
  });
});