# 莫奈取色图标配置快速指南

## 第一步：准备 Monochrome 图标

你需要将彩色图标转换为纯黑色，然后转换为 Android Vector Drawable 格式。

### 转换为黑色（必需步骤）

**快速方法**：我已经为你创建了黑色版本
- ✅ `resources/icon-only-monochrome.svg` - 已生成的黑色版本
- ✅ `convert_to_monochrome.py` - 自动转换脚本（如需修改）

**自动转换命令**（如果需要重新生成）：
```bash
python convert_to_monochrome.py
```

### 方法一：使用 Android Studio（推荐）
1. 打开 Android Studio
2. 选择 `File` -> `New` -> `Vector Asset`
3. 选择 `Local file (SVG, PSD)`
4. 点击路径选择，选择 `resources/icon-only-monochrome.svg` ⚠️ 注意用黑色版本
5. 设置 Name 为 `ic_launcher_monochrome`
6. 设置 Size 为 `108dp x 108dp`
7. ✅ 颜色已经是黑色，无需修改
8. 点击 `Next` -> `Finish`
9. 将生成的 XML 复制到 `resources/icon-configs/` 各个 mipmap 目录

### 方法二：使用在线工具
访问 https://svg2vector.com/
- 上传 `icon-only-monochrome.svg` ⚠️ 使用黑色版本
- 下载转换后的 XML
- 确认 `fillColor="#000000"` 和 `strokeColor="#000000"`
- 重命名为 `ic_launcher_monochrome.xml`

### 方法三：使用模板
我已经创建了 `ic_launcher_monochrome.xml.template`，你可以：
1. 手动提取 SVG 的 path data
2. 替换模板中的 `android:pathData` 属性值
3. 删除 `.template` 后缀

## 第二步：放置文件

创建好 `ic_launcher_monochrome.xml` 后，将它放到：
```
resources/icon-configs/mipmap-anydpi-v26/ic_launcher_monochrome.xml
resources/icon-configs/mipmap-hdpi/ic_launcher_monochrome.xml
resources/icon-configs/mipmap-mdpi/ic_launcher_monochrome.xml
resources/icon-configs/mipmap-xhdpi/ic_launcher_monochrome.xml
resources/icon-configs/mipmap-xxhdpi/ic_launcher_monochrome.xml
resources/icon-configs/mipmap-xxxhdpi/ic_launcher_monochrome.xml
```

**注意**：对于 Vector Drawable，所有密度的文件内容都可以相同（直接复制）。

## 第三步：构建 APK

运行构建脚本：
```bash
python build_apk.py
```

脚本会自动：
1. 构建 Web 资源
2. 同步 Capacitor
3. **复制你的自定义图标配置**（包括莫奈取色配置）
4. 构建 APK

## 第四步：在设备上测试

1. 安装 APK 到 Android 12+ 设备
2. 长按应用图标 -> 选择"壁纸和样式"
3. 启用"主题图标"或"Material You 图标"
4. 图标会跟随系统主题色变化 🎨

## 文件结构示例

```
Simple-editor/
├── convert_to_monochrome.py              # ✅ 新增：自动转换脚本
└── resources/
    ├── icon-only.svg                     # 原始彩色图标（你已有）
    ├── icon-only-monochrome.svg          # ✅ 新增：黑色版本
    ├── icon-background.svg               # 背景（已有）
    └── icon-configs/                     # 新增：自定义配置目录
        ├── README.md
        ├── SETUP_GUIDE.md                # 本文件
        ├── ic_launcher_monochrome.xml.template
        └── mipmap-anydpi-v31/
            ├── ic_launcher.xml           # ✅ 已创建
            └── ic_launcher_round.xml     # ✅ 已创建
```

## 常见问题

### Q: 我的图标不是黑色的，怎么转换？
A: 我已经为你准备了解决方案：
1. ✅ 已自动生成黑色版本：`resources/icon-only-monochrome.svg`
2. 🔧 如需重新生成：运行 `python convert_to_monochrome.py`
3. 🎨 手动方法：用任何 SVG 编辑器（Inkscape、Figma）打开原图标，将所有元素颜色改为 `#000000`

### Q: 为什么必须是纯黑色？
A: Android 系统的莫奈取色引擎会读取黑色图层（#000000），然后根据壁纸主题自动着色。如果用其他颜色，系统无法正确识别和处理。

### Q: 为什么需要 monochrome 图层？
A: Android 12+ 的莫奈取色功能需要一个单色图层，系统会根据壁纸主题自动给它着色。

### Q: 是否必须手动放置所有密度的图标？
A: Vector Drawable 格式的图标可以自动缩放，所有密度使用同一个文件即可。但为了最佳效果，可以为不同密度提供优化的位图。

### Q: 图标不跟随主题变化？
A: 确保：
1. 设备是 Android 12+ (API 31+)
2. 系统设置中启用了"主题图标"
3. mipmap-anydpi-v31 文件夹被正确复制
4. monochrome 图层的颜色是纯黑 #000000

### Q: cap sync 会覆盖我的配置吗？
A: 不会！build_apk.py 脚本会在 cap sync **之后**复制你的自定义配置，确保不被覆盖。
