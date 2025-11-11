import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // 基础配置
    environment: "node",
    root: "./i18n",
    include: ["**/__tests__/**/*.test.js", "**/*.test.js"],
    exclude: ["node_modules", "dist", ".git", ".cache"],

    // 测试报告配置
    reporters: ["default"],

    // 测试超时设置
    testTimeout: 10000,
    hookTimeout: 10000,

    // 全局测试设置
    globals: true,
    setupFiles: ["./src/__tests__/setup.js"],

    // 线程配置
    threads: true,
    maxThreads: 4,
    minThreads: 1,

    // 失败重试次数
    retry: 1,

    // 详细输出
    silent: false,
    logHeapUsage: true,

    // 模拟设置
    mockReset: true,
  },
});
