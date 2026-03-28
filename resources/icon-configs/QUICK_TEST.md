# 莫奈取色图标 - 快速测试指南

## ✅ 已完成的配置

你的莫奈取色图标已经完全配置好了！所有需要的文件都已创建。

### 文件清单

```
resources/icon-configs/
├── ic_launcher_monochrome.xml              # ✅ 主 monochrome 文件
├── mipmap-anydpi-v26/                      # Android 8.0+ (无 monochrome)
│   ├── ic_launcher.xml                     # ✅
│   ├── ic_launcher_round.xml               # ✅
│   └── ic_launcher_monochrome.xml          # ✅
├── mipmap-anydpi-v31/                      # Android 12+ (带 monochrome)
│   ├── ic_launcher.xml                     # ✅ 包含 <monochrome> 标签
│   └── ic_launcher_round.xml               # ✅ 包含 <monochrome> 标签
├── mipmap-hdpi/                            # ✅ 各密度的 monochrome
├── mipmap-mdpi/                            # ✅
├── mipmap-xhdpi/                           # ✅
├── mipmap-xxhdpi/                          # ✅
└── mipmap-xxxhdpi/                         # ✅
```

**已修复问题**：
- ✅ 白色元素已改为黑色 (#FFFFFF → #000000)
- ✅ 尺寸已优化为 108dp x 108dp（Android 规范）
- ✅ 所有密度的 monochrome 文件已创建

## 🚀 立即测试

### 1. 构建 APK
```bash
python build_apk.py
```

脚本会自动：
1. 构建 Web 资源
2. 同步 Capacitor
3. **复制所有图标配置到 android/app/src/main/res/**
4. 构建 APK

### 2. 安装到设备
```bash
python build_apk.py --install
```

### 3. 在设备上启用莫奈取色
**Android 12/13：**
1. 长按桌面空白处
2. 选择"壁纸和样式"
3. 启用"主题图标"或"Themed icons"

**Android 14+：**
1. 设置 → 壁纸和样式
2. 图标主题 → 选择"主题图标"

### 4. 测试效果
- 更换壁纸
- 观察应用图标颜色跟随系统主题变化 🎨

## 📋 预期效果

**Android 12+ 设备（启用主题图标后）：**
- 图标背景会使用系统主题色
- 图标前景会使用你的 monochrome 图层（自动着色）
- 不同壁纸 → 不同主题色 → 图标颜色跟随变化

**Android 8-11 设备：**
- 使用普通自适应图标（foreground + background）
- 不支持莫奈取色，但图标仍正常显示

## 🔍 调试提示

如果图标没有变色：
1. 确认设备是 Android 12+ (API 31+)
2. 确认已启用"主题图标"选项
3. 查看 logcat 是否有图标加载错误
4. 检查 `android/app/src/main/res/mipmap-anydpi-v31/` 是否包含文件

## 🎯 下一步（可选）

你还可以：
1. 调整 monochrome 图标的细节（修改 pathData）
2. 添加不同的背景颜色或图案
3. 为不同密度优化位图资源

---

**一切就绪！运行 `python build_apk.py` 即可测试你的莫奈取色图标！** 🎉
