# 国际化项目单元测试文档

本文档说明了如何使用 Vitest 框架对国际化项目进行单元测试。

## 目录结构

```
i18n/src/
├── __tests__/
│   ├── setup.js              # 全局测试设置
│   ├── main.test.js          # 主模块测试
│   └── types.test.js         # 类型定义测试
├── scripts/
│   ├── __tests__/
│   │   ├── validateKeys.test.js    # 验证键唯一性测试
│   │   ├── parseExcel.test.js      # 解析Excel测试
│   │   └── generateExcel.test.js   # 生成Excel测试
│   ├── main.js               # 主模块
│   ├── parseExcel.js         # 解析Excel脚本
│   ├── generateExcel.js      # 生成Excel脚本
│   └── validateKeys.js       # 验证键脚本
├── types/
│   └── index.js              # 类型定义
└── utils/                    # 工具函数（预留）
```

## 测试命令

### 基础测试命令

```bash
# 运行所有测试
yarn test

# 监视模式运行测试
yarn test:watch

# 一次性运行所有测试
yarn test:run

# 详细输出模式
yarn test:verbose
```

### 分类测试命令

```bash
# 只运行主模块测试
yarn test:main

# 只运行脚本测试
yarn test:scripts

# 运行测试并生成覆盖率报告
yarn test:coverage

# 运行测试UI界面（如果已安装@vitest/ui）
yarn test:ui
```

### 使用 npx 命令

```bash
# 使用npx直接运行vitest
npx vitest

# 运行特定测试文件
npx vitest run src/__tests__/main.test.js

# 运行特定测试套件
npx vitest run --reporter=verbose --testNamePattern="I18nManager"

# 运行测试并生成HTML覆盖率报告
npx vitest run --coverage --reporter=html
```

## 测试文件说明

### 1. main.test.js - 主模块测试

**测试内容：**

- I18nManager 类的方法测试
- 辅助函数测试
- 错误处理测试
- 边界情况测试

**测试场景：**

- 正常解析 Excel 文件
- 生成 Excel 文件
- 验证键唯一性
- 文件不存在错误
- JSON 格式错误
- 重复键检测

### 2. parseExcel.test.js - Excel 解析测试

**测试内容：**

- parseExcelFile 函数测试
- findDuplicateKeys 函数测试
- 文件操作测试

**测试场景：**

- 正常解析 Excel 文件
- 空文件处理
- 格式错误处理
- 重复键检测
- 文件路径验证

### 3. generateExcel.test.js - Excel 生成测试

**测试内容：**

- generateExcelFile 函数测试
- Excel 写入测试
- 数据转换测试

**测试场景：**

- 正常生成 Excel 文件
- 输入数据验证
- 文件写入权限
- 特殊字符处理
- 空数据处理

### 4. validateKeys.test.js - 键验证测试

**测试内容：**

- validateUniqueKeys 函数测试
- validateI18nKeys 函数测试
- 文件读取测试

**测试场景：**

- 键唯一性验证
- 键格式验证
- 文件读取错误
- 重复键错误处理

### 5. types.test.js - 类型定义测试

**测试内容：**

- 类型定义验证
- 常量验证
- 接口结构测试

**测试场景：**

- 错误类型常量
- 默认配置常量
- 验证规则
- 接口结构
- 边界情况

### 6. setup.js - 全局测试设置

**功能：**

- 测试环境配置
- 模拟函数设置
- 工具函数提供
- 自定义匹配器

**主要工具：**

- createMockFileSystem() - 创建模拟文件系统
- createMockXlsxModule() - 创建模拟 XLSX 模块
- createTestData() - 创建测试数据
- sleep(ms) - 异步等待函数

## 测试配置

### vitest.config.js 配置说明

```javascript
export default defineConfig({
  test: {
    environment: "node", // Node.js环境
    root: "./i18n", // 测试根目录
    include: ["**/__tests__/**/*.test.js"], // 测试文件匹配模式
    exclude: ["node_modules", "dist"], // 排除目录

    // 覆盖率配置
    coverage: {
      provider: "v8", // 覆盖率提供者
      reporter: ["text", "json", "html"], // 报告格式
      thresholds: {
        // 覆盖率阈值
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },

    // 其他配置...
  },
});
```

