"""Rebuild the actual Blender scene behind Sonora's six holographic card themes.

Run with official Blender 5.2 LTS, --background --factory-startup --python this.py.
No add-ons, downloads, external models, accounts, or user-save access.
"""
import argparse
import math
import sys
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public" / "assets"
THEMES = [
    ("BRASS CONSTELLATION", "Blue Train", "John Coltrane / 1957", "01-02", 0, (0.56, 0.35, 0.12)),
    ("CRYSTAL FREQUENCY", "Computer World", "Kraftwerk / 1981", "01-02", 1, (0.31, 0.63, 0.76)),
    ("TAPE NOCTURNE", "Dummy", "Portishead / 1994", "03-04", 0, (0.43, 0.28, 0.57)),
    ("GLASS REVERIE", "Heaven or Las Vegas", "Cocteau Twins / 1990", "03-04", 1, (0.65, 0.43, 0.37)),
    ("OBSIDIAN ANTHEM", "The Wall", "Pink Floyd / 1979", "05-06", 0, (0.61, 0.22, 0.08)),
    ("LUNAR RESONANCE", "Promises", "Floating Points / 2021", "05-06", 1, (0.35, 0.52, 0.69)),
]

def material(name, color, metallic=0, roughness=.3):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Metallic"].default_value = metallic
    p.inputs["Roughness"].default_value = roughness
    if "Coat Weight" in p.inputs:
        p.inputs["Coat Weight"].default_value = .9
    if "Thin Film Thickness" in p.inputs:
        p.inputs["Thin Film Thickness"].default_value = 360
        p.inputs["Thin Film IOR"].default_value = 1.34
    return m

def add_cube(name, dims, loc, mat, parent, bevel=.045):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(mat)
    modifier = o.modifiers.new("Physical milled bevel", "BEVEL")
    modifier.width = bevel
    modifier.segments = 5
    o.modifiers.new("Weighted corner normals", "WEIGHTED_NORMAL")
    o.parent = parent
    return o

def add_plane(name, size, loc, mat, parent):
    w, h = size
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([(-w/2, -h/2, 0), (w/2, -h/2, 0), (w/2, h/2, 0), (-w/2, h/2, 0)], [], [(0, 1, 2, 3)])
    mesh.uv_layers.new(name="Card UV")
    for face in mesh.polygons:
        for loop_index, uv in zip(face.loop_indices, [(0, 0), (1, 0), (1, 1), (0, 1)]):
            mesh.uv_layers.active.data[loop_index].uv = uv
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.location = loc
    obj.data.materials.append(mat)
    obj.parent = parent
    return obj

