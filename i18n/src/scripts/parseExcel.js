#!/usr/bin/env node

/**
 * Excel解析脚本
 * 用于将Excel格式的国际化配置转换为JSON格式
 */

const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');

/**
 * 解析Excel文件，提取国际化配置
 * @param {Object} options 解析选项
 * @returns {Object} 国际化配置映射
 */
function parseExcelFile(options) {
  const { filePath, outputPath } = options;
  
  try {
    // 读取Excel文件
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // 转换为JSON格式
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
    
    // 提取表头和数据
    const headers = jsonData[0];
    const dataRows = jsonData.slice(1);
    
    // 构建国际化配置对象
    const i18nMap = {};
    const allItems = [];
    
    dataRows.forEach((row) => {
      const item = {
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
    const uniqueItems = findUniqueItems(allItems);
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
}

/**
 * 查找重复的key
 * @param {Array} items 国际化配置项数组
 * @returns {Array} 重复的key数组
 */
function findDuplicateKeys(items) {
  const keyCount = {};
  const duplicates = [];
  
  items.forEach(item => {
    if (item.key) {
      keyCount[item.key] = (keyCount[item.key] || 0) + 1;
      if (keyCount[item.key] === 2) {
        duplicates.push(item.key);
      }
    }
  });
  
  return duplicates;
}

/**
 * 查找唯一的项
 * @param {Array} items 项数组
 * @returns {Array} 唯一的项数组
 */
function findUniqueItems(items) {
  const seen = new Set();
  return items.filter(item => {
    if (!item.key || seen.has(item.key)) {
      return false;
    }
    seen.add(item.key);
    return true;
  });
}

// 配置文件路径
const EXCEL_INPUT_PATH = path.join(__dirname, '../../input/i18n.xlsx');
const JSON_OUTPUT_PATH = path.join(__dirname, '../../output/i18n.json');

/**
 * 主函数
 */
async function main() {
  try {
    console.log('开始解析Excel国际化配置...');
    
    const i18nMap = parseExcelFile({
      filePath: EXCEL_INPUT_PATH,
      outputPath: JSON_OUTPUT_PATH
    });
    
    console.log(`解析完成！共解析 ${Object.keys(i18nMap).length} 条国际化配置`);
    console.log(`配置文件已保存至: ${JSON_OUTPUT_PATH}`);
    
    process.exit(0);
  } catch (error) {
    console.error('解析失败:', error.message);
    process.exit(1);
  }
}

// 执行主函数
main();
