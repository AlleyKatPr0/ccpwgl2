CCP WebGL Library
======
A webgl implementation of CCP Game's Eve Online graphics engine.
This version of the library provides partial support for newer ships and reading client resources but requires a resource server to do so (ccp's servers do not provide CORS headers which webgl requires). [A resource server is not yet provided](https://github.com/cppctamber/ccpwgl2-server).

The original library can be found here: https://github.com/ccpgames/ccpwgl

Warning
======
The resource files required for this library to work are no longer available, RIP.

## New Features

### glTF 2.0 Export Capability

Export WebGL-rendered EVE Online ship models to standard glTF 2.0 format with full validation!

**Features:**
- Export meshes with vertex data (positions, normals, UVs, etc.)
- Support for materials (PBR-based)
- Buffer and accessor generation with proper byte alignment
- Base64 data URI embedding for standalone files
- Multi-mesh scene export
- Interactive demo UI for easy model export
- **Full glTF 2.0 spec compliance** - files are readable by all glTF viewers
- Automatic validation to ensure export integrity

**Usage:**

```javascript
import { Tw2GltfExporter, GltfExportAPI } from 'ccpwgl2';

// Quick export with convenience API
GltfExportAPI.exportAndDownloadMesh(mesh, 'ship.gltf');

// Advanced usage with options
const exporter = new Tw2GltfExporter({
    embedImages: true,      // Embed textures as base64
    materials: true,        // Include material data
    animations: true        // Include animations
});

const gltf = exporter.ExportMesh(mesh);
Tw2GltfExporter.Download(gltf, 'ship.gltf');

// Export multiple meshes to one scene
const gltf = exporter.ExportMeshes([mesh1, mesh2, mesh3], 'ShipScene');
```

**Demo:**

Try the interactive demo at `demo/gltf-exporter.html` - a simple UI for loading models, selecting meshes/materials, and exporting to glTF with one click! The demo now generates valid glTF 2.0 files that can be opened in any glTF viewer like:
- [glTF Viewer](https://gltf-viewer.donmccurdy.com/)
- [Babylon.js Sandbox](https://sandbox.babylonjs.com/)
- [Three.js Editor](https://threejs.org/editor/)
- Blender (File → Import → glTF 2.0)

See `demo/README.md` for more details.



