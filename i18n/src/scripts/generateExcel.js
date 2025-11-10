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
const JSON_INPUT_PATH = path.join(__dirname, "../../output/i18n.json");
const EXCEL_OUTPUT_PATH = path.join(__dirname, "../../output/i18n.xlsx");

/**
 * 主函数
 */
async function main() {
  try {
    console.log("开始生成Excel国际化配置...");

    generateExcelFile({
      input: JSON_INPUT_PATH,
      outputPath: EXCEL_OUTPUT_PATH,
    });

    console.log(`Excel文件生成完成！`);
    console.log(`Excel文件已保存至: ${EXCEL_OUTPUT_PATH}`);

    process.exit(0);
  } catch (error) {
    console.error("生成失败:", error.message);
    process.exit(1);
  }
}

// 执行主函数
main();
