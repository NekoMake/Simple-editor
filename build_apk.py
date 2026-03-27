#!/usr/bin/env python3
"""
Simple-editor - 一键 Android APK 构建脚本

用法：
    python build_apk.py                   构建调试版 APK
    python build_apk.py --release         构建发布版 APK（未签名）
    python build_apk.py --install         构建调试版 APK 并通过 adb 安装到设备
    python build_apk.py --skip-web        跳过 npm 构建和 cap sync，仅执行 Gradle
    python build_apk.py --open-studio     打开 Android Studio 而非直接构建
    python build_apk.py --clean           构建前先执行 Gradle clean
"""

import argparse
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

# ---------------------------------------------------------------------------
# 配置
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).parent.resolve()
ANDROID_DIR = PROJECT_ROOT / "android"
DIST_DIR = PROJECT_ROOT / "dist"

APK_DEBUG_PATH = ANDROID_DIR / "app/build/outputs/apk/debug/app-debug.apk"
APK_RELEASE_PATH = ANDROID_DIR / "app/build/outputs/apk/release/app-release-unsigned.apk"

OUTPUT_DIR = PROJECT_ROOT / "output"

GRADLEW = ANDROID_DIR / ("gradlew.bat" if sys.platform == "win32" else "gradlew")

# ---------------------------------------------------------------------------
# 工具函数
# ---------------------------------------------------------------------------

def banner(msg: str) -> None:
    print()
    print("=" * 60)
    print(f"  {msg}")
    print("=" * 60)


def step(msg: str) -> None:
    print(f"\n[STEP] {msg}")


def info(msg: str) -> None:
    print(f"  {msg}")


def error(msg: str) -> None:
    print(f"\n[ERROR] {msg}", file=sys.stderr)


def success(msg: str) -> None:
    print(f"\n[OK] {msg}")


def run(cmd: list[str], cwd: Path = PROJECT_ROOT, check: bool = True) -> int:
    info(f"执行: {' '.join(str(c) for c in cmd)}")
    result = subprocess.run(cmd, cwd=str(cwd), shell=(sys.platform == "win32"))
    if check and result.returncode != 0:
        error(f"命令执行失败，退出码：{result.returncode}")
        sys.exit(result.returncode)
    return result.returncode


