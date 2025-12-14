# CCPWGL2 glTF Exporter Demo

This demo showcases the glTF 2.0 export functionality for CCPWGL2, allowing you to export WebGL-rendered EVE Online ship models to the standard glTF format.

## Features

- 🚀 Load EVE Online ship models
- 🎨 Select specific meshes and materials
- ⚙️ Configure export options (materials, animations, image embedding)
- 💾 Export to glTF 2.0 format with full validation
- 👁️ View exported JSON structure
- ✅ Generate valid glTF files that work with all viewers

## Usage

1. Open `gltf-exporter.html` in a web browser
2. (Optional) Enter a model resource path (e.g., `res:/dx9/model/ship/amarr/battleship/ab1/ab1_t1_lod1.red`)
3. Click "Load Model" to create a demo mesh
4. Select the meshes you want to export
5. Configure export options as needed
6. Click "Export to glTF" to download the file

## Requirements

- CCPWGL2 library built and available at `../dist/ccpwgl2_int.js`
- A resource server for loading actual model files (for production use)
- Modern web browser with WebGL support

## Demo Mode

The current implementation includes a demo mode that creates valid glTF 2.0 geometry and exports it. The demo generates a simple triangle mesh with proper vertex attributes (positions, normals) and indices, producing standards-compliant glTF files that can be opened in any glTF viewer. This allows you to test the UI and export workflow without needing a full resource server setup.

**The exported files include:**
- Proper glTF 2.0 structure with asset metadata
- Valid vertex data with positions and normals
- Correctly formatted indices for triangle primitives
- Base64-encoded binary data in data URIs
- Proper byte offsets and buffer view configurations
- Min/Max bounds for position data

## Validation

The demo includes built-in validation to ensure exported glTF files meet the glTF 2.0 specification:
- Asset version check (must be "2.0")
- Scene structure validation
- Buffer and buffer view integrity
- Accessor component type validation
- Data URI encoding verification

## Export Options

- **Embed Images**: Encodes textures as base64 data URIs in the glTF file
- **Include Materials**: Exports material information as PBR materials
- **Include Animations**: Includes animation data (if available)

## Testing Your Exports

After exporting, you can verify your glTF files work correctly by opening them in:

1. **Online Viewers:**
   - [glTF Viewer by Don McCurdy](https://gltf-viewer.donmccurdy.com/) - Drag and drop your .gltf file
   - [Babylon.js Sandbox](https://sandbox.babylonjs.com/) - Upload and view
   - [Three.js Editor](https://threejs.org/editor/) - File → Import

2. **Desktop Tools:**
   - Blender: File → Import → glTF 2.0 (.glb/.gltf)
   - Unity: Import as asset
   - Unreal Engine: Import as asset

3. **Command Line Validation:**
   ```bash
   # Validate JSON structure
   python -m json.tool your-export.gltf
   
   # Or use Node.js
   node -e "console.log(JSON.parse(require('fs').readFileSync('your-export.gltf')))"
   ```

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

// Validate before download
const json = Tw2GltfExporter.ToJSON(gltf); // Throws error if invalid

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

## Troubleshooting

**Problem:** "CCPWGL2 not loaded" error
- **Solution:** Build the library first: `npm install && npm run build`

**Problem:** Exported file won't open in viewers
- **Solution:** Use the "View as JSON" button to check for validation errors
- The demo now includes validation that should prevent invalid exports

**Problem:** Model loading fails
- **Solution:** The demo mode creates a basic triangle mesh automatically. For real model loading, you need a resource server.

## Notes

- For full functionality with EVE Online models, you'll need a CCPWGL2 resource server to load actual model files
- The demo mode provides a preview of the UI and working export functionality
- All exported glTF files are validated before export to ensure compatibility
