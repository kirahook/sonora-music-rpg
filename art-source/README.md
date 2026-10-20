# Sonora holographic card source

The website uses a lazy-loaded Three.js/WebGL material, not a playing video or a CSS rainbow placed over a flat cover.

The editable Blender rebuild script produces six real beveled card meshes, separated background and true-alpha foreground image planes, camera-local view-vector UV offset nodes, image-height bump, view-dependent spectral color and thin-film metallic stock. All six original image pairs are packed into the saved scene. The small 3D metadata labels are editable text objects.

Run with official Blender 5.2 LTS:

    blender --background --factory-startup --python art-source/build_holo_cards.py -- --output /absolute/output/sonora-holo-cards.blend --render /absolute/output/material-preview.png

The artist/guardian imagery is fictional genre symbolism, not an actual musician portrait or obtainable equipment. The Blender scene and web shader use equivalent material principles, not binary-identical rendering engines. The browser is intentionally lightweight and offers a static-art fallback on devices without WebGL.

Reference: [original Blender parallax/laser-foil tutorial](https://www.bilibili.com/video/BV1M95H62E4P/). Its video and existing character model are not copied or redistributed.

V16 web card layouts now distinguish vinyl album objects, ivory creator dossiers and blue listening folios. The V15 Blender scene remains a material-source study; it has not been regenerated to claim identical V16 layouts.

`compress_ui_fonts.py --source-dir /path/to/official-ttfs` wraps the official NotoSansSC-Variable.ttf and SpaceGrotesk-Variable.ttf in WOFF2 without modifying or subsetting glyphs. Install fonttools[woff] in an isolated tooling environment. Original download URLs and licenses are recorded in NOTICE.md; tooling and original TTF downloads are not bundled in the site.
