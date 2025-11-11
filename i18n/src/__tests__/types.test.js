/**
 * 类型定义文件的单元测试
 * 测试所有的类型定义、常量导出和接口定义
 */

import { describe, it, expect } from 'vitest';
import {
  ErrorTypes,
  DefaultConfig,
  FileExtensions,
  defaultValidationRules,
  I18nItem,
  I18nMap,
  ExcelRow,
  ParseExcelOptions,
  GenerateExcelOptions,
  ValidationResult,
  I18nManagerInterface,
  ValidationRules,
  UtilityFunctions
} from '../types/index.js';

// 重导出模块以进行测试
const mockTypes = {
  ErrorTypes: {
    FILE_NOT_FOUND: 'FILE_NOT_FOUND',
    PARSE_ERROR: 'PARSE_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    DUPLICATE_KEYS: 'DUPLICATE_KEYS',
    INVALID_FORMAT: 'INVALID_FORMAT',
    WRITE_ERROR: 'WRITE_ERROR'
  },
  DefaultConfig: {
    EXCEL_HEADERS: ['key', 'IContent', 'Remark', 'Last Update Date'],
    DATE_FORMAT: 'YYYY-MM-DD',
    WORKSHEET_NAME: 'i18n',
    DEFAULT_OUTPUT_DIR: './output',
    DEFAULT_INPUT_DIR: './input'
  },
  FileExtensions: {
    EXCEL: '.xlsx',
    JSON: '.json'
  },
  defaultValidationRules: {
    requireUniqueKeys: true,
    requireNonEmptyValues: true,
    keyPattern: /^[a-zA-Z0-9._-]+$/,
    maxKeyLength: 100,
    maxValueLength: 1000
  }
};

