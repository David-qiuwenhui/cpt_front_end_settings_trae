import * as XLSX from 'xlsx';
import { I18nItem, I18nMap, ParseExcelOptions } from '../types';
import { uniqBy } from 'lodash-es';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 解析Excel文件，提取国际化配置
 * @param options 解析选项
 * @returns 国际化配置映射
 */
export const parseExcelFile = (options: ParseExcelOptions): I18nMap => {
  const { filePath, outputPath } = options;
  
  try {
    // 读取Excel文件
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // 转换为JSON格式
    const jsonData: I18nItem[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as unknown as I18nItem[];
    
    // 提取表头和数据
    const headers = jsonData[0];
    const dataRows = jsonData.slice(1);
    
    // 构建国际化配置对象
    const i18nMap: I18nMap = {};
    const allItems: I18nItem[] = [];
    
    dataRows.forEach((row: any[]) => {
      const item: I18nItem = {
        key: row[0],
        IContent: row[1],
        Remark: row[2],
        'Last Update Date': row[3]
      };
      
      // 验证必填字段
      if (!item.key || !item.IContent) {
        console.warn(`行数据不完整，跳过: ${JSON.stringify(row)}`);
        return;
      }
      
      allItems.push(item);
      i18nMap[item.key] = item.IContent;
    });
    
    // 检查key重复
    const uniqueItems = uniqBy(allItems, 'key');
    if (uniqueItems.length !== allItems.length) {
      const duplicateKeys = findDuplicateKeys(allItems);
      console.error('发现重复的国际化key:', duplicateKeys);
      throw new Error(`存在重复的国际化key: ${duplicateKeys.join(', ')}`);
    }
    
    // 如果指定了输出路径，写入文件
    if (outputPath) {
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, JSON.stringify(i18nMap, null, 2), 'utf-8');
      console.log(`国际化配置已输出到: ${outputPath}`);
    }
    
    return i18nMap;
  } catch (error) {
    console.error('解析Excel文件失败:', error);
    throw error;
  }
};

/**
 * 查找重复的key
 * @param items 国际化配置项数组
 * @returns 重复的key数组
 */
export const findDuplicateKeys = (items: I18nItem[]): string[] => {
  const keyCount: { [key: string]: number } = {};
  const duplicates: string[] = [];
  
  items.forEach(item => {
    if (item.key) {
      keyCount[item.key] = (keyCount[item.key] || 0) + 1;
      if (keyCount[item.key] === 2) {
        duplicates.push(item.key);
      }
    }
  });
  
  return duplicates;
};

/**
 * 验证国际化key的唯一性
 * @param i18nMap 国际化配置映射
 * @returns 是否验证通过
 */
export const validateUniqueKeys = (i18nMap: I18nMap): boolean => {
  const keys = Object.keys(i18nMap);
  const uniqueKeys = new Set(keys);
  
  if (keys.length !== uniqueKeys.size) {
    console.error('存在重复的国际化key');
    return false;
  }
  
  return true;
};
