/**
 * 国际化配置项接口
 */
export interface I18nItem {
  /**
   * 国际化键名
   */
  key: string;
  /**
   * 国际化中英文值
   */
  IContent: string;
  /**
   * 国际化维护人信息（可选）
   */
  Remark?: string;
  /**
   * 最后更新日期（可选）
   */
  'Last Update Date'?: string;
}

/**
 * 国际化配置映射接口
 */
export interface I18nMap {
  [key: string]: string;
}

/**
 * 解析Excel选项接口
 */
export interface ParseExcelOptions {
  /**
   * Excel文件路径
   */
  filePath: string;
  /**
   * 输出文件路径
   */
  outputPath?: string;
}

/**
 * 生成Excel选项接口
 */
export interface GenerateExcelOptions {
  /**
   * 输入数据路径或对象
   */
  input: string | I18nMap;
  /**
   * 输出文件路径
   */
  outputPath: string;
}
