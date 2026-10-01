"""
Convert a USDZ (e.g. an iPhone Object Capture scan) into a plain glTF 2.0 folder:
  <out>/model.gltf, <out>/model.bin and the original texture PNGs.

This is a real geometry conversion, not a rename: positions, normals, UVs, triangles
and the UsdPreviewSurface textures are read with Pixar's USD library and re-encoded.
World units become metres (glTF standard) and Z-up stages are rotated to Y-up, so the
model keeps the physical size authored in the USDZ. Nothing is rescaled.

Needs Pixar's USD Python bindings, a dev-time tool only:
    pip install usd-core
Usage:
    python scripts/usdz_to_gltf.py <input.usdz> <output-folder>

Supported: triangle/polygon meshes (fan-triangulated), vertex or faceVarying normals and
UVs, one UsdPreviewSurface material per mesh (diffuseColor, normal, occlusion,
roughness, metallic, opacity). GeomSubsets (several materials on one mesh) are not
supported and are reported as a warning.
"""

import json
import os
import struct
import sys
import zipfile

from pxr import Gf, Usd, UsdGeom, UsdShade


def fail(msg):
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(1)


def texture_input(shader_input):
    """Follow a UsdPreviewSurface input to a UsdUVTexture. Returns (file_path, channel) or None."""
    sources = shader_input.GetConnectedSources()[0]
    if not sources:
        return None
    src = sources[0]
    tex = UsdShade.Shader(src.source.GetPrim())
    if tex.GetIdAttr().Get() != "UsdUVTexture":
        return None
    f = tex.GetInput("file")
    if not f or not f.Get():
        return None
    return f.Get().path, src.sourceName


def read_material(mesh_prim):
    mat, _ = UsdShade.MaterialBindingAPI(mesh_prim).ComputeBoundMaterial()
    out = {"textures": {}, "factors": {}}
    if not mat:
        return out
    surface = mat.ComputeSurfaceSource()[0]
    if not surface or surface.GetIdAttr().Get() != "UsdPreviewSurface":
        print(f"warning: {mat.GetPath()} is not a UsdPreviewSurface; exporting untextured", file=sys.stderr)
        return out
    for name in ("diffuseColor", "normal", "occlusion", "roughness", "metallic", "opacity"):
        inp = surface.GetInput(name)
        if not inp:
            continue
        tex = texture_input(inp)
        if tex:
            out["textures"][name] = tex
        elif inp.Get() is not None:
            out["factors"][name] = inp.Get()
    return out


