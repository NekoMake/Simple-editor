# Simple-editor（简单编辑）

一款基于 Vue 3 + Capacitor 构建的 Android 多格式文本编辑器与阅读器。

支持格式：TXT、Markdown、JSON、TOML、YAML。

---

## 功能特性

- Material 3 Expressive 界面，自适应手机与平板
- 模块化编辑器系统——每种格式均为独立插件
- TXT 小说阅读器，支持自定义字号、行高、背景色、页边距等
- Markdown 实时预览，含代码块语法高亮
- JSON / TOML / YAML 语法检查与自动补全
- 内部文件管理：文件存储于应用私有目录
- 支持导入外部文件（复制入库）、导出至 Documents 文件夹
- 自定义 TTF 字体安装（阅读与代码编辑均可使用）
- 亮色 / 暗色 / 跟随系统主题，提供多套 M3 配色方案
- 自动保存（1.5 秒防抖）
- 左边缘手势返回

---

## 技术栈

| 层级 | 库 |
|---|---|
| 框架 | Vue 3（Composition API）|
| 状态管理 | Pinia + pinia-plugin-persistedstate |
| 路由 | Vue Router 4 |
| 编辑器 | CodeMirror 6 |
| Markdown 渲染 | marked + marked-highlight + highlight.js |
| YAML 检查 | js-yaml |
| TOML 检查 | smol-toml |
| 原生能力 | Capacitor 6（Filesystem、Share、Haptics）|
| 构建工具 | Vite 6 |

---

## 项目结构

```
src/
  types/          核心 TypeScript 类型定义
  stores/         Pinia 状态（files、theme、settings、ui）
  composables/    可复用逻辑（文件编辑、字体加载、UI 工具）
  editors/        CodeMirror 编辑器模块
    registry.ts   格式模块注册表
    base.ts       公共 CodeMirror 扩展
    langLoader.ts 按文件格式分发语言扩展
    langs/        各格式的语言扩展
  components/
    ui/           Material 3 基础组件
    previews/     TXT 阅读器、Markdown 渲染器、阅读设置面板
    settings/     编辑器设置面板
  views/          页面级视图
  styles/         全局 CSS 与 M3 设计 Token
  router/         Vue Router 配置
  utils/          工具函数
```

---

## 新增格式支持

1. 在 `src/editors/registry.ts` 中添加模块定义
2. 创建 `src/editors/langs/xxxExt.ts`，填写 CodeMirror 扩展
3. 在 `src/editors/langLoader.ts` 中添加对应 `case`

三步即可完成新格式的接入。

---

## 本地开发

```bash
# 安装依赖
npm install --legacy-peer-deps

# 启动开发服务器
npm run dev

# 类型检查
npm run typecheck

# 构建 Web 产物
npm run build
```

---

## 打包 Android APK

详见 [BUILD_ANDROID.md](BUILD_ANDROID.md) 中的完整步骤说明。

一键自动构建脚本：[build_apk.py](build_apk.py)。

---

## 许可证

本项目以 [GNU Affero General Public License v3.0](LICENSE) 开源。


