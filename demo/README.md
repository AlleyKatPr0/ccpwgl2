# CCPWGL2 glTF Exporter Demo

This demo showcases the glTF 2.0 export functionality for CCPWGL2, allowing you to export WebGL-rendered EVE Online ship models to the standard glTF format.

## Features

- 🚀 Load EVE Online ship models
- 🎨 Select specific meshes and materials
- ⚙️ Configure export options (materials, animations, image embedding)
- 💾 Export to glTF 2.0 format
- 👁️ View exported JSON structure

## Usage

1. Open `gltf-exporter.html` in a web browser
2. Enter a model resource path (e.g., `res:/dx9/model/ship/amarr/battleship/ab1/ab1_t1_lod1.red`)
3. Click "Load Model" to load the model
4. Select the meshes you want to export
5. Configure export options as needed
6. Click "Export to glTF" to download the file

## Requirements

- CCPWGL2 library built and available at `../dist/ccpwgl2_int.js`
- A resource server for loading actual model files (for production use)

## Demo Mode

The current implementation includes a demo mode that simulates model loading and export functionality. This allows you to test the UI and export workflow without needing a full resource server setup.

## Export Options

- **Embed Images**: Encodes textures as base64 data URIs in the glTF file
- **Include Materials**: Exports material information as PBR materials
- **Include Animations**: Includes animation data (if available)

## Integration with CCPWGL2

To integrate the exporter into your own application:

```javascript
// Import the exporter
import { Tw2GltfExporter, GltfExportAPI } from 'ccpwgl2';

// Export a single mesh
const exporter = new Tw2GltfExporter({
    embedImages: true,
    materials: true,
    animations: true
});

const gltf = exporter.ExportMesh(myMesh);

// Download the file
Tw2GltfExporter.Download(gltf, 'my-model.gltf');

// Or use the convenience API
GltfExportAPI.exportAndDownloadMesh(myMesh, 'my-model.gltf');
```

## File Structure

- `gltf-exporter.html` - Main demo page with interactive UI
- Generated `.gltf` files - Standard glTF 2.0 JSON files

## Browser Compatibility

- Modern browsers with WebGL support (Chrome, Firefox, Edge, Safari)
- ES6+ JavaScript support required

## Notes

- For full functionality, you'll need a CCPWGL2 resource server to load actual model files
- The demo mode provides a preview of the UI and basic export functionality
- Exported glTF files can be viewed in tools like:
  - [glTF Viewer](https://gltf-viewer.donmccurdy.com/)
  - [Babylon.js Sandbox](https://sandbox.babylonjs.com/)
  - [Three.js Editor](https://threejs.org/editor/)
  - Blender (File → Import → glTF 2.0)
