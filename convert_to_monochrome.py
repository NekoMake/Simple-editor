#!/usr/bin/env python3
"""
将彩色 SVG 图标转换为纯黑色版本，用于 Android 莫奈取色图层
"""

import re
from pathlib import Path

def convert_svg_to_black(input_svg: Path, output_svg: Path) -> None:
    """
    将 SVG 中的所有颜色替换为黑色 #000000
    保留 stroke 和 fill 属性，但改为黑色
    """
    content = input_svg.read_text(encoding='utf-8')
    
    # 替换所有 stroke 颜色为黑色
    content = re.sub(
        r'stroke="#[0-9A-Fa-f]{6}"',
        'stroke="#000000"',
        content
    )
    
    # 替换所有 fill 颜色为黑色（除了 none）
    content = re.sub(
        r'fill="#[0-9A-Fa-f]{6}"',
        'fill="#000000"',
        content
    )
    
    # 处理 RGB/RGBA 格式
    content = re.sub(
        r'stroke="rgb\([^)]+\)"',
        'stroke="#000000"',
        content
    )
    content = re.sub(
        r'fill="rgb\([^)]+\)"',
        'fill="#000000"',
        content
    )
    
    output_svg.write_text(content, encoding='utf-8')
    print(f"✅ 已转换: {input_svg.name} -> {output_svg.name}")
    print(f"   输出路径: {output_svg}")


if __name__ == "__main__":
    # 配置
    PROJECT_ROOT = Path(__file__).parent
    INPUT_SVG = PROJECT_ROOT / "resources" / "icon-only.svg"
    OUTPUT_SVG = PROJECT_ROOT / "resources" / "icon-only-monochrome.svg"
    
    if not INPUT_SVG.exists():
        print(f"❌ 错误: 找不到输入文件 {INPUT_SVG}")
        exit(1)
    
    convert_svg_to_black(INPUT_SVG, OUTPUT_SVG)
    
    print("\n📝 下一步:")
    print("1. 检查生成的 icon-only-monochrome.svg")
    print("2. 使用以下方法转换为 Vector Drawable:")
    print("   - Android Studio: File -> New -> Vector Asset -> Local file")
    print("   - 在线工具: https://svg2vector.com/")
    print("3. 或使用下面的脚本自动转换")