## 测试最佳实践

### 1. 测试命名

- 使用描述性的测试名称
- 按照"应该..."的格式编写
- 包含测试的具体场景

```javascript
it("应该正确解析有效的Excel文件并返回I18n映射", () => {
  // 测试代码
});
```

### 2. AAA 模式

- **Arrange（安排）**: 设置测试数据和环境
- **Act（执行）**: 执行被测试的函数
- **Assert（断言）**: 验证结果

```javascript
it("应该正确处理重复键并抛出错误", () => {
  // Arrange
  const duplicateData = {
    hello: "Hello",
    hello: "Hello World", // 重复键
  };

  // Act & Assert
  expect(() => findDuplicateKeys(duplicateData)).toThrow(
    "发现重复的国际化键: hello"
  );
});
```

### 3. 模拟依赖

使用 Vitest 的 vi 对象模拟外部依赖：

```javascript
import { vi } from "vitest";

// 模拟fs模块
vi.mock("fs", () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
}));

// 模拟xlsx模块
vi.mock("xlsx", () => ({
  utils: {
    json_to_sheet: vi.fn(),
    sheet_to_json: vi.fn(),
  },
  writeFile: vi.fn(),
  readFile: vi.fn(),
}));
```

### 4. 测试数据

使用工具函数创建测试数据：

```javascript
import { createTestData } from "../setup.js";

const { mockI18nData, mockExcelRows } = createTestData();
```

### 5. 错误测试

测试错误处理和异常情况：

```javascript
it("应该抛出文件不存在的错误", () => {
  // 模拟文件不存在
  const existsSync = vi.fn(() => false);
  vi.mocked(fs.existsSync).mockImplementation(existsSync);

  expect(() => parseExcelFile("./nonexistent.xlsx")).toThrow(
    "文件不存在: ./nonexistent.xlsx"
  );
});
```

## 持续集成

### GitHub Actions 示例

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: yarn install
      - run: yarn test:coverage
      - uses: codecov/codecov-action@v1
```

### Pre-commit Hooks

在`.husky/pre-commit`中设置：

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

yarn test:run
```

## 覆盖率报告

运行`yarn test:coverage`后，会在`coverage/`目录生成以下报告：

- `index.html` - HTML 格式报告
- `coverage-final.json` - JSON 格式数据
- `lcov.info` - LCOV 格式数据
- 终端输出 - 文本格式报告

## 故障排除

### 常见问题

1. **模块找不到错误**

   - 检查 import 路径
   - 确认文件扩展名
   - 验证模块导出

2. **模拟函数不工作**

   - 检查 vi.mock()调用位置
   - 确认模拟函数名称
   - 验证模拟实现

3. **测试超时**

   - 增加 testTimeout 配置
   - 检查异步操作
   - 确认数据库连接

4. **覆盖率过低**
   - 增加边界情况测试
   - 测试错误处理路径
   - 验证条件分支

### 调试技巧

1. **使用 console.log**

   ```javascript
   it("应该调试测试数据", () => {
     console.log("测试数据:", testData);
     // 测试代码
   });
   ```

2. **使用--reporter=verbose**

   ```bash
   yarn test:verbose
   ```

3. **运行特定测试**
   ```bash
   npx vitest run --testNamePattern="具体测试名称"
   ```

## 贡献指南

1. 添加新功能时，编写相应的测试
2. 修复 bug 时，添加测试确保问题解决
3. 保持测试覆盖率在 80%以上
4. 使用描述性的测试名称
5. 遵循 AAA 测试模式

## 相关链接

- [Vitest 官方文档](https://vitest.dev/)
- [Jest 兼容 API](https://jestjs.io/)
- [测试驱动开发](https://zh.wikipedia.org/wiki/测试驱动开发)
