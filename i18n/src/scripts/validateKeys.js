#!/usr/bin/env node

/**
 * 国际化Key验证脚本
 * 用于验证国际化配置中key的唯一性
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// 获取当前文件和目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// JSON配置文件路径
const JSON_CONFIG_PATH = path.join(__dirname, "../output/i18n.json");

/**
 * 读取并验证国际化配置
 */
function validateI18nKeys() {
  try {
    // 检查配置文件是否存在
    if (!fs.existsSync(JSON_CONFIG_PATH)) {
      console.log("国际化配置文件不存在，跳过验证");
      return true;
    }

    // 读取配置文件
    const configContent = fs.readFileSync(JSON_CONFIG_PATH, "utf-8");
    const i18nMap = JSON.parse(configContent);

    // 验证key唯一性
    const isValid = validateUniqueKeys(i18nMap);

    if (isValid) {
      console.log("国际化Key验证通过，无重复key");
      return true;
    } else {
      console.error("国际化Key验证失败，存在重复key");
      return false;
    }
  } catch (error) {
    console.error("验证国际化配置时出错:", error.message);
    return false;
  }
}

/**
 * 主函数
 */
function main() {
  const isValid = validateI18nKeys();

  if (!isValid) {
    process.exit(1);
  }

  process.exit(0);
}

// 只有当直接运行此文件时才执行主函数
if (import.meta.url === new URL(process.argv[1], import.meta.url).href) {
  main();
}

// 导出函数以便测试
export { validateUniqueKeys, validateI18nKeys };
