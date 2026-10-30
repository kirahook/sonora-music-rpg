"""Encode real browser screenshots into guide GIFs; never paint or simulate UI.

Frames are captured at an 800x600 CSS viewport. The embedded browser sometimes
exports 785x589 content when a scrollbar is present. Retain every captured pixel
and add only an ivory letterbox to the shared 800x600 export canvas. No cropping,
rescaling, UI painting, cursor drawing or generated interpolation is performed.
GIF palette quantization is intrinsic to the format; WebP stills are lossless.
Requires Pillow for asset-authoring only, not for the web runtime.
"""
import argparse
import json
from pathlib import Path
from PIL import Image


def encode(manifest_path, destination):
    manifest = json.loads(Path(manifest_path).read_text(encoding="utf-8"))
    destination = Path(destination).resolve()
    destination.mkdir(parents=True, exist_ok=True)
    result = []
    for clip in manifest["clips"]:
        clip_id = clip["id"]
        if not clip_id.isalpha():
            raise ValueError("Unexpected clip id")
        if len(clip["frames"]) != 4:
            raise ValueError("Each chapter needs four captured keyframes")
        raw = [Image.open(f["path"]).convert("RGB") for f in clip["frames"]]
        images = []
        for im in raw:
            if im.size not in [(800,600),(785,589)]:
                raise ValueError("Unexpected native capture geometry; do not resize UI")
            canvas = Image.new("RGB", (800,600), "#f6f4eb")
            canvas.paste(im, ((800-im.width)//2,(600-im.height)//2))
            images.append(canvas)
        for i, im in enumerate(images):
            im.save(destination / f"{clip_id}-{i+1}.webp", lossless=True, method=6)
        images[0].save(destination / f"{clip_id}-poster.webp", lossless=True, method=6)
        durations = [max(300, min(5000, int(f.get("duration", 1700)))) for f in clip["frames"]]
        indexed = [im.quantize(colors=192, method=Image.Quantize.MEDIANCUT) for im in images]
        gif_path = destination / f"{clip_id}.gif"
        indexed[0].save(gif_path, save_all=True, append_images=indexed[1:], duration=durations, loop=0, disposal=2, optimize=False)
        with Image.open(gif_path) as check:
            frame_count = check.n_frames
            if frame_count < 3:
                raise ValueError(f"{clip_id}: captured actions do not show enough distinct states")
        result.append({"id": clip_id, "width": images[0].width, "height": images[0].height, "frames": frame_count, "durationMs": sum(durations), "bytes": gif_path.stat().st_size, "captureSizes": [list(im.size) for im in raw], "labels": [f["label"] for f in clip["frames"]], "source": "Real browser keyframes from an independent demo save; holds compressed, no audio. Native pixels preserved; ivory letterbox only."})
    (destination / "recording-manifest.json").write_text(json.dumps({"version": 25, "clips": result}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest")
    parser.add_argument("destination")
    args = parser.parse_args()
    encode(args.manifest, args.destination)
