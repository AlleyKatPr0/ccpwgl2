import { meta } from "utils";


/**
 * Tw2GltfExporter
 * Exports WebGL-rendered assets to glTF 2.0 format
 * 
 * @property {Object} options - Export options
 * @property {Array} buffers - Binary buffers
 * @property {Array} bufferViews - Buffer views
 * @property {Array} accessors - Data accessors
 * @property {Array} meshes - Mesh data
 * @property {Array} materials - Material data
 * @property {Array} textures - Texture data
 * @property {Array} images - Image data
 * @property {Array} nodes - Scene nodes
 * @property {Array} scenes - Scene data
 */
@meta.type("Tw2GltfExporter")
export class Tw2GltfExporter
{

    options = {
        binary: false,
        embedImages: true,
        includeCustomExtras: false,
        animations: true,
        materials: true
    };

    // glTF data structures
    buffers = [];
    bufferViews = [];
    accessors = [];
    meshes = [];
    materials = [];
    textures = [];
    images = [];
    samplers = [];
    nodes = [];
    scenes = [];
    animations = [];

    // Internal tracking
    _bufferData = [];
    _byteOffset = 0;
    _resourceMap = new Map();

    /**
     * Constructor
     * @param {Object} [options] - Export options
     */
    constructor(options = {})
    {
        Object.assign(this.options, options);
    }

    /**
     * Exports a Tw2Mesh to glTF format
     * @param {Tw2Mesh} mesh - The mesh to export
     * @returns {Object} glTF JSON object
     */
    ExportMesh(mesh)
    {
        if (!mesh || !mesh.geometryResource)
        {
            throw new Error("Invalid mesh or geometry resource");
        }

        this._Reset();

        const geometryRes = mesh.geometryResource;
        if (!geometryRes.IsGood())
        {
            throw new Error("Geometry resource not loaded");
        }

        // Process mesh data
        const meshIndex = this._ProcessMesh(mesh);
        
        // Create a default node
        const nodeIndex = this._CreateNode(mesh.name || "mesh", meshIndex);

        // Create a default scene
        const sceneIndex = this._CreateScene("Scene", [ nodeIndex ]);

        // Build final glTF object
        return this._BuildGltf(sceneIndex);
    }

    /**
     * Exports multiple meshes to glTF format
     * @param {Array<Tw2Mesh>} meshes - Array of meshes to export
     * @param {String} [sceneName="Scene"] - Name for the scene
     * @returns {Object} glTF JSON object
     */
    ExportMeshes(meshes, sceneName = "Scene")
    {
        if (!meshes || !meshes.length)
        {
            throw new Error("No meshes provided for export");
        }

        this._Reset();

        const nodeIndices = [];
        for (let i = 0; i < meshes.length; i++)
        {
            const mesh = meshes[i];
            if (!mesh || !mesh.geometryResource || !mesh.geometryResource.IsGood())
            {
                continue;
            }

            const meshIndex = this._ProcessMesh(mesh);
            const nodeIndex = this._CreateNode(mesh.name || `mesh_${i}`, meshIndex);
            nodeIndices.push(nodeIndex);
        }

        const sceneIndex = this._CreateScene(sceneName, nodeIndices);
        return this._BuildGltf(sceneIndex);
    }

    /**
     * Processes a single mesh
     * @param {Tw2Mesh} mesh - Mesh to process
     * @returns {number} Mesh index
     * @private
     */
    _ProcessMesh(mesh)
    {
        const geometryRes = mesh.geometryResource;
        const geometryMeshes = geometryRes.meshes || [];
        
        if (geometryMeshes.length === 0)
        {
            throw new Error("No geometry meshes found");
        }

        // For now, process the mesh at meshIndex
        const meshIndex = Math.min(mesh.meshIndex || 0, geometryMeshes.length - 1);
        const geometryMesh = geometryMeshes[meshIndex];

        if (!geometryMesh || !geometryMesh.bufferData)
        {
            throw new Error("Invalid geometry mesh data");
        }

        return this._CreateMeshPrimitives(geometryMesh, mesh);
    }

