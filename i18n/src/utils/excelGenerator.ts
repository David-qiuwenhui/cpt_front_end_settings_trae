import * as XLSX from 'xlsx';
import { I18nMap, GenerateExcelOptions, I18nItem } from '../types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 生成Excel文件
 * @param options 生成选项
 */
export const generateExcelFile = (options: GenerateExcelOptions): void => {
  const { input, outputPath } = options;
  
  try {
    let i18nMap: I18nMap;
    
    // 如果输入是文件路径，则读取文件
    if (typeof input === 'string') {
      if (!fs.existsSync(input)) {
        throw new Error(`输入文件不存在: ${input}`);
      }
      
      const fileContent = fs.readFileSync(input, 'utf-8');
      i18nMap = JSON.parse(fileContent);
    } else {
      // 直接使用输入的对象
      i18nMap = input;
    }
    
    // 构建Excel数据格式
    const headers = ['key', 'IContent', 'Remark', 'Last Update Date'];
    const data: any[][] = [headers];
    
    // 将国际化配置转换为Excel行
    Object.entries(i18nMap).forEach(([key, content]) => {
      const row: any[] = [key, content, '', new Date().toISOString().split('T')[0]];
      data.push(row);
    });
    
    // 创建工作簿和工作表
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'i18n');
    
    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 写入Excel文件
    XLSX.writeFile(workbook, outputPath);
    console.log(`Excel文件已生成: ${outputPath}`);
  } catch (error) {
    console.error('生成Excel文件失败:', error);
    throw error;
  }
};

/**
 * 将国际化配置项数组转换为映射
 * @param items 国际化配置项数组
 * @returns 国际化配置映射
 */
export const itemsToMap = (items: I18nItem[]): I18nMap => {
  const map: I18nMap = {};
  
  items.forEach(item => {
    if (item.key && item.IContent) {
      map[item.key] = item.IContent;
    }
  });
  
  return map;
};

/**
 * 将国际化配置映射转换为配置项数组
 * @param i18nMap 国际化配置映射
 * @returns 国际化配置项数组
 */
export const mapToItems = (i18nMap: I18nMap): I18nItem[] => {
  return Object.entries(i18nMap).map(([key, content]) => ({
    key,
    IContent: content,
    'Last Update Date': new Date().toISOString().split('T')[0]
  }));
};
