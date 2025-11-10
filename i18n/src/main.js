/**
 * 国际化配置管理工程主入口
 */

const path = require("path");
const XLSX = require("xlsx");
const fs = require("fs");

/**
 * 解析Excel文件，提取国际化配置
 * @param {Object} options 解析选项
 * @returns {Object} 国际化配置映射
 */
function parseExcelFile(options) {
  const { filePath, outputPath } = options || {};

  try {
    // 读取Excel文件
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 转换为JSON格式
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      raw: false,
    });

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
        "Last Update Date": row[3],
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
      console.error("发现重复的国际化key:", duplicateKeys);
      throw new Error(`存在重复的国际化key: ${duplicateKeys.join(", ")}`);
    }

    // 如果指定了输出路径，写入文件
    if (outputPath) {
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(outputPath, JSON.stringify(i18nMap, null, 2), "utf-8");
      console.log(`国际化配置已输出到: ${outputPath}`);
    }

    return i18nMap;
  } catch (error) {
    console.error("解析Excel文件失败:", error);
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

  items.forEach((item) => {
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
  return items.filter((item) => {
    if (!item.key || seen.has(item.key)) {
      return false;
    }
    seen.add(item.key);
    return true;
  });
}

/**
 * 验证国际化key的唯一性
 * @param {Object} i18nMap 国际化配置映射
 * @returns {boolean} 是否验证通过
 */
function validateUniqueKeys(i18nMap) {
  const keys = Object.keys(i18nMap);
  const uniqueKeys = new Set(keys);

  if (keys.length !== uniqueKeys.size) {
    console.error("存在重复的国际化key");
    return false;
  }

  return true;
}

/**
 * 生成Excel文件
 * @param {Object} options 生成选项
 */
function generateExcelFile(options) {
  const { input, outputPath } = options;

  try {
    let i18nMap;

    // 如果输入是文件路径，则读取文件
    if (typeof input === "string") {
      if (!fs.existsSync(input)) {
        throw new Error(`输入文件不存在: ${input}`);
      }

      const fileContent = fs.readFileSync(input, "utf-8");
      i18nMap = JSON.parse(fileContent);
    } else {
      // 直接使用输入的对象
      i18nMap = input;
    }

    // 构建Excel数据格式
    const headers = ["key", "IContent", "Remark", "Last Update Date"];
    const data = [headers];

    // 将国际化配置转换为Excel行
    Object.entries(i18nMap).forEach(([key, content]) => {
      const row = [key, content, "", new Date().toISOString().split("T")[0]];
      data.push(row);
    });

    // 创建工作簿和工作表
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "i18n");

    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 写入Excel文件
    XLSX.writeFile(workbook, outputPath);
    console.log(`Excel文件已生成: ${outputPath}`);
  } catch (error) {
    console.error("生成Excel文件失败:", error);
    throw error;
  }
}

// 配置文件路径
const EXCEL_INPUT_PATH = path.join(__dirname, "../../i18n/input/i18n.xlsx");
const JSON_OUTPUT_PATH = path.join(__dirname, "../../i18n/output/i18n.json");

/**
 * 主类 - 国际化管理器
 */
class I18nManager {
  /**
   * 解析Excel配置文件
   * @param {string} excelPath Excel文件路径
   * @param {string} outputPath 输出文件路径
   * @returns {Object} 国际化配置映射
   */
  parseExcel(excelPath = EXCEL_INPUT_PATH, outputPath = JSON_OUTPUT_PATH) {
    return parseExcelFile({ filePath: excelPath, outputPath });
  }

  /**
   * 生成Excel配置文件
   * @param {string|Object} input 输入数据路径或对象
   * @param {string} outputPath 输出文件路径
   */
  generateExcel(input, outputPath) {
    generateExcelFile({ input, outputPath });
  }

  /**
   * 验证国际化key的唯一性
   * @param {Object} i18nMap 国际化配置映射
   * @returns {boolean} 是否验证通过
   */
  validateKeys(i18nMap) {
    return validateUniqueKeys(i18nMap);
  }
}

// 创建单例实例
const i18nManager = new I18nManager();

// 导出主管理器实例
module.exports = i18nManager;

// 如果直接运行此文件，执行默认操作
if (require.main === module) {
  console.log("国际化配置管理工程启动");

  try {
    // 默认解析Excel文件
    const i18nMap = i18nManager.parseExcel();
    console.log(`\n已成功解析 ${Object.keys(i18nMap).length} 条国际化配置`);
    console.log("\n使用以下命令进行更多操作:");
    console.log("- yarn parse:excel: 解析Excel配置文件");
    console.log("- yarn generate:excel: 生成Excel配置文件");
    console.log("- yarn test: 运行测试");
  } catch (error) {
    console.error("\n操作失败:", error.message);
  }
}