def art_material(name, image_path, cell, cutout, accent):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    n, l = m.node_tree.nodes, m.node_tree.links
    n.clear()
    output = n.new("ShaderNodeOutputMaterial")
    output.location = (1050, 100)
    p = n.new("ShaderNodeBsdfPrincipled")
    p.location = (780, 100)
    p.inputs["Roughness"].default_value = .24
    p.inputs["Metallic"].default_value = .25
    if "Coat Weight" in p.inputs:
        p.inputs["Coat Weight"].default_value = 1
    if "Thin Film Thickness" in p.inputs:
        p.inputs["Thin Film Thickness"].default_value = 390
        p.inputs["Thin Film IOR"].default_value = 1.34
    l.new(p.outputs["BSDF"], output.inputs["Surface"])

    uv = n.new("ShaderNodeTexCoord")
    uv.location = (-1050, 160)
    geometry = n.new("ShaderNodeNewGeometry")
    geometry.location = (-1050, -170)
    transform = n.new("ShaderNodeVectorTransform")
    transform.vector_type = "VECTOR"
    transform.convert_from = "WORLD"
    transform.convert_to = "OBJECT"
    transform.location = (-850, -160)
    transform.label = "Camera ray in card-local coordinates"
    l.new(geometry.outputs["Incoming"], transform.inputs["Vector"])
    separate = n.new("ShaderNodeSeparateXYZ")
    separate.location = (-650, -140)
    l.new(transform.outputs["Vector"], separate.inputs["Vector"])
    combine = n.new("ShaderNodeCombineXYZ")
    combine.location = (-460, -220)
    for axis in ("X", "Y", "Z"):
        l.new(separate.outputs["Z"], combine.inputs[axis])
    quotient = n.new("ShaderNodeVectorMath")
    quotient.operation = "DIVIDE"
    quotient.location = (-280, -160)
    quotient.label = "Tangent-plane ray / view Z"
    l.new(transform.outputs["Vector"], quotient.inputs[0])
    l.new(combine.outputs["Vector"], quotient.inputs[1])
    scale = n.new("ShaderNodeVectorMath")
    scale.operation = "SCALE"
    scale.inputs["Scale"].default_value = .015 if cutout else .032
    scale.location = (-90, -130)
    scale.label = "Layer depth — editable parallax strength"
    l.new(quotient.outputs["Vector"], scale.inputs[0])
    offset = n.new("ShaderNodeVectorMath")
    offset.operation = "ADD"
    offset.location = (90, 150)
    l.new(uv.outputs["UV"], offset.inputs[0])
    l.new(scale.outputs["Vector"], offset.inputs[1])
    mapping = n.new("ShaderNodeVectorMath")
    mapping.operation = "MULTIPLY"
    mapping.inputs[1].default_value = (.5, 1, 1)
    mapping.location = (280, 160)
    l.new(offset.outputs["Vector"], mapping.inputs[0])
    cell_offset = n.new("ShaderNodeVectorMath")
    cell_offset.operation = "ADD"
    cell_offset.inputs[1].default_value = (cell*.5, 0, 0)
    cell_offset.location = (450, 160)
    l.new(mapping.outputs["Vector"], cell_offset.inputs[0])
    tex = n.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(str(image_path), check_existing=True)
    tex.image.pack()
    tex.extension = "EXTEND"
    tex.location = (450, 400)
    tex.label = "Original alpha foreground" if cutout else "Original miniature world"
    l.new(cell_offset.outputs["Vector"], tex.inputs["Vector"])
    l.new(tex.outputs["Color"], p.inputs["Base Color"])
    if "Emission Color" in p.inputs:
        l.new(tex.outputs["Color"], p.inputs["Emission Color"])
        p.inputs["Emission Strength"].default_value = .35

    # View-driven spectral response. These are editable material nodes,
    # not a pasted video or a pre-baked card screenshot.
    facing = n.new("ShaderNodeLayerWeight")
    facing.location = (80, -480)
    facing.inputs["Blend"].default_value = .3
    ramp = n.new("ShaderNodeValToRGB")
    ramp.location = (285, -430)
    colors = [(0, (.08, .21, .8, 1)), (.25, (.05, .8, .7, 1)), (.52, (.9, .72, .2, 1)), (.76, (.7, .12, .55, 1)), (1, (.12, .35, .9, 1))]
    for elem in list(ramp.color_ramp.elements)[1:]:
        ramp.color_ramp.elements.remove(elem)
    ramp.color_ramp.elements[0].position = 0
    ramp.color_ramp.elements[0].color = colors[0][1]
    for position, color in colors[1:]:
        ramp.color_ramp.elements.new(position).color = color
    l.new(facing.outputs["Facing"], ramp.inputs["Fac"])
    mix = n.new("ShaderNodeMixRGB")
    mix.blend_type = "SCREEN"
    mix.inputs[0].default_value = .12 if cutout else .19
    mix.location = (560, -90)
    l.new(tex.outputs["Color"], mix.inputs[1])
    l.new(ramp.outputs["Color"], mix.inputs[2])
    l.new(mix.outputs["Color"], p.inputs["Base Color"])
    bump = n.new("ShaderNodeBump")
    bump.location = (570, -300)
    bump.inputs["Strength"].default_value = .12
    bump.inputs["Distance"].default_value = .025
    l.new(tex.outputs["Color"], bump.inputs["Height"])
    l.new(bump.outputs["Normal"], p.inputs["Normal"])
    if cutout:
        l.new(tex.outputs["Alpha"], p.inputs["Alpha"])
        if hasattr(m, "surface_render_method"):
            m.surface_render_method = "DITHERED"
    return m

def text_object(name, body, loc, size, mat, parent):
    curve = bpy.data.curves.new(name, "FONT")
    curve.body = body
    curve.size = size
    curve.extrude = .0008
    curve.space_character = 1.05
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.location = loc
    obj.data.materials.append(mat)
    obj.parent = parent
    return obj