def check_tool(name: str, args: list[str] | None = None) -> bool:
    """检查工具是否在 PATH 中可访问，返回 True/False。"""
    try:
        subprocess.run(
            args or [name, "--version"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            shell=(sys.platform == "win32"),
        )
        return True
    except FileNotFoundError:
        return False


# ---------------------------------------------------------------------------
# 环境预检
# ---------------------------------------------------------------------------

def preflight() -> None:
    banner("环境预检")

    missing = []

    if not check_tool("node"):
        missing.append("node（https://nodejs.org/）")
    else:
        info("node       已找到")

    if not check_tool("npm"):
        missing.append("npm")
    else:
        info("npm        已找到")

    if not check_tool("java", ["java", "-version"]):
        missing.append("java（推荐 JDK 17 或 21，https://adoptium.net/）")
    else:
        info("java       已找到")

    if not GRADLEW.exists():
        missing.append(
            f"未找到 gradlew：{GRADLEW}，"
            "请先执行：npx cap add android"
        )
    else:
        info("gradlew    已找到")

    android_home = os.environ.get("ANDROID_HOME") or os.environ.get("ANDROID_SDK_ROOT")
    if not android_home:
        missing.append(
            "未设置 ANDROID_HOME 环境变量，"
            "请参阅 BUILD_ANDROID.md 中的配置说明。"
        )
    else:
        info(f"ANDROID_HOME = {android_home}")

    if missing:
        error("以下依赖未满足：")
        for m in missing:
            print(f"  - {m}")
        sys.exit(1)

    success("环境预检全部通过")


# ---------------------------------------------------------------------------
# 构建阶段
# ---------------------------------------------------------------------------

def stage_npm_build() -> None:
    step("构建 Web 产物（npm run build）")
    run(["npm", "run", "build"], cwd=PROJECT_ROOT)
    if not DIST_DIR.exists():
        error("dist/ 目录未生成，npm 构建可能失败。")
        sys.exit(1)
    success("Web 产物构建完成")


def stage_cap_sync() -> None:
    step("同步 Capacitor 资源至 Android 项目（npx cap sync android）")

    if not ANDROID_DIR.exists():
        info("未找到 android/ 目录，正在执行 npx cap add android...")
        run(["npx", "cap", "add", "android"], cwd=PROJECT_ROOT)

    run(["npx", "cap", "sync", "android"], cwd=PROJECT_ROOT)
    success("Capacitor 同步完成")


def stage_gradle_clean() -> None:
    step("清理 Gradle 构建缓存")
    run([str(GRADLEW), "clean"], cwd=ANDROID_DIR)
    success("Gradle clean 完成")


def stage_gradle_build(release: bool = False) -> Path:
    task = "assembleRelease" if release else "assembleDebug"
    label = "发布版" if release else "调试版"
    step(f"构建{label} APK（Gradle 任务：{task}）")

    start = time.time()
    run([str(GRADLEW), task], cwd=ANDROID_DIR)
    elapsed = time.time() - start

    apk_path = APK_RELEASE_PATH if release else APK_DEBUG_PATH

    if not apk_path.exists():
        error(f"未找到预期的 APK 文件：{apk_path}")
        sys.exit(1)

    success(f"Gradle 构建完成，耗时 {elapsed:.1f} 秒")
    return apk_path


def stage_copy_output(apk_path: Path) -> Path:
    step("复制 APK 到 output/ 目录")
    OUTPUT_DIR.mkdir(exist_ok=True)

    timestamp = time.strftime("%Y%m%d_%H%M%S")
    stem = apk_path.stem
    dest = OUTPUT_DIR / f"{stem}_{timestamp}.apk"
    shutil.copy2(apk_path, dest)

    info(f"APK 已保存至：{dest}")
    return dest


def stage_adb_install(apk_path: Path) -> None:
    step("通过 adb 安装 APK")

    if not check_tool("adb"):
        error("未在 PATH 中找到 adb，无法安装。")
        return

    # 检查已连接的设备
    result = subprocess.run(
        ["adb", "devices"],
        capture_output=True,
        text=True,
    )
    lines = [l.strip() for l in result.stdout.splitlines() if l.strip()]
    devices = [l for l in lines[1:] if "device" in l and "offline" not in l]

    if not devices:
        error("未检测到已连接的 Android 设备，请确保设备已开启 USB 调试并通过 USB 连接。")
        return

    info(f"检测到 {len(devices)} 台设备：")
    for d in devices:
        info(f"  {d}")

    run(["adb", "install", "-r", str(apk_path)])
    success("APK 已安装到设备")


def stage_open_studio() -> None:
    step("打开 Android Studio")

    if not ANDROID_DIR.exists():
        error("未找到 android/ 目录，请先执行一次构建以初始化该目录。")
        sys.exit(1)

    if sys.platform == "win32":
        run(["cmd", "/c", "studio64.exe", str(ANDROID_DIR)], check=False)
    elif sys.platform == "darwin":
        run(["open", "-a", "Android Studio", str(ANDROID_DIR)], check=False)
    else:
        run(["studio.sh", str(ANDROID_DIR)], check=False)


# ---------------------------------------------------------------------------
# 入口
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Simple-editor 一键 Android APK 构建脚本",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--release",
        action="store_true",
        help="构建发布版（未签名）APK，默认为调试版",
    )
    parser.add_argument(
        "--install",
        action="store_true",
        help="构建完成后通过 adb 安装到已连接设备",
    )
    parser.add_argument(
        "--skip-web",
        action="store_true",
        help="跳过 npm 构建和 cap sync，仅执行 Gradle",
    )
    parser.add_argument(
        "--clean",
        action="store_true",
        help="构建前先执行 Gradle clean",
    )
    parser.add_argument(
        "--open-studio",
        action="store_true",
        help="打开 Android Studio 而非直接构建",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    banner("Simple-editor APK 构建器")
    info(f"项目根目录：{PROJECT_ROOT}")
    info(f"Android 目录：{ANDROID_DIR}")
    info(f"构建类型：{'发布版' if args.release else '调试版'}")

    if args.open_studio:
        preflight()
        if not args.skip_web:
            stage_npm_build()
            stage_cap_sync()
        stage_open_studio()
        return

    preflight()

    if not args.skip_web:
        stage_npm_build()
        stage_cap_sync()
    else:
        info("已跳过 Web 构建和 cap sync（--skip-web）")

    if args.clean:
        stage_gradle_clean()

    apk_path = stage_gradle_build(release=args.release)
    final_path = stage_copy_output(apk_path)

    if args.install:
        stage_adb_install(final_path)

    banner("构建完成")
    info(f"APK 路径：{final_path}")
    info(f"文件大小：{final_path.stat().st_size / 1024 / 1024:.2f} MB")
    print()


if __name__ == "__main__":
    main()
