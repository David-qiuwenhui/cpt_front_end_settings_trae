#!/usr/bin/env node

/**
 * Excel生成脚本
 * 用于将JSON格式的国际化配置转换回Excel格式
 */

const path = require("path");
const XLSX = require("xlsx");
const fs = require("fs");

/**
 * 生成Excel文件
 * @param {Object} options 生成选项
 */
function generateExcelFile(jsonInputPath, excelOutputPath) {
  try {
    // 读取JSON文件
    if (!fs.existsSync(jsonInputPath)) {
      throw new Error(`输入文件不存在: ${jsonInputPath}`);
    }

    const jsonData = fs.readFileSync(jsonInputPath, "utf8");
    const i18nConfig = JSON.parse(jsonData);

    // 创建工作簿
    const workbook = XLSX.utils.book_new();

    // 获取所有语言键
    const languages = Object.keys(i18nConfig);
    if (languages.length === 0) {
      throw new Error("没有找到国际化配置数据");
    }

    // 获取所有翻译键
    const allKeys = Object.keys(i18nConfig[languages[0]] || {});

    // 准备Excel数据
    const excelData = [languages]; // 表头

    // 添加每行数据
    allKeys.forEach((key) => {
      const row = [];
      languages.forEach((lang) => {
        row.push(i18nConfig[lang]?.[key] || "");
      });
      excelData.push(row);
    });

    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, "i18n");

    // 确保输出目录存在
    const outputDir = path.dirname(excelOutputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 写入Excel文件
    XLSX.writeFile(workbook, excelOutputPath);
    console.log(`Excel文件已生成: ${excelOutputPath}`);
  } catch (error) {
    console.error("生成Excel文件失败:", error);
    throw error;
  }
}

// 配置文件路径
const JSON_INPUT_PATH = path.join(__dirname, "../../output/i18n.json");
const EXCEL_OUTPUT_PATH = path.join(__dirname, "../../output/i18n.xlsx");

/**
 * 主函数
 */
async function main() {
  try {
    console.log("开始生成Excel国际化配置...");

    generateExcelFile(JSON_INPUT_PATH, EXCEL_OUTPUT_PATH);

    console.log(`Excel文件生成完成！`);
    console.log(`Excel文件已保存至: ${EXCEL_OUTPUT_PATH}`);

    process.exit(0);
  } catch (err) {
    console.error(
      "生成失败:",
      err instanceof Error ? err.message : String(err)
    );
    process.exit(1);
  }
}

// 执行主函数
main();