def main():
    if len(sys.argv) != 3:
        fail("usage: usdz_to_gltf.py <input.usdz> <output-folder>")
    src_path, out_dir = sys.argv[1], sys.argv[2]
    stage = Usd.Stage.Open(src_path)
    if not stage:
        fail(f"could not open {src_path}")
    os.makedirs(out_dir, exist_ok=True)

    mpu = UsdGeom.GetStageMetersPerUnit(stage)
    up = UsdGeom.GetStageUpAxis(stage)
    # USD uses row vectors (p' = p * M), so the stage-level fix is applied after the world transform.
    stage_fix = Gf.Matrix4d(1.0).SetScale(Gf.Vec3d(mpu, mpu, mpu))
    if up == UsdGeom.Tokens.z:
        stage_fix = Gf.Matrix4d(1.0).SetRotate(Gf.Rotation(Gf.Vec3d(1, 0, 0), -90)) * stage_fix

    xf_cache = UsdGeom.XformCache()
    blob = bytearray()
    buffer_views, accessors, meshes, nodes = [], [], [], []
    materials, images, textures = [], [], []
    image_index = {}

    def add_view(data, target=None):
        while len(blob) % 4:
            blob.append(0)
        view = {"buffer": 0, "byteOffset": len(blob), "byteLength": len(data)}
        if target:
            view["target"] = target
        blob.extend(data)
        buffer_views.append(view)
        return len(buffer_views) - 1

    def add_accessor(values, comp, count, typ, target, minmax=False):
        fmt = {5126: "f", 5125: "I"}[comp]
        data = struct.pack(f"<{len(values)}{fmt}", *values)
        acc = {"bufferView": add_view(data, target), "componentType": comp, "count": count, "type": typ}
        if minmax:
            n = {"VEC3": 3, "VEC2": 2}[typ]
            acc["min"] = [min(values[i::n]) for i in range(n)]
            acc["max"] = [max(values[i::n]) for i in range(n)]
        accessors.append(acc)
        return len(accessors) - 1

    package = zipfile.ZipFile(src_path) if zipfile.is_zipfile(src_path) else None

    def add_image(path):
        if path in image_index:
            return image_index[path]
        name = os.path.basename(path)
        dest = os.path.join(out_dir, name)
        if package:
            member = path.replace("\\", "/").lstrip("./")
            with open(dest, "wb") as fh:
                fh.write(package.read(member))
        else:
            with open(os.path.join(os.path.dirname(src_path), path), "rb") as a, open(dest, "wb") as b:
                b.write(a.read())
        images.append({"uri": name})
        textures.append({"source": len(images) - 1, "sampler": 0})
        image_index[path] = len(textures) - 1
        return image_index[path]

    for prim in stage.Traverse():
        if not prim.IsA(UsdGeom.Mesh):
            continue
        if UsdGeom.Imageable(prim).ComputeVisibility() == UsdGeom.Tokens.invisible:
            continue
        mesh = UsdGeom.Mesh(prim)
        if UsdGeom.Subset.GetAllGeomSubsets(UsdGeom.Imageable(prim)):
            print(f"warning: {prim.GetPath()} has GeomSubsets; only its bound material is exported", file=sys.stderr)

        points = mesh.GetPointsAttr().Get()
        counts = mesh.GetFaceVertexCountsAttr().Get()
        fvi = mesh.GetFaceVertexIndicesAttr().Get()
        left_handed = mesh.GetOrientationAttr().Get() == UsdGeom.Tokens.leftHanded

        world = xf_cache.GetLocalToWorldTransform(prim) * stage_fix
        normal_m = world.GetInverse().GetTranspose()

        pvapi = UsdGeom.PrimvarsAPI(prim)
        st = pvapi.GetPrimvar("st")
        st_vals = st.Get() if st else None
        st_idx = st.GetIndices() if st and st.IsIndexed() else None
        st_interp = st.GetInterpolation() if st else None

        pn = pvapi.GetPrimvar("normals")
        if pn and pn.HasAuthoredValue():
            n_vals, n_interp = pn.ComputeFlattened(), pn.GetInterpolation()
        else:
            n_vals, n_interp = mesh.GetNormalsAttr().Get(), mesh.GetNormalsInterpolation()

        def uv_key(fv, pi):
            if st_vals is None:
                return None
            if st_interp == UsdGeom.Tokens.faceVarying:
                return st_idx[fv] if st_idx is not None else fv
            return st_idx[pi] if st_idx is not None else pi

        def n_key(fv, pi):
            if not n_vals:
                return None
            return fv if n_interp == UsdGeom.Tokens.faceVarying else pi

        verts, remap, tri = [], {}, []
        fv = 0
        for c in counts:
            corner = []
            for k in range(c):
                pi = fvi[fv + k]
                key = (pi, uv_key(fv + k, pi), n_key(fv + k, pi))
                if key not in remap:
                    remap[key] = len(verts)
                    verts.append(key)
                corner.append(remap[key])
            for k in range(1, c - 1):  # fan triangulation
                a, b, d = corner[0], corner[k], corner[k + 1]
                tri.extend((a, d, b) if left_handed else (a, b, d))
            fv += c

        pos, nor, uv = [], [], []
        for pi, uk, nk in verts:
            p = world.Transform(Gf.Vec3d(points[pi]))
            pos.extend((p[0], p[1], p[2]))
            if nk is not None:
                n = normal_m.TransformDir(Gf.Vec3d(n_vals[nk])).GetNormalized()
                nor.extend((n[0], n[1], n[2]))
            if uk is not None:
                u, v = st_vals[uk]
                uv.extend((u, 1.0 - v))  # USD st origin is bottom-left, glTF is top-left

        attrs = {"POSITION": add_accessor(pos, 5126, len(verts), "VEC3", 34962, minmax=True)}
        if nor:
            attrs["NORMAL"] = add_accessor(nor, 5126, len(verts), "VEC3", 34962)
        if uv:
            attrs["TEXCOORD_0"] = add_accessor(uv, 5126, len(verts), "VEC2", 34962)
        idx = add_accessor(tri, 5125, len(tri), "SCALAR", 34963)

        m = read_material(prim)
        pbr = {"metallicFactor": float(m["factors"].get("metallic", 0.0)),
               "roughnessFactor": float(m["factors"].get("roughness", 0.5))}
        mat = {"name": prim.GetName(), "pbrMetallicRoughness": pbr}
        if "diffuseColor" in m["textures"]:
            pbr["baseColorTexture"] = {"index": add_image(m["textures"]["diffuseColor"][0])}
        elif "diffuseColor" in m["factors"]:
            c = m["factors"]["diffuseColor"]
            pbr["baseColorFactor"] = [c[0], c[1], c[2], float(m["factors"].get("opacity", 1.0))]
        if "normal" in m["textures"]:
            mat["normalTexture"] = {"index": add_image(m["textures"]["normal"][0])}
        if "occlusion" in m["textures"]:
            mat["occlusionTexture"] = {"index": add_image(m["textures"]["occlusion"][0])}
        if "roughness" in m["textures"] or "metallic" in m["textures"]:
            print("warning: roughness/metallic textures are not converted; using constant factors", file=sys.stderr)
        if float(m["factors"].get("opacity", 1.0)) < 1.0:
            mat["alphaMode"] = "BLEND"
        if mesh.GetDoubleSidedAttr().Get():
            mat["doubleSided"] = True
        materials.append(mat)

        meshes.append({"name": prim.GetName(), "primitives": [{"attributes": attrs, "indices": idx, "material": len(materials) - 1}]})
        nodes.append({"name": prim.GetName(), "mesh": len(meshes) - 1})
        print(f"mesh {prim.GetPath()}: {len(verts)} vertices, {len(tri) // 3} triangles")

    if not meshes:
        fail("no visible meshes found")

    bin_name = "model.bin"
    with open(os.path.join(out_dir, bin_name), "wb") as fh:
        fh.write(blob)

    layer = stage.GetRootLayer()
    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "DekhKhao usdz_to_gltf.py",
            "extras": {"source": os.path.basename(src_path), "sourceCreator": str(layer.customLayerData.get("creator", ""))},
        },
        "scene": 0,
        "scenes": [{"nodes": list(range(len(nodes)))}],
        "nodes": nodes,
        "meshes": meshes,
        "materials": materials,
        "accessors": accessors,
        "bufferViews": buffer_views,
        "buffers": [{"uri": bin_name, "byteLength": len(blob)}],
        "samplers": [{"magFilter": 9729, "minFilter": 9987, "wrapS": 10497, "wrapT": 10497}],
    }
    if images:
        gltf["images"] = images
        gltf["textures"] = textures
    with open(os.path.join(out_dir, "model.gltf"), "w") as fh:
        json.dump(gltf, fh)

    bounds = [accessors[m["primitives"][0]["attributes"]["POSITION"]] for m in meshes]
    lo = [min(b["min"][i] for b in bounds) for i in range(3)]
    hi = [max(b["max"][i] for b in bounds) for i in range(3)]
    size_cm = [round((hi[i] - lo[i]) * 100, 2) for i in range(3)]
    print(f"size (w x h x d): {size_cm[0]} x {size_cm[1]} x {size_cm[2]} cm  (metersPerUnit={mpu}, upAxis={up})")
    print(f"wrote {os.path.join(out_dir, 'model.gltf')}")


if __name__ == "__main__":
    main()
