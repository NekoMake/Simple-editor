# 图标资源配置说明

此目录包含 Android 应用图标的配置文件，这些文件在构建时会自动复制到 `android/app/src/main/res/` 目录。

## 目录结构

- `mipmap-anydpi-v31/` - Android 12+ (API 31+) 的莫奈取色图标配置
  - 包含 `monochrome` 图层，使图标能够跟随系统 Material You 主题色变化

## 莫奈取色图标

要使用莫奈取色图标，需要准备以下资源：

1. **ic_launcher_foreground** - 前景图层（彩色版本）
2. **ic_launcher_background** - 背景图层（纯色或图案）
3. **ic_launcher_monochrome** - 单色图层（用于莫奈取色）

### 如何准备 monochrome 图层

单色图层应该是：
- 单一颜色的矢量图（通常是黑色 #000000）
- 使用 Vector Drawable 格式（.xml）
- 形状应该与前景图层相同或相似
- 系统会自动应用莫奈取色来改变颜色

### 示例

你可以将 `icon-only.svg` 转换为 Vector Drawable 并命名为 `ic_launcher_monochrome.xml`，放置在各个 mipmap 目录中。

或者使用 Android Studio 的 Image Asset Studio 工具自动生成所有密度的图标。

## 构建流程

运行 `python build_apk.py` 时，脚本会自动：
1. 将此目录下的配置文件复制到 `android/app/src/main/res/`
2. 保持这些自定义配置不被 Capacitor 覆盖

## 测试

在 Android 12+ 设备上：
1. 长按应用图标
2. 选择"壁纸和样式"或"主题"
3. 启用"主题图标"选项
4. 图标应该会跟随系统主题色变化