    /**
     * Creates mesh primitives from geometry mesh
     * @param {Tw2GeometryMesh} geometryMesh - Geometry mesh
     * @param {Tw2Mesh} mesh - Original mesh with materials
     * @returns {number} Mesh index
     * @private
     */
    _CreateMeshPrimitives(geometryMesh, mesh)
    {
        const primitives = [];

        // Process each mesh area
        const areas = this._GetAllMeshAreas(mesh);
        
        for (let i = 0; i < areas.length; i++)
        {
            const area = areas[i];
            const primitive = this._CreatePrimitive(geometryMesh, area);
            primitives.push(primitive);
        }

        // If no areas, create a single primitive with all data
        if (primitives.length === 0)
        {
            const primitive = this._CreatePrimitive(geometryMesh, null);
            primitives.push(primitive);
        }

        const meshData = {
            name: geometryMesh.name || "mesh",
            primitives: primitives
        };

        const index = this.meshes.length;
        this.meshes.push(meshData);
        return index;
    }

    /**
     * Gets all mesh areas from a mesh
     * @param {Tw2Mesh} mesh - The mesh
     * @returns {Array} All mesh areas
     * @private
     */
    _GetAllMeshAreas(mesh)
    {
        const areas = [];
        const areaTypes = [
            "opaqueAreas",
            "transparentAreas",
            "additiveAreas",
            "decalAreas",
            "distortionAreas",
            "pickableAreas"
        ];

        for (const type of areaTypes)
        {
            if (mesh[type] && mesh[type].length)
            {
                areas.push(...mesh[type]);
            }
        }

        return areas;
    }

    /**
     * Creates a single primitive
     * @param {Tw2GeometryMesh} geometryMesh - Geometry mesh
     * @param {Tw2MeshArea} [area] - Optional mesh area
     * @returns {Object} Primitive data
     * @private
     */
    _CreatePrimitive(geometryMesh, area)
    {
        const attributes = {};
        const declaration = geometryMesh.declaration;
        const bufferData = geometryMesh.bufferData;
        const indexData = geometryMesh.indexData;

        // Process vertex attributes
        if (declaration && declaration.elements)
        {
            for (let i = 0; i < declaration.elements.length; i++)
            {
                const element = declaration.elements[i];
                const accessorIndex = this._CreateAccessorForElement(
                    element,
                    bufferData,
                    geometryMesh.bufferLength / declaration.stride,
                    declaration.stride
                );

                if (accessorIndex !== -1)
                {
                    const attrName = this._GetGltfAttributeName(element);
                    if (attrName)
                    {
                        attributes[attrName] = accessorIndex;
                    }
                }
            }
        }

        const primitive = {
            attributes: attributes,
            mode: 4 // TRIANGLES
        };

        // Add indices if available
        if (indexData && indexData.length > 0)
        {
            const indexAccessor = this._CreateIndexAccessor(indexData, area);
            if (indexAccessor !== -1)
            {
                primitive.indices = indexAccessor;
            }
        }

        // Add material if available
        if (area && area.effect && this.options.materials)
        {
            const materialIndex = this._CreateMaterial(area.effect);
            if (materialIndex !== -1)
            {
                primitive.material = materialIndex;
            }
        }

        return primitive;
    }

