import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs';

// 模拟xlsx模块
vi.mock('xlsx', () => ({
  default: {
    utils: {
      book_new: vi.fn(),
      book_append_sheet: vi.fn(),
      aoa_to_sheet: vi.fn(),
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
    readFileSync: vi.fn(),
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

describe('generateExcel.js 单元测试', () => {
  let generateExcelFile;
  let mockXLSX;

  beforeEach(async () => {
    // 清理所有mock
    vi.clearAllMocks();

    // 设置XLSX模拟
    mockXLSX = await import('xlsx');
    const mockWorkbook = { type: 'workbook' };
    const mockWorksheet = { type: 'worksheet' };
    
    mockXLSX.default.utils.book_new.mockReturnValue(mockWorkbook);
    mockXLSX.default.utils.aoa_to_sheet.mockReturnValue(mockWorksheet);
    mockXLSX.default.utils.book_append_sheet.mockReturnValue();
    mockXLSX.default.writeFile = vi.fn();

    // 设置fs模拟
    fs.existsSync.mockReturnValue(true);
    fs.mkdirSync.mockReturnValue();
    fs.readFileSync.mockReturnValue(JSON.stringify({
      'key1': 'value1',
      'key2': 'value2',
      'key3': 'value3'
    }));

    // 模拟路径函数
    const { join, dirname } = await import('path');
    path.join = join;
    path.dirname = dirname;
    const { fileURLToPath } = await import('url');
    import.meta.url = 'file:///test/path/generateExcel.js';
    fileURLToPath.mockReturnValue('/test/path/generateExcel.js');

    // 导入被测试的函数
    const module = await import('../generateExcel.js');
    generateExcelFile = module.generateExcelFile;
  });

  describe('generateExcelFile函数测试', () => {
    /**
     * 测试场景1: 从JSON对象生成Excel文件
     * 期望结果: 成功生成包含正确数据的Excel文件
     */
    it('should generate Excel file from JSON object successfully', () => {
      const inputData = {
        'welcome.message': '欢迎信息',
        'user.profile': '用户资料',
        'error.network': '网络错误'
      };

      const outputPath = 'test-output.xlsx';

      generateExcelFile(inputData, outputPath);

      // 验证调用了正确的xlsx方法
      expect(mockXLSX.default.utils.book_new).toHaveBeenCalled();
      expect(mockXLSX.default.utils.aoa_to_sheet).toHaveBeenCalled();
      expect(mockXLSX.default.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        'i18n'
      );
      expect(mockXLSX.default.writeFile).toHaveBeenCalledWith(
        expect.any(Object),
        outputPath
      );
    });

    /**
     * 测试场景2: 从JSON文件路径生成Excel文件
     * 期望结果: 读取文件并成功生成Excel
     */
    it('should generate Excel file from JSON file path successfully', () => {
      const inputPath = 'input/i18n.json';
      const outputPath = 'output/i18n.xlsx';

      generateExcelFile(inputPath, outputPath);

      // 验证读取了输入文件
      expect(fs.existsSync).toHaveBeenCalledWith(inputPath);
      expect(fs.readFileSync).toHaveBeenCalledWith(inputPath, 'utf8');

      // 验证生成了Excel文件
      expect(mockXLSX.default.writeFile).toHaveBeenCalledWith(
        expect.any(Object),
        outputPath
      );
    });

    /**
     * 测试场景3: 处理不存在的输入文件
     * 期望结果: 抛出文件不存在错误
     */
    it('should throw error when input file does not exist', () => {
      const inputPath = 'nonexistent.json';
      const outputPath = 'output.xlsx';
      
      fs.existsSync.mockReturnValue(false);

      expect(() => {
        generateExcelFile(inputPath, outputPath);
      }).toThrow(`输入文件不存在: ${inputPath}`);
    });

    /**
     * 测试场景4: 处理无效的JSON内容
     * 期望结果: 抛出JSON解析错误
     */
    it('should throw error when JSON content is invalid', () => {
      const inputPath = 'invalid.json';
      const outputPath = 'output.xlsx';
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('invalid json content');

      expect(() => {
        generateExcelFile(inputPath, outputPath);
      }).toThrow();
    });

    /**
     * 测试场景5: 处理空的JSON对象
     * 期望结果: 生成包含表头但无数据的Excel文件
     */
    it('should generate Excel with headers only for empty JSON object', () => {
      const inputData = {};
      const outputPath = 'empty-output.xlsx';

      generateExcelFile(inputData, outputPath);

      // 验证仍创建了工作簿结构
      expect(mockXLSX.default.utils.book_new).toHaveBeenCalled();
      expect(mockXLSX.default.utils.aoa_to_sheet).toHaveBeenCalledWith([
        ['key', 'IContent', 'Remark', 'Last Update Date'] // 只有表头
      ]);
      expect(mockXLSX.default.writeFile).toHaveBeenCalledWith(
        expect.any(Object),
        outputPath
      );
    });

    /**
     * 测试场景6: 处理单条国际化配置
     * 期望结果: 生成包含一条数据的Excel文件
     */
    it('should generate Excel file with single i18n item', () => {
      const inputData = {
        'single.key': 'Single translation value'
      };
      const outputPath = 'single-output.xlsx';

      generateExcelFile(inputData, outputPath);

      // 验证调用了正确的写入方法
      expect(mockXLSX.default.writeFile).toHaveBeenCalledWith(
        expect.any(Object),
        outputPath
      );

      // 验证包含了正确的数据结构
      const expectedData = [
        ['key', 'IContent', 'Remark', 'Last Update Date'],
        ['single.key', 'Single translation value', '', expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)]
      ];
      expect(mockXLSX.default.utils.aoa_to_sheet).toHaveBeenCalledWith(expectedData);
    });

    /**
     * 测试场景7: 验证输出目录创建
     * 期望结果: 如果输出目录不存在，自动创建
     */
    it('should create output directory if it does not exist', () => {
      const inputData = { 'key': 'value' };
      const outputPath = 'new/nested/directory/output.xlsx';
      
      fs.existsSync.mockReturnValue(false);

      generateExcelFile(inputData, outputPath);

      expect(fs.mkdirSync).toHaveBeenCalledWith('new/nested/directory', { 
        recursive: true 
      });
    });

    /**
     * 测试场景8: 处理包含特殊字符的键和值
     * 期望结果: 正确处理特殊字符，不损坏Excel文件
     */
    it('should handle special characters in keys and values correctly', () => {
      const inputData = {
        'key.with.dots': '值包含特殊字符：@#$%',
        'key-with-dashes': 'Value with "quotes" and \'apostrophes\'',
        'key_with_underscores': '值 with émojis 🎉 and ñoñ ñoñ'
      };
      const outputPath = 'special-chars.xlsx';

      generateExcelFile(inputData, outputPath);

      expect(mockXLSX.default.writeFile).toHaveBeenCalledWith(
        expect.any(Object),
        outputPath
      );
    });

    /**
     * 测试场景9: 验证Excel工作表名称
     * 期望结果: 使用"i18n"作为工作表名称
     */
    it('should use "i18n" as worksheet name', () => {
      const inputData = { 'key': 'value' };
      const outputPath = 'output.xlsx';

      generateExcelFile(inputData, outputPath);

      expect(mockXLSX.default.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
        'i18n'
      );
    });

    describe('数据格式验证测试', () => {
      /**
       * 测试场景1: 验证Excel数据格式
       * 期望结果: 数据格式正确，第一行为表头
       */
      it('should create correct Excel data format with headers', () => {
        const inputData = {
          'key1': 'value1',
          'key2': 'value2'
        };
        const outputPath = 'format-test.xlsx';

        generateExcelFile(inputData, outputPath);

        // 验证调用了aoa_to_sheet，包含表头
        expect(mockXLSX.default.utils.aoa_to_sheet).toHaveBeenCalledWith([
          ['key', 'IContent', 'Remark', 'Last Update Date'],
          ['key1', 'value1', '', expect.any(String)],
          ['key2', 'value2', '', expect.any(String)]
        ]);
      });

      /**
       * 测试场景2: 验证日期格式
       * 期望结果: 使用ISO日期格式 (YYYY-MM-DD)
       */
      it('should use correct date format for "Last Update Date" column', () => {
        const inputData = { 'test.key': 'test value' };
        const outputPath = 'date-format-test.xlsx';

        generateExcelFile(inputData, outputPath);

        const expectedData = mockXLSX.default.utils.aoa_to_sheet.mock.calls[0][0];
        const dateCell = expectedData[1][3]; // 第二行，第四列（日期列）
        
        // 验证日期格式为YYYY-MM-DD
        expect(dateCell).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    describe('错误处理测试', () /**
     * 测试场景1: Excel文件写入失败
     * 期望结果: 抛出写入错误
     */
    it('should throw error when Excel file write fails', () => {
      const inputData = { 'key': 'value' };
      const outputPath = 'output.xlsx';

      mockXLSX.default.writeFile.mockImplementation(() => {
        throw new Error('Write permission denied');
      });

      expect(() => {
        generateExcelFile(inputData, outputPath);
      }).toThrow('Write permission denied');
    });

    /**
     * 测试场景2: 目录创建失败
     * 期望结果: 抛出目录创建错误
     */
    it('should throw error when output directory creation fails', () => {
      const inputData = { 'key': 'value' };
      const outputPath = 'forbidden/directory/output.xlsx';

      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => {
        generateExcelFile(inputData, outputPath);
      }).toThrow('Permission denied');
    });

    /**
     * 测试场景3: 处理null或undefined输入
     * 期望结果: 抛出类型错误或正常处理
     */
    it('should handle null or undefined input gracefully', () => {
      const outputPath = 'output.xlsx';

      expect(() => {
        generateExcelFile(null, outputPath);
      }).not.toThrow();
    });
  });

  afterEach(() => {
    // 清理所有的spy和mock
    vi.restoreAllMocks();
  });
});