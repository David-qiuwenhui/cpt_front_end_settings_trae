# 国际化配置管理工程

一个用于管理前端国际化配置的工程，支持Excel格式和代码化配置之间的相互转换，并提供Git版本追踪和自动化校验功能。

## ✨ 特性

- 📊 **Excel解析**：将Excel格式的国际化配置转换为JSON/JS格式
- 📝 **代码化管理**：通过代码对国际化内容进行新增、编辑、修改和删除
- 🔄 **双向转换**：支持从代码配置反向生成Excel表格
- 🔍 **唯一性校验**：自动检测和提示重复的国际化key
- 🧪 **单元测试**：使用Vitest进行核心逻辑的测试覆盖
- 🛡️ **提交前校验**：通过husky确保提交的代码符合规范
- 📦 **模块化设计**：清晰的目录结构和函数分层

## 📁 目录结构

```
cpt_front_end_settings_trae/
├── i18n/
│   ├── input/             # 输入文件目录
│   │   └── i18n.xlsx      # 原始Excel国际化配置
│   ├── output/            # 输出文件目录
│   │   ├── i18n.json      # 生成的JSON配置
│   │   └── generated_i18n.xlsx  # 反向生成的Excel
│   └── src/               # 源代码
│       ├── utils/         # 工具函数
│       ├── scripts/       # 脚本命令
│       ├── types/         # TypeScript类型定义
│       └── main.js        # 工程入口
├── .husky/                # Git钩子配置
├── tsconfig.json          # TypeScript配置
└── package.json           # 项目配置和依赖
```

## 🚀 快速开始

### 安装依赖

```bash
yarn install
```

### 初始化husky

```bash
yarn prepare
chmod +x .husky/pre-commit
```

### 基本命令

#### 1. 解析Excel配置

将Excel格式的国际化配置转换为JSON格式：

```bash
yarn parse:excel
```

#### 2. 生成Excel配置

将JSON格式的国际化配置反向生成Excel格式：

```bash
yarn generate:excel
```

#### 3. 运行测试

```bash
yarn test
```

#### 4. 开发模式运行

```bash
yarn dev
```

## 📋 Excel文件规范

原始Excel文件(`i18n/input/i18n.xlsx`)需要包含以下列：

| 列名 | 类型 | 必填 | 说明 |
|------|------|------|------|
| key | 字符串 | 是 | 国际化键名（唯一） |
| IContent | 字符串 | 是 | 国际化中英文值 |
| Remark | 字符串 | 否 | 国际化维护人信息 |
| Last Update Date | 日期 | 否 | 最后更新日期 |

## 🔧 使用API

可以在代码中直接使用国际化管理器：

```javascript
const i18nManager = require('./i18n/src/main');

// 解析Excel文件
const i18nConfig = i18nManager.parseExcel('path/to/excel.xlsx', 'path/to/output.json');

// 验证国际化key
const isValid = i18nManager.validateKeys(i18nConfig);

// 生成Excel文件
i18nManager.generateExcel(i18nConfig, 'path/to/generated.xlsx');
```

## 🛡️ 自动化校验

项目集成了以下自动化校验机制：

1. **Git提交前校验**：通过husky pre-commit钩子自动运行
   - 检查国际化key的唯一性
   - 执行单元测试

2. **实时提示**：在编辑器中可以通过lint工具提示key重复问题

## ✅ 测试

项目使用Vitest进行单元测试，测试文件位于源代码目录下，以`.test.ts`结尾。

运行测试：
```bash
yarn test
```

监视模式：
```bash
yarn test:watch
```

## 📝 提交规范

提交代码时，husky会自动执行以下检查：

1. 国际化key唯一性校验
2. 单元测试运行

只有通过所有检查的代码才能被成功提交。

## 🔧 开发指南

### 添加新功能

1. 在`i18n/src/utils/`目录下添加新的工具函数
2. 在`i18n/src/types/`目录下定义相关的TypeScript类型
3. 在`i18n/src/scripts/`目录下添加相应的脚本命令
4. 为新功能编写单元测试

### 修改现有功能

1. 修改对应的工具函数或脚本
2. 更新相关的类型定义
3. 确保所有单元测试通过

## 📦 依赖

- **xlsx**：用于Excel文件的读写操作
- **lodash-es**：提供实用的工具函数
- **TypeScript**：静态类型检查
- **Vitest**：单元测试框架
- **husky**：Git钩子工具
- **lint-staged**：暂存文件检查工具

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License
