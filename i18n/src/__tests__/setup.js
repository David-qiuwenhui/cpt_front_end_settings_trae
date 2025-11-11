/**
 * Vitest 全局测试设置文件
 * 在所有测试运行前执行的全局设置和配置
 */

import { vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// 设置全局超时时间
const TEST_TIMEOUT = 10000;

/**
 * 全局测试前置设置
 */
beforeAll(() => {
  console.log('🔧 全局测试设置已初始化');
});

/**
 * 全局测试后置清理
 */
afterAll(() => {
  vi.restoreAllMocks();
  console.log('✅ 全局测试清理已完成');
});

/**
 * 在每个测试前重置状态
 */
beforeEach(() => {
  vi.clearAllMocks();
});

/**
 * 在每个测试后清理
 */
afterEach(() => {
  // 清理测试创建的临时文件
  cleanupTestFiles();
});

/**
 * 清理测试文件的工具函数
 */
function cleanupTestFiles() {
  const testOutputDir = path.join(process.cwd(), 'test-output');
  
  if (fs.existsSync(testOutputDir)) {
    try {
      const files = fs.readdirSync(testOutputDir);
      files.forEach(file => {
        const filePath = path.join(testOutputDir, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.warn('⚠️ 清理测试文件时出现警告:', error.message);
    }
  }
}

/**
 * 创建测试数据
 * 用于单元测试的模拟数据
 */
export function createTestData() {
  return {
    // 模拟I18n数据
    mockI18nData: {
      'hello': 'Hello',
      'world': 'World',
      'user.name': 'User Name',
      'nav.item_1': 'Navigation Item 1',
      'button.ok': 'OK',
      'button.cancel': 'Cancel'
    },
    
    // 模拟Excel行数据
    mockExcelRows: [
      { key: 'hello', IContent: 'Hello', Remark: 'Greeting', 'Last Update Date': '2023-12-01' },
      { key: 'world', IContent: 'World', Remark: 'Planet', 'Last Update Date': '2023-12-01' },
      { key: 'user.name', IContent: 'User Name', Remark: 'User field', 'Last Update Date': '2023-12-01' }
    ]
  };
}

/**
 * 扩展expect匹配器
 * 用于更灵活的断言
 */
expect.extend({
  /**
   * 验证是否为有效的国际化key
   */
  toBeValidI18nKey(received) {
    const pass = /^[a-zA-Z0-9._-]+$/.test(received);
    return {
      pass,
      message: () => pass 
        ? `expected ${received} not to be a valid i18n key`
        : `expected ${received} to be a valid i18n key`
    };
  }
});

// 导出工具函数
export {
  TEST_TIMEOUT,
  createTestData
};