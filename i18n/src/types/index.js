/**
 * 国际化配置项目的类型定义
 * 包含所有主要数据结构和接口的类型定义
 */

/**
 * 国际化配置项接口
 * @typedef {Object} I18nItem
 * @property {string} key - 国际化键名，必须唯一
 * @property {string} IContent - 国际化内容
 * @property {string} [Remark] - 可选的备注信息
 * @property {string} [LastUpdateDate] - 最后更新日期，格式为YYYY-MM-DD
 */

/**
 * 国际化配置映射
 * 键为国际化key，值为对应的国际化内容
 * @typedef {Object<string, string>} I18nMap
 */

/**
 * Excel行数据接口
 * @typedef {Object} ExcelRow
 * @property {string|null} key - Excel第一列，键名
 * @property {string|null} IContent - Excel第二列，内容
 * @property {string|null} Remark - Excel第三列，备注
 * @property {string|null} LastUpdateDate - Excel第四列，更新日期
 */

/**
 * Excel解析选项接口
 * @typedef {Object} ParseExcelOptions
 * @property {string} filePath - Excel文件路径
 * @property {string} [outputPath] - 可选的输出JSON文件路径
 */

/**
 * Excel生成选项接口
 * @typedef {Object} GenerateExcelOptions
 * @property {string|I18nMap} input - 输入数据，可以是文件路径或I18nMap对象
 * @property {string} outputPath - 输出Excel文件路径
 */

/**
 * 验证结果接口
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - 是否验证通过
 * @property {string[]} [errors] - 错误信息数组
 * @property {string[]} [warnings] - 警告信息数组
 */

/**
 * I18nManager类接口
 * @typedef {Object} I18nManagerInterface
 * @property {(excelPath?: string, outputPath?: string) => I18nMap} parseExcel - 解析Excel方法
 * @property {(input: string|I18nMap, outputPath: string) => void} generateExcel - 生成Excel方法
 * @property {(i18nMap: I18nMap) => boolean} validateKeys - 验证key唯一性方法
 */

/**
 * 错误类型枚举
 * @enum {string}
 */
export const ErrorTypes = {
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  PARSE_ERROR: 'PARSE_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_KEYS: 'DUPLICATE_KEYS',
  INVALID_FORMAT: 'INVALID_FORMAT',
  WRITE_ERROR: 'WRITE_ERROR'
};

/**
 * 默认配置常量
 * @enum {string}
 */
export const DefaultConfig = {
  EXCEL_HEADERS: ['key', 'IContent', 'Remark', 'Last Update Date'],
  DATE_FORMAT: 'YYYY-MM-DD',
  WORKSHEET_NAME: 'i18n',
  DEFAULT_OUTPUT_DIR: './output',
  DEFAULT_INPUT_DIR: './input'
};

/**
 * 文件扩展名常量
 * @enum {string}
 */
export const FileExtensions = {
  EXCEL: '.xlsx',
  JSON: '.json'
};

/**
 * 验证规则接口
 * @typedef {Object} ValidationRules
 * @property {boolean} requireUniqueKeys - 是否要求key唯一
 * @property {boolean} requireNonEmptyValues - 是否要求值非空
 * @property {RegExp} keyPattern - key的验证模式
 * @property {number} maxKeyLength - key的最大长度
 * @property {number} maxValueLength - 值的最大长度
 */

/**
 * 默认验证规则
 * @type {ValidationRules}
 */
export const defaultValidationRules = {
  requireUniqueKeys: true,
  requireNonEmptyValues: true,
  keyPattern: /^[a-zA-Z0-9._-]+$/, // 只允许字母、数字、点、下划线和横线
  maxKeyLength: 100,
  maxValueLength: 1000
};

/**
 * 工具函数类型定义
 * @typedef {Object} UtilityFunctions
 * @property {(items: I18nItem[]) => string[]} findDuplicateKeys - 查找重复key的函数
 * @property {(items: I18nItem[]) => I18nItem[]} findUniqueItems - 查找唯一项的函数
 * @property {(i18nMap: I18nMap) => boolean} validateUniqueKeys - 验证key唯一性的函数
 * @property {(data: any[]) => I18nMap} parseExcelFile - 解析Excel文件的函数
 * @property {(options: GenerateExcelOptions) => void} generateExcelFile - 生成Excel文件的函数
 */

/**
 * 导出所有类型
 */
export {
  I18nItem,
  I18nMap,
  ExcelRow,
  ParseExcelOptions,
  GenerateExcelOptions,
  ValidationResult,
  I18nManagerInterface,
  ValidationRules,
  UtilityFunctions
};