    /**
     * Creates an accessor for a vertex element
     * @param {Tw2VertexElement} element - Vertex element
     * @param {TypedArray} bufferData - Buffer data
     * @param {number} count - Vertex count
     * @param {number} stride - Vertex stride
     * @returns {number} Accessor index
     * @private
     */
    _CreateAccessorForElement(element, bufferData, count, stride)
    {
        if (!bufferData || !element)
        {
            return -1;
        }

        // Create or get buffer
        const bufferIndex = this._GetOrCreateBuffer(bufferData);
        
        // Create buffer view
        const bufferViewIndex = this.bufferViews.length;
        this.bufferViews.push({
            buffer: bufferIndex,
            byteOffset: 0,
            byteLength: bufferData.byteLength,
            byteStride: stride,
            target: 34962 // ARRAY_BUFFER
        });

        // Create accessor
        const accessorData = {
            bufferView: bufferViewIndex,
            byteOffset: element.offset || 0,
            componentType: this._GetComponentType(element.type),
            count: count,
            type: this._GetAccessorType(element.elements),
            normalized: false
        };

        // Add min/max for POSITION by calculating from actual data
        if (element.usage === 0) // POSITION
        {
            const minMax = this._CalculateMinMax(bufferData, element, count, stride);
            if (minMax)
            {
                accessorData.min = minMax.min;
                accessorData.max = minMax.max;
            }
        }

        const index = this.accessors.length;
        this.accessors.push(accessorData);
        return index;
    }

    /**
     * Creates an index accessor
     * @param {TypedArray} indexData - Index data
     * @param {Tw2MeshArea} [area] - Optional mesh area
     * @returns {number} Accessor index
     * @private
     */
    _CreateIndexAccessor(indexData, area)
    {
        if (!indexData)
        {
            return -1;
        }

        const bufferIndex = this._GetOrCreateBuffer(indexData);
        
        // Determine index range
        let start = 0;
        let count = indexData.length;
        
        if (area)
        {
            start = area.start || 0;
            count = area.count || (indexData.length - start);
        }

        // Create buffer view
        const bufferViewIndex = this.bufferViews.length;
        this.bufferViews.push({
            buffer: bufferIndex,
            byteOffset: start * indexData.BYTES_PER_ELEMENT,
            byteLength: count * indexData.BYTES_PER_ELEMENT,
            target: 34963 // ELEMENT_ARRAY_BUFFER
        });

        // Create accessor with proper component type detection
        let componentType = 5125; // Default to UNSIGNED_INT
        if (indexData instanceof Uint8Array)
        {
            componentType = 5121; // UNSIGNED_BYTE
        }
        else if (indexData instanceof Uint16Array)
        {
            componentType = 5123; // UNSIGNED_SHORT
        }
        else if (indexData instanceof Uint32Array)
        {
            componentType = 5125; // UNSIGNED_INT
        }
        
        const accessorData = {
            bufferView: bufferViewIndex,
            byteOffset: 0,
            componentType: componentType,
            count: count,
            type: "SCALAR"
        };

        const index = this.accessors.length;
        this.accessors.push(accessorData);
        return index;
    }

    /**
     * Gets or creates a buffer for the data
     * @param {TypedArray} data - Buffer data
     * @returns {number} Buffer index
     * @private
     */
    _GetOrCreateBuffer(data)
    {
        // Check if buffer already exists
        if (this._resourceMap.has(data))
        {
            return this._resourceMap.get(data);
        }

        const index = this.buffers.length;
        this.buffers.push({
            byteLength: data.byteLength,
            uri: this.options.binary ? undefined : this._CreateDataUri(data)
        });

        this._bufferData.push(data);
        this._resourceMap.set(data, index);
        return index;
    }

    /**
     * Creates a data URI from buffer data
     * @param {TypedArray} data - Buffer data
     * @returns {string} Data URI
     * @private
     */
    _CreateDataUri(data)
    {
        const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        const base64 = this._ArrayBufferToBase64(bytes);
        return `data:application/octet-stream;base64,${base64}`;
    }

    /**
     * Converts array buffer to base64
     * @param {Uint8Array} buffer - Buffer
     * @returns {string} Base64 string
     * @private
     */
    _ArrayBufferToBase64(buffer)
    {
        let binary = "";
        const len = buffer.byteLength;
        for (let i = 0; i < len; i++)
        {
            binary += String.fromCharCode(buffer[i]);
        }
        return btoa(binary);
    }

