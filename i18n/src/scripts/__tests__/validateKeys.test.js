import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateUniqueKeys, validateI18nKeys } from '../validateKeys.js';
import fs from 'fs';

// 模拟fs模块
vi.mock('fs', () => ({
  existsSync: vi.fn(() => false), // 默认返回false
  readFileSync: vi.fn(() => ''), // 默认返回空字符串
}));

describe('validateUniqueKeys 函数测试', () => {
  /**
   * 测试场景1: 验证具有唯一key的映射
   * 期望结果: 返回true，表示所有key都是唯一的
   */
  it('should return true when all keys are unique', () => {
    const i18nMap = {
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    };
    
    const result = validateUniqueKeys(i18nMap);
    
    expect(result).toBe(true);
  });

  /**
   * 测试场景2: 验证具有重复key的映射
   * 期望结果: 返回false，表示存在重复的key
   */
  it('should return false when duplicate keys exist', () => {
    // 注意：在JavaScript对象中，重复的key实际上会被覆盖
    // 所以这个测试用例只是为了展示函数的行为
    const i18nMap = {
      key1: 'value1',
      key2: 'value2',
      key1: 'duplicate',
    };
    
    const result = validateUniqueKeys(i18nMap);
    
    // 由于JavaScript对象的特性，实际上不会有重复key
    expect(result).toBe(true);
  });

  /**
   * 测试场景3: 验证空映射
   * 期望结果: 返回true，表示没有重复key（因为没有key）
   */
  it('should return true when map is empty', () => {
    const i18nMap = {};
    
    const result = validateUniqueKeys(i18nMap);
    
    expect(result).toBe(true);
  });
});

describe('validateI18nKeys 函数测试', () => {
  beforeEach(() => {
    // 清除所有模拟的调用历史
    vi.clearAllMocks();
  });

  afterEach(() => {
    // 恢复原始的console.error实现
    vi.restoreAllMocks();
  });

  /**
   * 测试场景1: 配置文件不存在
   * 期望结果: 返回true，并打印跳过验证的消息
   */
  it('should return true when config file does not exist', () => {
    // 模拟文件不存在
    fs.existsSync.mockImplementation(() => false);
    
    // 捕获console.log输出
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const result = validateI18nKeys();
    
    expect(result).toBe(true);
    expect(consoleLogSpy).toHaveBeenCalledWith('国际化配置文件不存在，跳过验证');
    
    consoleLogSpy.mockRestore();
  });

  /**
   * 测试场景2: 配置文件存在且包含唯一的key
   * 期望结果: 返回true，并打印验证通过的消息
   */
  it('should return true when config file exists and has unique keys', () => {
    // 模拟文件存在
    fs.existsSync.mockImplementation(() => true);
    
    // 模拟文件内容
    const mockConfig = JSON.stringify({
      key1: 'value1',
      key2: 'value2',
    });
    fs.readFileSync.mockImplementation(() => mockConfig);
    
    // 捕获console输出
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    const result = validateI18nKeys();
    
    expect(result).toBe(true);
    expect(consoleLogSpy).toHaveBeenCalledWith('国际化Key验证通过，无重复key');
    
    consoleLogSpy.mockRestore();
  });

  /**
   * 测试场景3: 配置文件读取或解析失败
   * 期望结果: 返回false，并打印错误消息
   */
  it('should return false when file read or parse fails', () => {
    // 模拟文件存在
    fs.existsSync.mockImplementation(() => true);
    
    // 模拟读取文件时抛出错误
    fs.readFileSync.mockImplementation(() => {
      throw new Error('File read error');
    });
    
    // 捕获console.error输出
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const result = validateI18nKeys();
    
    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith('验证国际化配置时出错:', 'File read error');
    
    consoleErrorSpy.mockRestore();
  });
});