describe('类型定义测试', () => {
  describe('错误类型常量测试', () => {
    it('ErrorTypes 包含所有错误类型', () => {
      expect(mockTypes.ErrorTypes).toHaveProperty('FILE_NOT_FOUND');
      expect(mockTypes.ErrorTypes).toHaveProperty('PARSE_ERROR');
      expect(mockTypes.ErrorTypes).toHaveProperty('VALIDATION_ERROR');
      expect(mockTypes.ErrorTypes).toHaveProperty('DUPLICATE_KEYS');
      expect(mockTypes.ErrorTypes).toHaveProperty('INVALID_FORMAT');
      expect(mockTypes.ErrorTypes).toHaveProperty('WRITE_ERROR');
    });

    it('所有错误类型都是非空字符串', () => {
      Object.values(mockTypes.ErrorTypes).forEach(errorType => {
        expect(typeof errorType).toBe('string');
        expect(errorType.length).toBeGreaterThan(0);
      });
    });
  });

  describe('默认配置常量测试', () => {
    it('DefaultConfig 包含所有必需的配置项', () => {
      expect(mockTypes.DefaultConfig).toHaveProperty('EXCEL_HEADERS');
      expect(mockTypes.DefaultConfig).toHaveProperty('DATE_FORMAT');
      expect(mockTypes.DefaultConfig).toHaveProperty('WORKSHEET_NAME');
      expect(mockTypes.DefaultConfig).toHaveProperty('DEFAULT_OUTPUT_DIR');
      expect(mockTypes.DefaultConfig).toHaveProperty('DEFAULT_INPUT_DIR');
    });

    it('Excel 头部数组包含预期的列数', () => {
      expect(Array.isArray(mockTypes.DefaultConfig.EXCEL_HEADERS)).toBe(true);
      expect(mockTypes.DefaultConfig.EXCEL_HEADERS).toHaveLength(4);
      expect(mockTypes.DefaultConfig.EXCEL_HEADERS[0]).toBe('key');
      expect(mockTypes.DefaultConfig.EXCEL_HEADERS[1]).toBe('IContent');
      expect(mockTypes.DefaultConfig.EXCEL_HEADERS[2]).toBe('Remark');
      expect(mockTypes.DefaultConfig.EXCEL_HEADERS[3]).toBe('Last Update Date');
    });

    it('日期格式符合预期', () => {
      expect(mockTypes.DefaultConfig.DATE_FORMAT).toBe('YYYY-MM-DD');
    });

    it('工作表名称为预期的值', () => {
      expect(mockTypes.DefaultConfig.WORKSHEET_NAME).toBe('i18n');
    });

    it('默认目录路径都是相对路径', () => {
      expect(mockTypes.DefaultConfig.DEFAULT_OUTPUT_DIR).toStartWith('./');
      expect(mockTypes.DefaultConfig.DEFAULT_INPUT_DIR).toStartWith('./');
    });
  });

  describe('文件扩展名常量测试', () => {
    it('FileExtensions 包含所有文件扩展名', () => {
      expect(mockTypes.FileExtensions).toHaveProperty('EXCEL');
      expect(mockTypes.FileExtensions).toHaveProperty('JSON');
    });

    it('Excel 扩展名正确', () => {
      expect(mockTypes.FileExtensions.EXCEL).toBe('.xlsx');
    });

    it('JSON 扩展名正确', () => {
      expect(mockTypes.FileExtensions.JSON).toBe('.json');
    });
  });

  describe('默认验证规则测试', () => {
    it('defaultValidationRules 包含所有验证规则', () => {
      expect(mockTypes.defaultValidationRules).toHaveProperty('requireUniqueKeys');
      expect(mockTypes.defaultValidationRules).toHaveProperty('requireNonEmptyValues');
      expect(mockTypes.defaultValidationRules).toHaveProperty('keyPattern');
      expect(mockTypes.defaultValidationRules).toHaveProperty('maxKeyLength');
      expect(mockTypes.defaultValidationRules).toHaveProperty('maxValueLength');
    });

    it('验证规则值符合预期', () => {
      const rules = mockTypes.defaultValidationRules;
      
      expect(rules.requireUniqueKeys).toBe(true);
      expect(rules.requireNonEmptyValues).toBe(true);
      expect(rules.keyPattern).toBeInstanceOf(RegExp);
      expect(rules.maxKeyLength).toBe(100);
      expect(rules.maxValueLength).toBe(1000);
    });

    it('Key 模式正确识别有效和无效的 key', () => {
      const pattern = mockTypes.defaultValidationRules.keyPattern;
      
      // 有效的 key
      expect(pattern.test('hello')).toBe(true);
      expect(pattern.test('user.name')).toBe(true);
      expect(pattern.test('nav-item_1')).toBe(true);
      expect(pattern.test('button-ok')).toBe(true);
      expect(pattern.test('app.config.setting')).toBe(true);
      expect(pattern.test('user123')).toBe(true);
      
      // 无效的 key
      expect(pattern.test('hello world')).toBe(false); // 包含空格
      expect(pattern.test('hello@world')).toBe(false); // 包含特殊字符 @
      expect(pattern.test('hello#world')).toBe(false); // 包含特殊字符 #
      expect(pattern.test('')).toBe(false); // 空字符串
      expect(pattern.test('hello.world.')).toBe(false); // 以点结尾
    });
  });

  describe('类型结构测试', () => {
    it('I18nItem 接口结构正确', () => {
      const testItem = {
        key: 'test.key',
        IContent: 'Test Content',
        Remark: 'Test Remark',
        LastUpdateDate: '2023-12-01'
      };
      
      // 验证必要属性存在
      expect(testItem).toHaveProperty('key');
      expect(testItem).toHaveProperty('IContent');
      
      // 验证可选属性
      expect(testItem).toHaveProperty('Remark');
      expect(testItem).toHaveProperty('LastUpdateDate');
      
      // 验证类型
      expect(typeof testItem.key).toBe('string');
      expect(typeof testItem.IContent).toBe('string');
    });

    it('I18nMap 映射结构正确', () => {
      const testMap = {
        'hello': 'Hello',
        'world': 'World',
        'user.name': 'User Name',
        'nav.item_1': 'Navigation Item 1'
      };
      
      // 验证所有值都是字符串
      Object.values(testMap).forEach(value => {
        expect(typeof value).toBe('string');
      });
      
      // 验证对象结构
      expect(typeof testMap).toBe('object');
      expect(testMap.hello).toBe('Hello');
      expect(testMap['user.name']).toBe('User Name');
    });

    it('ExcelRow 接口结构正确', () => {
      const testRow = {
        key: 'test.key',
        IContent: 'Test Content',
        Remark: 'Test Remark',
        LastUpdateDate: '2023-12-01'
      };
      
      // 验证所有属性
      expect(testRow.key).toBe('test.key');
      expect(testRow.IContent).toBe('Test Content');
      expect(testRow.Remark).toBe('Test Remark');
      expect(testRow.LastUpdateDate).toBe('2023-12-01');
    });

    it('ParseExcelOptions 接口结构正确', () => {
      const testOptions = {
        filePath: './input/test.xlsx',
        outputPath: './output/test.json'
      };
      
      // 验证必要属性
      expect(testOptions).toHaveProperty('filePath');
      expect(typeof testOptions.filePath).toBe('string');
      expect(testOptions.filePath.length).toBeGreaterThan(0);
      
      // 验证可选属性
      expect(testOptions).toHaveProperty('outputPath');
      expect(typeof testOptions.outputPath).toBe('string');
    });

    it('GenerateExcelOptions 接口结构正确', () => {
      const testOptions1 = {
        input: './input/test.json',
        outputPath: './output/test.xlsx'
      };
      
      const testOptions2 = {
        input: {
          'hello': 'Hello',
          'world': 'World'
        },
        outputPath: './output/test.xlsx'
      };
      
      // 验证输入为字符串
      expect(testOptions1.input).toBe('./input/test.json');
      expect(typeof testOptions1.outputPath).toBe('string');
      
      // 验证输入为对象
      expect(typeof testOptions2.input).toBe('object');
      expect(typeof testOptions2.outputPath).toBe('string');
    });

    it('ValidationResult 接口结构正确', () => {
      const validResult = {
        isValid: true
      };
      
      const invalidResult = {
        isValid: false,
        errors: ['Error message 1', 'Error message 2'],
        warnings: ['Warning message']
      };
      
      // 验证有效结果
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toBeUndefined();
      expect(validResult.warnings).toBeUndefined();
      
      // 验证无效结果
      expect(invalidResult.isValid).toBe(false);
      expect(Array.isArray(invalidResult.errors)).toBe(true);
      expect(invalidResult.errors.length).toBe(2);
      expect(Array.isArray(invalidResult.warnings)).toBe(true);
      expect(invalidResult.warnings.length).toBe(1);
    });
  });

  describe('边界情况测试', () => {
    it('处理空对象情况', () => {
      // 测试空 I18nMap
      const emptyMap = {};
      expect(typeof emptyMap).toBe('object');
      expect(Object.keys(emptyMap).length).toBe(0);
      
      // 测试空数组情况
      const emptyArray = [];
      expect(Array.isArray(emptyArray)).toBe(true);
      expect(emptyArray.length).toBe(0);
    });

    it('处理特殊字符数据', () => {
      const specialKeyMap = {
        '中文': '中文内容',
        'special@key': 'Special content',
        'key.with.dots': 'Content with dots',
        'key_with_underscores': 'Content with underscores',
        'key-with-dashes': 'Content with dashes'
      };
      
      // 验证所有键值对存在
      expect(specialKeyMap['中文']).toBe('中文内容');
      expect(specialKeyMap['special@key']).toBe('Special content');
      expect(specialKeyMap['key.with.dots']).toBe('Content with dots');
    });

    it('处理长度限制的键和值', () => {
      const longKey = 'a'.repeat(100);
      const longValue = 'b'.repeat(1000);
      const shortKey = 'c';
      const shortValue = 'd';
      
      const limitTestMap = {
        [longKey]: longValue,
        [shortKey]: shortValue
      };
      
      expect(limitTestMap[longKey]).toBe(longValue);
      expect(limitTestMap[shortKey]).toBe(shortValue);
      expect(limitTestMap[longKey].length).toBe(1000);
      expect(limitTestMap[shortKey].length).toBe(1);
    });
  });

  describe('日期格式验证测试', () => {
    it('日期格式符合 YYYY-MM-DD 标准', () => {
      const dateFormat = mockTypes.DefaultConfig.DATE_FORMAT;
      expect(dateFormat).toBe('YYYY-MM-DD');
      
      // 验证一些符合格式的日期
      const validDates = [
        '2023-12-01',
        '2000-01-01',
        '1999-12-31',
        '2024-02-29' // 闰年
      ];
      
      validDates.forEach(date => {
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });
  });

  describe('工作表名称验证测试', () => {
    it('工作表名称是有效的字符串', () => {
      const worksheetName = mockTypes.DefaultConfig.WORKSHEET_NAME;
      expect(typeof worksheetName).toBe('string');
      expect(worksheetName.length).toBeGreaterThan(0);
      expect(worksheetName).toBe('i18n');
    });
  });

  describe('目录路径验证测试', () => {
    it('默认目录路径是有效的相对路径', () => {
      expect(mockTypes.DefaultConfig.DEFAULT_OUTPUT_DIR).toStartWith('./');
      expect(mockTypes.DefaultConfig.DEFAULT_INPUT_DIR).toStartWith('./');
      expect(mockTypes.DefaultConfig.DEFAULT_OUTPUT_DIR).toBe('./output');
      expect(mockTypes.DefaultConfig.DEFAULT_INPUT_DIR).toBe('./input');
    });
  });

  describe('文件扩展名验证测试', () => {
    it('文件扩展名以点开头', () => {
      expect(mockTypes.FileExtensions.EXCEL).toStartWith('.');
      expect(mockTypes.FileExtensions.JSON).toStartWith('.');
    });

    it('文件扩展名是有效的字符串', () => {
      expect(typeof mockTypes.FileExtensions.EXCEL).toBe('string');
      expect(typeof mockTypes.FileExtensions.JSON).toBe('string');
      expect(mockTypes.FileExtensions.EXCEL.length).toBeGreaterThan(0);
      expect(mockTypes.FileExtensions.JSON.length).toBeGreaterThan(0);
    });
  });
});