    /**
     * Creates a material from an effect
     * @param {Tw2Effect} effect - Effect
     * @returns {number} Material index
     * @private
     */
    _CreateMaterial(effect)
    {
        if (!effect)
        {
            return -1;
        }

        // Create a basic PBR material
        const material = {
            name: effect.name || "material",
            pbrMetallicRoughness: {
                baseColorFactor: [ 1, 1, 1, 1 ],
                metallicFactor: 0.0,
                roughnessFactor: 0.5
            }
        };

        const index = this.materials.length;
        this.materials.push(material);
        return index;
    }

    /**
     * Creates a scene node
     * @param {string} name - Node name
     * @param {number} meshIndex - Mesh index
     * @param {mat4} [transform] - Transform matrix
     * @returns {number} Node index
     * @private
     */
    _CreateNode(name, meshIndex, transform = null)
    {
        const node = {
            name: name,
            mesh: meshIndex
        };

        if (transform)
        {
            node.matrix = Array.from(transform);
        }

        const index = this.nodes.length;
        this.nodes.push(node);
        return index;
    }

    /**
     * Creates a scene
     * @param {string} name - Scene name
     * @param {Array<number>} nodeIndices - Node indices
     * @returns {number} Scene index
     * @private
     */
    _CreateScene(name, nodeIndices)
    {
        const scene = {
            name: name,
            nodes: nodeIndices
        };

        const index = this.scenes.length;
        this.scenes.push(scene);
        return index;
    }

    /**
     * Builds the final glTF object
     * @param {number} sceneIndex - Default scene index
     * @returns {Object} glTF JSON
     * @private
     */
    _BuildGltf(sceneIndex)
    {
        const gltf = {
            asset: {
                version: "2.0",
                generator: "CCPWGL2 glTF Exporter"
            },
            scene: sceneIndex,
            scenes: this.scenes,
            nodes: this.nodes,
            meshes: this.meshes
        };

        if (this.buffers.length > 0)
        {
            gltf.buffers = this.buffers;
        }

        if (this.bufferViews.length > 0)
        {
            gltf.bufferViews = this.bufferViews;
        }

        if (this.accessors.length > 0)
        {
            gltf.accessors = this.accessors;
        }

        if (this.materials.length > 0)
        {
            gltf.materials = this.materials;
        }

        if (this.textures.length > 0)
        {
            gltf.textures = this.textures;
        }

        if (this.images.length > 0)
        {
            gltf.images = this.images;
        }

        if (this.samplers.length > 0)
        {
            gltf.samplers = this.samplers;
        }

        if (this.animations.length > 0)
        {
            gltf.animations = this.animations;
        }

        return gltf;
    }

    /**
     * Gets glTF attribute name from vertex element
     * @param {Tw2VertexElement} element - Vertex element
     * @returns {string|null} Attribute name
     * @private
     */
    _GetGltfAttributeName(element)
    {
        // Map vertex usage to glTF attribute names
        const usageMap = {
            0: "POSITION",      // POSITION
            1: "BLENDWEIGHT",   // BLENDWEIGHT
            2: "BLENDINDICES",  // BLENDINDICES
            3: "NORMAL",        // NORMAL
            5: "TEXCOORD",      // TEXCOORD
            6: "TANGENT",       // TANGENT
            7: "BINORMAL",      // BINORMAL
            10: "COLOR"         // COLOR
        };

        const baseName = usageMap[element.usage];
        if (!baseName)
        {
            return null;
        }

        // Add index for attributes that can have multiple sets
        if (baseName === "TEXCOORD" || baseName === "COLOR")
        {
            return `${baseName}_${element.usageIndex || 0}`;
        }

        return baseName;
    }

