# Android 打包指南

本文档说明将 Simple-editor 构建为可安装 APK 或 AAB 的完整流程。

---

## 前置依赖

### 1. Java 开发工具包（JDK）

需要 17 或 21 版本，推荐 21。

下载地址：https://adoptium.net/

验证安装：

```
java -version
```

预期输出包含 `openjdk 21` 或 `openjdk 17`。

设置 JAVA_HOME 环境变量（Windows）：

```
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-21.x.x.x-hotspot"
```

### 2. Android Studio

下载地址：https://developer.android.com/studio

安装时确保勾选以下 SDK 组件：

- Android SDK Platform 34（API 34）
- Android SDK Build-Tools 34.x.x
- Android SDK Command-line Tools（最新版）
- Android NDK（若需要原生模块）

安装完成后设置环境变量（Windows，路径替换为实际路径）：

```
setx ANDROID_HOME "C:\Users\<你的用户名>\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin"
```

验证：

```
adb version
sdkmanager --version
```

### 3. Node.js

18 或 20 LTS 版本。下载地址：https://nodejs.org/

### 4. Python（可选，用于一键构建脚本）

3.8 或更高版本。下载地址：https://www.python.org/

---

## 首次初始化

### 第一步 — 安装项目依赖

```
cd path\to\Simple-editor
npm install --legacy-peer-deps
```

### 第二步 — 初始化 Capacitor（仅需一次）

若 `android` 文件夹不存在：

```
npx cap init SimpleEditor com.simpleeditor.app --web-dir dist
npx cap add android
```

若 `android` 文件夹已存在，跳过此步。

### 第三步 — 配置 Android 权限

打开 `android/app/src/main/AndroidManifest.xml`，在 `<manifest>` 标签内添加：

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
    android:maxSdkVersion="29" />
<uses-permission android:name="android.permission.READ_MEDIA_DOCUMENTS" />
```

### 第四步 — 设置最低 SDK 版本

打开 `android/variables.gradle`，确认或修改为：

```
minSdkVersion = 22
compileSdkVersion = 34
targetSdkVersion = 34
```

---

## 构建 APK

### 方式 A — 使用自动化 Python 脚本

```
python build_apk.py
```

可用参数见脚本注释。

### 方式 B — 手动步骤

#### 1. 构建 Web 产物

```
npm run build
```

#### 2. 同步 Web 产物至 Android 项目

```
npx cap sync android
```

#### 3. 构建调试 APK

进入 `android` 目录：

Windows：
```
cd android
gradlew.bat assembleDebug
```

macOS / Linux：
```
cd android
./gradlew assembleDebug
```

输出路径：
```
android/app/build/outputs/apk/debug/app-debug.apk
```

#### 4. 构建发布 APK（未签名）

```
gradlew.bat assembleRelease
```

输出路径：
```
android/app/build/outputs/apk/release/app-release-unsigned.apk
```

---

## 签名发布 APK

### 第一步 — 生成密钥库（仅需一次）

```
keytool -genkeypair -v -keystore simpleeditor.jks -alias simpleeditor -keyalg RSA -keysize 2048 -validity 10000
```

请妥善保管密钥库文件及密码，不要将其提交至版本控制。

### 第二步 — 在 Gradle 中配置签名

创建或编辑 `android/app/release.jks.properties`（不要提交此文件）：

```
storeFile=../../simpleeditor.jks
storePassword=你的密钥库密码
keyAlias=simpleeditor
keyPassword=你的密钥密码
```

编辑 `android/app/build.gradle`，添加签名配置：

```groovy
android {
    signingConfigs {
        release {
            def keystorePropsFile = rootProject.file("app/release.jks.properties")
            def keystoreProps = new Properties()
            keystoreProps.load(new FileInputStream(keystorePropsFile))
            storeFile file(keystoreProps["storeFile"])
            storePassword keystoreProps["storePassword"]
            keyAlias keystoreProps["keyAlias"]
            keyPassword keystoreProps["keyPassword"]
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

然后构建：

```
gradlew.bat assembleRelease
```

### 第三步 — 构建 AAB 用于 Google Play

```
gradlew.bat bundleRelease
```

输出：`android/app/build/outputs/bundle/release/app-release.aab`

---

## 安装到设备

在设备上开启 USB 调试，通过 USB 连接后：

```
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

也可通过文件管理器将 APK 直接拖拽至设备进行安装。

---

## 常见问题排查

**Gradle 构建报 "SDK not found"**

确保 ANDROID_HOME 配置正确，且 `android/local.properties` 中存在：

```
sdk.dir=C:\\Users\\<你的用户名>\\AppData\\Local\\Android\\Sdk
```

**报错 JAVA_HOME 未设置**

JAVA_HOME 应指向 JDK 根目录，而非 `bin` 子目录。

**cap sync 失败**

先运行 `npm run build` 生成 `dist` 文件夹，再执行 `npx cap sync android`。

**应用启动时崩溃**

通过 logcat 检查错误：

```
adb logcat | findstr "SimpleEditor"
```

**Filesystem 插件权限被拒绝**

检查存储权限上的 `android:maxSdkVersion` 属性是否与设备 Android 版本匹配。

---

## 最低支持 Android 版本

Android 5.1（API 22）
