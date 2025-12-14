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

## 3D Viewer with Model Selection

This demo provides a **full WebGL 3D viewer** with a model selection dropdown and glTF export capabilities.

### Features

**Model Selection:**
- Dropdown list with predefined EVE Online ship models
- Multiple ship types from different factions (Amarr, Caldari, Gallente, Minmatar)
- Easy one-click model loading

**WebGL 3D Rendering:**
- Real-time WebGL rendering using CCPWGL2
- Standard WebGL renderer with continuous render loop
- Displays selected models in 3D canvas
- Interactive visualization of loaded models

**Model Loading:**
- Select a model from the dropdown list
- Automatic model loading from resource paths
- Automatic mesh extraction from loaded objects
- Support for multiple meshes per model
- Clear status updates during loading
- Fallback to demo mode if resources unavailable

**glTF 2.0 Export:**
- Export loaded meshes to valid glTF 2.0 format
- Uses **actual geometry from the loaded 3D model** (not placeholder data)
- Support for single or multiple mesh export
- Configurable options (materials, animations, image embedding)
- Falls back to valid demo triangle mesh only if model loading fails

### How to Use

**Prerequisites:**
1. Build the library: `npm install && npm run build`
2. Open `demo/gltf-exporter.html` in a web browser

**Loading and Viewing Models:**
1. Select a model from the "Choose a Model" dropdown (e.g., "Amarr Battleship")
2. Click "Load Selected Model"
3. The model will load and display in the 3D viewer canvas
4. Available meshes will be listed in the "Meshes & Materials" section

**Exporting to glTF:**
1. Once a model is loaded, select which meshes to export from the list
2. Configure export options (embed images, materials, animations)
3. Click "Export to glTF" to download the file
4. **The exported file contains actual geometry from the loaded 3D model**, not a placeholder

**Demo Mode Fallback:**
If the CCPWGL2 library is not built or model loading fails (e.g., resource server unavailable), the demo falls back to creating valid sample glTF files with triangle geometry for testing the export functionality.

### Technical Details

**Model Selection:**
- Predefined list of EVE Online ship models
- Dropdown automatically populated with model paths
- Validates selection before loading

**WebGL Renderer:**
- Initializes CCPWGL2 device with canvas
- Runs continuous render loop using `requestAnimationFrame`
- Handles model updates with `Update()` and batch rendering with `GetBatches()`/`RenderBatches()`
- Proper error handling and fallback modes

**Model Loading Process:**
1. User selects model from dropdown
2. Previous model is cleared
3. `tw2.Load(modelPath)` initiates loading
4. Polls every 100ms for up to 10 seconds
5. Extracts meshes when loaded
6. Updates UI and enables export

**Export Process:**
- For loaded models: Uses `Tw2GltfExporter` to export **actual mesh data from the 3D model**
- For demo mode: Generates valid glTF 2.0 triangle mesh
- All exports are spec-compliant and viewable in standard glTF viewers

### Troubleshooting

**"CCPWGL2 library not loaded" error:**
- Build the library first: `npm install && npm run build`

**Models don't load / timeout:**
- Ensure you have a resource server set up for EVE Online assets
- The models in the dropdown require access to EVE Online's resource files
- Demo mode export will still work and generate valid glTF files

**Model loads but doesn't appear in canvas:**
- Check browser console for WebGL errors
- Ensure WebGL is enabled in your browser
- The model may be very large or small - this is a known limitation

**Export gives triangle instead of model:**
- This means the model didn't load successfully
- Check if the model appeared in the 3D viewer first
- If the viewer shows the model but export gives a triangle, this is a bug - check console for errors

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