    /**
     * Gets glTF component type from element type
     * @param {number} type - Element type
     * @returns {number} Component type
     * @private
     */
    _GetComponentType(type)
    {
        // WebGL type to glTF component type mapping
        const typeMap = {
            5120: 5120, // BYTE
            5121: 5121, // UNSIGNED_BYTE
            5122: 5122, // SHORT
            5123: 5123, // UNSIGNED_SHORT
            5124: 5124, // INT
            5125: 5125, // UNSIGNED_INT
            5126: 5126  // FLOAT
        };

        return typeMap[type] || 5126; // Default to FLOAT
    }

    /**
     * Gets glTF accessor type from element count
     * @param {number} elements - Number of elements
     * @returns {string} Accessor type
     * @private
     */
    _GetAccessorType(elements)
    {
        const typeMap = {
            1: "SCALAR",
            2: "VEC2",
            3: "VEC3",
            4: "VEC4"
        };

        return typeMap[elements] || "SCALAR";
    }

    /**
     * Calculates min/max values for vertex attribute data
     * @param {TypedArray} bufferData - Buffer data
     * @param {Tw2VertexElement} element - Vertex element
     * @param {number} count - Vertex count
     * @param {number} stride - Vertex stride
     * @returns {Object|null} Object with min and max arrays
     * @private
     */
    _CalculateMinMax(bufferData, element, count, stride)
    {
        if (!bufferData || !element || element.elements < 1 || element.elements > 4)
        {
            return null;
        }

        const elementCount = element.elements;
        const offset = element.offset || 0;
        const min = new Array(elementCount).fill(Infinity);
        const max = new Array(elementCount).fill(-Infinity);

        // Create a view of the buffer based on the element type
        const bytesPerElement = this._GetBytesPerComponent(element.type);
        const byteOffset = bufferData.byteOffset + offset;
        
        let dataView;
        if (element.type === 5126) // FLOAT
        {
            dataView = new Float32Array(bufferData.buffer, byteOffset);
        }
        else
        {
            return null; // Only support float for now
        }

        // Iterate through vertices
        const strideInElements = stride / bytesPerElement;
        for (let i = 0; i < count; i++)
        {
            const baseIndex = i * strideInElements;
            for (let j = 0; j < elementCount; j++)
            {
                const value = dataView[baseIndex + j];
                if (value < min[j]) min[j] = value;
                if (value > max[j]) max[j] = value;
            }
        }

        return { min, max };
    }

    /**
     * Gets bytes per component for a given type
     * @param {number} type - Component type
     * @returns {number} Bytes per component
     * @private
     */
    _GetBytesPerComponent(type)
    {
        const bytesMap = {
            5120: 1, // BYTE
            5121: 1, // UNSIGNED_BYTE
            5122: 2, // SHORT
            5123: 2, // UNSIGNED_SHORT
            5124: 4, // INT
            5125: 4, // UNSIGNED_INT
            5126: 4  // FLOAT
        };
        return bytesMap[type] || 4;
    }

    /**
     * Resets the exporter state
     * @private
     */
    _Reset()
    {
        this.buffers = [];
        this.bufferViews = [];
        this.accessors = [];
        this.meshes = [];
        this.materials = [];
        this.textures = [];
        this.images = [];
        this.samplers = [];
        this.nodes = [];
        this.scenes = [];
        this.animations = [];
        this._bufferData = [];
        this._byteOffset = 0;
        this._resourceMap.clear();
    }

    /**
     * Exports to JSON string
     * @param {Object} gltf - glTF object
     * @param {number} [space=2] - Indentation spaces
     * @returns {string} JSON string
     */
    static ToJSON(gltf, space = 2)
    {
        return JSON.stringify(gltf, null, space);
    }

    /**
     * Downloads glTF as a file
     * @param {Object} gltf - glTF object
     * @param {string} [filename="model.gltf"] - Filename
     */
    static Download(gltf, filename = "model.gltf")
    {
        const json = Tw2GltfExporter.ToJSON(gltf);
        const blob = new Blob([ json ], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
