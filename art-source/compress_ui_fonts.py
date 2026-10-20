"""Losslessly wrap the official variable TTF sources in web-native WOFF2.

Run with fonttools[woff]. Original TTFs are retained in the task outputs,
not copied into the public deployment along with the compressed files.
"""
from pathlib import Path
import argparse
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--source-dir', type=Path, default=root / 'public' / 'assets')
args = parser.parse_args()
for name in ("NotoSansSC", "SpaceGrotesk"):
    source = args.source_dir / f"{name}-Variable.ttf"
    target = root / 'public' / 'assets' / f'{name}-Variable.woff2'
    font = TTFont(source)
    font.flavor = "woff2"
    font.save(target)
    print(f"{name}: {source.stat().st_size} -> {target.stat().st_size} bytes")