def build(output, render):
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = 12
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 1120
    scene.render.resolution_percentage = 80
    scene.render.image_settings.file_format = "PNG"
    scene.world.color = (.06, .06, .06)
    scene.view_settings.view_transform = "AgX"
    scene.frame_start, scene.frame_end = 1, 160
    scene.render.fps = 30
    for i, (name, title, artist, pair, cell, accent) in enumerate(THEMES):
        parent = bpy.data.objects.new(name, None)
        bpy.context.collection.objects.link(parent)
        parent.location = ((i%3-1)*3.65, (0.5-i//3)*5.05, 0)
        parent["description"] = "Actual beveled model, separated UV-parallax world/alpha foreground, view-dependent foil"
        metal = material(name+" / thin-film bevel", accent, .8, .19)
        ink = material(name+" / dark board", (.008, .016, .022), .22, .32)
        gold = material(name+" / printed index", (.83, .72, .46), .3, .3)
        add_cube(name+" / beveled stock", (2.98, 4.42, .08), (0, 0, 0), metal, parent, .065)
        add_cube(name+" / inset", (2.90, 4.34, .083), (0, 0, .008), ink, parent, .055)
        bg = art_material(name+" / UV-parallax world", ASSETS/("v15-holo-worlds-"+pair+".png"), cell, False, accent)
        fg = art_material(name+" / raised alpha guardian", ASSETS/("v15-holo-guardians-"+pair+".png"), cell, True, accent)
        add_plane("WORLD / "+name, (2.75, 3.67), (0, .14, .06), bg, parent)
        add_plane("GUARDIAN / "+name, (2.68, 3.57), (0, .17, .23), fg, parent)
        add_cube("Printed header", (2.77, .22, .013), (0, 1.96, .245), ink, parent, .012)
        add_cube("Printed record label", (2.77, .67, .013), (0, -1.77, .25), ink, parent, .012)
        text_object("Archive index", "SONORA / "+str(i+1).zfill(2)+" / HOLO ARCHIVE", (-1.29, 1.91, .26), .086, gold, parent)
        text_object("Album title", title, (-1.29, -1.67, .27), .125 if len(title)>18 else .17, gold, parent)
        text_object("Artist metadata", artist, (-1.29, -1.89, .27), .071, gold, parent)
        text_object("Theme engraving", name, (-1.29, -2.05, .27), .064, gold, parent)
        for frame, angle in [(1, -.10), (80, .16), (160, -.10)]:
            parent.rotation_euler[1] = angle
            parent.keyframe_insert(data_path="rotation_euler", frame=frame)
    bpy.ops.object.camera_add(location=(0, -.9, 19))
    camera = bpy.context.object
    camera.name = "Six-card material inspection camera"
    camera.rotation_euler = (Vector((0, 0, 0))-camera.location).to_track_quat("-Z", "Y").to_euler()
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 12.1
    scene.camera = camera
    for name, location, energy, color, size in [
        ("Warm key softbox", (-5, 6, 9), 1600, (1, .86, .64), 6),
        ("Cyan rim softbox", (6, 2, 7), 1200, (.5, .8, 1), 5),
        ("Lower fill", (0, -6, 5), 800, (.75, .8, 1), 4),
    ]:
        bpy.ops.object.light_add(type="AREA", location=location)
        light = bpy.context.object
        light.name = name
        light.data.energy, light.data.color, light.data.shape, light.data.size = energy, color, "DISK", size
        light.rotation_euler = (-light.location).to_track_quat("-Z", "Y").to_euler()
    scene.frame_set(35)
    scene["Source video"] = "https://www.bilibili.com/video/BV1M95H62E4P/"
    scene["Web implementation"] = "src/holoRenderer.js + src/holoShaders.js; geometry and view-driven UV/foil equivalents"
    scene["Copyright"] = "Original generated music-world assets; no video frames or third-party character art packaged"
    bpy.ops.wm.save_as_mainfile(filepath=str(output))
    if render:
        scene.render.filepath = str(render)
        bpy.ops.render.render(write_still=True)
    print("SONORA_HOLO_BLEND_READY", output)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--render", type=Path)
    args = parser.parse_args(sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else [])
    build(args.output, args.render)
