import { Tw2GltfExporter } from "./Tw2GltfExporter";

/**
 * Convenience API for exporting WebGL assets to glTF 2.0
 */
export class GltfExportAPI
{
    /**
     * Exports a single mesh to glTF
     * @param {Tw2Mesh} mesh - Mesh to export
     * @param {Object} [options] - Export options
     * @returns {Object} glTF JSON object
     */
    static exportMesh(mesh, options = {})
    {
        const exporter = new Tw2GltfExporter(options);
        return exporter.ExportMesh(mesh);
    }

    /**
     * Exports multiple meshes to a single glTF file
     * @param {Array<Tw2Mesh>} meshes - Meshes to export
     * @param {String} [sceneName="Scene"] - Scene name
     * @param {Object} [options] - Export options
     * @returns {Object} glTF JSON object
     */
    static exportMeshes(meshes, sceneName = "Scene", options = {})
    {
        const exporter = new Tw2GltfExporter(options);
        return exporter.ExportMeshes(meshes, sceneName);
    }

    /**
     * Exports a mesh and downloads it as a glTF file
     * @param {Tw2Mesh} mesh - Mesh to export
     * @param {string} [filename="model.gltf"] - Output filename
     * @param {Object} [options] - Export options
     */
    static exportAndDownloadMesh(mesh, filename = "model.gltf", options = {})
    {
        const gltf = GltfExportAPI.exportMesh(mesh, options);
        Tw2GltfExporter.Download(gltf, filename);
    }

    /**
     * Exports multiple meshes and downloads as a glTF file
     * @param {Array<Tw2Mesh>} meshes - Meshes to export
     * @param {string} [filename="scene.gltf"] - Output filename
     * @param {String} [sceneName="Scene"] - Scene name
     * @param {Object} [options] - Export options
     */
    static exportAndDownloadMeshes(meshes, filename = "scene.gltf", sceneName = "Scene", options = {})
    {
        const gltf = GltfExportAPI.exportMeshes(meshes, sceneName, options);
        Tw2GltfExporter.Download(gltf, filename);
    }

    /**
     * Exports a mesh to JSON string
     * @param {Tw2Mesh} mesh - Mesh to export
     * @param {Object} [options] - Export options
     * @param {number} [indent=2] - JSON indentation
     * @returns {string} glTF JSON string
     */
    static exportMeshToJSON(mesh, options = {}, indent = 2)
    {
        const gltf = GltfExportAPI.exportMesh(mesh, options);
        return Tw2GltfExporter.ToJSON(gltf, indent);
    }

    /**
     * Exports multiple meshes to JSON string
     * @param {Array<Tw2Mesh>} meshes - Meshes to export
     * @param {String} [sceneName="Scene"] - Scene name
     * @param {Object} [options] - Export options
     * @param {number} [indent=2] - JSON indentation
     * @returns {string} glTF JSON string
     */
    static exportMeshesToJSON(meshes, sceneName = "Scene", options = {}, indent = 2)
    {
        const gltf = GltfExportAPI.exportMeshes(meshes, sceneName, options);
        return Tw2GltfExporter.ToJSON(gltf, indent);
    }
}

// Make it available as a global utility
if (typeof window !== "undefined")
{
    window.GltfExportAPI = GltfExportAPI;
}
