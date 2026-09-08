/*
 * Copyright (C) 2019-2026 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * This file declares TypeScript annotations for Filament, which is implemented with an external
 * WASM library. The annotations declared in this file must match the bindings that are defined
 * in jsbindings. Note that clients are not required to use glMatrix, but we provide annotations for
 * those that do.
 */

import * as glm from "gl-matrix";

export as namespace Filament;

export function getSupportedFormatSuffix(desired: string): void;

/**
 * Asynchronously initializes the WebGPU adapter and device.
 * This must be awaited before initializing the Filament Engine with the WebGPU backend.
 */
export function initWebGPU(): Promise<void>;

export function init(assets: string[], onready?: (() => void) | null): void;

export function fetch(assets: string[], onDone?: (() => void) | null, onFetched?: ((name: string) => void) | null): void;

export function clearAssetCache(): void;

export function vectorToArray<T>(vector: Vector<T>): T[];

export function arrayToVector<T>(vector: new () => Vector<T>, array: T[]): Vector<T>;

export function getBufferDescriptor(buffer: BufferReference): driver$BufferDescriptor;

export function fitIntoUnitCube(box: Aabb): mat4;

export function multiplyMatrices(a: mat4, b: mat4): mat4;

export const assets: {[url: string]: Uint8Array};

/**
 * May be either a string exactly containing a URL loaded with Filament.init() or Filament.fetch(),
 * OR any TypedArray such as Uint8Array, Float32Array, etc., all of which match the ArrayBufferView
 * interface.
 */
export type BufferReference = string | ArrayBufferView;

export type quat = glm.quat|number[];

export type short4 = number[];

export type ushort3 = number[];

export type quath = quat;

/** A C++ std::vector. */
export interface Vector<T> {
    size(): number;
    get(i: number): T;
    push_back(value: T): void;
    delete(): void;
}

export interface PickingQueryResult {
    renderable: Entity;
    depth: number;
    fragCoords: number[];
}

export type PickCallback = (result: PickingQueryResult) => void;

// Clients should use the [Buffer] helper function to wrap a typed array as a BufferDescriptor.
export class driver$BufferDescriptor {
    constructor(byteLength: number);
    getBytes(): ArrayBuffer;
}

// Clients should use the [PixelBuffer/CompressedPixelBuffer] helper function to contruct PixelBufferDescriptor objects.
export class driver$PixelBufferDescriptor {
    constructor(byteLength: number, format: PixelDataFormat, datatype: PixelDataType);
    constructor(byteLength: number, cdtype: CompressedPixelDataType, imageSize: number, compressed: boolean);
    getBytes(): ArrayBuffer;
}

export class IcoSphere {
    constructor(nsubdivs: number);
    public subdivide(): void;
    vertices: Float32Array;
    tangents: Int16Array;
    triangles: Uint16Array;
}

export interface Filamesh {
    renderable: Entity;
    vertexBuffer: VertexBuffer;
    indexBuffer: IndexBuffer;
}

export class filamesh$Mesh {
    public renderable(): Entity;
    public vertexBuffer(): VertexBuffer;
    public indexBuffer(): IndexBuffer;
    public delete(): void;
}

export class DecodedImage {
    public width: number;
    public height: number;
    public data: any;
}

// [mipLevel, arrayIndex, cubeFace] index into a KTX1 bundle's blobs.
export type KtxBlobIndex = [number, number, number];

export class Ktx1Bundle {
    constructor(kbd: driver$BufferDescriptor);
    public getNumMipLevels(): number;
    public getArrayLength(): number;
    public getInternalFormat(srgb: boolean): TextureFormat;
    public getPixelDataFormat(): PixelDataFormat;
    public getPixelDataType(): PixelDataType;
    public getCompressedPixelDataType(): CompressedPixelDataType;
    public isCompressed(): boolean;
    public isCubemap(): boolean;
    public getBlob(index: KtxBlobIndex): ArrayBuffer;
    public getCubeBlob(miplevel: number): ArrayBuffer;
    public info(): KtxInfo;
    public getMetadata(key: string): string;
    public delete(): void;
}

export class KtxInfo {
    public endianness: number;
    public glType: number;
    public glTypeSize: number;
    public glFormat: number;
    public glInternalFormat: number;
    public glBaseInternalFormat: number;
    public pixelWidth: number;
    public pixelHeight: number;
    public pixelDepth: number;
}

export interface ViewerContent {
    view: View;
    renderer: Renderer;
    materials: MaterialInstance[];
    lightManager: LightManager;
    scene: Scene;
    indirectLight: IndirectLight | null;
    sunlight: Entity;
    assetLights: Entity[];
}

export class AutomationSpec {
    static generate(json: string): AutomationSpec | null;
    static generateDefaultTestCases(): AutomationSpec;
    size(): number;
    get(index: number, out: viewer$Settings): boolean;
    getName(index: number): string;
    delete(): void;
}

export class ViewerGui {
    constructor(engine: Engine, scene: Scene, view: View, sidebarWidth: number);
    renderUserInterface(timeStepInSeconds: number, guiView: View, pixelRatio: number): void;
    getSettings(): viewer$Settings;
    mouseEvent(mouseX: number, mouseY: number, mouseButton: boolean, mouseWheelY: number, control: boolean): void;
    keyDownEvent(keyCode: number): void;
    keyUpEvent(keyCode: number): void;
    keyPressEvent(charCode: number): void;
    delete(): void;
}

export class gltfio$AssetLoader {
    public createAsset(urlOrBuffer: BufferReference): gltfio$FilamentAsset;
    public createInstancedAsset(urlOrBuffer: BufferReference,
            instances: (gltfio$FilamentInstance | null)[]): gltfio$FilamentAsset;
    public destroyAsset(asset: gltfio$FilamentAsset): void;
    public createInstance(asset: gltfio$FilamentAsset): (gltfio$FilamentInstance | null);
    public delete(): void;
}

export class gltfio$FilamentAsset {
    public loadResources(onDone: () => void|null, onFetched: (s: string) => void|null,
            basePath: string|null, asyncInterval: number|null, options?: object): void;
    public getEntities(): Entity[];
    public getEntitiesByName(name: string): Entity[];
    public getEntityByName(name: string): Entity;
    public getEntitiesByPrefix(name: string): Entity[];
    public getLightEntities(): Entity[];
    public getRenderableEntities(): Entity[];
    public getCameraEntities(): Entity[];
    public getRoot(): Entity;
    public popRenderable(): Entity;
    public getInstance(): gltfio$FilamentInstance;
    public getAssetInstances(): gltfio$FilamentInstance[];
    public getResourceUris(): string[];
    public getBoundingBox(): Aabb;
    public getName(entity: Entity): string;
    public getExtras(entity: Entity): string;
    public getWireframe(): Entity;
    public getEngine(): Engine;
    public getMorphTargetNames(entity: Entity): string[];
    public releaseSourceData(): void;
    public getFirstEntityByName(name: string): Entity;
}

export class gltfio$FilamentInstance {
    public getAsset(): gltfio$FilamentAsset;
    public getEntities(): Vector<Entity>;
    public getRoot(): Entity;
    public getAnimator(): gltfio$Animator;
    public getSkinNames(): Vector<string>;
    public getSkinCount(): number;
    public getJointCountAt(skinIndex: number): number;
    public getJointsAt(skinIndex: number): Entity[];
    public attachSkin(skinIndex: number, entity: Entity): void;
    public detachSkin(skinIndex: number, entity: Entity): void;
    public getMaterialInstances(): Vector<MaterialInstance>;
    public detachMaterialInstances(): void;
    public getMaterialVariantNames(): string[];
    public applyMaterialVariant(index: number): void;
}

export class gltfio$Animator {
    public applyAnimation(index: number, time: number): void;
    public applyCrossFade(previousAnimIndex: number, previousAnimTime: number, alpha: number): void;
    public updateBoneMatrices(): void;
    public resetBoneMatrices(): void;
    public getAnimationCount(): number;
    public getAnimationDuration(index: number): number;
    public getAnimationName(index: number): string;
}

export class gltfio$UbershaderProvider {
    constructor(engine: Engine);
    public destroyMaterials(): void;
}

export class gltfio$StbProvider {
    constructor(engine: Engine);
}

export class gltfio$Ktx2Provider {
    constructor(engine: Engine);
}

export class gltfio$WebpProvider {
    constructor(engine: Engine);
    public static isWebpSupported(): boolean;
}

export class gltfio$ResourceLoader {
    constructor(engine: Engine, normalizeSkinningWeights: boolean);
    public addResourceData(url: string, buffer: driver$BufferDescriptor): void;
    public addStbProvider(mimeType: string, provider: gltfio$StbProvider): void;
    public addKtx2Provider(mimeType: string, provider: gltfio$Ktx2Provider): void;
    public addWebpProvider(mimeType: string, provider: gltfio$WebpProvider): void;
    public hasResourceData(url: string): boolean;
    public loadResources(asset: gltfio$FilamentAsset): boolean;
    public asyncBeginLoad(asset: gltfio$FilamentAsset): boolean;
    public asyncGetLoadProgress(): number;
    public asyncUpdateLoad(): void;
}

export enum camutils$Key {
    FORWARD,
    LEFT,
    BACKWARD,
    RIGHT,
    UP,
    DOWN,
}

export class camutils$Bookmark {
    public static interpolate(a: camutils$Bookmark, b: camutils$Bookmark, t: number): camutils$Bookmark;
    public static duration(a: camutils$Bookmark, b: camutils$Bookmark): number;
}

export class camutils$Manipulator {
    public setViewport(width: number, height: number): void;
    public getLookAt(eye: float3, target: float3, up: float3): void;
    public raycast(x: number, y: number, result: float3): boolean;
    public getRay(x: number, y: number, origin: float3, dir: float3): void;
    public grabBegin(x: number, y: number, strafe: boolean): void;
    public grabUpdate(x: number, y: number): void;
    public grabEnd(): void;
    public scroll(x: number, y: number, delta: number): void;
    public keydown(key: camutils$Key): void;
    public keyup(key: camutils$Key): void;
    public update(deltaTime: number): void;
    public getCurrentBookmark(): camutils$Bookmark;
    public jumpToBookmark(bookmark: camutils$Bookmark): void;
    public attach(canvas: HTMLCanvasElement): void;
    public detach(canvas: HTMLCanvasElement): void;
}

export class camutils$Manipulator$Builder {
    constructor();
    public viewport(width: number, height: number): camutils$Manipulator$Builder;
    public targetPosition(x: number, y: number, z: number): camutils$Manipulator$Builder;
    public upVector(x: number, y: number, z: number): camutils$Manipulator$Builder;
    public zoomSpeed(val: number): camutils$Manipulator$Builder;
    public orbitHomePosition(x: number, y: number, z: number): camutils$Manipulator$Builder;
    public orbitSpeed(x: number, y: number): camutils$Manipulator$Builder;
    public fovDirection(fov: camutils$Fov): camutils$Manipulator$Builder;
    public fovDegrees(degrees: number): camutils$Manipulator$Builder;
    public farPlane(distance: number): camutils$Manipulator$Builder;
    public mapExtent(worldWidth: number, worldHeight: number): camutils$Manipulator$Builder;
    public mapMinDistance(distance: number): camutils$Manipulator$Builder;
    public flightStartPosition(x: number, y: number, z: number): camutils$Manipulator$Builder;
    public flightStartOrientation(pitch: number, yaw: number): camutils$Manipulator$Builder;
    public flightMaxSpeed(maxSpeed: number): camutils$Manipulator$Builder;
    public flightSpeedSteps(steps: number): camutils$Manipulator$Builder;
    public flightPanSpeed(panSpeed: float2): camutils$Manipulator$Builder;
    public flightMoveDamping(damping: number): camutils$Manipulator$Builder;
    public groundPlane(a: number, b: number, c: number, d: number): camutils$Manipulator$Builder;
    public panning(enabled: boolean): camutils$Manipulator$Builder;
    public build(mode: camutils$Mode): camutils$Manipulator;
}

export class utils$NameComponentManager {
    public getName(entity: Entity): string;
    public hasComponent(entity: Entity): boolean;
}

export namespace Engine {
    function create(canvas: HTMLCanvasElement, options?: { backend?: Backend }): Engine;
    const SINGLE_THREADED: number;
}

export interface MaterialProperty<T> {
    name?: string;
    value?: T;
}

export enum filamat$MaterialBuilder$Parameter$ {
    INVALID,
    UNIFORM,
    SAMPLER,
    SUBPASS,
}

export enum filamesh$Flags {
    INTERLEAVED,
    TEXCOORD_SNORM16,
    COMPRESSION,
}

export enum filamesh$IndexType {
    UI32,
    UI16,
}

export enum gltfio$AlphaMode {
    OPAQUE,
    MASK,
    BLEND,
}

export enum gltfio$UvSet {
    UNUSED,
    UV0,
    UV1,
}

export interface TransformManager$children_sentinel {
}

/**
 * \struct AssetConfiguration AssetLoader.h gltfio/AssetLoader.h
 * \brief Construction parameters for AssetLoader.
 */
export interface gltfio$AssetConfiguration {
}

/**
 * \struct ResourceConfiguration ResourceLoader.h gltfio/ResourceLoader.h
 * \brief Construction parameters for ResourceLoader.
 */
export interface gltfio$ResourceConfiguration {
    normalizeSkinningWeights?: boolean;
}

export class LightManager$Instance {
    public delete(): void;
}

export class RenderableManager$Instance {
    public delete(): void;
}

export class TransformManager$Instance {
    public delete(): void;
}

export class gltfio$NodeManager$Instance {
    public delete(): void;
}

export class gltfio$TrsTransformManager$Instance {
    public delete(): void;
}

// ===== GENERATED DECLARATIONS =====
//
// Everything below is written by beamsplitter2 and is replaced on every run. It
// describes the embind registrations exactly; edit the headers, not this file.
// Anything hand-written belongs above the marker, where it is preserved.

export type double2 = glm.vec2|number[];
export type double3 = glm.vec3|number[];
export type double4 = glm.vec4|number[];
export type float2 = glm.vec2|number[];
export type float3 = glm.vec3|number[];
export type float4 = glm.vec4|number[];
export type mat3 = glm.mat3|number[];
export type mat4 = glm.mat4|number[];
export type quatf = glm.quat|number[];
export type uint2 = number[];
export type uint3 = number[];

export enum AgxToneMapper$AgxLook {
    /** Base contrast with no look applied */
    NONE = 0,
    /** A punchy and more chroma laden look for sRGB displays */
    PUNCHY = 1,
    /** A golden tinted, slightly washed look for BT.1886 displays */
    GOLDEN = 2,
}

export enum AlphaMode {
    OPAQUE = 0,
    MASK = 1,
    BLEND = 2,
}

export enum AmbientOcclusionOptions$AmbientOcclusionType {
    /** use Scalable Ambient Occlusion */
    SAO = 0,
    /** use Ground Truth-Based Ambient Occlusion */
    GTAO = 1,
}

/**
 * List of available post-processing anti-aliasing techniques.
 * @see #setAntiAliasing
 * @see #getAntiAliasing
 * @see #setSampleCount
 */
export enum AntiAliasing {
    /** no anti aliasing performed as part of post-processing */
    NONE = 0,
    /** FXAA is a low-quality but very efficient type of anti-aliasing. (default). */
    FXAA = 1,
}

/**
 * Outcome of an asynchronous operation, reported to its completion callback.
 *
 * A completion callback that cannot say why it fired is ambiguous: chaining another operation
 * from a callback that fired because the operation was canceled would proceed on a resource
 * that was never populated. The caller cannot reconstruct the answer out of band either,
 * because an operation can be canceled without anyone asking for it (the driver dropping
 * queued work while shutting down).
 * @see AsyncCallback, cancelAsyncJob
 */
export enum AsyncCallStatus {
    /** The operation ran to completion. */
    COMPLETED = 0,
    /** The operation never ran: it was canceled, or dropped because the driver is shutting down. */
    CANCELED = 1,
}

/** Selects which driver a particular Engine should use. */
export enum Backend {
    /** Automatically selects an appropriate driver for the platform. */
    DEFAULT = 0,
    /** Selects the OpenGL/ES driver (default on Android) */
    OPENGL = 1,
    /** Selects the Vulkan driver if the platform supports it (default on Linux/Windows) */
    VULKAN = 2,
    /** Selects the Metal driver if the platform supports it (default on MacOS/iOS). */
    METAL = 3,
    /** Selects the Webgpu driver if the platform supports webgpu. */
    WEBGPU = 4,
    /** Selects the no-op driver for testing purposes. */
    NOOP = 5,
}

/** blending equation function */
export enum BlendEquation {
    /** the fragment is added to the color buffer */
    ADD = 0,
    /** the fragment is subtracted from the color buffer */
    SUBTRACT = 1,
    /** the color buffer is subtracted from the fragment */
    REVERSE_SUBTRACT = 2,
    /** the min between the fragment and color buffer */
    MIN = 3,
    /** the max between the fragment and color buffer */
    MAX = 4,
}

/** blending function */
export enum BlendFunction {
    /** f(src, dst) = 0 */
    ZERO = 0,
    /** f(src, dst) = 1 */
    ONE = 1,
    /** f(src, dst) = src */
    SRC_COLOR = 2,
    /** f(src, dst) = 1-src */
    ONE_MINUS_SRC_COLOR = 3,
    /** f(src, dst) = dst */
    DST_COLOR = 4,
    /** f(src, dst) = 1-dst */
    ONE_MINUS_DST_COLOR = 5,
    /** f(src, dst) = src.a */
    SRC_ALPHA = 6,
    /** f(src, dst) = 1-src.a */
    ONE_MINUS_SRC_ALPHA = 7,
    /** f(src, dst) = dst.a */
    DST_ALPHA = 8,
    /** f(src, dst) = 1-dst.a */
    ONE_MINUS_DST_ALPHA = 9,
    /** f(src, dst) = (1,1,1) * min(src.a, 1 - dst.a), 1 */
    SRC_ALPHA_SATURATE = 10,
}

export enum BlendMode {
    OPAQUE = 0,
    TRANSLUCENT = 1,
}

/** Supported blending modes */
export enum BlendingMode {
    /** material is opaque */
    OPAQUE = 0,
    /** material is transparent and color is alpha-pre-multiplied, affects diffuse lighting only */
    TRANSPARENT = 1,
    /** material is additive (e.g.: hologram) */
    ADD = 2,
    /** material is masked (i.e. alpha tested) */
    MASKED = 3,
    /**
     * material is transparent and color is alpha-pre-multiplied, affects specular lighting when
     * adding more entries, change the size of FRenderer::CommandKey::blending
     */
    FADE = 4,
    /** material darkens what's behind it */
    MULTIPLY = 5,
    /** material brightens what's behind it */
    SCREEN = 6,
    /** custom blending function */
    CUSTOM = 7,
}

export enum BloomOptions$BlendMode {
    /** Bloom is modulated by the strength parameter and added to the scene */
    ADD = 0,
    /** Bloom is interpolated with the scene using the strength parameter */
    INTERPOLATE = 1,
}

/** Buffer object binding type */
export enum BufferObjectBinding {
    VERTEX = 0,
    UNIFORM = 1,
    SHADER_STORAGE = 2,
}

/** How the buffer will be used. */
export enum BufferUsage {
    /** (legacy) content modified once, used many times */
    STATIC = 0,
    /** (legacy) content modified frequently, used many times */
    DYNAMIC = 1,
    /** buffer can be modified frequently, used many times */
    DYNAMIC_BIT = 1,
    /** buffer can be memory mapped for write operations */
    SHARED_WRITE_BIT = 4,
}

/**
 * Denotes a field-of-view direction.
 * @see setProjection
 */
export enum Camera$Fov {
    /** the field-of-view angle is defined on the vertical axis */
    VERTICAL = 0,
    /** the field-of-view angle is defined on the horizontal axis */
    HORIZONTAL = 1,
}

/**
 * Denotes the projection type used by this camera.
 * @see setProjection
 */
export enum Camera$Projection {
    /** perspective projection, objects get smaller as they are farther */
    PERSPECTIVE = 0,
    /** orthonormal projection, preserves distances */
    ORTHO = 1,
}

/** type of color conversion to use when converting to/from sRGB and linear spaces */
export enum ColorConversion {
    /** accurate conversion using the sRGB standard */
    ACCURATE = 0,
    /** fast conversion using a simple gamma 2.2 curve */
    FAST = 1,
}

export enum ColorGrading$LutFormat {
    /** 10 bits per component */
    INTEGER = 0,
    /** 16 bits per component (10 bits mantissa precision) */
    FLOAT = 1,
}

export enum ColorGrading$QualityLevel {
    LOW = 0,
    MEDIUM = 1,
    HIGH = 2,
    ULTRA = 3,
}

/**
 * List of available tone-mapping operators.
 *
 * @deprecated Use Builder::toneMapper(ToneMapper*) instead
 */
export enum ColorGrading$ToneMapping {
    /** Linear tone mapping (i.e. no tone mapping) */
    LINEAR = 0,
    /** ACES tone mapping, with a brightness modifier to match Filament's legacy tone mapper */
    ACES_LEGACY = 1,
    /** ACES tone mapping */
    ACES = 2,
    /** Filmic tone mapping, modelled after ACES but applied in sRGB space */
    FILMIC = 3,
    /** Tone mapping used to validate/debug scene exposure */
    DISPLAY_RANGE = 4,
}

/**
 * Shader compiler priority queue
 *
 * On platforms which support parallel shader compilation, compilation requests will be
 * processed in order of priority, then insertion order. See Material::compile().
 */
export enum CompilerPriorityQueue {
    /**
     * We need this program NOW.
     *
     * When passed as an argument to Material::compile(), if the platform doesn't support parallel
     * compilation, but does support amortized shader compilation, the given shader program will be
     * synchronously compiled.
     */
    CRITICAL = 0,
    /** We will need this program soon. */
    HIGH = 1,
    /** We will need this program eventually. */
    LOW = 2,
}

/** Compressed pixel data types */
export enum CompressedPixelDataType {
    EAC_R11 = 0,
    EAC_R11_SIGNED = 1,
    EAC_RG11 = 2,
    EAC_RG11_SIGNED = 3,
    ETC2_RGB8 = 4,
    ETC2_SRGB8 = 5,
    ETC2_RGB8_A1 = 6,
    ETC2_SRGB8_A1 = 7,
    ETC2_EAC_RGBA8 = 8,
    ETC2_EAC_SRGBA8 = 9,
    DXT1_RGB = 10,
    DXT1_RGBA = 11,
    DXT3_RGBA = 12,
    DXT5_RGBA = 13,
    DXT1_SRGB = 14,
    DXT1_SRGBA = 15,
    DXT3_SRGBA = 16,
    DXT5_SRGBA = 17,
    RGBA_ASTC_4x4 = 18,
    RGBA_ASTC_5x4 = 19,
    RGBA_ASTC_5x5 = 20,
    RGBA_ASTC_6x5 = 21,
    RGBA_ASTC_6x6 = 22,
    RGBA_ASTC_8x5 = 23,
    RGBA_ASTC_8x6 = 24,
    RGBA_ASTC_8x8 = 25,
    RGBA_ASTC_10x5 = 26,
    RGBA_ASTC_10x6 = 27,
    RGBA_ASTC_10x8 = 28,
    RGBA_ASTC_10x10 = 29,
    RGBA_ASTC_12x10 = 30,
    RGBA_ASTC_12x12 = 31,
    SRGB8_ALPHA8_ASTC_4x4 = 32,
    SRGB8_ALPHA8_ASTC_5x4 = 33,
    SRGB8_ALPHA8_ASTC_5x5 = 34,
    SRGB8_ALPHA8_ASTC_6x5 = 35,
    SRGB8_ALPHA8_ASTC_6x6 = 36,
    SRGB8_ALPHA8_ASTC_8x5 = 37,
    SRGB8_ALPHA8_ASTC_8x6 = 38,
    SRGB8_ALPHA8_ASTC_8x8 = 39,
    SRGB8_ALPHA8_ASTC_10x5 = 40,
    SRGB8_ALPHA8_ASTC_10x6 = 41,
    SRGB8_ALPHA8_ASTC_10x8 = 42,
    SRGB8_ALPHA8_ASTC_10x10 = 43,
    SRGB8_ALPHA8_ASTC_12x10 = 44,
    SRGB8_ALPHA8_ASTC_12x12 = 45,
    RED_RGTC1 = 46,
    SIGNED_RED_RGTC1 = 47,
    RED_GREEN_RGTC2 = 48,
    SIGNED_RED_GREEN_RGTC2 = 49,
    RGB_BPTC_SIGNED_FLOAT = 50,
    RGB_BPTC_UNSIGNED_FLOAT = 51,
    RGBA_BPTC_UNORM = 52,
    SRGB_ALPHA_BPTC_UNORM = 53,
}

/** Supported constant parameter types */
export enum ConstantType {
    INT = 0,
    FLOAT = 1,
    BOOL = 2,
}

/** Face culling Mode */
export enum CullingMode {
    /** No culling, front and back faces are visible */
    NONE = 0,
    /** Front face culling, only back faces are visible */
    FRONT = 1,
    /** Back face culling, only front faces are visible */
    BACK = 2,
    /** Front and Back, geometry is not visible */
    FRONT_AND_BACK = 3,
}

export enum DepthOfFieldOptions$Filter {
    NONE = 0,
    UNUSED = 1,
    MEDIAN = 2,
}

export enum DescriptorFlags {
    NONE = 0,
    DYNAMIC_OFFSET = 1,
    UNFILTERABLE = 2,
}

export enum DescriptorType {
    SAMPLER_2D_FLOAT = 0,
    SAMPLER_2D_INT = 1,
    SAMPLER_2D_UINT = 2,
    SAMPLER_2D_DEPTH = 3,
    SAMPLER_2D_ARRAY_FLOAT = 4,
    SAMPLER_2D_ARRAY_INT = 5,
    SAMPLER_2D_ARRAY_UINT = 6,
    SAMPLER_2D_ARRAY_DEPTH = 7,
    SAMPLER_CUBE_FLOAT = 8,
    SAMPLER_CUBE_INT = 9,
    SAMPLER_CUBE_UINT = 10,
    SAMPLER_CUBE_DEPTH = 11,
    SAMPLER_CUBE_ARRAY_FLOAT = 12,
    SAMPLER_CUBE_ARRAY_INT = 13,
    SAMPLER_CUBE_ARRAY_UINT = 14,
    SAMPLER_CUBE_ARRAY_DEPTH = 15,
    SAMPLER_3D_FLOAT = 16,
    SAMPLER_3D_INT = 17,
    SAMPLER_3D_UINT = 18,
    SAMPLER_2D_MS_FLOAT = 19,
    SAMPLER_2D_MS_INT = 20,
    SAMPLER_2D_MS_UINT = 21,
    SAMPLER_2D_MS_ARRAY_FLOAT = 22,
    SAMPLER_2D_MS_ARRAY_INT = 23,
    SAMPLER_2D_MS_ARRAY_UINT = 24,
    SAMPLER_EXTERNAL = 25,
    UNIFORM_BUFFER = 26,
    SHADER_STORAGE_BUFFER = 27,
    INPUT_ATTACHMENT = 28,
}

/** List of available post-processing dithering techniques. */
export enum Dithering {
    /** No dithering */
    NONE = 0,
    /** Temporal dithering (default) */
    TEMPORAL = 1,
}

/** Supported element types */
export enum ElementType {
    BYTE = 0,
    BYTE2 = 1,
    BYTE3 = 2,
    BYTE4 = 3,
    UBYTE = 4,
    UBYTE2 = 5,
    UBYTE3 = 6,
    UBYTE4 = 7,
    SHORT = 8,
    SHORT2 = 9,
    SHORT3 = 10,
    SHORT4 = 11,
    USHORT = 12,
    USHORT2 = 13,
    USHORT3 = 14,
    USHORT4 = 15,
    INT = 16,
    UINT = 17,
    FLOAT = 18,
    FLOAT2 = 19,
    FLOAT3 = 20,
    FLOAT4 = 21,
    HALF = 22,
    HALF2 = 23,
    HALF3 = 24,
    HALF4 = 25,
}

export enum Engine$Config$ShaderLanguage {
    DEFAULT = 0,
    MSL = 1,
    METAL_LIBRARY = 2,
}

/** Defines the backend's feature levels. */
export enum FeatureLevel {
    /** OpenGL ES 2.0 features */
    FEATURE_LEVEL_0 = 0,
    /** OpenGL ES 3.0 features (default) */
    FEATURE_LEVEL_1 = 1,
    /** OpenGL ES 3.1 features + 16 textures units + cubemap arrays */
    FEATURE_LEVEL_2 = 2,
    /** OpenGL ES 3.1 features + 31 textures units + cubemap arrays */
    FEATURE_LEVEL_3 = 3,
}

/** Mode controls the behavior of the command stream when calling wait() */
export enum Fence$Mode {
    /** The command stream is flushed */
    FLUSH = 0,
    /** The command stream is not flushed */
    DONT_FLUSH = 1,
}

/**
 * Error codes for Fence::wait()
 * @see Fence, Fence::wait()
 */
export enum FenceStatus {
    /** An error occurred. The Fence condition is not satisfied. */
    ERROR = -1,
    /** The Fence condition is satisfied. */
    CONDITION_SATISFIED = 0,
    /** wait()'s timeout expired. The Fence condition is not satisfied. */
    TIMEOUT_EXPIRED = 1,
}

export enum FramePacer$FrameStatus {
    /** Skipped to maintain target frame rate cadence (e.g. 30 FPS on 60Hz display). */
    SKIPPED_SPURIOUS = -2,
    /** Skipped to prevent out-of-order presentation (monotonic guard). */
    SKIPPED_STALE = -1,
    /** The frame is approved for rendering. */
    ACCEPTED = 0,
}

export enum FramePacer$PacingStatus {
    /** Operating at or near the optimal configured latency. */
    STEADY = 0,
    /** Latency has shrunk. The display is starving for buffers. */
    DISPLAY_STARVING = -1,
    /** Latency has bloated. The display queue is stuffed. */
    DISPLAY_STUFFED = 1,
}

/**
 * TargetPercentile specifies the desired statistical confidence interval for workload
 * estimation.
 *
 * The percentile P (e.g., P90 = 90%) represents the probability that a frame's processing time
 * will fall within the estimated workload budget. Conversely, 1 - P represents the theoretical
 * probability of exceeding the budget and missing a frame deadline (jank/stutter):
 *
 * - P50 (Z = 0.0): 50% theoretical miss rate. Expect constant judder (30 drops/sec at 60Hz). -
 * P90 (Z = 1.282): 10% theoretical miss rate. Expect a drop every 10 frames (~6 drops/sec at
 * 60Hz). - P95 (Z = 1.645): 5% theoretical miss rate. Expect a drop every 20 frames (~3
 * drops/sec at 60Hz).
 *
 * Note: In practice, actual visual stutters are significantly lower because: 1. Frame
 * workloads have temporal coherence (spikes are clustered rather than independent). 2. The
 * FramePacer's structural latency (queue depth) acts as a shock absorber.
 */
export enum FramePipelineEstimator$TargetPercentile {
    /** 50th percentile (mean workload, Z = 0.0) */
    P50 = 0,
    /** 90th percentile (confidence interval, Z = 1.282) */
    P90 = 1,
    /** 95th percentile (high confidence interval, Z = 1.645) */
    P95 = 2,
}

export enum Frustum$Plane {
    LEFT = 0,
    RIGHT = 1,
    BOTTOM = 2,
    TOP = 3,
    FAR = 4,
    NEAR = 5,
}

export enum IBLPrefilterContext$Kernel {
    D_GGX = 0,
}

/** Type of the index buffer */
export enum IndexBuffer$IndexType {
    /** 16-bit indices */
    USHORT = 12,
    /** 32-bit indices */
    UINT = 17,
}

/** Attribute interpolation types in the fragment shader */
export enum Interpolation {
    /** default, smooth interpolation */
    SMOOTH = 0,
    /** flat interpolation */
    FLAT = 1,
}

export enum LightManager$Builder$Result {
    Error = -1,
    Success = 0,
}

/** Denotes the type of the light being created. */
export enum LightManager$Type {
    /** Directional light that also draws a sun's disk in the sky. */
    SUN = 0,
    /** Directional light, emits light in a given direction. */
    DIRECTIONAL = 1,
    /** Point light, emits light from a position, in all directions. */
    POINT = 2,
    /** Physically correct spot light. */
    FOCUSED_SPOT = 3,
    /** Spot light with coupling of outer cone and illumination disabled. */
    SPOT = 4,
}

/** How the buffer will be mapped. */
export enum MapBufferAccessFlags {
    /** buffer is mapped from writing */
    WRITE_BIT = 2,
    /** the mapped range content is lost */
    INVALIDATE_RANGE_BIT = 4,
}

export enum Material$Builder$ShadowSamplingQuality {
    HARD = 0,
    LOW = 1,
}

/** Defines whether a material instance should use UBO batching or not. */
export enum Material$UboBatchingMode {
    /**
     * For default, it follows the engine settings. If UBO batching is enabled on the engine and
     * the material domain is SURFACE, it turns on the UBO batching. Otherwise, it turns off the
     * UBO batching.
     */
    DEFAULT = 0,
    /** Disable the Ubo Batching for this material */
    DISABLED = 1,
}

/** Material domains */
export enum MaterialDomain {
    /** shaders applied to renderables */
    SURFACE = 0,
    /** shaders applied to rendered buffers */
    POST_PROCESS = 1,
    /** compute shader */
    COMPUTE = 2,
}

/** Pixel Data Format */
export enum PixelDataFormat {
    /** One Red channel, float */
    R = 0,
    /** One Red channel, integer */
    R_INTEGER = 1,
    /** Two Red and Green channels, float */
    RG = 2,
    /** Two Red and Green channels, integer */
    RG_INTEGER = 3,
    /** Three Red, Green and Blue channels, float */
    RGB = 4,
    /** Three Red, Green and Blue channels, integer */
    RGB_INTEGER = 5,
    /** Four Red, Green, Blue and Alpha channels, float */
    RGBA = 6,
    /** Four Red, Green, Blue and Alpha channels, integer */
    RGBA_INTEGER = 7,
    UNUSED = 8,
    /** Depth, 16-bit or 24-bits usually */
    DEPTH_COMPONENT = 9,
    /** Two Depth (24-bits) + Stencil (8-bits) channels */
    DEPTH_STENCIL = 10,
    ALPHA = 11,
}

/** Pixel Data Type */
export enum PixelDataType {
    /** unsigned byte */
    UBYTE = 0,
    /** signed byte */
    BYTE = 1,
    /** unsigned short (16-bit) */
    USHORT = 2,
    /** signed short (16-bit) */
    SHORT = 3,
    /** unsigned int (32-bit) */
    UINT = 4,
    /** signed int (32-bit) */
    INT = 5,
    /** half-float (16-bit float) */
    HALF = 6,
    /** float (32-bits float) */
    FLOAT = 7,
    /**
     * compressed pixels,
     * @see CompressedPixelDataType
     */
    COMPRESSED = 8,
    /** three low precision floating-point numbers */
    UINT_10F_11F_11F_REV = 9,
    /** unsigned int (16-bit), encodes 3 RGB channels */
    USHORT_565 = 10,
    /** unsigned normalized 10 bits RGB, 2 bits alpha */
    UINT_2_10_10_10_REV = 11,
}

/** Defines how asynchronous operations are handled by the engine. */
export enum Platform$AsynchronousMode {
    /** Asynchronous operations are disabled. This is the default. */
    NONE = 0,
    /**
     * Attempts to use a dedicated worker thread for asynchronous tasks. If threading is not
     * supported by the platform, it automatically falls back to using an amortization strategy.
     */
    THREAD_PREFERRED = 1,
    /**
     * Uses an amortization strategy, processing a small number of asynchronous tasks during each
     * engine update cycle.
     */
    AMORTIZATION = 2,
}

/** Frame rate change strategy for setFrameRate(). */
export enum Platform$ChangeFrameRateStrategy {
    /**
     * The frame rate transition is applied only if the display controller can perform it
     * seamlessly without visual glitches or disruptive display mode switch blackouts.
     */
    ONLY_IF_SEAMLESS = 0,
    /**
     * The transition is applied immediately, even if it requires a non-seamless display mode
     * switch that introduces brief screen interruptions or visual artifacts.
     */
    ALWAYS = 1,
}

/** Types of device/driver information that can be queried from the platform. */
export enum Platform$DeviceInfoType {
    /** glGetString(GL_RENDERER) */
    OPENGL_RENDERER = 0,
    /** glGetString(GL_VENDOR) */
    OPENGL_VENDOR = 1,
    /** glGetString(GL_VERSION) */
    OPENGL_VERSION = 2,
    /** VkPhysicalDeviceProperties::deviceName */
    VULKAN_DEVICE_NAME = 3,
    /** VkPhysicalDeviceDriverProperties::driverName */
    VULKAN_DRIVER_NAME = 4,
    /** VkPhysicalDeviceDriverProperties::driverInfo */
    VULKAN_DRIVER_INFO = 5,
}

/** Frame rate compatibility mode for setFrameRate(). */
export enum Platform$FrameRateCompatibility {
    /**
     * The OS matches the frame rate when the surface is active, but may pick a different rate to
     * better harmonize with concurrent windows or display power policies.
     */
    DEFAULT = 0,
    /**
     * The surface represents a fixed-rate source (like video). The OS strongly prioritizes running
     * the display at this exact frame rate regardless of concurrent compositing.
     */
    FIXED_SOURCE = 1,
}

/**
 * This controls the priority level for GPU work scheduling, which helps prioritize the
 * submitted GPU work and enables preemption.
 */
export enum Platform$GpuContextPriority {
    /** Backend default GPU context priority (typically MEDIUM) */
    DEFAULT = 0,
    /**
     * For non-interactive, deferrable workloads. This should not interfere with standard
     * applications.
     */
    LOW = 1,
    /** The default priority level for standard applications. */
    MEDIUM = 2,
    /**
     * For high-priority, latency-sensitive workloads that are more important than standard
     * applications.
     */
    HIGH = 3,
    /**
     * The highest priority, intended for system-critical, real-time applications where missing
     * deadlines is unacceptable (e.g., VR/AR compositors or other system-critical tasks).
     */
    REALTIME = 4,
}

/**
 * The type of technique for stereoscopic rendering. (Note that the materials used will need to
 * be compatible with the chosen technique.)
 */
export enum Platform$StereoscopicType {
    /** No stereoscopic rendering */
    NONE = 0,
    /** Stereoscopic rendering is performed using instanced rendering technique. */
    INSTANCED = 1,
    /** Stereoscopic rendering is performed using the multiview feature from the graphics backend. */
    MULTIVIEW = 2,
}

export enum Precision {
    LOW = 0,
    MEDIUM = 1,
    HIGH = 2,
    DEFAULT = 3,
}

/** Primitive types */
export enum PrimitiveType {
    /** points */
    POINTS = 0,
    /** lines */
    LINES = 1,
    /** line strip */
    LINE_STRIP = 3,
    /** triangles */
    TRIANGLES = 4,
    /** triangle strip */
    TRIANGLE_STRIP = 5,
}

export enum Property {
    /** float4, all shading models */
    BASE_COLOR = 0,
    /** float, lit shading models only */
    ROUGHNESS = 1,
    /** float, all shading models, except unlit and cloth */
    METALLIC = 2,
    /** float, all shading models, except unlit and cloth */
    REFLECTANCE = 3,
    /** float, lit shading models only, except subsurface and cloth */
    AMBIENT_OCCLUSION = 4,
    /** float, lit shading models only, except subsurface and cloth */
    CLEAR_COAT = 5,
    /** float, lit shading models only, except subsurface and cloth */
    CLEAR_COAT_ROUGHNESS = 6,
    /** float, lit shading models only, except subsurface and cloth */
    CLEAR_COAT_NORMAL = 7,
    /** float, lit shading models only, except subsurface and cloth */
    ANISOTROPY = 8,
    /** float3, lit shading models only, except subsurface and cloth */
    ANISOTROPY_DIRECTION = 9,
    /** float, subsurface shading model only */
    THICKNESS = 10,
    /** float, subsurface shading model only */
    SUBSURFACE_POWER = 11,
    /** float3, subsurface and cloth shading models only */
    SUBSURFACE_COLOR = 12,
    /** float3, lit shading models only, except subsurface */
    SHEEN_COLOR = 13,
    /** float3, lit shading models only, except subsurface and cloth */
    SHEEN_ROUGHNESS = 14,
    /** float3, specular-glossiness shading model only */
    SPECULAR_COLOR = 15,
    /** float, specular-glossiness shading model only */
    GLOSSINESS = 16,
    /** float4, all shading models */
    EMISSIVE = 17,
    /** float3, all shading models only, except unlit */
    NORMAL = 18,
    /** float4, all shading models */
    POST_LIGHTING_COLOR = 19,
    /** float, all shading models */
    POST_LIGHTING_MIX_FACTOR = 20,
    /** mat4, vertex shader only */
    CLIP_SPACE_TRANSFORM = 21,
    /** float3, how much light is absorbed by the material */
    ABSORPTION = 22,
    /** float, how much light is refracted through the material */
    TRANSMISSION = 23,
    /** float, material's index of refraction */
    IOR = 24,
    /** float, material's dispersion */
    DISPERSION = 25,
    /** float, thickness of the thin layer */
    MICRO_THICKNESS = 26,
    /** float3, all shading models only, except unlit */
    BENT_NORMAL = 27,
    /** float, lit shading models only, except subsurface and cloth */
    SPECULAR_FACTOR = 28,
    /** float3, lit shading models only, except subsurface and cloth */
    SPECULAR_COLOR_FACTOR = 29,
    /** float, strength of shadows received by this material [0, 1] */
    SHADOW_STRENGTH = 30,
    /** float4, vertex shader only */
    CLIP_SPACE_POSITION = 31,
    /** float, lit shading models only, except subsurface and cloth */
    SECOND_ROUGHNESS = 32,
    /** float, lit shading models only, except subsurface and cloth */
    SECOND_ROUGHNESS_WEIGHT = 33,
}

/** Generic quality level. */
export enum QualityLevel {
    LOW = 0,
    MEDIUM = 1,
    HIGH = 2,
    ULTRA = 3,
}

/** Reflection mode */
export enum ReflectionMode {
    DEFAULT = 0,
    /** reflections sample from the scene's IBL only */
    SCREEN_SPACE = 1,
}

/** Refraction */
export enum RefractionMode {
    /** no refraction */
    NONE = 0,
    /** refracted rays go to the ibl cubemap */
    CUBEMAP = 1,
    /** refracted rays go to screen space */
    SCREEN_SPACE = 2,
}

/** Refraction type */
export enum RefractionType {
    /** refraction through solid objects (e.g. a sphere) */
    SOLID = 0,
    /** refraction through thin objects (e.g. window) */
    THIN = 1,
}

/** Attachment identifiers */
export enum RenderTarget$AttachmentPoint {
    /** identifies the 1st color attachment */
    COLOR0 = 0,
    /** identifies the 2nd color attachment */
    COLOR1 = 1,
    /** identifies the 3rd color attachment */
    COLOR2 = 2,
    /** identifies the 4th color attachment */
    COLOR3 = 3,
    /** identifies the 5th color attachment */
    COLOR4 = 4,
    /** identifies the 6th color attachment */
    COLOR5 = 5,
    /** identifies the 7th color attachment */
    COLOR6 = 6,
    /** identifies the 8th color attachment */
    COLOR7 = 7,
    /** identifies the depth attachment */
    DEPTH = 8,
    /** identifies the 1st color attachment */
    COLOR = 0,
}

/** Type of geometry for a Renderable */
export enum RenderableManager$Builder$GeometryType {
    /** dynamic gemoetry has no restriction */
    DYNAMIC = 0,
    /** bounds and world space transform are immutable */
    STATIC_BOUNDS = 1,
    /** skinning/morphing not allowed and Vertex/IndexBuffer immutables */
    STATIC = 2,
}

/** Type of morphing for a Renderable. This usually acts as a bitmask of multiple types. */
export enum RenderableManager$Builder$MorphType {
    NONE = 0,
    POSITION = 1,
    TANGENT = 2,
    CUSTOM = 4,
}

export enum RenderableManager$Builder$Result {
    Error = -1,
    Success = 0,
}

/** types of RGB colors */
export enum RgbType {
    /** the color is defined in Rec.709-sRGB-D65 (sRGB) space */
    sRGB = 0,
    /** the color is defined in Rec.709-Linear-D65 ("linear sRGB") space */
    LINEAR = 1,
}

/** types of RGBA colors */
export enum RgbaType {
    /**
     * the color is defined in Rec.709-sRGB-D65 (sRGB) space and the RGB values have not been
     * pre-multiplied by the alpha (for instance, a 50% transparent red is < 1,0,0,0.5>)
     */
    sRGB = 0,
    /**
     * the color is defined in Rec.709-Linear-D65 ("linear sRGB") space and the RGB values have not
     * been pre-multiplied by the alpha (for instance, a 50% transparent red is < 1,0,0,0.5>)
     */
    LINEAR = 1,
    /**
     * the color is defined in Rec.709-sRGB-D65 (sRGB) space and the RGB values have been
     * pre-multiplied by the alpha (for instance, a 50% transparent red is < 0.5,0,0,0.5>)
     */
    PREMULTIPLIED_sRGB = 2,
    /**
     * the color is defined in Rec.709-Linear-D65 ("linear sRGB") space and the RGB values have
     * been pre-multiplied by the alpha (for instance, a 50% transparent red is < 0.5,0,0,0.5>)
     */
    PREMULTIPLIED_LINEAR = 3,
}

/** comparison function for the depth / stencil sampler */
export enum SamplerCompareFunc {
    /** Less or equal */
    LE = 0,
    /** Greater or equal */
    GE = 1,
    /** Strictly less than */
    L = 2,
    /** Strictly greater than */
    G = 3,
    /** Equal */
    E = 4,
    /** Not equal */
    NE = 5,
    /** Always. Depth / stencil testing is deactivated. */
    A = 6,
    /** Never. The depth / stencil test always fails. */
    N = 7,
}

/** Sampler compare mode */
export enum SamplerCompareMode {
    NONE = 0,
    COMPARE_TO_TEXTURE = 1,
}

/** Texture sampler format */
export enum SamplerFormat {
    /** signed integer sampler */
    INT = 0,
    /** unsigned integer sampler */
    UINT = 1,
    /** float sampler */
    FLOAT = 2,
    /** shadow sampler (PCF) */
    SHADOW = 3,
}

/** Sampler magnification filter */
export enum SamplerMagFilter {
    /** No filtering. Nearest neighbor is used. */
    NEAREST = 0,
    /** Box filtering. Weighted average of 4 neighbors is used. */
    LINEAR = 1,
}

/** Sampler minification filter */
export enum SamplerMinFilter {
    /** No filtering. Nearest neighbor is used. */
    NEAREST = 0,
    /** Box filtering. Weighted average of 4 neighbors is used. */
    LINEAR = 1,
    /** Mip-mapping is activated. But no filtering occurs. */
    NEAREST_MIPMAP_NEAREST = 2,
    /** Box filtering within a mip-map level. */
    LINEAR_MIPMAP_NEAREST = 3,
    /** Mip-map levels are interpolated, but no other filtering occurs. */
    NEAREST_MIPMAP_LINEAR = 4,
    /** Both interpolated Mip-mapping and linear filtering are used. */
    LINEAR_MIPMAP_LINEAR = 5,
}

/** Texture sampler type */
export enum SamplerType {
    /** 2D texture */
    SAMPLER_2D = 0,
    /** 2D array texture */
    SAMPLER_2D_ARRAY = 1,
    /** Cube map texture */
    SAMPLER_CUBEMAP = 2,
    /** External texture */
    SAMPLER_EXTERNAL = 3,
    /** 3D texture */
    SAMPLER_3D = 4,
    /** Cube map array texture (feature level 2) */
    SAMPLER_CUBEMAP_ARRAY = 5,
}

/** Sampler Wrap mode */
export enum SamplerWrapMode {
    /** clamp-to-edge. The edge of the texture extends to infinity. */
    CLAMP_TO_EDGE = 0,
    /** repeat. The texture infinitely repeats in the wrap direction. */
    REPEAT = 1,
    /** mirrored-repeat. The texture infinitely repeats and mirrors in the wrap direction. */
    MIRRORED_REPEAT = 2,
}

/**
 * Defines the shader language. Similar to the above backend enum, with some differences: - The
 * OpenGL backend can select between two shader languages: ESSL 1.0 and ESSL 3.0. - The Metal
 * backend can prefer precompiled Metal libraries, while falling back to MSL.
 */
export enum ShaderLanguage {
    UNSPECIFIED = -1,
    ESSL1 = 0,
    ESSL3 = 1,
    SPIRV = 2,
    MSL = 3,
    METAL_LIBRARY = 4,
    WGSL = 5,
}

/**
 * Shader model.
 *
 * These enumerants are used across all backends and refer to a level of functionality and
 * quality.
 *
 * For example, the OpenGL backend returns `MOBILE` if it supports OpenGL ES, or `DESKTOP` if
 * it supports Desktop OpenGL, this is later used to select the proper shader.
 *
 * Shader quality vs. performance is also affected by ShaderModel.
 */
export enum ShaderModel {
    /** Mobile level functionality */
    MOBILE = 1,
    /** Desktop level functionality */
    DESKTOP = 2,
}

/** Shader quality, affect some global quality parameters */
export enum ShaderQuality {
    DEFAULT = -1,
    LOW = 0,
    NORMAL = 1,
    HIGH = 2,
}

export enum ShaderStage {
    VERTEX = 0,
    FRAGMENT = 1,
    COMPUTE = 2,
}

export enum ShaderStageFlags {
    NONE = 0,
    VERTEX = 1,
    FRAGMENT = 2,
    COMPUTE = 4,
    ALL_SHADER_STAGE_FLAGS = 7,
}

/** Supported shading models */
export enum Shading {
    /** no lighting applied, emissive possible */
    UNLIT = 0,
    /** default, standard lighting */
    LIT = 1,
    /** subsurface lighting model */
    SUBSURFACE = 2,
    /** cloth lighting model */
    CLOTH = 3,
    /** legacy lighting model */
    SPECULAR_GLOSSINESS = 4,
}

/**
 * List of available shadow mapping techniques.
 * @see #setShadowType
 */
export enum ShadowType {
    /** percentage-closer filtered shadows (default) */
    PCF = 0,
    /** exponential variance shadows (EVSM) */
    VSM = 1,
    /** @deprecated falls back to PCSS */
    DPCF = 2,
    /** EVSM with soft shadows and contact hardening */
    PCSS = 3,
    /** EVSM with soft shadows and contact hardening */
    PCFd = 4,
}

/** Specular occlusion */
export enum SpecularAmbientOcclusion {
    /** no specular occlusion */
    NONE = 0,
    /** simple specular occlusion */
    SIMPLE = 1,
    /** more accurate specular occlusion, requires bent normals */
    BENT_NORMALS = 2,
}

/** stencil faces */
export enum StencilFace {
    /** Update stencil state for front-facing polygons. */
    FRONT = 1,
    /** Update stencil state for back-facing polygons. */
    BACK = 2,
    /** Update stencil state for all polygons. */
    FRONT_AND_BACK = 3,
}

/** stencil operation */
export enum StencilOperation {
    /** Keeps the current value. */
    KEEP = 0,
    /** Sets the value to 0. */
    ZERO = 1,
    /** Sets the value to the stencil reference value. */
    REPLACE = 2,
    /** Increments the current value. Clamps to the maximum representable unsigned value. */
    INCR = 3,
    /**
     * Increments the current value. Wraps value to zero when incrementing the maximum
     * representable unsigned value.
     */
    INCR_WRAP = 4,
    /** Decrements the current value. Clamps to 0. */
    DECR = 5,
    /**
     * Decrements the current value. Wraps value to the maximum representable unsigned value when
     * decrementing a value of zero.
     */
    DECR_WRAP = 6,
    /** Bitwise inverts the current value. */
    INVERT = 7,
}

/** Stream for external textures */
export enum StreamType {
    /** Not synchronized but copy-free. Good for video. */
    NATIVE = 0,
    /** Synchronized, copy-free, and take a release callback. Good for AR but requires API 26+. */
    ACQUIRED = 1,
}

/** Subpass type */
export enum SubpassType {
    SUBPASS_INPUT = 0,
}

/** Bitmask for selecting render buffers */
export enum TargetBufferFlags {
    /** No buffer selected. */
    NONE = 0,
    /** Color buffer selected. */
    COLOR0 = 1,
    /** Color buffer selected. */
    COLOR1 = 2,
    /** Color buffer selected. */
    COLOR2 = 4,
    /** Color buffer selected. */
    COLOR3 = 8,
    /** Color buffer selected. */
    COLOR4 = 16,
    /** Color buffer selected. */
    COLOR5 = 32,
    /** Color buffer selected. */
    COLOR6 = 64,
    /** Color buffer selected. */
    COLOR7 = 128,
    COLOR = 1,
    COLOR_ALL = 255,
    /** Depth buffer selected. */
    DEPTH = 268435456,
    /** Stencil buffer selected. */
    STENCIL = 536870912,
    /** depth and stencil buffer selected. */
    DEPTH_AND_STENCIL = 805306368,
    /** Color, depth and stencil buffer selected. */
    ALL = 805306623,
}

export enum TemporalAntiAliasingOptions$BoxClipping {
    /** Accurate box clipping */
    ACCURATE = 0,
    /** clamping */
    CLAMP = 1,
    /** no rejections (use for debugging) */
    NONE = 2,
}

export enum TemporalAntiAliasingOptions$BoxType {
    /** use an AABB neighborhood */
    AABB = 0,
    /** use both AABB and variance */
    AABB_VARIANCE = 1,
}

export enum TemporalAntiAliasingOptions$JitterPattern {
    /** 4-samples, rotated grid sampling */
    RGSS_X4 = 0,
    /** 4-samples, uniform grid in helix sequence */
    UNIFORM_HELIX_X4 = 1,
    /** 8-samples of halton 2,3 */
    HALTON_23_X8 = 2,
    /** 16-samples of halton 2,3 */
    HALTON_23_X16 = 3,
    /** 32-samples of halton 2,3 */
    HALTON_23_X32 = 4,
}

/** Texture Cubemap Face */
export enum TextureCubemapFace {
    /** +x face */
    POSITIVE_X = 0,
    /** -x face */
    NEGATIVE_X = 1,
    /** +y face */
    POSITIVE_Y = 2,
    /** -y face */
    NEGATIVE_Y = 3,
    /** +z face */
    POSITIVE_Z = 4,
    /** -z face */
    NEGATIVE_Z = 5,
}

/**
 * Supported texel formats These formats are typically used to specify a texture's internal
 * storage format.
 *
 * Enumerants syntax format ========================
 *
 * `[components][size][type]`
 *
 * `components` : List of stored components by this format. `size` : Size in bit of each
 * component. `type` : Type this format is stored as.
 *
 * Name | Component :--------|:------------------------------- R | Linear Red RG | Linear Red,
 * Green RGB | Linear Red, Green, Blue RGBA | Linear Red, Green Blue, Alpha SRGB | sRGB encoded
 * Red, Green, Blue DEPTH | Depth STENCIL | Stencil
 *
 * Name | Type :--------|:--------------------------------------------------- (none) | Unsigned
 * Normalized Integer [0, 1] _SNORM | Signed Normalized Integer [-1, 1] UI | Unsigned Integer
 *
 * I | Signed Integer
 *
 * F | Floating-point
 *
 * Special color formats ---------------------
 *
 * There are a few special color formats that don't follow the convention above:
 *
 * Name | Format
 * :----------------|:--------------------------------------------------------------------------
 * RGB565 | 5-bits for R and B, 6-bits for G. RGB5_A1 | 5-bits for R, G and B, 1-bit for A.
 * RGB10_A2 | 10-bits for R, G and B, 2-bits for A. RGB9_E5 | **Unsigned** floating point.
 * 9-bits mantissa for RGB, 5-bits shared exponent R11F_G11F_B10F | **Unsigned** floating
 * point. 6-bits mantissa, for R and G, 5-bits for B. 5-bits exponent. SRGB8_A8 | sRGB 8-bits
 * with linear 8-bits alpha. DEPTH24_STENCIL8 | 24-bits unsigned normalized integer depth,
 * 8-bits stencil. DEPTH32F_STENCIL8| 32-bits floating-point depth, 8-bits stencil.
 *
 * Compressed texture formats --------------------------
 *
 * Many compressed texture formats are supported as well, which include (but are not limited
 * to) the following list:
 *
 * Name | Format
 * :----------------|:--------------------------------------------------------------------------
 * EAC_R11 | Compresses R11UI EAC_R11_SIGNED | Compresses R11I EAC_RG11 | Compresses RG11UI
 * EAC_RG11_SIGNED | Compresses RG11I ETC2_RGB8 | Compresses RGB8 ETC2_SRGB8 | compresses SRGB8
 * ETC2_EAC_RGBA8 | Compresses RGBA8 ETC2_EAC_SRGBA8 | Compresses SRGB8_A8 ETC2_RGB8_A1 |
 * Compresses RGB8 with 1-bit alpha ETC2_SRGB8_A1 | Compresses sRGB8 with 1-bit alpha
 * @see Texture
 */
export enum TextureFormat {
    R8 = 0,
    R8_SNORM = 1,
    R8UI = 2,
    R8I = 3,
    STENCIL8 = 4,
    R16F = 5,
    R16UI = 6,
    R16I = 7,
    RG8 = 8,
    RG8_SNORM = 9,
    RG8UI = 10,
    RG8I = 11,
    RGB565 = 12,
    RGB9_E5 = 13,
    RGB5_A1 = 14,
    RGBA4 = 15,
    DEPTH16 = 16,
    RGB8 = 17,
    SRGB8 = 18,
    RGB8_SNORM = 19,
    RGB8UI = 20,
    RGB8I = 21,
    DEPTH24 = 22,
    R32F = 23,
    R32UI = 24,
    R32I = 25,
    RG16F = 26,
    RG16UI = 27,
    RG16I = 28,
    R11F_G11F_B10F = 29,
    RGBA8 = 30,
    SRGB8_A8 = 31,
    RGBA8_SNORM = 32,
    UNUSED = 33,
    RGB10_A2 = 34,
    RGBA8UI = 35,
    RGBA8I = 36,
    DEPTH32F = 37,
    DEPTH24_STENCIL8 = 38,
    DEPTH32F_STENCIL8 = 39,
    RGB16F = 40,
    RGB16UI = 41,
    RGB16I = 42,
    RG32F = 43,
    RG32UI = 44,
    RG32I = 45,
    RGBA16F = 46,
    RGBA16UI = 47,
    RGBA16I = 48,
    RGB32F = 49,
    RGB32UI = 50,
    RGB32I = 51,
    RGBA32F = 52,
    RGBA32UI = 53,
    RGBA32I = 54,
    EAC_R11 = 55,
    EAC_R11_SIGNED = 56,
    EAC_RG11 = 57,
    EAC_RG11_SIGNED = 58,
    ETC2_RGB8 = 59,
    ETC2_SRGB8 = 60,
    ETC2_RGB8_A1 = 61,
    ETC2_SRGB8_A1 = 62,
    ETC2_EAC_RGBA8 = 63,
    ETC2_EAC_SRGBA8 = 64,
    DXT1_RGB = 65,
    DXT1_RGBA = 66,
    DXT3_RGBA = 67,
    DXT5_RGBA = 68,
    DXT1_SRGB = 69,
    DXT1_SRGBA = 70,
    DXT3_SRGBA = 71,
    DXT5_SRGBA = 72,
    RGBA_ASTC_4x4 = 73,
    RGBA_ASTC_5x4 = 74,
    RGBA_ASTC_5x5 = 75,
    RGBA_ASTC_6x5 = 76,
    RGBA_ASTC_6x6 = 77,
    RGBA_ASTC_8x5 = 78,
    RGBA_ASTC_8x6 = 79,
    RGBA_ASTC_8x8 = 80,
    RGBA_ASTC_10x5 = 81,
    RGBA_ASTC_10x6 = 82,
    RGBA_ASTC_10x8 = 83,
    RGBA_ASTC_10x10 = 84,
    RGBA_ASTC_12x10 = 85,
    RGBA_ASTC_12x12 = 86,
    SRGB8_ALPHA8_ASTC_4x4 = 87,
    SRGB8_ALPHA8_ASTC_5x4 = 88,
    SRGB8_ALPHA8_ASTC_5x5 = 89,
    SRGB8_ALPHA8_ASTC_6x5 = 90,
    SRGB8_ALPHA8_ASTC_6x6 = 91,
    SRGB8_ALPHA8_ASTC_8x5 = 92,
    SRGB8_ALPHA8_ASTC_8x6 = 93,
    SRGB8_ALPHA8_ASTC_8x8 = 94,
    SRGB8_ALPHA8_ASTC_10x5 = 95,
    SRGB8_ALPHA8_ASTC_10x6 = 96,
    SRGB8_ALPHA8_ASTC_10x8 = 97,
    SRGB8_ALPHA8_ASTC_10x10 = 98,
    SRGB8_ALPHA8_ASTC_12x10 = 99,
    SRGB8_ALPHA8_ASTC_12x12 = 100,
    RED_RGTC1 = 101,
    SIGNED_RED_RGTC1 = 102,
    RED_GREEN_RGTC2 = 103,
    SIGNED_RED_GREEN_RGTC2 = 104,
    RGB_BPTC_SIGNED_FLOAT = 105,
    RGB_BPTC_UNSIGNED_FLOAT = 106,
    RGBA_BPTC_UNORM = 107,
    SRGB_ALPHA_BPTC_UNORM = 108,
}

/** Texture swizzle */
export enum TextureSwizzle {
    SUBSTITUTE_ZERO = 0,
    SUBSTITUTE_ONE = 1,
    CHANNEL_0 = 2,
    CHANNEL_1 = 3,
    CHANNEL_2 = 4,
    CHANNEL_3 = 5,
}

export enum TextureType {
    FLOAT = 0,
    INT = 1,
    UINT = 2,
    DEPTH = 3,
    STENCIL = 4,
    DEPTH_STENCIL = 5,
}

/** Bitmask describing the intended Texture Usage */
export enum TextureUsage {
    NONE = 0,
    /** Texture can be used as a color attachment */
    COLOR_ATTACHMENT = 1,
    /** Texture can be used as a depth attachment */
    DEPTH_ATTACHMENT = 2,
    /** Texture can be used as a stencil attachment */
    STENCIL_ATTACHMENT = 4,
    /** Data can be uploaded into this texture (default) */
    UPLOADABLE = 8,
    /** Texture can be sampled (default) */
    SAMPLEABLE = 16,
    /** Texture can be used as a subpass input */
    SUBPASS_INPUT = 32,
    /** Texture can be used the source of a blit() */
    BLIT_SRC = 64,
    /** Texture can be used the destination of a blit() */
    BLIT_DST = 128,
    /** Texture can be used for protected content */
    PROTECTED = 256,
    /** Texture can be used with generateMipmaps() */
    GEN_MIPMAPPABLE = 512,
    /** Default texture usage */
    DEFAULT = 24,
    /** Mask of all attachments */
    ALL_ATTACHMENTS = 39,
}

export enum TimerQueryResult {
    ERROR = -1,
    NOT_READY = 0,
    AVAILABLE = 1,
}

/** How transparent objects are handled */
export enum TransparencyMode {
    /** the transparent object is drawn honoring the raster state */
    DEFAULT = 0,
    /**
     * the transparent object is first drawn in the depth buffer, then in the color buffer,
     * honoring the culling mode, but ignoring the depth test function
     */
    TWO_PASSES_ONE_SIDE = 1,
    /**
     * the transparent object is drawn twice in the color buffer, first with back faces only, then
     * with front faces; the culling mode is ignored. Can be combined with two-sided lighting
     */
    TWO_PASSES_TWO_SIDES = 2,
}

/** Supported uniform types */
export enum UniformType {
    BOOL = 0,
    BOOL2 = 1,
    BOOL3 = 2,
    BOOL4 = 3,
    FLOAT = 4,
    FLOAT2 = 5,
    FLOAT3 = 6,
    FLOAT4 = 7,
    INT = 8,
    INT2 = 9,
    INT3 = 10,
    INT4 = 11,
    UINT = 12,
    UINT2 = 13,
    UINT3 = 14,
    UINT4 = 15,
    /** a 3x3 float matrix */
    MAT3 = 16,
    /** a 4x4 float matrix */
    MAT4 = 17,
    STRUCT = 18,
}

export enum UserVariantFilterBit {
    /** Directional lighting */
    DIRECTIONAL_LIGHTING = 1,
    /** Dynamic lighting */
    DYNAMIC_LIGHTING = 2,
    /** Shadow receiver */
    SHADOW_RECEIVER = 4,
    /** Skinning */
    SKINNING = 8,
    /** Fog */
    FOG = 16,
    /** Variance shadow maps */
    VSM = 32,
    /** Screen-space reflections */
    SSR = 64,
    /** Instanced stereo rendering */
    STE = 128,
    ALL = 255,
}

export enum UvSet {
    UNUSED = 0,
    UV0 = 1,
    UV1 = 2,
}

/** Vertex attribute types */
export enum VertexAttribute {
    /** XYZ position (float3) */
    POSITION = 0,
    /** tangent, bitangent and normal, encoded as a quaternion (float4) */
    TANGENTS = 1,
    /** vertex color (float4) */
    COLOR = 2,
    /** texture coordinates (float2) */
    UV0 = 3,
    /** texture coordinates (float2) */
    UV1 = 4,
    /** indices of 4 bones, as unsigned integers (uvec4) */
    BONE_INDICES = 5,
    /** weights of the 4 bones (normalized float4) */
    BONE_WEIGHTS = 6,
    CUSTOM0 = 8,
    CUSTOM1 = 9,
    CUSTOM2 = 10,
    CUSTOM3 = 11,
    CUSTOM4 = 12,
    CUSTOM5 = 13,
    CUSTOM6 = 14,
    CUSTOM7 = 15,
    MORPH_POSITION_0 = 8,
    MORPH_POSITION_1 = 9,
    MORPH_POSITION_2 = 10,
    MORPH_POSITION_3 = 11,
    MORPH_TANGENTS_0 = 12,
    MORPH_TANGENTS_1 = 13,
    MORPH_TANGENTS_2 = 14,
    MORPH_TANGENTS_3 = 15,
}

/** Supported types of vertex domains. */
export enum VertexDomain {
    /** vertices are in object space, default */
    OBJECT = 0,
    /** vertices are in world space */
    WORLD = 1,
    /** vertices are in view space */
    VIEW = 2,
    /** vertices are in normalized device space */
    DEVICE = 3,
}

/**
 * List of available ambient occlusion techniques
 *
 * @deprecated use AmbientOcclusionOptions::enabled instead
 */
export enum View$AmbientOcclusion {
    /** No Ambient Occlusion */
    NONE = 0,
    /** Basic, sampling SSAO */
    SSAO = 1,
}

export enum Workaround {
    SPLIT_EASU = 0,
    ALLOW_READ_ONLY_ANCILLARY_FEEDBACK_LOOP = 1,
    ADRENO_UNIFORM_ARRAY_CRASH = 2,
    METAL_STATIC_TEXTURE_TARGET_ERROR = 3,
    DISABLE_BLIT_INTO_TEXTURE_ARRAY = 4,
    POWER_VR_SHADER_WORKAROUNDS = 5,
    DISABLE_DEPTH_PRECACHE_FOR_DEFAULT_MATERIAL = 6,
    EMULATE_SRGB_SWAPCHAIN = 7,
}

export enum camutils$Fov {
    VERTICAL = 0,
    HORIZONTAL = 1,
}

/**
 * Keys used to translate the camera in FREE_FLIGHT mode. FORWARD and BACKWARD dolly the camera
 * forwards and backwards. LEFT and RIGHT strafe the camera left and right. UP and DOWN boom
 * the camera upwards and downwards.
 */
export enum camutils$Manipulator$Key {
    FORWARD = 0,
    LEFT = 1,
    BACKWARD = 2,
    RIGHT = 3,
    UP = 4,
    DOWN = 5,
    COUNT = 6,
}

export enum camutils$Mode {
    ORBIT = 0,
    MAP = 1,
    FREE_FLIGHT = 2,
}

export enum filamat$MaterialBuilder$OutputTarget {
    COLOR = 0,
    DEPTH = 1,
}

export enum filamat$MaterialBuilder$OutputType {
    FLOAT = 0,
    FLOAT2 = 1,
    FLOAT3 = 2,
    FLOAT4 = 3,
    INT = 4,
    INT2 = 5,
    INT3 = 6,
    INT4 = 7,
    UINT = 8,
    UINT2 = 9,
    UINT3 = 10,
    UINT4 = 11,
}

export enum filamat$MaterialBuilder$Variable {
    CUSTOM0 = 0,
    CUSTOM1 = 1,
    CUSTOM2 = 2,
    CUSTOM3 = 3,
    CUSTOM4 = 4,
}

export enum filamat$MaterialBuilder$VariableQualifier {
    OUT = 0,
}

export enum filamat$MaterialBuilderBase$Optimization {
    NONE = 0,
    PREPROCESSOR = 1,
    SIZE = 2,
    PERFORMANCE = 3,
}

/**
 * High-level hint that works in concert with TargetApi to determine the shader models (used to
 * generate GLSL) and final output representations (spirv and/or text). When generating the
 * GLSL this is used to differentiate OpenGL from OpenGLES, it is also used to make some
 * performance adjustments.
 */
export enum filamat$MaterialBuilderBase$Platform {
    DESKTOP = 0,
    MOBILE = 1,
    ALL = 2,
}

/**
 * TargetApi defines which language after transpilation will be used, it is used to account for
 * some differences between these languages when generating the GLSL.
 */
export enum filamat$MaterialBuilderBase$TargetApi {
    OPENGL = 1,
    VULKAN = 2,
    METAL = 4,
    WEBGPU = 8,
    ALL = 7,
}

export enum filamat$MaterialBuilderBase$TargetLanguage {
    GLSL = 0,
    SPIRV = 1,
}

export enum filamesh$Flags {
    INTERLEAVED = 1,
    TEXCOORD_SNORM16 = 2,
    COMPRESSION = 4,
}

export enum filamesh$IndexType {
    UI32 = 0,
    UI16 = 1,
}

export enum geometry$ComponentType {
    /** If normalization is enabled, this maps from [-127,127] to [-1,+1] */
    BYTE = 0,
    /** If normalization is enabled, this maps from [0,255] to [0, +1] */
    UBYTE = 1,
    /** If normalization is enabled, this maps from [-32767,32767] to [-1,+1] */
    SHORT = 2,
    /** If normalization is enabled, this maps from [0,65535] to [0, +1] */
    USHORT = 3,
    /** 1 sign bit, 5 exponent bits, and 5 mantissa bits. */
    HALF = 4,
    /** Standard 32-bit float */
    FLOAT = 5,
}

export enum geometry$TangentSpaceMesh$Algorithm {
    /**
     * default
     *
     * Tries to select the best possible algorithm given the input. The corresponding algorithms
     * are detailed in the corresponding enums. INPUT ALGORITHM
     * ----------------------------------------------------------- normals FRISVAD positions +
     * indices FLAT_SHADING normals + uvs + positions + indices MIKKTSPACE
     */
    DEFAULT = 0,
    /**
     * mikktspace
     *
     * **Requires**: `normals + uvs + positions + indices` **Reference**: - Mikkelsen, M., 2008.
     * Simulation of wrinkled surfaces revisited. - https://github.com/mmikk/MikkTSpace -
     * https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#meshes-overview
     *
     * **Note**: Will remesh
     */
    MIKKTSPACE = 1,
    /**
     * Lengyel's method
     *
     * **Requires**: `normals + uvs + positions + indices` **Reference**: Lengyel, E., 2019.
     * Foundations of Game Engine Development: Rendering. Terathon Software LLC.. (Chapter 7)
     */
    LENGYEL = 2,
    /**
     * Hughes-Moller method
     *
     * **Requires**: `normals` **Reference**: - Hughes, J.F. and Moller, T., 1999. Building an
     * orthonormal basis from a unit vector. journal of graphics tools, 4(4), pp.33-35. - Parker,
     * S.G., Bigler, J., Dietrich, A., Friedrich, H., Hoberock, J., Luebke, D., McAllister, D.,
     * McGuire, M., Morley, K., Robison, A. and Stich, M., 2010. Optix: a general purpose ray
     * tracing engine. Acm transactions on graphics (tog), 29(4), pp.1-13. **Note**: We implement
     * the Optix variant, which is documented in the second reference above.
     */
    HUGHES_MOLLER = 3,
    /**
     * Frisvad's method
     *
     * **Requires**: `normals` **Reference**: - Frisvad, J.R., 2012. Building an orthonormal basis
     * from a 3D unit vector without normalization. Journal of Graphics Tools, 16(3), pp.151-159. -
     * http://people.compute.dtu.dk/jerf/code/hairy/
     */
    FRISVAD = 4,
}

/**
 * This enum specifies the auxiliary attributes of each vertex that can be provided as input.
 * These attributes do not affect the computation of the tangent space, but they will be
 * properly mapped when a remeshing is carried out.
 */
export enum geometry$TangentSpaceMesh$AuxAttribute {
    UV1 = 0,
    COLORS = 1,
    JOINTS = 2,
    WEIGHTS = 3,
}

/** Controls the weighted average used across a window of source samples. */
export enum image$Filter {
    DEFAULT = 0,
    BOX = 1,
    NEAREST = 2,
    HERMITE = 3,
    GAUSSIAN_SCALARS = 4,
    GAUSSIAN_NORMALS = 5,
    MITCHELL = 6,
    LANCZOS = 7,
    MINIMUM = 8,
}

/** Transforms the texel fetching operation when sampling from adjacent images. */
export enum image$Orientation {
    STANDARD = 0,
    FLIP_X = 1,
    FLIP_Y = 2,
    FLIP_XY = 3,
}

export enum ktxreader$Ktx2Reader$Result {
    SUCCESS = 0,
    COMPRESSED_TRANSCODE_FAILURE = 1,
    UNCOMPRESSED_TRANSCODE_FAILURE = 2,
    FORMAT_UNSUPPORTED = 3,
    FORMAT_ALREADY_REQUESTED = 4,
}

export enum ktxreader$Ktx2Reader$TransferFunction {
    LINEAR = 0,
    sRGB = 1,
}

/** Formats that could be used for exporting the screenshots. */
export enum viewer$AutomationEngine$Options$ExportFormat {
    /** Tagged Image File Format (TIFF) */
    TIFF = 0,
    /** Netpbm color image format (Portable Pixel Map) */
    PPM = 1,
}

export enum viewer$CustomLut {
    NONE = 0,
    NEGATIVE = 1,
    GRAYSCALE = 2,
    SEPIA = 3,
    TEAL_AND_ORANGE = 4,
}

export enum viewer$ToneMapping {
    LINEAR = 0,
    ACES_LEGACY = 1,
    ACES = 2,
    FILMIC = 3,
    AGX = 4,
    GENERIC = 5,
    PBR_NEUTRAL = 6,
    GT7 = 7,
    DISPLAY_RANGE = 8,
}

/** An axis aligned box represented by its min and max coordinates */
export interface Aabb {
    /** min coordinates */
    min?: float3;
    /** max coordinates */
    max?: float3;
}

/**
 * Options for screen space Ambient Occlusion (SSAO) and Screen Space Cone Tracing (SSCT)
 * @see #setAmbientOcclusionOptions
 */
export interface AmbientOcclusionOptions {
    /** Type of ambient occlusion algorithm. */
    aoType?: AmbientOcclusionOptions$AmbientOcclusionType;
    /** Ambient Occlusion radius in meters, between 0 and ~10. */
    radius?: number;
    /** Controls ambient occlusion's contrast. Must be positive. */
    power?: number;
    /**
     * Self-occlusion bias in meters. Use to avoid self-occlusion. Between 0 and a few mm. No
     * effect when aoType set to GTAO
     */
    bias?: number;
    /** How each dimension of the AO buffer is scaled. Must be either 0.5 or 1.0. */
    resolution?: number;
    /** Strength of the Ambient Occlusion effect. */
    intensity?: number;
    /** depth distance that constitute an edge for filtering */
    bilateralThreshold?: number;
    /** affects # of samples used for AO and params for filtering */
    quality?: QualityLevel;
    /** affects AO smoothness. Recommend setting to HIGH when aoType set to GTAO. */
    lowPassFilter?: QualityLevel;
    /** affects AO buffer upsampling quality */
    upsampling?: QualityLevel;
    /** enables or disables screen-space ambient occlusion */
    enabled?: boolean;
    /** enables bent normals computation from AO, and specular AO */
    bentNormals?: boolean;
    /** min angle in radian to consider. No effect when aoType set to GTAO. */
    minHorizonAngleRad?: number;
    ssct?: AmbientOcclusionOptions$Ssct;
    gtao?: AmbientOcclusionOptions$Gtao;
}

/** Ground Truth-base Ambient Occlusion (GTAO) options */
export interface AmbientOcclusionOptions$Gtao {
    /** # of slices. Higher value makes less noise. */
    sampleSliceCount?: number;
    /** # of steps the radius is divided into for integration. Higher value makes less bias. */
    sampleStepsPerSlice?: number;
    /**
     * thickness heuristic, should be closed to 0. No effect when useVisibilityBitmasks sets to
     * true.
     */
    thicknessHeuristic?: number;
    /**
     * Enables or disables visibility bitmasks mode. Notes that bent normal doesn't work under this
     * mode. Caution: Changing this option at runtime is very expensive as it may trigger a shader
     * re-compilation.
     */
    useVisibilityBitmasks?: boolean;
    /**
     * constant thickness value of objects on the screen in world space. Only take effect when
     * useVisibilityBitmasks is set to true.
     */
    constThickness?: number;
    /**
     * Increase thickness with distance to maintain detail on distant surfaces. Caution: Changing
     * this option at runtime is very expensive as it may trigger a shader re-compilation.
     */
    linearThickness?: boolean;
}

/** Screen Space Cone Tracing (SSCT) options Ambient shadows from dominant light */
export interface AmbientOcclusionOptions$Ssct {
    /** full cone angle in radian, between 0 and pi/2 */
    lightConeRad?: number;
    /** how far shadows can be cast */
    shadowDistance?: number;
    /** max distance for contact */
    contactDistanceMax?: number;
    /** intensity */
    intensity?: number;
    /** light direction */
    lightDirection?: float3;
    /** depth bias in world units (mitigate self shadowing) */
    depthBias?: number;
    /** depth slope bias (mitigate self shadowing) */
    depthSlopeBias?: number;
    /** tracing sample count, between 1 and 255 */
    sampleCount?: number;
    /** # of rays to trace, between 1 and 255 */
    rayCount?: number;
    /** enables or disables SSCT */
    enabled?: boolean;
}

export interface AssetConfiguration {
}

export interface AssetConfigurationExtended {
}

/** Vertex attribute descriptor */
export interface Attribute {
    /** attribute offset in bytes */
    offset?: number;
    /** attribute stride in bytes */
    stride?: number;
    /** attribute buffer index */
    buffer?: number;
    /** attribute element type */
    type?: ElementType;
    /** attribute flags */
    flags?: number;
}

/**
 * Options to control the bloom effect
 *
 * enabled: Enable or disable the bloom post-processing effect. Disabled by default.
 *
 * levels: Number of successive blurs to achieve the blur effect, the minimum is 3 and the
 * maximum is 12. This value together with resolution influences the spread of the blur effect.
 * This value can be silently reduced to accommodate the original image size.
 *
 * resolution: Resolution of bloom's minor axis. The minimum value is 2^levels and the the
 * maximum is lower of the original resolution and 4096. This parameter is silently clamped to
 * the minimum and maximum. It is highly recommended that this value be smaller than the target
 * resolution after dynamic resolution is applied (horizontally and vertically).
 *
 * strength: how much of the bloom is added to the original image. Between 0 and 1.
 *
 * blendMode: Whether the bloom effect is purely additive (false) or mixed with the original
 * image (true).
 *
 * threshold: When enabled, a threshold at 1.0 is applied on the source image, this is useful
 * for artistic reasons and is usually needed when a dirt texture is used.
 *
 * dirt: A dirt/scratch/smudges texture (that can be RGB), which gets added to the bloom
 * effect. Smudges are visible where bloom occurs. Threshold must be enabled for the dirt
 * effect to work properly.
 *
 * dirtStrength: Strength of the dirt texture.
 */
export interface BloomOptions {
    /** strength of the dirt texture */
    dirtStrength?: number;
    /** bloom's strength between 0.0 and 1.0 */
    strength?: number;
    /** resolution of vertical axis (2^levels to 2048) */
    resolution?: number;
    /** number of blur levels (1 to 11) */
    levels?: number;
    /** how the bloom effect is applied */
    blendMode?: BloomOptions$BlendMode;
    /** whether to threshold the source */
    threshold?: boolean;
    /** enable or disable bloom */
    enabled?: boolean;
    /** limit highlights to this value before bloom [10, +inf] */
    highlight?: number;
    /**
     * Bloom quality level. LOW (default): use a more optimized down-sampling filter, however there
     * can be artifacts with dynamic resolution, this can be alleviated by using the homogenous
     * mode. MEDIUM: Good balance between quality and performance. HIGH: In this mode the bloom
     * resolution is automatically increased to avoid artifacts. This mode can be significantly
     * slower on mobile, especially at high resolution. This mode greatly improves the anamorphic
     * bloom.
     */
    quality?: QualityLevel;
    /** enable screen-space lens flare */
    lensFlare?: boolean;
    /** enable starburst effect on lens flare */
    starburst?: boolean;
    /** amount of chromatic aberration */
    chromaticAberration?: number;
    /** number of flare "ghosts" */
    ghostCount?: number;
    /** spacing of the ghost in screen units [0, 1[ */
    ghostSpacing?: number;
    /** hdr threshold for the ghosts */
    ghostThreshold?: number;
    /** thickness of halo in vertical screen units, 0 to disable */
    haloThickness?: number;
    /** radius of halo in vertical screen units [0, 0.5] */
    haloRadius?: number;
    /** hdr threshold for the halo */
    haloThreshold?: number;
}

/** @ } */
export interface DebugRegistry$DataSource {
    count?: number;
}

export interface DebugRegistry$FrameHistory {
    target?: number;
    targetWithHeadroom?: number;
    frameTime?: number;
    frameTimeDenoised?: number;
    scale?: number;
    pid_e?: number;
    pid_i?: number;
    pid_d?: number;
}

/**
 * Options to control Depth of Field (DoF) effect in the scene.
 *
 * cocScale can be used to set the depth of field blur independently of the camera aperture,
 * e.g. for artistic reasons. This can be achieved by setting: cocScale = cameraAperture /
 * desiredDoFAperture
 * @see Camera
 */
export interface DepthOfFieldOptions {
    /** circle of confusion scale factor (amount of blur) */
    cocScale?: number;
    /** width/height aspect ratio of the circle of confusion (simulate anamorphic lenses) */
    cocAspectRatio?: number;
    /** maximum aperture diameter in meters (zero to disable rotation) */
    maxApertureDiameter?: number;
    /** enable or disable depth of field effect */
    enabled?: boolean;
    /** filter to use for filling gaps in the kernel */
    filter?: DepthOfFieldOptions$Filter;
    /** perform DoF processing at native resolution */
    nativeResolution?: boolean;
    /**
     * Number of of rings used by the gather kernels. The number of rings affects quality and
     * performance. The actual number of sample per pixel is defined as (ringCount * 2 - 1)^2. Here
     * are a few commonly used values: 3 rings : 25 ( 5x 5 grid) 4 rings : 49 ( 7x 7 grid) 5 rings
     * : 81 ( 9x 9 grid) 17 rings : 1089 (33x33 grid)
     *
     * With a maximum circle-of-confusion of 32, it is never necessary to use more than 17 rings.
     *
     * Usually all three settings below are set to the same value, however, it is often acceptable
     * to use a lower ring count for the "fast tiles", which improves performance. Fast tiles are
     * regions of the screen where every pixels have a similar circle-of-confusion radius.
     *
     * A value of 0 means default, which is 5 on desktop and 3 on mobile.
     *
     * number of kernel rings for foreground tiles
     * @see #backgroundRingCount
     * @see #fastGatherRingCount
     */
    foregroundRingCount?: number;
    /** number of kernel rings for background tiles */
    backgroundRingCount?: number;
    /** number of kernel rings for fast tiles */
    fastGatherRingCount?: number;
    /**
     * maximum circle-of-confusion in pixels for the foreground, must be in [0, 32] range. A value
     * of 0 means default, which is 32 on desktop and 24 on mobile.
     */
    maxForegroundCOC?: number;
    /**
     * maximum circle-of-confusion in pixels for the background, must be in [0, 32] range. A value
     * of 0 means default, which is 32 on desktop and 24 on mobile.
     */
    maxBackgroundCOC?: number;
}

/** Specifies the mapping of the near and far clipping plane to window coordinates. */
export interface DepthRange {
    /** mapping of the near plane to window coordinates. */
    near?: number;
    /** mapping of the far plane to window coordinates. */
    far?: number;
}

export interface DescriptorSetLayout {
}

export interface DescriptorSetLayoutDescriptor {
    type?: DescriptorType;
    stageFlags?: ShaderStageFlags;
    binding?: number;
    flags?: DescriptorFlags;
    count?: number;
}

/**
 * Dynamic resolution can be used to either reach a desired target frame rate by lowering the
 * resolution of a View, or to increase the quality when the rendering is faster than the
 * target frame rate.
 *
 * This structure can be used to specify the minimum scale factor used when lowering the
 * resolution of a View, and the maximum scale factor used when increasing the resolution for
 * higher quality rendering. The scale factors can be controlled on each X and Y axis
 * independently. By default, all scale factors are set to 1.0.
 *
 * enabled: enable or disables dynamic resolution on a View
 *
 * homogeneousScaling: by default the system scales the major axis first. Set this to true to
 * force homogeneous scaling.
 *
 * minScale: the minimum scale in X and Y this View should use
 *
 * maxScale: the maximum scale in X and Y this View should use
 *
 * quality: upscaling quality. LOW: 1 bilinear tap, Medium: 4 bilinear taps, High: 9 bilinear
 * taps (tent)
 *
 * Note: Dynamic resolution is only supported on platforms where the time to render a frame can
 * be measured accurately. On platforms where this is not supported, Dynamic Resolution can't
 * be enabled unless minScale == maxScale .
 * @see Renderer.FrameRateOptions
 */
export interface DynamicResolutionOptions {
    /** minimum scale factors in x and y */
    minScale?: float2;
    /** maximum scale factors in x and y */
    maxScale?: float2;
    /** sharpness when QualityLevel::MEDIUM or higher is used [0 (disabled), 1 (sharpest)] */
    sharpness?: number;
    /** enable or disable dynamic resolution */
    enabled?: boolean;
    /** set to true to force homogeneous scaling */
    homogeneousScaling?: boolean;
    /**
     * Upscaling quality LOW: bilinear filtered blit. Fastest, poor quality MEDIUM: Qualcomm
     * Snapdragon Game Super Resolution (SGSR) 1.0 HIGH: AMD FidelityFX FSR1 w/ mobile
     * optimizations ULTRA: AMD FidelityFX FSR1 FSR1 and SGSR require a well anti-aliased (MSAA or
     * TAA), noise free scene. Avoid FXAA and dithering.
     *
     * The default upscaling quality is set to LOW.
     *
     * caveat: currently, quality is always set to LOW if the View is TRANSLUCENT.
     */
    quality?: QualityLevel;
}

/**
 * Config is used to define the memory footprint used by the engine, such as the command buffer
 * size. Config can be used to customize engine requirements based on the applications needs.
 *
 * .perRenderPassArenaSizeMB (default: 3 MiB) +--------------------------+ | | |
 * .perFrameCommandsSizeMB | | (default 2 MiB) | | | +--------------------------+ | (froxel,
 * etc...) | +--------------------------+
 *
 * .commandBufferSizeMB (default 3MiB) +--------------------------+ | .minCommandBufferSizeMB |
 * +--------------------------+ | .minCommandBufferSizeMB | +--------------------------+ |
 * .minCommandBufferSizeMB | +--------------------------+ : : : :
 */
export interface Engine$Config {
    /**
     * Size in MiB of the low-level command buffer arena.
     *
     * Each new command buffer is allocated from here. If this buffer is too small the program
     * might terminate or rendering errors might occur.
     *
     * This is typically set to minCommandBufferSizeMB * 3, so that up to 3 frames can be
     * batched-up at once.
     *
     * This value affects the application's memory usage.
     */
    commandBufferSizeMB?: number;
    /**
     * Size in MiB of the per-frame data arena.
     *
     * This is the main arena used for allocations when preparing a frame. e.g.: Froxel data and
     * high-level commands are allocated from this arena.
     *
     * If this size is too small, the program will abort on debug builds and have undefined
     * behavior otherwise.
     *
     * This value affects the application's memory usage.
     */
    perRenderPassArenaSizeMB?: number;
    /**
     * Size in MiB of the backend's handle arena.
     *
     * Backends will fallback to slower heap-based allocations when running out of space and log
     * this condition.
     *
     * If 0, then the default value for the given platform is used
     *
     * This value affects the application's memory usage.
     */
    driverHandleArenaSizeMB?: number;
    /**
     * Minimum size in MiB of a low-level command buffer.
     *
     * This is how much space is guaranteed to be available for low-level commands when a new
     * buffer is allocated. If this is too small, the engine might have to stall to wait for more
     * space to become available, this situation is logged.
     *
     * This value does not affect the application's memory usage.
     */
    minCommandBufferSizeMB?: number;
    /**
     * Size in MiB of the per-frame high level command buffer.
     *
     * This buffer is related to the number of draw calls achievable within a frame, if it is too
     * small, the program will abort on debug builds and have undefined behavior otherwise.
     *
     * It is allocated from the 'per-render-pass arena' above. Make sure that at least 1 MiB is
     * left in the per-render-pass arena when deciding the size of this buffer.
     *
     * This value does not affect the application's memory usage.
     */
    perFrameCommandsSizeMB?: number;
    /**
     * Number of threads to use in Engine's JobSystem.
     *
     * Engine uses a utils::JobSystem to carry out parallelization of Engine workloads. This value
     * sets the number of threads allocated for JobSystem. Configuring this value can be helpful in
     * CPU-constrained environments where too many threads can cause contention of CPU and reduce
     * performance.
     *
     * The default value is 0, which implies that the Engine will use a heuristic to determine the
     * number of threads to use.
     *
     * The special value SINGLE_THREADED forces the JobSystem to be single-threaded and not use a
     * thread pool (jobs are executed on the calling thread).
     */
    jobSystemThreadCount?: number;
    /**
     * When uploading vertex or index data, the Filament Metal backend copies data into a shared
     * staging area before transferring it to the GPU. This setting controls the total size of the
     * buffer used to perform these allocations.
     *
     * Higher values can improve performance when performing many uploads across a small number of
     * frames.
     *
     * This buffer remains alive throughout the lifetime of the Engine, so this size adds to the
     * memory footprint of the app and should be set as conservative as possible.
     *
     * A value of 0 disables the shared staging buffer entirely; uploads will acquire an individual
     * buffer from a pool of shared buffers.
     *
     * Only respected by the Metal backend.
     */
    metalUploadBufferSizeBytes?: number;
    /**
     * The action to take if a Drawable cannot be acquired.
     *
     * Each frame rendered requires a CAMetalDrawable texture, which is presented on-screen at the
     * completion of each frame. These are limited and provided round-robin style by the system.
     */
    metalDisablePanicOnDrawableFailure?: boolean;
    /**
     * Set to `true` to forcibly disable parallel shader compilation in the backend. Currently only
     * honored by the GL and Metal backends.
     *
     * @deprecated use "backend.disable_parallel_shader_compile" feature flag instead
     */
    disableParallelShaderCompile?: boolean;
    stereoscopicType?: Platform$StereoscopicType;
    stereoscopicEyeCount?: number;
    resourceAllocatorCacheSizeMB?: number;
    resourceAllocatorCacheMaxAge?: number;
    disableHandleUseAfterFreeCheck?: boolean;
    preferredShaderLanguage?: Engine$Config$ShaderLanguage;
    forceGLES2Context?: boolean;
    /**
     * Assert the native window associated to a SwapChain is valid when calling makeCurrent(). This
     * is only supported for: - PlatformEGLAndroid
     *
     * @deprecated use "backend.opengl.assert_native_window_is_valid" feature flag instead
     */
    assertNativeWindowIsValid?: boolean;
    /** GPU context priority level. Controls GPU work scheduling and preemption. */
    gpuContextPriority?: Platform$GpuContextPriority;
    /**
     * The initial size in bytes of the shared uniform buffer used for material instance batching.
     *
     * If the buffer runs out of space during a frame, it will be automatically reallocated with a
     * larger capacity. Setting an appropriate initial size can help avoid runtime reallocations,
     * which can cause a minor performance stutter, at the cost of higher initial memory usage.
     */
    sharedUboInitialSizeInBytes?: number;
    /**
     * Asynchronous mode for the engine. Defines how asynchronous operations are handled. Note that
     * selecting a non-NONE mode does not guarantee asynchronous methods are supported, as the
     * underlying backend or the feature flag may override this configuration. Always validate
     * availability via Engine::isAsynchronousModeEnabled() before invoking asynchronous methods.
     */
    asynchronousMode?: Platform$AsynchronousMode;
    /**
     * Capacity of the LRU cache for material definitions.
     *
     * A value of 0 indicates that definitions will be destroyed immediately when they are no
     * longer referenced by any material instances or scenes. A value greater than 0 defines the
     * maximum number of unreferenced definitions to keep alive to avoid re-compilation.
     */
    materialCacheCapacity?: number;
    /**
     * Capacity of the LRU cache for program specializations.
     *
     * Similar to materialCacheCapacity, but applies to the underlying shader programs generated
     * for materials. A value of 0 means immediate destruction of unreferenced programs. A positive
     * value caches up to that number of programs.
     */
    programCacheCapacity?: number;
    /**
     * Whether a scene can contain more than one directional light.
     *
     * By default, and historically, only the dominant directional light (the one with the highest
     * intensity) of a scene is evaluated. When this is enabled, up to four additional directional
     * lights contribute lighting; they don't cast shadows and don't draw a sun's disk. Scenes with
     * a single directional light are unaffected either way.
     * @see LightManager
     */
    enableMultipleDirectionalLights?: boolean;
}

/**
 * Feature flags can be enabled or disabled when the Engine is built. Some Feature flags can
 * also be toggled at any time. Feature flags should alawys use their default value unless the
 * feature enabled by the flag is faulty. Feature flags provide a last resort way to disable
 * problematic features. Feature flags are intended to have a short life-time and are regularly
 * removed as features mature.
 */
export interface Engine$FeatureFlag {
    /** whether the flag is constant after construction */
    constant?: boolean;
}

/**
 * Options to control large-scale fog in the scene. Materials can enable the linearFog
 * property, which uses a simplified, linear equation for fog calculation; in this mode, the
 * heightFalloff is ignored as well as the mipmap selection in IBL or skyColor mode.
 */
export interface FogOptions {
    /** Distance in world units [m] from the camera to where the fog starts ( >= 0.0 ) */
    distance?: number;
    /**
     * Distance in world units [m] after which the fog calculation is disabled. This can be used to
     * exclude the skybox, which is desirable if it already contains clouds or fog. The default
     * value is +infinity which applies the fog to everything.
     *
     * Note: The SkyBox is typically at a distance of 1e19 in world space (depending on the near
     * plane distance and projection used though).
     */
    cutOffDistance?: number;
    /** fog's maximum opacity between 0 and 1. Ignored in linearFog mode. */
    maximumOpacity?: number;
    /** Fog's floor in world units [m]. This sets the "sea level". */
    height?: number;
    /**
     * How fast the fog dissipates with the altitude. heightFalloff has a unit of [1/m]. It can be
     * expressed as 1/H, where H is the altitude change in world units [m] that causes a factor
     * 2.78 (e) change in fog density.
     *
     * A falloff of 0 means the fog density is constant everywhere and may result is slightly
     * faster computations.
     *
     * In linearFog mode, only use to compute the slope of the linear equation. Completely ignored
     * if set to 0.
     */
    heightFalloff?: number;
    /**
     * Fog's color is used for ambient light in-scattering, a good value is to use the average of
     * the ambient light, possibly tinted towards blue for outdoors environments. Color component's
     * values should be between 0 and 1, values above one are allowed but could create a non
     * energy-conservative fog (this is dependant on the IBL's intensity as well).
     *
     * We assume that our fog has no absorption and therefore all the light it scatters out becomes
     * ambient light in-scattering and has lost all directionality, i.e.: scattering is isotropic.
     * This somewhat simulates Rayleigh scattering.
     *
     * This value is used as a tint instead, when fogColorFromIbl is enabled.
     * @see #fogColorFromIbl
     */
    color?: float3;
    /**
     * Extinction factor in [1/m] at an altitude 'height'. The extinction factor controls how much
     * light is absorbed and out-scattered per unit of distance. Each unit of extinction reduces
     * the incoming light to 37% of its original value.
     *
     * Note: The extinction factor is related to the fog density, it's usually some constant K
     * times the density at sea level (more specifically at fog height). The constant K depends on
     * the composition of the fog/atmosphere.
     *
     * For historical reason this parameter is called density .
     *
     * In linearFog mode this is the slope of the linear equation if heightFalloff is set to 0.
     * Otherwise, heightFalloff affects the slope calculation such that it matches the slope of the
     * standard equation at the camera height.
     */
    density?: number;
    /**
     * Distance in world units [m] from the camera where the Sun in-scattering starts. Ignored in
     * linearFog mode.
     */
    inScatteringStart?: number;
    /**
     * Very inaccurately simulates the Sun's in-scattering. That is, the light from the sun that is
     * scattered (by the fog) towards the camera. Size of the Sun in-scattering (>0 to activate).
     * Good values are >> 1 (e.g. ~10 - 100). Smaller values result is a larger scattering size.
     * Ignored in linearFog mode.
     */
    inScatteringSize?: number;
    /**
     * The fog color will be sampled from the IBL in the view direction and tinted by color .
     * Depending on the scene this can produce very convincing results.
     *
     * This simulates a more anisotropic phase-function.
     *
     * fogColorFromIbl is ignored when skyTexture is specified.
     * @see #skyColor
     */
    fogColorFromIbl?: boolean;
    /** Enable or disable large-scale fog */
    enabled?: boolean;
}

/** Holds dynamic pacing targets and latency pipeline depth requirements. */
export interface FramePacer$Configuration {
    /** The application's desired frame rendering step in Hz. */
    targetFrameRate?: number;
}

/** Telemetry for a single expected hardware presentation timeline. */
export interface FramePacer$HardwareTimeline {
}

/** Encapsulates VSYNC synchronization telemetry received from the platform compositor. */
export interface FramePacer$VsyncTick {
}

/**
 * PacingSizing encapsulates the structural latency and CPU delay recommendations relative to a
 * pacing period.
 */
export interface FramePipelineEstimator$PacingSizing {
    /** Recommended structural latency (Pipeline Depth in frames) */
    latencyFrames?: number;
}

/** Workload encapsulates the computed ideal throughput recommendation (raw bottleneck). */
export interface FramePipelineEstimator$Workload {
    /** Ideal frame rate in Hz (1.0 / idealFrameDuration) */
    idealFrameRate?: number;
}

/**
 * Gran Turismo 7 tone mapping operator. This tone mapper was designed to preserve the
 * appearance of materials across lighting conditions while avoiding artifacts in the
 * highlights in high dynamic range conditions. This tone mapper targets an SDR paper white
 * value of 250 nits, with a reference luminance of 100 cd/m^2 (a value of 1.0 in the HDR
 * framebuffer).
 */
export interface GT7ToneMapper {
}

/**
 * Options for the screen-space guard band. A guard band can be enabled to avoid some artifacts
 * towards the edge of the screen when using screen-space effects such as SSAO. Enabling the
 * guard band reduces performance slightly. Currently the guard band can only be enabled or
 * disabled.
 */
export interface GuardBandOptions {
    enabled?: boolean;
}

export interface IBLPrefilterContext$EquirectangularToCubemap$Config {
    /** mirror the source horizontally */
    mirror?: boolean;
}

/** Filter configuration. */
export interface IBLPrefilterContext$IrradianceFilter$Config {
    /** filter sample count (max 2048) */
    sampleCount?: number;
    /** filter kernel */
    kernel?: IBLPrefilterContext$Kernel;
}

/** Filtering options for the current environment. */
export interface IBLPrefilterContext$IrradianceFilter$Options {
    /** no HDR compression up to this value */
    hdrLinear?: number;
    /** HDR compression between hdrLinear and hdrMax */
    hdrMax?: number;
    /** Good values are 2.0 or 3.0. Higher values help with heavily HDR inputs. */
    lodOffset?: number;
    /** set to false if the input environment map already has mipmaps */
    generateMipmap?: boolean;
}

/** Filter configuration. */
export interface IBLPrefilterContext$SpecularFilter$Config {
    /** filter sample count (max 2048) */
    sampleCount?: number;
    /** number of roughness levels */
    levelCount?: number;
    /** filter kernel */
    kernel?: IBLPrefilterContext$Kernel;
}

/** Filtering options for the current environment. */
export interface IBLPrefilterContext$SpecularFilter$Options {
    /** no HDR compression up to this value */
    hdrLinear?: number;
    /** HDR compression between hdrLinear and hdrMax */
    hdrMax?: number;
    /** Good values are 1.0 or 2.0. Higher values help with heavily HDR inputs. */
    lodOffset?: number;
    /** set to false if the input environment map already has mipmaps */
    generateMipmap?: boolean;
}

/** Control the quality / performance of the shadow map associated to this light */
export interface LightManager$ShadowOptions {
    /** Size of the shadow map in texels. Must be a power-of-two and larger or equal to 8. */
    mapSize?: number;
    /**
     * Number of shadow cascades to use for this light. Must be between 1 and 4 (inclusive). A
     * value greater than 1 turns on cascaded shadow mapping (CSM). Only applicable to Type.SUN or
     * Type.DIRECTIONAL lights.
     *
     * When using shadow cascades, cascadeSplitPositions must also be set.
     * @see ShadowOptions::cascadeSplitPositions
     */
    shadowCascades?: number;
    /**
     * Constant bias in world units (e.g. meters) by which shadows are moved away from the light.
     * 1mm by default. This is ignored when the View's ShadowType is set to VSM or PCSS.
     */
    constantBias?: number;
    /**
     * Amount by which the maximum sampling error is scaled. The resulting value is used to move
     * the shadow away from the fragment normal. Should be 1.0. This is ignored when the View's
     * ShadowType is set to VSM or PCSS.
     */
    normalBias?: number;
    /**
     * Distance from the camera after which shadows are clipped. This is used to clip shadows that
     * are too far and wouldn't contribute to the scene much, improving performance and quality.
     * This value is always positive. Use 0.0f to use the camera far distance. This only affect
     * directional lights.
     */
    shadowFar?: number;
    /**
     * Optimize the quality of shadows from this distance from the camera. Shadows will be rendered
     * in front of this distance, but the quality may not be optimal. This value is always
     * positive. Use 0.0f to use the camera near distance. The default of 1m works well with many
     * scenes. The quality of shadows may drop rapidly when this value decreases.
     */
    shadowNearHint?: number;
    /**
     * Optimize the quality of shadows in front of this distance from the camera. Shadows will be
     * rendered behind this distance, but the quality may not be optimal. This value is always
     * positive. Use std::numerical_limits <float >::infinity() to use the camera far distance.
     */
    shadowFarHint?: number;
    /**
     * Controls whether the shadow map should be optimized for resolution or stability. When set to
     * true, all resolution enhancing features that can affect stability are disabling, resulting
     * in significantly lower resolution shadows, albeit stable ones.
     *
     * Setting this flag to true always disables LiSPSM (see below).
     * @see lispsm
     */
    stable?: boolean;
    /**
     * LiSPSM, or light-space perspective shadow-mapping is a technique allowing to better optimize
     * the use of the shadow-map texture. When enabled the effective resolution of shadows is
     * greatly improved and yields result similar to using cascades without the extra cost. LiSPSM
     * comes with some drawbacks however, in particular it is incompatible with blurring because it
     * effectively affects the blur kernel size.
     *
     * Blurring is only an issue when using ShadowType::VSM with a large blur or with
     * ShadowType::PCSS however.
     *
     * If these blurring artifacts become problematic, this flag can be used to disable LiSPSM.
     * @see stable
     */
    lispsm?: boolean;
    /**
     * Constant bias in depth-resolution units by which shadows are moved away from the light. The
     * default value of 0.5 is used to round depth values up. Generally this value shouldn't be
     * changed or at least be small and positive. This is ignored when the View's ShadowType is set
     * to VSM.
     */
    polygonOffsetConstant?: number;
    /**
     * Bias based on the change in depth in depth-resolution units by which shadows are moved away
     * from the light. The default value of 2.0 works well with SHADOW_SAMPLING_PCF_LOW. Generally
     * this value is between 0.5 and the size in texel of the PCF filter. Setting this value
     * correctly is essential for LISPSM shadow-maps. This is ignored when the View's ShadowType is
     * set to VSM.
     */
    polygonOffsetSlope?: number;
    /**
     * Whether screen-space contact shadows are used. This applies regardless of whether a
     * Renderable is a shadow caster. Screen-space contact shadows are typically useful in large
     * scenes. (off by default)
     */
    screenSpaceContactShadows?: boolean;
    /**
     * Number of ray-marching steps for screen-space contact shadows (8 by default).
     *
     * CAUTION: this parameter is ignored for all lights except the directional/sun light, all
     * other lights use the same value set for the directional/sun light.
     */
    stepCount?: number;
    /**
     * Maximum shadow-occluder distance for screen-space contact shadows (world units). (30 cm by
     * default)
     *
     * CAUTION: this parameter is ignored for all lights except the directional/sun light, all
     * other lights use the same value set for the directional/sun light.
     */
    maxShadowDistance?: number;
    vsm?: LightManager$ShadowOptions$Vsm;
    /**
     * Light bulb radius used for soft shadows. This is only used PCSS. A negative value is used to
     * use a default value for each light type. For Spot and point-lights, this is the radius of
     * the light bulb in meters. For Directional lights, this is tan(angularRadius), or just
     * angularRadius [Rad] for small angles. SUN: getSunAngularRadius() * getSunHaloSize()
     * DIRECTIONAL: 1.0 (1m area light) POINT / SPOT: 0.06 (A19 bulb)
     */
    shadowBulbRadius?: number;
    /**
     * Transforms the shadow direction. Must be a unit quaternion. The default is identity. Ignored
     * if the light type isn't directional. For artistic use. Use with caution.
     */
    transform?: quatf;
    /**
     * Sets a light-specific scale factor applied to the final penumbra size of PCSS shadows.
     *
     * This parameter acts as an artistic modifier, allowing you to artificially soften or sharpen
     * the shadows cast by this specific light without changing its physical light bulb size or
     * altering the global scene lighting.
     *
     * The final scale applied to the shadow is calculated by modulating this local value with the
     * global SoftShadowOptions::penumbraScale (global * local).
     *
     * The local penumbra scale multiplier. Default is 1.0.
     * @see SoftShadowOptions::penumbraScale
     */
    penumbraScale?: number;
    /**
     * Sets a light-specific scale factor applied to the PCSS geometric ratio before clamping.
     *
     * This parameter controls the "contact shadow contrast" for this specific light. It allows
     * artists to dictate how rapidly this light's shadow transitions from razor-sharp at the
     * contact point to its maximum blur radius. It is heavily utilized to stylize lighting and
     * aggressively mask 2.5D shadow map limitations near occluders.
     *
     * - Values > 1.0 (e.g., 10.0 or 20.0) create a rapid, cinematic blur acceleration. - Values <
     * 1.0 keep the shadow crisp over longer distances.
     *
     * The final ratio scale applied is calculated by modulating this local value with the global
     * SoftShadowOptions::penumbraRatioScale (global * local).
     *
     * The local penumbra ratio scale multiplier. Default is 1.0.
     * @see SoftShadowOptions::penumbraRatioScale
     */
    penumbraRatioScale?: number;
    /**
     * Sets a light-specific maximum geometric ratio applied to Percentage-Closer Soft Shadows
     * (PCSS), overriding the global default.
     *
     * In PCSS, overlapping occluders (like complex light fixtures) can cause the shadow map's 2.5D
     * depth limitations to calculate an artificially close blocker depth. This drives the
     * geometric ratio toward infinity, resulting in unnatural, massive "ghost" shadows.
     *
     * This parameter allows you to clamp the geometric ratio for this specific light, fixing
     * geometric artifacts caused by layered occluders without compromising the soft shadows of
     * other lights in the scene.
     *
     * The maximum penumbra ratio. Setting this to a value < = 0.0f disables the override and
     * reverts the light to using the global default.
     * @see SoftShadowOptions::maxPenumbraRatio
     */
    maxPenumbraRatio?: number;
    /**
     * Sets a light-specific maximum world-space radius used during the PCSS blocker search,
     * overriding the global default.
     *
     * In PCSS, the shadow algorithm searches a region of the shadow map to find the average depth
     * of occluders. If this search region expands too much, it may inadvertently overlap distinct
     * foreground geometry (like the light's own complex fixture) or climb vertical surfaces (like
     * a pole), causing the shadow to detach from the contact point and appear to float.
     *
     * This parameter allows you to clamp the physical footprint of the blocker search for this
     * specific light, fixing floating contact artifacts without compromising the soft shadows of
     * other lights in the scene.
     *
     * The maximum search radius in world-space meters. Setting this to a value < = 0.0f disables
     * the override and reverts the light to using the global default.
     * @see SoftShadowOptions::maxSearchRadius
     */
    maxSearchRadius?: number;
}

/**
 * Options available when the View's ShadowType is set to VSM.
 *
 * @remarks Warning: This API is still experimental and subject to change.
 * @see View::setShadowType
 */
export interface LightManager$ShadowOptions$Vsm {
    /**
     * When elvsm is set to true, "Exponential Layered VSM without Layers" are used. It is an
     * improvement to the default EVSM which suffers important light leaks. Enabling ELVSM for a
     * single shadowmap doubles the memory usage of all shadow maps. ELVSM is mostly useful when
     * large blurs are used.
     *
     * elvsm is only relevant when the ShadowType is VSM elvsm is always enabled with PCSS
     */
    elvsm?: boolean;
    /** Blur width for the VSM blur. Zero do disable. The maximum value is 125. */
    blurWidth?: number;
}

/** Holds information about a material parameter. */
export interface Material$ParameterInfo {
    /** Whether the parameter is a sampler (texture). */
    isSampler?: boolean;
    /** Whether the parameter is a subpass type. */
    isSubpass?: boolean;
    /** Size of the parameter when the parameter is an array. */
    count?: number;
    /** Requested precision of the parameter. */
    precision?: Precision;
}

/** @remarks This key is processed by MurmurHashFn so please make padding explicit. */
export interface MaterialKey {
    baseColorUV?: number;
    emissiveUV?: number;
    aoUV?: number;
    normalUV?: number;
    specularTextureUV?: number;
    specularColorTextureUV?: number;
    padding2?: number;
}

/**
 * Options for Multi-Sample Anti-aliasing (MSAA)
 * @see #setMultiSampleAntiAliasingOptions
 */
export interface MultiSampleAntiAliasingOptions {
    /** enables or disables msaa */
    enabled?: boolean;
    /**
     * sampleCount number of samples to use for multi-sampled anti-aliasing. 0: treated as 1 1: no
     * anti-aliasing n: sample count. Effective sample could be different depending on the GPU
     * capabilities.
     */
    sampleCount?: number;
    /** custom resolve improves quality for HDR scenes, but may impact performance. */
    customResolve?: boolean;
}

export interface Platform$CompositorTiming {
}

export interface Platform$DriverConfig {
    /**
     * Size of handle arena in bytes. Setting to 0 indicates default value is to be used. Driver
     * clamps to valid values.
     */
    handleArenaSize?: number;
    metalUploadBufferSizeBytes?: number;
    /**
     * Force GLES2 context if supported, or pretend the context is ES2. Only meaningful on GLES 3.x
     * backends.
     */
    forceGLES2Context?: boolean;
    /** Sets the technique for stereoscopic rendering. */
    stereoscopicType?: Platform$StereoscopicType;
    /**
     * The number of eyes to render when stereoscopic rendering is enabled. Supported values are
     * between 1 and Engine::getMaxStereoscopicEyes() (inclusive).
     */
    stereoscopicEyeCount?: number;
    /**
     * The action to take if a Drawable cannot be acquired. If true, the frame is aborted instead
     * of panic. This is only supported for: - PlatformMetal
     */
    metalDisablePanicOnDrawableFailure?: boolean;
    /**
     * GPU context priority level. Controls GPU work scheduling and preemption. This is only
     * supported for: - PlatformEGL
     */
    gpuContextPriority?: Platform$GpuContextPriority;
    /** Asynchronous mode for the engine. Defines how asynchronous operations are handled. */
    asynchronousMode?: Platform$AsynchronousMode;
}

export interface Platform$FrameTimestamps {
}

export interface PolygonOffset {
    slope?: number;
    constant?: number;
}

/**
 * Selects which buffers to clear at the beginning of the render pass, as well as which buffers
 * can be discarded at the beginning and end of the render pass.
 */
export interface RenderPassFlags {
    /**
     * bitmask indicating which buffers to clear at the beginning of a render pass. This implies
     * discard.
     */
    clear?: TargetBufferFlags;
    /**
     * bitmask indicating which buffers to discard at the beginning of a render pass. Discarded
     * buffers have uninitialized content, they must be entirely drawn over or cleared.
     */
    discardStart?: TargetBufferFlags;
    /**
     * bitmask indicating which buffers to discard at the end of a render pass. Discarded buffers'
     * content becomes invalid, they must not be read from again.
     */
    discardEnd?: TargetBufferFlags;
}

/** Parameters of a render pass. */
export interface RenderPassParams {
    /** operations performed on the buffers for this pass */
    flags?: RenderPassFlags;
    /** viewport for this pass */
    viewport?: backend$Viewport;
    /** depth range for this pass */
    depthRange?: DepthRange;
    /**
     * Value used to clear the COLOR attachments. RenderPassFlags::clear must be set. For
     * integer-format attachments, put a value in the matching range (e.g., values in [0,
     * UINT32_MAX] for a UINT attachment); the backend converts the doubles as-is into the matching
     * native clear entry-point based on the attachment's TextureFormat.
     */
    clearColor?: double4;
    /** Depth value to clear the depth buffer with */
    clearDepth?: number;
    /** Stencil value to clear the stencil buffer with */
    clearStencil?: number;
    /**
     * The subpass mask specifies which color attachments are designated for read-back in the
     * second subpass. If this is zero, the render pass has only one subpass. The least significant
     * bit specifies that the first color attachment in the render target is a subpass input.
     *
     * For now only 2 subpasses are supported, so only the lower 8 bits are used, one for each
     * color attachment (see MRT::MAX_SUPPORTED_RENDER_TARGET_COUNT).
     */
    subpassMask?: number;
    /**
     * This mask makes a promise to the backend about read-only usage of the depth attachment (bit
     * 0) and the stencil attachment (bit 1). Some backends need to know if writes are disabled in
     * order to allow sampling from the depth attachment.
     */
    readOnlyDepthStencil?: number;
}

/**
 * Structure used to set the precision of the color buffer and related quality settings.
 * @see #setRenderQuality
 * @see #getRenderQuality
 */
export interface RenderQuality {
    /**
     * Sets the quality of the HDR color buffer.
     *
     * A quality of HIGH or ULTRA means using an RGB16F or RGBA16F color buffer. This means colors
     * in the LDR range (0..1) have a 10 bit precision. A quality of LOW or MEDIUM means using an
     * R11G11B10F opaque color buffer or an RGBA16F transparent color buffer. With R11G11B10F
     * colors in the LDR range have a precision of either 6 bits (red and green channels) or 5 bits
     * (blue channel).
     */
    hdrColorBuffer?: QualityLevel;
}

/**
 * The transformation associated with a skinning joint.
 *
 * Clients can specify bones either using this quat-vec3 pair, or by using 4x4 matrices.
 */
export interface RenderableManager$Bone {
    unitQuaternion?: quatf;
    translation?: float3;
    reserved?: number;
}

/** ClearOptions are used at the beginning of a frame to clear or retain the SwapChain content. */
export interface Renderer$ClearOptions {
    /**
     * Color to use to clear the RenderTarget (typically the SwapChain).
     *
     * The RenderTarget is cleared using this color, which won't be tone-mapped since tone-mapping
     * is part of View rendering (this is not).
     *
     * The value is stored as four doubles. The backend converts them as-is into the matching
     * native clear entry-point based on the attachment's format -- so the caller is responsible
     * for putting a value here that makes sense for the attachment family (e.g. for a UINT
     * attachment, a value in [0, UINT32_MAX]). int32_t / uint32_t values round-trip exactly
     * because double has a 53-bit mantissa.
     *
     * When a View is rendered, there are 3 scenarios to consider: - Pixels rendered by the View
     * replace the clear color (or blend with it in `BlendMode::TRANSLUCENT` mode).
     *
     * - With blending mode set to `BlendMode::TRANSLUCENT`, Pixels untouched by the View are
     * considered fulling transparent and let the clear color show through.
     *
     * - With blending mode set to `BlendMode::OPAQUE`, Pixels untouched by the View are set to the
     * clear color. However, because it is now used in the context of a View, it will go through
     * the post-processing stage, which includes tone-mapping.
     *
     * For consistency, it is recommended to always use a Skybox to clear an opaque View's
     * background, or to use black or fully-transparent (i.e. {0,0,0,0}) as the clear color.
     */
    clearColor?: double4;
    /** Value to clear the stencil buffer */
    clearStencil?: number;
    /**
     * Whether the SwapChain should be cleared using the clearColor. Use this if translucent View
     * will be drawn, for instance.
     */
    clear?: boolean;
    /**
     * Whether the SwapChain content should be discarded. clear implies discard. Set this to false
     * (along with clear to false as well) if the SwapChain already has content that needs to be
     * preserved
     */
    discard?: boolean;
}

/**
 * Use DisplayInfo to set important Display properties. This is used to achieve correct frame
 * pacing and dynamic resolution scaling.
 */
export interface Renderer$DisplayInfo {
    refreshRate?: number;
    presentationDeadlineNanos?: number;
    vsyncOffsetNanos?: number;
}

/**
 * Timing information about a frame
 * @see getFrameInfoHistory()
 */
export interface Renderer$FrameInfo {
    /** monotonically increasing frame identifier */
    frameId?: number;
}

/**
 * Use FrameRateOptions to set the desired frame rate and control how quickly the system reacts
 * to GPU load changes.
 *
 * interval: desired frame interval in multiple of the refresh period, set in DisplayInfo (as 1
 * / DisplayInfo::refreshRate)
 *
 * The parameters below are relevant when some Views are using dynamic resolution scaling:
 *
 * headRoomRatio: additional headroom for the GPU as a ratio of the targetFrameTime. Useful for
 * taking into account constant costs like post-processing or GPU drivers on different
 * platforms. history: History size. higher values, tend to filter more (clamped to 31)
 * scaleRate: rate at which the gpu load is adjusted to reach the target frame rate This value
 * can be computed as 1 / N, where N is the number of frames needed to reach 64% of the target
 * scale factor. Higher values make the dynamic resolution react faster.
 * @see View::DynamicResolutionOptions
 * @see Renderer::DisplayInfo
 */
export interface Renderer$FrameRateOptions {
    /** additional headroom for the GPU */
    headRoomRatio?: number;
    /** rate at which the system reacts to load changes */
    scaleRate?: number;
    /** history size */
    history?: number;
    /** desired frame interval in unit of 1.0 / DisplayInfo::refreshRate */
    interval?: number;
}

export interface ResourceConfiguration {
    /**
     * If true, adjusts skinning weights to sum to 1. Well formed glTF files do not need this, but
     * it is useful for robustness.
     */
    normalizeSkinningWeights?: boolean;
}

/** Sampler parameters */
export interface SamplerParams {
}

/**
 * Options for Screen-space Reflections.
 * @see #setScreenSpaceReflectionsOptions
 */
export interface ScreenSpaceReflectionsOptions {
    /** ray thickness, in world units */
    thickness?: number;
    /** bias, in world units, to prevent self-intersections */
    bias?: number;
    /** maximum distance, in world units, to raycast */
    maxDistance?: number;
    /** stride, in texels, for samples along the ray. */
    stride?: number;
    enabled?: boolean;
}

/**
 * View-level options for PCSS Shadowing.
 * @see #setSoftShadowOptions Warning: This API is still experimental and subject to change.
 */
export interface SoftShadowOptions {
    /**
     * Sets a global scale factor applied to the final penumbra size of all PCSS shadows.
     *
     * This parameter acts as an artistic modifier, uniformly scaling the overall softness of
     * shadows across the entire scene without altering the physical angular size of the light
     * sources.
     *
     * The final scale applied to a shadow is calculated by modulating this global value with the
     * light's individual penumbraScale (global * local). This allows art directors to shift the
     * global mood (e.g., making all shadows 20% softer) while preserving the relative contrast
     * between different lights.
     *
     * The global penumbra scale multiplier. Default is 1.0 (physically based).
     * @see LightManager::ShadowOptions::penumbraScale
     */
    penumbraScale?: number;
    /**
     * Sets a global scale factor applied to the PCSS geometric ratio before failsafe clamping.
     *
     * This parameter controls the "contact shadow contrast" or the rate at which shadows
     * transition from sharp to soft. By scaling the geometric ratio, you can create highly
     * dramatic, cinematic shadows that blur rapidly as they move away from the contact point,
     * completely independently of the light's overall physical size.
     *
     * - Values > 1.0 cause the shadow to accelerate toward its maximum softness faster. - Values <
     * 1.0 cause the shadow to stay sharper for a longer distance.
     *
     * The final ratio scale applied is calculated by modulating this global value with the light's
     * individual penumbraRatioScale (global * local).
     *
     * The global penumbra ratio scale multiplier. Default is 1.0.
     * @see LightManager::ShadowOptions::penumbraRatioScale
     */
    penumbraRatioScale?: number;
    /**
     * Sets the global default maximum geometric ratio applied to Percentage-Closer Soft Shadows
     * (PCSS).
     *
     * In PCSS, the physical width of a shadow's penumbra is determined by the ratio:
     * (distance_to_receiver - distance_to_blocker) / distance_to_blocker
     *
     * Standard shadow maps store a single depth layer (2.5D). When evaluating complex, overlapping
     * occluders (e.g., foliage, layered floating geometry), the shadow map cannot resolve
     * volumetric depth. This limitation can trick the blocker search into returning an
     * artificially close depth value, driving the denominator toward zero. The resulting explosion
     * in penumbra size causes unnatural, massive "ghost" shadows.
     *
     * maxPenumbraRatio applies a smooth, asymptotic squash to the geometric ratio, acting as both
     * a mathematical failsafe and an artistic control. It guarantees the penumbra will gracefully
     * stop expanding before it destroys the visual coherence of the scene.
     *
     * This global value acts as the baseline for all lights. Individual lights can explicitly
     * override this default via the LightManager API to handle specific geometric artifacts
     * without affecting the rest of the scene.
     *
     * - A lower value (e.g., 2.0) creates generally sharper, highly stable shadows that
     * aggressively suppress 2.5D layered occlusion artifacts. - A higher value (e.g., 5.0+) allows
     * for physically accurate, widely expanding soft shadows, but increases susceptibility to
     * ghosting.
     * @see LightManager::ShadowOptions::maxPenumbraRatio
     */
    maxPenumbraRatio?: number;
    /**
     * Sets the global default maximum world-space radius used during the PCSS blocker search.
     *
     * In PCSS, the shadow algorithm searches a region of the shadow map to find the average depth
     * of occluders. For lights with a large angular size (or objects very far from the light),
     * this search region can become massive. * If the search region expands too much, it may
     * inadvertently overlap distinct foreground geometry (like a streetlight fixture) or climb
     * vertical surfaces (like a pole), causing the shadow to detach from the contact point and
     * appear to float.
     *
     * maxSearchRadius limits the physical footprint of this search. This global value acts as the
     * baseline for all lights. Individual lights can explicitly override this default via the
     * LightManager API to clamp the search footprint for specific geometric setups without
     * affecting the rest of the scene.
     *
     * The maximum search radius in world-space meters: - A smaller value (e.g., 0.05 to 0.1)
     * tightly anchors shadows to their contact points and prevents artifacts near complex light
     * fixtures. - A larger value provides more physically accurate blocker averaging for massive
     * area lights but increases the risk of floating geometry.
     * @see LightManager::ShadowOptions::maxSearchRadius
     */
    maxSearchRadius?: number;
}

export interface StencilState {
    /** Stencil operations for front-facing polygons */
    front?: StencilState$StencilOperations;
    /** Stencil operations for back-facing polygons */
    back?: StencilState$StencilOperations;
    /** Whether stencil-buffer writes are enabled */
    stencilWrite?: boolean;
    padding?: number;
}

export interface StencilState$StencilOperations {
    /** Reference value for stencil comparison tests and updates */
    ref?: number;
    /** Masks the bits of the stencil values participating in the stencil comparison test. */
    readMask?: number;
    /** Masks the bits of the stencil values updated by the stencil test. */
    writeMask?: number;
}

/** Options for stereoscopic (multi-eye) rendering. */
export interface StereoscopicOptions {
    enabled?: boolean;
}

/**
 * Options for Temporal Anti-aliasing (TAA) Most TAA parameters are extremely costly to change,
 * as they will trigger the TAA post-process shaders to be recompiled. These options should be
 * changed or set during initialization. `filterWidth`, `feedback` and `jitterPattern`,
 * however, can be changed at any time.
 *
 * feedback of 0.1 effectively accumulates a maximum of 19 samples in steady state. see "A
 * Survey of Temporal Antialiasing Techniques" by Lei Yang and all for more information.
 * @see #setTemporalAntiAliasingOptions
 */
export interface TemporalAntiAliasingOptions {
    /** @deprecated has no effect. */
    filterWidth?: number;
    /** history feedback, between 0 (maximum temporal AA) and 1 (no temporal AA). */
    feedback?: number;
    /** texturing lod bias (typically -1 or -2) */
    lodBias?: number;
    /** post-TAA sharpen, especially useful when upscaling is true. */
    sharpness?: number;
    /** enables or disables temporal anti-aliasing */
    enabled?: boolean;
    /** Upscaling factor. Disables Dynamic Resolution. [BETA] */
    upscaling?: number;
    /** whether to filter the history buffer */
    filterHistory?: boolean;
    /** whether to apply the reconstruction filter to the input */
    filterInput?: boolean;
    /** whether to use the YcoCg color-space for history rejection */
    useYCoCg?: boolean;
    /** set to true for HDR content */
    hdr?: boolean;
    /** type of color gamut box */
    boxType?: TemporalAntiAliasingOptions$BoxType;
    /** clipping algorithm */
    boxClipping?: TemporalAntiAliasingOptions$BoxClipping;
    /** Jitter Pattern */
    jitterPattern?: TemporalAntiAliasingOptions$JitterPattern;
    /**
     * High values increases ghosting artefact, lower values increases jittering, range [0.75,
     * 1.25]
     */
    varianceGamma?: number;
    /** adjust the feedback dynamically to reduce flickering */
    preventFlickering?: boolean;
    /** whether to apply history reprojection (debug option) */
    historyReprojection?: boolean;
}

/** debugging: returns information about the froxel configuration */
export interface View$FroxelConfigurationInfo {
    width?: number;
    height?: number;
    depth?: number;
    viewportWidth?: number;
    viewportHeight?: number;
    froxelDimension?: uint2;
    zLightFar?: number;
    linearizer?: number;
    p?: mat4;
    clipTransform?: float4;
}

export interface View$FroxelConfigurationInfoWithAge {
    info?: View$FroxelConfigurationInfo;
    age?: number;
}

/** User data for PickingQueryResultCallback */
export interface View$PickingQuery {
}

/** Result of a picking query */
export interface View$PickingQueryResult {
    renderable?: Entity;
    /** RenderableManager Entity at the queried coordinates */
    depth?: number;
    /** Depth buffer value (1 (near plane) to 0 (infinity)) */
    reserved1?: number;
    reserved2?: number;
    /**
     * screen space coordinates in GL convention, this can be used to compute the view or world
     * space position of the picking hit. For e.g.: clip_space_position = (fragCoords.xy /
     * viewport.wh, fragCoords.z) * 2.0 - 1.0 view_space_position = inverse(projection) *
     * clip_space_position world_space_position = model * view_space_position
     *
     * The viewport, projection and model matrices can be obtained from Camera. Because pick() has
     * some latency, it might be more accurate to obtain these values at the time the View::pick()
     * call is made.
     *
     * Note: if the Engine is running at FEATURE_LEVEL_0, the precision or `depth` and
     * `fragCoords.z` is only 8-bits.
     */
    fragCoords?: float3;
}

/** Options to control the vignetting effect. */
export interface VignetteOptions {
    /** high values restrict the vignette closer to the corners, between 0 and 1 */
    midPoint?: number;
    /**
     * controls the shape of the vignette, from a rounded rectangle (0.0), to an oval (0.5), to a
     * circle (1.0)
     */
    roundness?: number;
    /** softening amount of the vignette effect, between 0 and 1 */
    feather?: number;
    /** color of the vignette effect, alpha is currently ignored */
    color?: float4;
    /** enables or disables the vignette effect */
    enabled?: boolean;
}

/**
 * View-level options for VSM Shadowing.
 * @see #setVsmShadowOptions Warning: This API is still experimental and subject to change.
 */
export interface VsmShadowOptions {
    /**
     * Sets the number of anisotropic samples to use when sampling a VSM shadow map. If greater
     * than 0, mipmaps will automatically be generated each frame for all lights.
     *
     * The number of anisotropic samples = 2 ^ vsmAnisotropy.
     */
    anisotropy?: number;
    /** Whether to generate mipmaps for all VSM shadow maps. */
    mipmapping?: boolean;
    /**
     * The number of MSAA samples to use when rendering VSM shadow maps. Must be a power-of-two and
     * greater than or equal to 1. A value of 1 effectively turns off MSAA. Higher values may not
     * be available depending on the underlying hardware.
     */
    msaaSamples?: number;
    /**
     * Whether to use a 32-bits or 16-bits texture format for VSM shadow maps. 32-bits precision is
     * rarely needed, but it does reduce light leaks as well as "fading" of the shadows in some
     * situations. Setting highPrecision to true for a single shadow map will double the memory
     * usage of all shadow maps. This may not be supported on all mobile devices.
     */
    highPrecision?: boolean;
    /** @deprecated has no effect. */
    minVarianceScale?: number;
    /** VSM light bleeding reduction amount, between 0 and 1. */
    lightBleedReduction?: number;
}

/**
 * Defines a viewport, which is the origin and extent of the clip-space. All drawing is clipped
 * to the viewport.
 */
export interface backend$Viewport {
    /** left coordinate in window space. */
    left?: number;
    /** bottom coordinate in window space. */
    bottom?: number;
    /** width in pixels */
    width?: number;
    /** height in pixels */
    height?: number;
}

/**
 * Opaque memento to a viewing position and orientation (e.g. the "home" camera position).
 *
 * This little struct is meant to be passed around by value and can be used to track camera
 * animation between waypoints. In map mode this implements Van Wijk interpolation.
 * @see Manipulator::getCurrentBookmark, Manipulator::jumpToBookmark
 */
export interface camutils$Bookmark {
}

/** Builder state, direct access is allowed but Builder methods are preferred. * */
export interface camutils$Manipulator$Config {
    zoomSpeed?: number;
    fovDirection?: camutils$Fov;
    fovDegrees?: number;
    farPlane?: number;
    mapMinDistance?: number;
    flightStartPitch?: number;
    flightStartYaw?: number;
    flightMaxSpeed?: number;
    flightSpeedSteps?: number;
    flightMoveDamping?: number;
    panning?: boolean;
}

/**
 * Holds the chromaticities of a color space's primaries as xy coordinates in xyY (Y is assumed
 * to be 1).
 */
export interface color$Primaries {
    r?: float2;
    g?: float2;
    b?: float2;
}

export interface filamat$MaterialBuilder$Attribute {
    name?: string;
    type?: UniformType;
    location?: VertexAttribute;
}

export interface filamat$MaterialBuilder$Constant {
    type?: ConstantType;
}

export interface filamat$MaterialBuilder$CustomVariable {
    precision?: Precision;
    hasPrecision?: boolean;
}

export interface filamat$MaterialBuilder$Output {
    qualifier?: filamat$MaterialBuilder$VariableQualifier;
    target?: filamat$MaterialBuilder$OutputTarget;
    precision?: Precision;
    type?: filamat$MaterialBuilder$OutputType;
    location?: number;
}

export interface filamat$MaterialBuilder$Parameter {
    size?: number;
    uniformType?: UniformType;
    precision?: Precision;
    samplerType?: SamplerType;
    subpassType?: SubpassType;
    format?: SamplerFormat;
    filterable?: boolean;
    multisample?: boolean;
}

export interface filamat$MaterialBuilder$PushConstant {
    type?: ConstantType;
    stage?: ShaderStage;
}

export interface filamesh$CompressionHeader {
    positions?: number;
    tangents?: number;
    colors?: number;
    uv0?: number;
    uv1?: number;
}

export interface filamesh$Header {
    version?: number;
    parts?: number;
    aabb?: Box;
    flags?: number;
    offsetPosition?: number;
    stridePosition?: number;
    offsetTangents?: number;
    strideTangents?: number;
    offsetColor?: number;
    strideColor?: number;
    offsetUV0?: number;
    strideUV0?: number;
    offsetUV1?: number;
    strideUV1?: number;
    vertexCount?: number;
    vertexSize?: number;
    indexType?: number;
    indexCount?: number;
    indexSize?: number;
}

export interface filamesh$MeshReader$Mesh {
    renderable?: Entity;
}

export interface filamesh$Part {
    offset?: number;
    indexCount?: number;
    minIndex?: number;
    maxIndex?: number;
    material?: number;
    aabb?: Box;
}

/** Describes the format of all input data that get passed to this transcoder object. */
export interface geometry$Transcoder$Config {
    componentType?: geometry$ComponentType;
    normalized?: boolean;
    componentCount?: number;
    /** If stride is 0, the transcoder assumes tight packing. */
    inputStrideBytes?: number;
}

/** Specifies how to generate samples that lie outside the boundaries of the source region. */
export interface image$Boundary {
    color?: image$SingleSample;
    orientation?: image$Orientation;
}

/** Configuration for the resampleImage function. Provides reasonable defaults. */
export interface image$ImageSampler {
    horizontalFilter?: image$Filter;
    verticalFilter?: image$Filter;
    sourceRegion?: image$Region;
    filterRadiusMultiplier?: number;
    east?: image$Boundary;
    north?: image$Boundary;
    west?: image$Boundary;
    south?: image$Boundary;
}

export interface image$KtxBlobIndex {
    mipLevel?: number;
    arrayIndex?: number;
    cubeFace?: number;
}

export interface image$KtxInfo {
    endianness?: number;
    glType?: number;
    glTypeSize?: number;
    glFormat?: number;
    glInternalFormat?: number;
    glBaseInternalFormat?: number;
    pixelWidth?: number;
    pixelHeight?: number;
    pixelDepth?: number;
}

/**
 * Defines a viewport inside the texture such that (0,0) is at the top-left corner of the
 * top-left pixel, and (1,1) is at the bottom-right corner of the bottom-corner pixel.
 */
export interface image$Region {
    left?: number;
    top?: number;
    right?: number;
    bottom?: number;
}

export interface viewer$AgxToneMapperSettings {
    look?: AgxToneMapper$AgxLook;
}

export interface viewer$AnimationSettings {
    enabled?: boolean;
    time?: number;
    speed?: number;
}

/** Allows users to toggle screenshots, change the sleep duration between tests, etc. */
export interface viewer$AutomationEngine$Options {
    /**
     * Minimum time that automation waits between applying a settings object and advancing to the
     * next test case. Specified in seconds.
     */
    sleepDuration?: number;
    /**
     * Similar to sleepDuration, but expressed as a frame count. Both the minimum sleep time and
     * the minimum frame count must be elapsed before automation advances to the next test.
     */
    minFrameCount?: number;
    /** If true, test progress is dumped to the utils Log (info priority). */
    verbose?: boolean;
    /** If true, the tick function writes out a screenshot before advancing to the next test. */
    exportScreenshots?: boolean;
    /** If true, the tick function writes out a settings JSON file before advancing. */
    exportSettings?: boolean;
    /** Which image format will be used for exporting screenshots. */
    exportFormat?: viewer$AutomationEngine$Options$ExportFormat;
}

/** Collection of Filament objects that can be modified by the automation engine. */
export interface viewer$AutomationEngine$ViewerContent {
    materialCount?: number;
    sunlight?: Entity;
    assetLightCount?: number;
}

export interface viewer$CameraSettings {
    center?: float3;
    lookAt?: float3;
    up?: float3;
    horizontalFov?: number;
    near?: number;
    far?: number;
    focalLength?: number;
    aperture?: number;
    shutterSpeed?: number;
    sensitivity?: number;
    focusDistance?: number;
    eyeOcularDistance?: number;
    eyeToeIn?: number;
    projection?: Camera$Projection;
    enabled?: boolean;
    scaling?: float2;
    shift?: float2;
}

export interface viewer$ColorGradingSettings {
    enabled?: boolean;
    linkedCurves?: boolean;
    luminanceScaling?: boolean;
    gamutMapping?: boolean;
    quality?: ColorGrading$QualityLevel;
    toneMapping?: viewer$ToneMapping;
    customLut?: viewer$CustomLut;
    agxToneMapper?: viewer$AgxToneMapperSettings;
    colorspace?: color$ColorSpace;
    genericToneMapper?: viewer$GenericToneMapperSettings;
    shadows?: float4;
    midtones?: float4;
    highlights?: float4;
    ranges?: float4;
    outRed?: float3;
    outGreen?: float3;
    outBlue?: float3;
    slope?: float3;
    offset?: float3;
    power?: float3;
    gamma?: float3;
    midPoint?: float3;
    scale?: float3;
    exposure?: number;
    nightAdaptation?: number;
    temperature?: number;
    tint?: number;
    contrast?: number;
    vibrance?: number;
    saturation?: number;
}

export interface viewer$DebugOptions {
    skipFrames?: number;
}

export interface viewer$DynamicLightingSettings {
    zLightNear?: number;
    zLightFar?: number;
}

export interface viewer$FogSettings {
}

export interface viewer$GenericToneMapperSettings {
    contrast?: number;
    midGrayIn?: number;
    midGrayOut?: number;
    hdrMax?: number;
}

export interface viewer$LightDefinition {
    type?: LightManager$Type;
    position?: float3;
    direction?: float3;
    color?: float3;
    intensity?: number;
    falloff?: number;
    spotInner?: number;
    spotOuter?: number;
    sunHaloSize?: number;
    sunHaloFalloff?: number;
    sunAngularRadiusDeg?: number;
    castShadows?: boolean;
    shadowOptions?: LightManager$ShadowOptions;
}

export interface viewer$LightSettings {
    enableShadows?: boolean;
    enableSunlight?: boolean;
    softShadowOptions?: SoftShadowOptions;
    iblIntensity?: number;
    iblRotation?: number;
    sunlight?: viewer$LightDefinition;
}

export interface viewer$MaterialSettings {
}

export interface viewer$RenderSettings {
    clearOptions?: Renderer$ClearOptions;
    frameRateOptions?: Renderer$FrameRateOptions;
}

export interface viewer$Settings {
    view?: viewer$ViewSettings;
    material?: viewer$MaterialSettings;
    lighting?: viewer$LightSettings;
    viewer?: viewer$ViewerOptions;
    camera?: viewer$CameraSettings;
    animation?: viewer$AnimationSettings;
    render?: viewer$RenderSettings;
    debug?: viewer$DebugOptions;
}

export interface viewer$ViewSettings {
    antiAliasing?: AntiAliasing;
    dithering?: Dithering;
    shadowType?: ShadowType;
    postProcessingEnabled?: boolean;
    ssao?: AmbientOcclusionOptions;
    screenSpaceReflections?: ScreenSpaceReflectionsOptions;
    bloom?: BloomOptions;
    dof?: DepthOfFieldOptions;
    dsr?: DynamicResolutionOptions;
    fog?: FogOptions;
    msaa?: MultiSampleAntiAliasingOptions;
    renderQuality?: RenderQuality;
    taa?: TemporalAntiAliasingOptions;
    vignette?: VignetteOptions;
    vsmShadowOptions?: VsmShadowOptions;
    guardBand?: GuardBandOptions;
    stereoscopicOptions?: StereoscopicOptions;
    colorGrading?: viewer$ColorGradingSettings;
    dynamicLighting?: viewer$DynamicLightingSettings;
    fogSettings?: viewer$FogSettings;
    blendMode?: BlendMode;
    stencilBufferEnabled?: boolean;
    visibleLayers?: number;
}

export interface viewer$ViewerOptions {
    groundShadowStrength?: number;
    groundPlaneEnabled?: boolean;
    skyboxEnabled?: boolean;
    backgroundColor?: float3;
    autoScaleEnabled?: boolean;
    autoInstancingEnabled?: boolean;
    cameraFrameRate?: number;
}

export class Aabb$Corners {
    public size(): number;
    public get(i: number): float3;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Animator can be used for two things: - Updating matrices in filament::TransformManager
 * components according to glTF `animation` definitions. - Updating bone matrices in
 * filament::RenderableManager components according to glTF `skin` definitions.
 *
 * For a usage example, see the documentation for AssetLoader.
 */
export class Animator {
    /**
     * Applies rotation, translation, and scale to entities that have been targeted by the given
     * animation definition. Uses filament::TransformManager.
     *
     * @param animationIndex Zero-based index for the `animation` of interest.
     * @param time Elapsed time of interest in seconds.
     */
    public applyAnimation(animationIndex: number, time: number): void;
    /**
     * Computes root-to-node transforms for all bone nodes, then passes the results into
     * filament::RenderableManager::setBones. Uses filament::TransformManager and
     * filament::RenderableManager.
     *
     * NOTE: this operation is independent of `animation.`
     */
    public updateBoneMatrices(): void;
    /**
     * Applies a blended transform to the union of nodes affected by two animations. Used for
     * cross-fading from a previous skinning-based animation or rigid body animation.
     *
     * First, this stashes the current transform hierarchy into a transient memory buffer.
     *
     * Next, this applies previousAnimIndex / previousAnimTime to the actual asset by internally
     * calling applyAnimation().
     *
     * Finally, the stashed local transforms are lerped (via the scale / translation / rotation
     * components) with their live counterparts, and the results are pushed to the asset.
     *
     * To achieve a cross fade effect with skinned models, clients will typically call animator
     * methods in this order: (1) applyAnimation (2) applyCrossFade (3) updateBoneMatrices. The
     * animation that clients pass to applyAnimation is the "current" animation corresponding to
     * alpha=1, while the "previous" animation passed to applyCrossFade corresponds to alpha=0.
     */
    public applyCrossFade(previousAnimIndex: number, previousAnimTime: number, alpha: number): void;
    /**
     * Pass the identity matrix into all bone nodes, useful for returning to the T pose.
     *
     * NOTE: this operation is independent of `animation.`
     */
    public resetBoneMatrices(): void;
    /** Returns the number of `animation` definitions in the glTF asset. */
    public getAnimationCount(): number;
    /** Returns the duration of the specified glTF `animation` in seconds. */
    public getAnimationDuration(animationIndex: number): number;
    /**
     * Returns a weak reference to the string name of the specified `animation,` or an empty string
     * if none was specified.
     */
    public getAnimationName(animationIndex: number): string;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * AssetLoader consumes a blob of glTF 2.0 content (either JSON or GLB) and produces a
 * FilamentAsset object, which is a bundle of Filament textures, vertex buffers, index buffers,
 * etc. An asset is composed of 1 or more FilamentInstance objects which contain entities and
 * components.
 *
 * Clients must use AssetLoader to create and destroy FilamentAsset objects. This is similar to
 * how filament::Engine is used to create and destroy core objects like VertexBuffer.
 *
 * AssetLoader does not fetch external buffer data or create textures on its own. Clients can
 * use ResourceLoader for this, which obtains the URI list from the asset. This is demonstrated
 * in the code snippet below.
 *
 * AssetLoader also owns a cache of filament::Material objects that may be re-used across
 * multiple loads.
 *
 * Example usage:
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ auto engine =
 * Engine::create(); auto materials = createJitShaderProvider(engine); auto decoder =
 * createStbProvider(engine); auto loader = AssetLoader::create({engine, materials});
 *
 * // Parse the glTF content and create Filament entities. std::vector <uint8 _t> content(...);
 * FilamentAsset* asset = loader->createAsset(content.data(), content.size()); content.clear();
 *
 * // Load buffers and textures from disk. ResourceLoader resourceLoader({engine, ".", true});
 * resourceLoader.addTextureProvider("image/png", decoder);
 * resourceLoader.addTextureProvider("image/jpeg", decoder);
 * resourceLoader.loadResources(asset);
 *
 * // Free the glTF hierarchy as it is no longer needed. asset->releaseSourceData();
 *
 * // Add renderables to the scene. scene->addEntities(asset->getEntities(),
 * asset->getEntityCount());
 *
 * // Extract the animator interface from the FilamentInstance. auto animator =
 * asset->getInstance()->getAnimator();
 *
 * // Execute the render loop and play the first animation. do { animator->applyAnimation(0,
 * time); animator->updateBoneMatrices(); if (renderer->beginFrame(swapChain)) {
 * renderer->render(view); renderer->endFrame(); } } while (!quit);
 *
 * scene->removeEntities(asset->getEntities(), asset->getEntityCount());
 * loader->destroyAsset(asset); materials->destroyMaterials(); delete materials; delete
 * decoder; AssetLoader::destroy( &loader ); Engine::destroy( &engine );
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export class AssetLoader {
    /**
     * Creates an asset loader for the given configuration, which specifies the Filament engine.
     *
     * The engine is held weakly, used only for the creation and destruction of Filament objects.
     * The optional name component manager can be used to assign names to renderables. The material
     * source specifies whether to use filamat to generate materials on the fly, or to load a small
     * set of precompiled ubershader materials.
     */
    public static create(config: AssetConfiguration): AssetLoader;
    /**
     * Takes a pointer to the contents of a GLB or a JSON-based glTF 2.0 file and returns an asset
     * with one instance, or null on failure.
     */
    public createAsset(bytes: number, numBytes: number): FilamentAsset;
    /**
     * Adds a new instance to the asset.
     *
     * Use this with caution. It is more efficient to pre-allocate a max number of instances, and
     * gradually add them to the scene as needed. Instances can also be "recycled" by removing and
     * re-adding them to the scene.
     *
     * NOTE: destroyInstance() does not exist because gltfio favors flat arrays for storage of
     * entity lists and instance lists, which would be slow to shift. We also wish to discourage
     * create/destroy churn, as noted above.
     *
     * This cannot be called after FilamentAsset::releaseSourceData(). See also
     * AssetLoader::createInstancedAsset().
     */
    public createInstance(asset: FilamentAsset): FilamentInstance;
    /** Allows clients to enable diagnostic shading on newly-loaded assets. */
    public enableDiagnostics(enable?: boolean): void;
    /**
     * Destroys the given asset, all of its associated Filament objects, and all associated
     * FilamentInstance objects.
     *
     * This destroys entities, components, material instances, vertex buffers, index buffers, and
     * textures. This does not necessarily immediately free all source data, since texture decoding
     * or GPU uploading might be underway.
     */
    public destroyAsset(asset: FilamentAsset): void;
    public gc(): void;
    /** Gets the number of cached materials. */
    public getMaterialsCount(): number;
    public getNames(): NameComponentManager;
    public getNodeManager(): NodeManager;
    public getMaterialProvider(): MaterialProvider;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** An axis aligned 3D box represented by its center and half-extent. */
export class Box {
    /**
     * Whether the box is empty, i.e.: its extents are zero.
     *
     * @returns true if the extents of the box are zero
     */
    public isEmpty(): boolean;
    /**
     * Computes the lowest coordinates corner of the box.
     *
     * @returns center - halfExtent
     */
    public getMin(): float3;
    /**
     * Computes the largest coordinates corner of the box.
     *
     * @returns center + halfExtent
     */
    public getMax(): float3;
    /**
     * Initializes the 3D box from its min / max coordinates on each axis
     *
     * @param min lowest coordinates corner of the box
     * @param max largest coordinates corner of the box
     * @returns This bounding box
     */
    public set(min: float3, max: float3): Box;
    /**
     * Computes the bounding box of the union of two boxes
     *
     * @param box The box to be combined with
     * @returns The bounding box of the union of *this and box
     */
    public unionSelf(box: Box): Box;
    /**
     * Translates the box *to* a given center position
     *
     * @param tr position to translate the box to
     * @returns A box centered in `tr` with the same extent than *this
     */
    public translateTo(tr: float3): Box;
    /**
     * Computes the smallest bounding sphere of the box.
     *
     * @returns The smallest sphere defined by its center (.xyz) and radius (.w) that contains
     * *this
     */
    public getBoundingSphere(): float4;
    /**
     * Transform a Box by a linear transform and a translation.
     *
     * @param m a 3x3 matrix, the linear transform
     * @param t a float3, the translation
     * @param box the box to transform
     * @returns the bounding box of the transformed box
     */
    public static transform(m: mat3, t: float3, box: Box): Box;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * A CPU memory-buffer descriptor, typically used to transfer data from the CPU to the GPU.
 *
 * A BufferDescriptor owns the memory buffer it references, therefore BufferDescriptor cannot
 * be copied, but can be moved.
 *
 * BufferDescriptor releases ownership of the memory-buffer when it's destroyed.
 */
export class BufferDescriptor {
    constructor();
    /** Returns whether a release callback is set */
    public hasCallback(): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * A generic GPU buffer containing data.
 *
 * Usage of this BufferObject is optional. For simple use cases it is not necessary. It is
 * useful only when you need to share data between multiple VertexBuffer instances. It also
 * allows you to efficiently swap-out the buffers in VertexBuffer.
 *
 * NOTE: For now this is only used for vertex data, but in the future we may use it for other
 * things (e.g. compute).
 * @see VertexBuffer
 */
export class BufferObject {
    /**
     * Asynchronously copy-initializes a region of this BufferObject from the data provided.
     *
     * @param engine Reference to the filament::Engine associated with this BufferObject.
     * @param buffer A BufferDescriptor representing the data used to initialize the BufferObject.
     * @param byteOffset Offset in bytes into the BufferObject. Must be multiple of 4.
     */
    public setBuffer(engine: Engine, buffer: driver$BufferDescriptor, byteOffset?: number): void;
    /**
     * Returns the size of this BufferObject in elements.
     *
     * @returns The maximum capacity of the BufferObject.
     */
    public getByteCount(): number;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

export class BufferObject$Builder {
    constructor();
    /**
     * Size of the buffer in bytes.
     *
     * @param byteCount Maximum number of bytes the BufferObject can hold.
     * @returns A reference to this Builder for chaining calls.
     */
    public size(byteCount: number): BufferObject$Builder;
    /**
     * The binding type for this buffer object. (defaults to VERTEX)
     *
     * @param bindingType Distinguishes between SSBO, VBO, etc. For now this must be VERTEX.
     * @returns A reference to this Builder for chaining calls.
     */
    public bindingType(bindingType: BufferObjectBinding): BufferObject$Builder;
    /**
     * Associate an optional name with this BufferObject for debugging purposes.
     *
     * name will show in error messages and should be kept as short as possible. The name is
     * truncated to a maximum of 128 characters.
     *
     * The name string is copied during this method so clients may free its memory after the
     * function returns.
     *
     * @deprecated Use name(utils::StaticString const & ) instead.
     *
     * @param name A string to identify this BufferObject
     * @param len Length of name, should be less than or equal to 128
     * @returns This Builder, for chaining calls.
     */
    public name(name: string, len: number): BufferObject$Builder;
    /**
     * Creates the BufferObject and returns a pointer to it. After creation, the buffer object is
     * uninitialized. Use BufferObject::setBuffer() to initialize it.
     *
     * @param engine Reference to the filament::Engine to associate this BufferObject with.
     * @returns pointer to the newly created object
     * @see IndexBuffer::setBuffer
     */
    public build(engine: Engine): BufferObject;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Camera represents the eye(s) through which the scene is viewed.
 *
 * A Camera has a position and orientation and controls the projection and exposure parameters.
 *
 * For stereoscopic rendering, a Camera maintains two separate "eyes": Eye 0 and Eye 1. These
 * are arbitrary and don't necessarily need to correspond to "left" and "right".
 *
 * Creation and destruction ========================
 *
 * In Filament, Camera is a component that must be associated with an entity. To do so, use
 * Engine::createCamera(Entity). A Camera component is destroyed using
 * Engine::destroyCameraComponent(Entity).
 *
 * ~~~~~~~~~~~{.cpp} filament::Engine* engine = filament::Engine::create();
 *
 * utils::Entity myCameraEntity = utils::EntityManager::get().create(); filament::Camera*
 * myCamera = engine->createCamera(myCameraEntity); myCamera->setProjection(45, 16.0/9.0, 0.1,
 * 1.0); myCamera->lookAt({0, 1.60, 1}, {0, 0, 0});
 * engine->destroyCameraComponent(myCameraEntity); ~~~~~~~~~~~
 *
 * Coordinate system =================
 *
 * The camera coordinate system defines the *view space*. The camera points towards its -z axis
 * and is oriented such that its top side is in the direction of +y, and its right side in the
 * direction of +x.
 *
 * Clipping planes ===============
 *
 * The camera defines six *clipping planes* which together create a *clipping volume*. The
 * geometry outside this volume is clipped.
 *
 * The clipping volume can either be a box or a frustum depending on which projection is used,
 * respectively Projection.ORTHO or Projection.PERSPECTIVE. The six planes are specified either
 * directly or indirectly using setProjection().
 *
 * The six planes are: - left - right - bottom - top - near - far
 *
 * Choosing the *near* plane distance ==================================
 *
 * The *near* plane distance greatly affects the depth-buffer resolution.
 *
 * Example: Precision at 1m, 10m, 100m and 1Km for various near distances assuming a 32-bit
 * float depth-buffer:
 *
 * near (m) | 1 m | 10 m | 100 m | 1 Km -----------:|:------:|:-------:|:--------:|:--------:
 * 0.001 | 7.2e-5 | 0.0043 | 0.4624 | 48.58 0.01 | 6.9e-6 | 0.0001 | 0.0430 | 4.62 0.1 | 3.6e-7
 * | 7.0e-5 | 0.0072 | 0.43 1.0 | 0 | 3.8e-6 | 0.0007 | 0.07
 *
 * As can be seen in the table above, the depth-buffer precision drops rapidly with the
 * distance to the camera.
 *
 * Make sure to pick the highest *near* plane distance possible.
 *
 * On Vulkan and Metal platforms (or OpenGL platforms supporting either EXT_clip_control or
 * ARB_clip_control extensions), the depth-buffer precision is much less dependent on the
 * *near* plane value:
 *
 * near (m) | 1 m | 10 m | 100 m | 1 Km -----------:|:------:|:-------:|:--------:|:--------:
 * 0.001 | 1.2e-7 | 9.5e-7 | 7.6e-6 | 6.1e-5 0.01 | 1.2e-7 | 9.5e-7 | 7.6e-6 | 6.1e-5 0.1 |
 * 5.9e-8 | 9.5e-7 | 1.5e-5 | 1.2e-4 1.0 | 0 | 9.5e-7 | 7.6e-6 | 1.8e-4
 *
 * Choosing the *far* plane distance =================================
 *
 * The far plane distance is always set internally to infinity for rendering, however it is
 * used for culling and shadowing calculations. It is important to keep a reasonable ratio
 * between the near and far plane distances. Typically a ratio in the range 1:100 to 1:100000
 * is commanded. Larger values may causes rendering artifacts or trigger assertions in debug
 * builds.
 *
 * Exposure ========
 *
 * The Camera is also used to set the scene's exposure, just like with a real camera. The
 * lights intensity and the Camera exposure interact to produce the final scene's brightness.
 *
 * Stereoscopic rendering ======================
 *
 * The Camera's transform (as set by setModelMatrix or via TransformManager) defines a "head"
 * space, which typically corresponds to the location of the viewer's head. Each eye's
 * transform is set relative to this head space by setEyeModelMatrix.
 *
 * Each eye also maintains its own projection matrix. These can be set with
 * setCustomEyeProjection. Care must be taken to correctly set the projectionForCulling matrix,
 * as well as its corresponding near and far values. The projectionForCulling matrix must
 * define a frustum (in head space) that bounds the frustums of both eyes. Alternatively,
 * culling may be disabled with View::setFrustumCullingEnabled.
 *
 * @remarks Since the *near* and *far* planes are defined by the distance from the camera,
 * their respective coordinates are - `distance(near)` and - `distance(far).`
 *
 * @remarks To increase the depth-buffer precision, the *far* clipping plane is always assumed
 * to be at infinity for rendering. That is, it is not used to clip geometry during rendering.
 * However, it is used during the culling phase (objects entirely behind the *far* plane are
 * culled).
 * @see Frustum, View
 */
export class Camera {
    /**
     * Returns the projection matrix from the field-of-view.
     *
     * . `aspect` > 0.
     *
     * @param direction direction of the `fovInDegrees` parameter.
     * @param fovInDegrees full field-of-view in degrees. 0 < `fov` < 180.
     * @param aspect aspect ratio
     * @param near distance in world units from the camera to the near plane. `near` > 0.
     * @param far distance in world units from the camera to the far plane. `far` > `near.`
     * @see Fov.
     */
    public static projection(direction: Camera$Fov, fovInDegrees: number, aspect: number, near: number, far?: number): mat4;
    /**
     * Returns the projection matrix from the focal length.
     *
     * . `aspect` > 0.
     *
     * @param focalLengthInMillimeters lens's focal length in millimeters. `focalLength` > 0.
     * @param aspect aspect ratio
     * @param near distance in world units from the camera to the near plane. `near` > 0.
     * @param far distance in world units from the camera to the far plane. `far` > `near.`
     */
    public static projection(focalLengthInMillimeters: number, aspect: number, near: number, far?: number): mat4;
    /**
     * Sets the projection matrix from a frustum defined by six planes.
     *
     * @param projection type of #Projection to use.
     * @param left distance in world units from the camera to the left plane, at the near plane.
     *     Precondition: `left` != `right.`
     * @param right distance in world units from the camera to the right plane, at the near plane.
     *     Precondition: `left` != `right.`
     * @param bottom distance in world units from the camera to the bottom plane, at the near
     *     plane. Precondition: `bottom` != `top.`
     * @param top distance in world units from the camera to the top plane, at the near plane.
     *     Precondition: `left` != `right.`
     * @param near distance in world units from the camera to the near plane. The near plane's
     *     position in view space is z = - `near.` Precondition: `near` > 0 for PROJECTION::PERSPECTIVE
     *     or `near` != far for PROJECTION::ORTHO
     * @param far distance in world units from the camera to the far plane. The far plane's
     *     position in view space is z = - `far.` Precondition: `far` > near for
     *     PROJECTION::PERSPECTIVE or `far` != near for PROJECTION::ORTHO
     * @see Projection, Frustum
     */
    public setProjection(projection: Camera$Projection, left: number, right: number, bottom: number, top: number, near: number, far: number): void;
    /**
     * Utility to set the projection matrix from the field-of-view.
     *
     * . `aspect` > 0.
     *
     * @param fovInDegrees full field-of-view in degrees. 0 < `fov` < 180.
     * @param aspect aspect ratio
     * @param near distance in world units from the camera to the near plane. `near` > 0.
     * @param far distance in world units from the camera to the far plane. `far` > `near.`
     * @param direction direction of the `fovInDegrees` parameter.
     * @see Fov.
     */
    public setProjection(fovInDegrees: number, aspect: number, near: number, far: number, direction?: Camera$Fov): void;
    /**
     * Utility to set the projection matrix from the focal length.
     *
     * . `aspect` > 0.
     *
     * @param focalLengthInMillimeters lens's focal length in millimeters. `focalLength` > 0.
     * @param aspect aspect ratio
     * @param near distance in world units from the camera to the near plane. `near` > 0.
     * @param far distance in world units from the camera to the far plane. `far` > `near.`
     */
    public setLensProjection(focalLengthInMillimeters: number, aspect: number, near: number, far: number): void;
    /**
     * Sets a custom projection matrix.
     *
     * The projection matrix must define an NDC system that must match the OpenGL convention, that
     * is all 3 axis are mapped to [-1, 1].
     *
     * @param projection custom projection matrix used for rendering and culling
     * @param near distance in world units from the camera to the near plane.
     * @param far distance in world units from the camera to the far plane. `far` != `near.`
     */
    public setCustomProjection(projection: mat4, near: number, far: number): void;
    /**
     * Sets the projection matrix.
     *
     * The projection matrices must define an NDC system that must match the OpenGL convention,
     * that is all 3 axis are mapped to [-1, 1].
     *
     * @param projection custom projection matrix used for rendering
     * @param projectionForCulling custom projection matrix used for culling
     * @param near distance in world units from the camera to the near plane.
     * @param far distance in world units from the camera to the far plane. `far` != `near.`
     */
    public setCustomProjection(projection: mat4, projectionForCulling: mat4, near: number, far: number): void;
    /**
     * Sets a custom projection matrix for each eye.
     *
     * The projectionForCulling, near, and far parameters establish a "culling frustum" which must
     * encompass anything any eye can see. All projection matrices must be set simultaneously. The
     * number of stereoscopic eyes is controlled by the stereoscopicEyeCount setting inside of
     * Engine::Config.
     *
     * @param projection an array of projection matrices, only the first
     *     config.stereoscopicEyeCount are read
     * @param count size of the projection matrix array to set, must be >=
     *     config.stereoscopicEyeCount
     * @param projectionForCulling custom projection matrix for culling, must encompass both eyes
     * @param near distance in world units from the camera to the culling near plane. `near` > 0.
     * @param far distance in world units from the camera to the culling far plane. `far` > `near.`
     * @see setCustomProjection
     * @see Engine::Config::stereoscopicEyeCount
     */
    public setCustomEyeProjection(projection: mat4, count: number, projectionForCulling: mat4, near: number, far: number): void;
    /**
     * Sets an additional matrix that scales the projection matrix.
     *
     * This is useful to adjust the aspect ratio of the camera independent of its projection.
     * First, pass an aspect of 1.0 to setProjection. Then set the scaling with the desired aspect
     * ratio:
     *
     * const double aspect = width / height;
     *
     * // with Fov::HORIZONTAL passed to setProjection: camera->setScaling(double4 {1.0, aspect});
     *
     * // with Fov::VERTICAL passed to setProjection: camera->setScaling(double4 {1.0 / aspect,
     * 1.0});
     *
     * By default, this is an identity matrix.
     *
     * @param scaling diagonal of the 2x2 scaling matrix to be applied after the projection matrix.
     * @see setProjection, setLensProjection, setCustomProjection
     */
    public setScaling(scaling: double2): void;
    /**
     * Sets an additional matrix that shifts the projection matrix. By default, this is an identity
     * matrix.
     *
     * @param shift x and y translation added to the projection matrix, specified in NDC
     *     coordinates, that is, if the translation must be specified in pixels, shift must be scaled
     *     by 1.0 / { viewport.width, viewport.height }.
     * @see setProjection, setLensProjection, setCustomProjection
     */
    public setShift(shift: double2): void;
    /**
     * Returns the scaling amount used to scale the projection matrix.
     *
     * @returns the diagonal of the scaling matrix applied after the projection matrix.
     * @see setScaling
     */
    public getScaling(): double4;
    /**
     * Returns the shift amount used to translate the projection matrix.
     *
     * @returns the 2D translation x and y offsets applied after the projection matrix.
     * @see setShift
     */
    public getShift(): double2;
    /**
     * Returns the projection matrix used for rendering.
     *
     * The projection matrix used for rendering always has its far plane set to infinity. This is
     * why it may differ from the matrix set through setProjection() or setLensProjection().
     *
     * @param eyeId the index of the eye to return the projection matrix for, must be <
     *     config.stereoscopicEyeCount
     * @returns The projection matrix used for rendering
     * @see setProjection, setLensProjection, setCustomProjection, getCullingProjectionMatrix,
     * setCustomEyeProjection
     */
    public getProjectionMatrix(eyeId?: number): mat4;
    /**
     * Returns the projection matrix used for culling (far plane is finite).
     *
     * @returns The projection matrix set by setProjection or setLensProjection.
     * @see setProjection, setLensProjection, getProjectionMatrix
     */
    public getCullingProjectionMatrix(): mat4;
    /** Returns the frustum's near plane */
    public getNear(): number;
    /** Returns the frustum's far plane used for culling */
    public getCullingFar(): number;
    /**
     * Sets the camera's model matrix.
     *
     * Helper method to set the camera's entity transform component. It has the same effect as
     * calling:
     *
     * ~~~~~~~~~~~{.cpp} engine.getTransformManager().setTransform(
     * engine.getTransformManager().getInstance(camera->getEntity()), model); ~~~~~~~~~~~
     *
     * @remarks The Camera "looks" towards its -z axis
     *
     * @remarks Warning: `model` must be a rigid transform
     *
     * @param modelMatrix The camera position and orientation provided as a rigid transform matrix.
     */
    public setModelMatrixMat4d(modelMatrix: mat4): void;
    public setModelMatrixMat4f(modelMatrix: mat4): void;
    /**
     * Set the position of an eye relative to this Camera (head).
     *
     * By default, both eyes' model matrices are identity matrices.
     *
     * For example, to position Eye 0 3cm leftwards and Eye 1 3cm rightwards: ~~~~~~~~~~~{.cpp}
     * const mat4 leftEye = mat4::translation(double3{-0.03, 0.0, 0.0}); const mat4 rightEye =
     * mat4::translation(double3{ 0.03, 0.0, 0.0}); camera.setEyeModelMatrix(0, leftEye);
     * camera.setEyeModelMatrix(1, rightEye); ~~~~~~~~~~~
     *
     * This method is not intended to be called every frame. Instead, to update the position of the
     * head, use Camera::setModelMatrix.
     *
     * @param eyeId the index of the eye to set, must be < config.stereoscopicEyeCount
     * @param model the model matrix for an individual eye
     */
    public setEyeModelMatrix(eyeId: number, model: mat4): void;
    /**
     * Sets the camera's model matrix
     *
     * @param eye The position of the camera in world space.
     * @param center The point in world space the camera is looking at.
     * @param up A unit vector denoting the camera's "up" direction.
     */
    public lookAt(eye: double3, center: double3, up?: double3): void;
    /**
     * Returns the camera's model matrix
     *
     * Helper method to return the camera's entity transform component. It has the same effect as
     * calling:
     *
     * ~~~~~~~~~~~{.cpp} engine.getTransformManager().getWorldTransform(
     * engine.getTransformManager().getInstance(camera->getEntity())); ~~~~~~~~~~~
     *
     * @returns The camera's pose in world space as a rigid transform. Parent transforms, if any,
     * are taken into account.
     */
    public getModelMatrix(): mat4;
    /** Returns the camera's view matrix (inverse of the model matrix) */
    public getViewMatrix(): mat4;
    /**
     * Returns the eye from view matrix for the specified eye.
     *
     * @param eyeId the index of the eye to return the eye from view matrix for, must be <
     *     config.stereoscopicEyeCount
     * @returns The eye from view matrix
     */
    public getEyeFromViewMatrix(eyeId?: number): mat4;
    /** Returns the camera's position in world space */
    public getPosition(): double3;
    /** Returns the camera's normalized left vector */
    public getLeftVector(): float3;
    /** Returns the camera's normalized up vector */
    public getUpVector(): float3;
    /** Returns the camera's forward vector */
    public getForwardVector(): float3;
    /** Returns the camera's field of view in degrees */
    public getFieldOfViewInDegrees(direction: Camera$Fov): number;
    /** Returns the camera's culling Frustum in world space */
    public getFrustum(): Frustum;
    /** Returns the entity representing this camera */
    public getEntity(): Entity;
    /**
     * Sets this camera's exposure (default is f/16, 1/125s, 100 ISO)
     *
     * The exposure ultimately controls the scene's brightness, just like with a real camera. The
     * default values provide adequate exposure for a camera placed outdoors on a sunny day with
     * the sun at the zenith.
     *
     * @remarks With the default parameters, the scene must contain at least one Light of intensity
     * similar to the sun (e.g.: a 100,000 lux directional light).
     *
     * @param aperture Aperture in f-stops, clamped between 0.5 and 64. A lower `aperture` value
     *     *increases* the exposure, leading to a brighter scene. Realistic values are between 0.95 and
     *     32.
     * @param shutterSpeed Shutter speed in seconds, clamped between 1/25,000 and 60. A lower
     *     shutter speed increases the exposure. Realistic values are between 1/8000 and 30.
     * @param sensitivity Sensitivity in ISO, clamped between 10 and 204,800. A higher
     *     `sensitivity` increases the exposure. Realistic values are between 50 and 25600.
     * @see LightManager, Exposure
     */
    public setExposure(aperture: number, shutterSpeed: number, sensitivity: number): void;
    /**
     * Sets this camera's exposure directly. Calling this method will set the aperture to 1.0, the
     * shutter speed to 1.2 and the sensitivity will be computed to match the requested exposure
     * (for a desired exposure of 1.0, the sensitivity will be set to 100 ISO).
     *
     * This method is useful when trying to match the lighting of other engines or tools. Many
     * engines/tools use unit-less light intensities, which can be matched by setting the exposure
     * manually. This can be typically achieved by setting the exposure to 1.0.
     */
    public setExposure(exposure: number): void;
    /** returns this camera's aperture in f-stops */
    public getAperture(): number;
    /** returns this camera's shutter speed in seconds */
    public getShutterSpeed(): number;
    /** returns this camera's sensitivity in ISO */
    public getSensitivity(): number;
    /**
     * Returns the focal length in meters [m] for a 35mm camera. Eye 0's projection matrix is used
     * to compute the focal length.
     */
    public getFocalLength(): number;
    /**
     * Sets the camera focus distance. This is used by the Depth-of-field PostProcessing effect.
     *
     * @param distance Distance from the camera to the plane of focus in world units. Must be
     *     positive and larger than the near clipping plane.
     */
    public setFocusDistance(distance: number): void;
    /** Returns the focus distance in world units */
    public getFocusDistance(): number;
    /**
     * Returns the inverse of a projection matrix.
     *
     * @param p the projection matrix to inverse
     * @returns the inverse of the projection matrix `p`
     */
    public static inverseProjectionMat4d(p: mat4): mat4;
    /**
     * Returns the inverse of a projection matrix.
     * @see inverseProjection(const math::mat4 & )
     */
    public static inverseProjectionMat4f(p: mat4): mat4;
    /**
     * Helper to compute the effective focal length taking into account the focus distance
     *
     * @param focalLength focal length in any unit (e.g. [m] or [mm])
     * @param focusDistance focus distance in same unit as focalLength
     * @returns the effective focal length in same unit as focalLength
     */
    public static computeEffectiveFocalLength(focalLength: number, focusDistance: number): number;
    /**
     * Helper to compute the effective field-of-view taking into account the focus distance
     *
     * @param fovInDegrees full field of view in degrees
     * @param focusDistance focus distance in meters [m]
     * @returns effective full field of view in degrees
     */
    public static computeEffectiveFov(fovInDegrees: number, focusDistance: number): number;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** Utilities to manipulate and convert colors */
export class Color {
    /** converts an RGB color to linear space, the conversion depends on the specified type */
    public static toLinearFloat3(type: RgbType, color: float3): float3;
    /** converts an RGBA color to linear space, the conversion depends on the specified type */
    public static toLinearFloat4(type: RgbaType, color: float4): float4;
    /**
     * Converts a correlated color temperature to a linear RGB color in sRGB space the temperature
     * must be expressed in kelvin and must be in the range 1,000K to 15,000K.
     */
    public static cct(K: number): float3;
    /**
     * Converts a CIE standard illuminant series D to a linear RGB color in sRGB space the
     * temperature must be expressed in kelvin and must be in the range 4,000K to 25,000K
     */
    public static illuminantD(K: number): float3;
    /**
     * Computes the Beer-Lambert absorption coefficients from the specified transmittance color and
     * distance. The computed absorption will guarantee the white light will become the specified
     * color at the specified distance. The output of this function can be used as the absorption
     * parameter of materials that use refraction.
     *
     * @param color the desired linear RGB color in sRGB space
     * @param distance the distance at which white light should become the specified color
     * @returns absorption coefficients for the Beer-Lambert law
     */
    public static absorptionAtDistance(color: float3, distance: number): float3;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * ColorGrading is used to transform (either to modify or correct) the colors of the HDR buffer
 * rendered by Filament. Color grading transforms are applied after lighting, and after any
 * lens effects (bloom for instance), and include tone mapping.
 *
 * Creation, usage and destruction ===============================
 *
 * A ColorGrading object is created using the ColorGrading::Builder and destroyed by calling
 * Engine::destroy(const ColorGrading*). A ColorGrading object is meant to be set on a View.
 *
 * ~~~~~~~~~~~{.cpp} filament::Engine* engine = filament::Engine::create();
 *
 * filament::ColorGrading* colorGrading = filament::ColorGrading::Builder()
 * .toneMapping(filament::ColorGrading::ToneMapping::ACES) .build(*engine);
 *
 * myView->setColorGrading(colorGrading);
 *
 * engine->destroy(colorGrading); ~~~~~~~~~~~
 *
 * Performance ===========
 *
 * Creating a new ColorGrading object may be more expensive than other Filament objects as a
 * LUT may need to be generated. The generation of this LUT, if necessary, may happen on the
 * CPU.
 *
 * Ordering ========
 *
 * The various transforms held by ColorGrading are applied in the following order: - Exposure -
 * Night adaptation - White balance - Channel mixer - Shadows/mid-tones/highlights -
 * Slope/offset/power (CDL) - Contrast - Vibrance - Saturation - Curves - Tone mapping -
 * Luminance scaling - Gamut mapping
 *
 * Defaults ========
 *
 * Here are the default color grading options: - Exposure: 0.0 - Night adaptation: 0.0 - White
 * balance: temperature 0, and tint 0 - Channel mixer: red {1,0,0}, green {0,1,0}, blue {0,0,1}
 * - Shadows/mid-tones/highlights: shadows {1,1,1,0}, mid-tones {1,1,1,0}, highlights
 * {1,1,1,0}, ranges {0,0.333,0.550,1} - Slope/offset/power: slope 1.0, offset 0.0, and power
 * 1.0 - Contrast: 1.0 - Vibrance: 1.0 - Saturation: 1.0 - Curves: gamma {1,1,1}, midPoint
 * {1,1,1}, and scale {1,1,1} - Tone mapping: ACESLegacyToneMapper - Luminance scaling: false -
 * Gamut mapping: false - Output color space: Rec709-sRGB-D65
 * @see View
 */
export class ColorGrading {

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** Use Builder to construct a ColorGrading object instance */
export class ColorGrading$Builder {
    constructor();
    /**
     * Sets the quality level of the color grading. When color grading is implemented using a 3D
     * LUT, the quality level may impact the resolution and bit depth of the backing 3D texture.
     * For instance, a low quality level will use a 16x16x16 10 bit LUT, a medium quality level
     * will use a 32x32x32 10 bit LUT, a high quality will use a 32x32x32 16 bit LUT, and a ultra
     * quality will use a 64x64x64 16 bit LUT.
     *
     * This setting has no effect if generating a 1D LUT.
     *
     * This overrides the values set by format() and dimensions().
     *
     * The default quality is medium.
     *
     * @param qualityLevel The desired quality of the color grading process
     * @returns This Builder, for chaining calls
     */
    public quality(qualityLevel: ColorGrading$QualityLevel): ColorGrading$Builder;
    /**
     * When color grading is implemented using a 3D LUT, this sets the texture format of of the
     * LUT. This overrides the value set by quality().
     *
     * This setting has no effect if generating a 1D LUT.
     *
     * The default is INTEGER
     *
     * @param format The desired format of the 3D LUT.
     * @returns This Builder, for chaining calls
     */
    public format(format: ColorGrading$LutFormat): ColorGrading$Builder;
    /**
     * When color grading is implemented using a 3D LUT, this sets the dimension of the LUT. This
     * overrides the value set by quality().
     *
     * This setting has no effect if generating a 1D LUT.
     *
     * The default is 32
     *
     * @param dim The desired dimension of the LUT. Between 16 and 64.
     * @returns This Builder, for chaining calls
     */
    public dimensions(dim: number): ColorGrading$Builder;
    /**
     * Selects the tone mapping operator to apply to the HDR color buffer as the last operation of
     * the color grading post-processing step.
     *
     * The default tone mapping operator is ACES_LEGACY.
     *
     * @deprecated Use toneMapper(ToneMapper*) instead
     *
     * @param toneMapping The tone mapping operator to apply to the HDR color buffer
     * @returns This Builder, for chaining calls
     */
    public toneMapping(toneMapping: ColorGrading$ToneMapping): ColorGrading$Builder;
    /**
     * Enables or disables the luminance scaling component (LICH) from the exposure value invariant
     * luminance system (EVILS). When this setting is enabled, pixels with high chromatic values
     * will roll-off to white to offer a more natural rendering. This step also helps avoid
     * undesirable hue skews caused by out of gamut colors clipped to the destination color gamut.
     *
     * When luminance scaling is enabled, tone mapping is performed on the luminance of each pixel
     * instead of per-channel.
     *
     * @param luminanceScaling Enables or disables luminance scaling post-tone mapping
     * @returns This Builder, for chaining calls
     */
    public luminanceScaling(luminanceScaling: boolean): ColorGrading$Builder;
    /**
     * Enables or disables gamut mapping to the destination color space's gamut. When gamut mapping
     * is turned off, out-of-gamut colors are clipped to the destination's gamut, which may produce
     * hue skews (blue skewing to purple, green to yellow, etc.). When gamut mapping is enabled,
     * out-of-gamut colors are brought back in gamut by trying to preserve the perceived chroma and
     * lightness of the original values.
     *
     * @param gamutMapping Enables or disables gamut mapping
     * @returns This Builder, for chaining calls
     */
    public gamutMapping(gamutMapping: boolean): ColorGrading$Builder;
    /**
     * Adjusts the exposure of this image. The exposure is specified in stops: each stop brightens
     * (positive values) or darkens (negative values) the image by a factor of 2. This means that
     * an exposure of 3 will brighten the image 8 times more than an exposure of 0 (2^3 = 8 and 2^0
     * = 1). Contrary to the camera's exposure, this setting is applied after all post-processing
     * (bloom, etc.) are applied.
     *
     * @param exposure Value in EV stops. Can be negative, 0, or positive.
     * @returns This Builder, for chaining calls
     */
    public exposure(exposure: number): ColorGrading$Builder;
    /**
     * Controls the amount of night adaptation to replicate a more natural representation of
     * low-light conditions as perceived by the human vision system. In low-light conditions, peak
     * luminance sensitivity of the eye shifts toward the blue end of the color spectrum: darker
     * tones appear brighter, reducing contrast, and colors are blue shifted (the darker the more
     * intense the effect).
     *
     * @param adaptation Amount of adaptation, between 0 (no adaptation) and 1 (full adaptation).
     * @returns This Builder, for chaining calls
     */
    public nightAdaptation(adaptation: number): ColorGrading$Builder;
    /**
     * Adjusts the while balance of the image. This can be used to remove color casts and correct
     * the appearance of the white point in the scene, or to alter the overall chromaticity of the
     * image for artistic reasons (to make the image appear cooler or warmer for instance).
     *
     * The while balance adjustment is defined with two values: - Temperature, to modify the color
     * temperature. This value will modify the colors on a blue/yellow axis. Lower values apply a
     * cool color temperature, and higher values apply a warm color temperature. The lowest value,
     * -1.0f, is equivalent to a temperature of 50,000K. The highest value, 1.0f, is equivalent to
     * a temperature of 2,000K. - Tint, to modify the colors on a green/magenta axis. The lowest
     * value, -1.0f, will apply a strong green cast, and the highest value, 1.0f, will apply a
     * strong magenta cast.
     *
     * Both values are expected to be in the range [-1.0..+1.0]. Values outside of that range will
     * be clipped to that range.
     *
     * @param temperature Modification on the blue/yellow axis, as a value between -1.0 and +1.0.
     * @param tint Modification on the green/magenta axis, as a value between -1.0 and +1.0.
     * @returns This Builder, for chaining calls
     */
    public whiteBalance(temperature: number, tint: number): ColorGrading$Builder;
    /**
     * The channel mixer adjustment modifies each output color channel using the specified mix of
     * the source color channels.
     *
     * By default each output color channel is set to use 100% of the corresponding source channel
     * and 0% of the other channels. For instance, the output red channel is set to {1.0, 0.0, 1.0}
     * or 100% red, 0% green and 0% blue.
     *
     * Each output channel can add or subtract data from the source channel by using values in the
     * range [-2.0..+2.0]. Values outside of that range will be clipped to that range.
     *
     * Using the channel mixer adjustment you can for instance create a monochrome output by
     * setting all 3 output channels to the same mix. For instance: {0.4, 0.4, 0.2} for all 3
     * output channels(40% red, 40% green and 20% blue).
     *
     * More complex mixes can be used to create more complex effects. For instance, here is a mix
     * that creates a sepia tone effect: - outRed = {0.255, 0.858, 0.087} - outGreen = {0.213,
     * 0.715, 0.072} - outBlue = {0.170, 0.572, 0.058}
     *
     * @param outRed The mix of source RGB for the output red channel, between -2.0 and +2.0
     * @param outGreen The mix of source RGB for the output green channel, between -2.0 and +2.0
     * @param outBlue The mix of source RGB for the output blue channel, between -2.0 and +2.0
     * @returns This Builder, for chaining calls
     */
    public channelMixer(outRed: float3, outGreen: float3, outBlue: float3): ColorGrading$Builder;
    /**
     * Adjusts the colors separately in 3 distinct tonal ranges or zones: shadows, mid-tones, and
     * highlights.
     *
     * The tonal zones are by the ranges parameter: the x and y components define the beginning and
     * end of the transition from shadows to mid-tones, and the z and w components define the
     * beginning and end of the transition from mid-tones to highlights.
     *
     * A smooth transition is applied between the zones which means for instance that the
     * correction color of the shadows range will partially apply to the mid-tones, and the other
     * way around. This ensure smooth visual transitions in the final image.
     *
     * Each correction color is defined as a linear RGB color and a weight. The weight is a value
     * (which may be positive or negative) that is added to the linear RGB color before mixing.
     * This can be used to darken or brighten the selected tonal range.
     *
     * Shadows/mid-tones/highlights adjustment are performed linear space.
     *
     * @param shadows Linear RGB color (.rgb) and weight (.w) to apply to the shadows
     * @param midtones Linear RGB color (.rgb) and weight (.w) to apply to the mid-tones
     * @param highlights Linear RGB color (.rgb) and weight (.w) to apply to the highlights
     * @param ranges Range of the shadows (x and y), and range of the highlights (z and w)
     * @returns This Builder, for chaining calls
     */
    public shadowsMidtonesHighlights(shadows: float4, midtones: float4, highlights: float4, ranges: float4): ColorGrading$Builder;
    /**
     * Applies a slope, offset, and power, as defined by the ASC CDL (American Society of
     * Cinematographers Color Decision List) to the image. The CDL can be used to adjust the colors
     * of different tonal ranges in the image.
     *
     * The ASC CDL is similar to the lift/gamma/gain controls found in many color grading tools.
     * Lift is equivalent to a combination of offset and slope, gain is equivalent to slope, and
     * gamma is equivalent to power.
     *
     * The slope and power values must be strictly positive. Values less than or equal to 0 will be
     * clamped to a small positive value, offset can be any positive or negative value.
     *
     * Version 1.2 of the ASC CDL adds saturation control, which is here provided as a separate
     * API. See the saturation() method for more information.
     *
     * Slope/offset/power adjustments are performed in log space.
     *
     * @param slope Multiplier of the input color, must be a strictly positive number
     * @param offset Added to the input color, can be a negative or positive number, including 0
     * @param power Power exponent of the input color, must be a strictly positive number
     * @returns This Builder, for chaining calls
     */
    public slopeOffsetPower(slope: float3, offset: float3, power: float3): ColorGrading$Builder;
    /**
     * Adjusts the contrast of the image. Lower values decrease the contrast of the image (the
     * tonal range is narrowed), and higher values increase the contrast of the image (the tonal
     * range is widened). A value of 1.0 has no effect.
     *
     * The contrast is defined as a value in the range [0.0...2.0]. Values outside of that range
     * will be clipped to that range.
     *
     * Contrast adjustment is performed in log space.
     *
     * @param contrast Contrast expansion, between 0.0 and 2.0. 1.0 leaves contrast unaffected
     * @returns This Builder, for chaining calls
     */
    public contrast(contrast: number): ColorGrading$Builder;
    /**
     * Adjusts the saturation of the image based on the input color's saturation level. Colors with
     * a high level of saturation are less affected than colors with low saturation levels.
     *
     * Lower vibrance values decrease intensity of the colors present in the image, and higher
     * values increase the intensity of the colors in the image. A value of 1.0 has no effect.
     *
     * The vibrance is defined as a value in the range [0.0...2.0]. Values outside of that range
     * will be clipped to that range.
     *
     * Vibrance adjustment is performed in linear space.
     *
     * @param vibrance Vibrance, between 0.0 and 2.0. 1.0 leaves vibrance unaffected
     * @returns This Builder, for chaining calls
     */
    public vibrance(vibrance: number): ColorGrading$Builder;
    /**
     * Adjusts the saturation of the image. Lower values decrease intensity of the colors present
     * in the image, and higher values increase the intensity of the colors in the image. A value
     * of 1.0 has no effect.
     *
     * The saturation is defined as a value in the range [0.0...2.0]. Values outside of that range
     * will be clipped to that range.
     *
     * Saturation adjustment is performed in linear space.
     *
     * @param saturation Saturation, between 0.0 and 2.0. 1.0 leaves saturation unaffected
     * @returns This Builder, for chaining calls
     */
    public saturation(saturation: number): ColorGrading$Builder;
    /**
     * Applies a curve to each RGB channel of the image. Each curve is defined by 3 values: a gamma
     * value applied to the shadows only, a mid-point indicating where shadows stop and highlights
     * start, and a scale factor for the highlights.
     *
     * The gamma and mid-point must be strictly positive values. If they are not, they will be
     * clamped to a small positive value. The scale can be any negative of positive value.
     *
     * Curves are applied in linear space.
     *
     * @param shadowGamma Power value to apply to the shadows, must be strictly positive
     * @param midPoint Mid-point defining where shadows stop and highlights start, must be strictly
     *     positive
     * @param highlightScale Scale factor for the highlights, can be any negative or positive value
     * @returns This Builder, for chaining calls
     */
    public curves(shadowGamma: float3, midPoint: float3, highlightScale: float3): ColorGrading$Builder;
    /**
     * Sets the output color space for this ColorGrading object. After all color grading steps have
     * been applied, the final color will be converted in the desired color space.
     *
     * NOTE: Currently the output color space must be one of Rec709-sRGB-D65 or Rec709-Linear-D65.
     * Only the transfer function is taken into account.
     *
     * @param colorSpace The output color space.
     * @returns This Builder, for chaining calls
     */
    public outputColorSpace(colorSpace: color$ColorSpace): ColorGrading$Builder;
    /**
     * Hints whether the engine is permitted to use fast mathematical approximations (such as SIMD
     * polynomial transcendentals) during LUT generation when eligible.
     *
     * Setting fastMath to false forces exact C++ scalar libm calculations. The default is true.
     *
     * @param fastMath true to allow fast mathematical approximations, false otherwise.
     * @returns This Builder, for chaining calls.
     */
    public fastMath(fastMath: boolean): ColorGrading$Builder;
    /**
     * Creates the ColorGrading object and returns a pointer to it.
     *
     * @param engine Reference to the filament::Engine to associate this ColorGrading with.
     * @returns pointer to the newly created object.
     */
    public build(engine: Engine): ColorGrading;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * A registry of runtime properties used exclusively for debugging
 *
 * Filament exposes a few properties that can be queried and set, which control certain
 * debugging features of the engine. These properties can be set at runtime at anytime.
 *
 * Internally, boolean flags used by both the main thread (client side) and backend threads are
 * implemented using std::atomic <bool > to ensure safe cross-thread flipping without data
 * races.
 */
export class DebugRegistry {
    /**
     * Queries whether a property exists
     *
     * @param name The name of the property to query
     * @returns true if the property exists, false otherwise
     */
    public hasProperty(name: string): boolean;
    /**
     * Set the value of a property
     *
     * @param name Name of the property to set the value of
     * @param v Value to set
     * @returns true if the operation was successful, false otherwise. @ {
     */
    public setPropertyBool(name: string, v: boolean): boolean;
    public setPropertyInt(name: string, v: number): boolean;
    public setPropertyFloat(name: string, v: number): boolean;
    public setPropertyFloat2(name: string, v: float2): boolean;
    public setPropertyFloat3(name: string, v: float3): boolean;
    public setPropertyFloat4(name: string, v: float4): boolean;
    /**
     * Get the value of a property
     *
     * @param name Name of the property to get the value of
     * @param v A pointer to a variable which will hold the result
     * @returns true if the call was successful and `v` was updated @ {
     */
    public getPropertyBool(name: string, v: boolean): boolean;
    public getPropertyInt(name: string, v: number): boolean;
    public getPropertyFloat(name: string, v: number): boolean;
    public getPropertyFloat2(name: string, v: float2): boolean;
    public getPropertyFloat3(name: string, v: float3): boolean;
    public getPropertyFloat4(name: string, v: float4): boolean;
    public getDataSource(name: string): DebugRegistry$DataSource;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Engine is filament's main entry-point.
 *
 * An Engine instance main function is to keep track of all resources created by the user and
 * manage the rendering thread as well as the hardware renderer.
 *
 * To use filament, an Engine instance must be created first:
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ #include <filament /Engine.h>
 * using namespace filament;
 *
 * Engine* engine = Engine::create();
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Engine essentially represents (or is associated to) a hardware context (e.g. an OpenGL ES
 * context).
 *
 * Rendering typically happens in an operating system's window (which can be full screen), such
 * window is managed by a filament.Renderer.
 *
 * A typical filament render loop looks like this:
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ #include <filament /Engine.h>
 * #include <filament /Renderer.h> #include <filament /Scene.h> #include <filament /View.h>
 * using namespace filament;
 *
 * Engine* engine = Engine::create(); SwapChain* swapChain =
 * engine->createSwapChain(nativeWindow); Renderer* renderer = engine->createRenderer(); Scene*
 * scene = engine->createScene(); View* view = engine->createView();
 *
 * view->setScene(scene);
 *
 * do { // typically we wait for VSYNC and user input events if
 * (renderer->beginFrame(swapChain)) { renderer->render(view); renderer->endFrame(); } } while
 * (!quit);
 *
 * engine->destroy(view); engine->destroy(scene); engine->destroy(renderer);
 * engine->destroy(swapChain); Engine::destroy( &engine ); // clears engine*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Resource Tracking =================
 *
 * Each Engine instance keeps track of all objects created by the user, such as vertex and
 * index buffers, lights, cameras, etc... The user is expected to free those resources,
 * however, leaked resources are freed when the engine instance is destroyed and a warning is
 * emitted in the console.
 *
 * Thread safety =============
 *
 * An Engine instance is not thread-safe. The implementation makes no attempt to synchronize
 * calls to an Engine instance methods. If multi-threading is needed, synchronization must be
 * external.
 *
 * Multi-threading ===============
 *
 * When created, the Engine instance starts a render thread as well as multiple worker threads,
 * these threads have an elevated priority appropriate for rendering, based on the platform's
 * best practices. The number of worker threads depends on the platform and is automatically
 * chosen for best performance.
 *
 * On platforms with asymmetric cores (e.g. ARM's Big.Little), Engine makes some educated
 * guesses as to which cores to use for the render thread and worker threads. For example,
 * it'll try to keep an OpenGL ES thread on a Big core.
 *
 * Swap Chains ===========
 *
 * A swap chain represents an Operating System's *native* renderable surface. Typically it's a
 * window or a view. Because a SwapChain is initialized from a native object, it is given to
 * filament as a `void*`, which must be of the proper type for each platform filament is
 * running on.
 * @see SwapChain
 * @see Renderer
 */
export class Engine {
    /**
     * Destroy the Engine instance and all associated resources.
     *
     * Engine.destroy() should be called last and after all other resources have been destroyed, it
     * ensures all filament resources are freed.
     *
     * Destroy performs the following tasks: 1. Destroy all internal software and hardware
     * resources. 2. Free all user allocated resources that are not already destroyed and logs a
     * warning. This indicates a "leak" in the user's code. 3. Terminate the rendering engine's
     * thread.
     *
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ #include <filament /Engine.h>
     * using namespace filament;
     *
     * Engine* engine = Engine::create(); Engine::destroy(engine);
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     *
     * @param engine A pointer to the filament.Engine to be destroyed.
     */
    public static destroyEngine(engine: Engine): void;
    /**
     * Query the feature level supported by the selected backend.
     *
     * A specific feature level needs to be set before the corresponding features can be used.
     *
     * @returns FeatureLevel supported the selected backend.
     * @see setActiveFeatureLevel
     */
    public getSupportedFeatureLevel(): FeatureLevel;
    /**
     * Activate all features of a given feature level. If an explicit feature level is not
     * specified at Engine initialization time via Builder::featureLevel, the default feature level
     * is FeatureLevel::FEATURE_LEVEL_0 on devices not compatible with GLES 3.0; otherwise, the
     * default is FeatureLevel::FEATURE_LEVEL_1. The selected feature level must not be higher than
     * the value returned by getActiveFeatureLevel() and it's not possible lower the active feature
     * level. Additionally, it is not possible to modify the feature level at all if the Engine was
     * initialized at FeatureLevel::FEATURE_LEVEL_0.
     *
     * @param featureLevel the feature level to activate. If featureLevel is lower than
     *     getActiveFeatureLevel(), the current (higher) feature level is kept. If featureLevel is
     *     higher than getSupportedFeatureLevel(), or if the engine was initialized at feature level 0,
     *     an exception is thrown, or the program is terminated if exceptions are disabled.
     * @returns the active feature level.
     * @see Builder::featureLevel
     * @see getSupportedFeatureLevel
     * @see getActiveFeatureLevel
     */
    public setActiveFeatureLevel(featureLevel: FeatureLevel): FeatureLevel;
    /**
     * Returns the currently active feature level.
     *
     * @returns currently active feature level
     * @see getSupportedFeatureLevel
     * @see setActiveFeatureLevel
     */
    public getActiveFeatureLevel(): FeatureLevel;
    /**
     * Queries the maximum number of GPU instances that Filament creates when automatic instancing
     * is enabled. This value is also the limit for the number of transforms that can be stored in
     * an InstanceBuffer. This value may depend on the device and platform, but will remain
     * constant during the lifetime of this Engine.
     *
     * This value does not apply when using the instances(size_t) method on
     * RenderableManager::Builder.
     *
     * @returns the number of max automatic instances
     * @see setAutomaticInstancingEnabled
     * @see RenderableManager::Builder::instances(size_t)
     * @see RenderableManager::Builder::instances(size_t, InstanceBuffer*)
     */
    public getMaxAutomaticInstances(): number;
    /**
     * Queries the device and platform for support of the given stereoscopic type.
     *
     * @returns true if the given stereo rendering is supported, false otherwise
     * @see View::setStereoscopicOptions
     */
    public isStereoSupported(stereoscopicType: Platform$StereoscopicType): boolean;
    /**
     * Checks if the engine is set up for asynchronous operation. If it returns true, the
     * asynchronous versions of the APIs are available for use.
     *
     * @returns true if the engine supports asynchronous operation.
     */
    public isAsynchronousModeEnabled(): boolean;
    /**
     * Returns whether the engine has encountered an unrecoverable failure.
     *
     * If this returns true, the engine is in an unrecoverable state and further calls to rendering
     * methods will fail or be ignored. Apps can use this to check for fatal errors instead of
     * relying on exceptions.
     *
     * @returns true if an unrecoverable failure has occurred, false otherwise.
     */
    public hasUnrecoverableFailure(): boolean;
    /**
     * Retrieves the configuration settings of this Engine.
     *
     * This method returns the configuration object that was supplied to the Engine's
     * Builder::config method during the creation of this Engine. If the Builder::config method was
     * not explicitly called (or called with nullptr), this method returns the default
     * configuration settings.
     *
     * @returns a Config object with this Engine's configuration
     * @see Builder::config
     */
    public getConfig(): Engine$Config;
    /**
     * Returns the maximum number of stereoscopic eyes supported by Filament. The actual number of
     * eyes rendered is set at Engine creation time with the Engine::Config::stereoscopicEyeCount
     * setting.
     *
     * @returns the max number of stereoscopic eyes supported
     * @see Engine::Config::stereoscopicEyeCount
     */
    public static getMaxStereoscopicEyes(): number;
    /** @returns EntityManager used by filament */
    public getEntityManager(): EntityManager;
    /** @returns RenderableManager reference */
    public getRenderableManager(): RenderableManager;
    /** @returns LightManager reference */
    public getLightManager(): LightManager;
    /** @returns TransformManager reference */
    public getTransformManager(): TransformManager;
    /**
     * Helper to enable accurate translations. If you need this Engine to handle a very large world
     * space, one way to achieve this automatically is to enable accurate translations in the
     * TransformManager. This helper provides a convenient way of doing that. This is typically
     * called once just after creating the Engine.
     */
    public enableAccurateTranslations(): void;
    /**
     * Enables or disables automatic instancing of render primitives. Instancing of render
     * primitives can greatly reduce CPU overhead but requires the instanced primitives to be
     * identical (i.e. use the same geometry) and use the same MaterialInstance. If it is known
     * that the scene doesn't contain any identical primitives, automatic instancing can have some
     * overhead and it is then best to disable it.
     *
     * Disabled by default.
     *
     * @param enable true to enable, false to disable automatic instancing.
     * @see RenderableManager
     * @see MaterialInstance
     */
    public setAutomaticInstancingEnabled(enable: boolean): void;
    /**
     * @returns true if automatic instancing is enabled, false otherwise.
     * @see setAutomaticInstancingEnabled
     */
    public isAutomaticInstancingEnabled(): boolean;
    /**
     * Creates a headless SwapChain.
     *
     * @param width Width of the drawing buffer in pixels.
     * @param height Height of the drawing buffer in pixels.
     * @param flags One or more configuration flags as defined in `SwapChain`.
     * @returns A pointer to the newly created SwapChain.
     * @see Renderer.beginFrame()
     */
    public createSwapChain(width: number, height: number, flags?: number): SwapChain;
    /**
     * Creates a renderer associated to this engine.
     *
     * A Renderer is intended to map to a *window* on screen.
     *
     * @returns A pointer to the newly created Renderer.
     */
    public createRenderer(): Renderer;
    /**
     * Creates a View.
     *
     * @returns A pointer to the newly created View.
     */
    public createView(): View;
    /**
     * Creates a Scene.
     *
     * @returns A pointer to the newly created Scene.
     */
    public createScene(): Scene;
    /**
     * Creates a Camera component.
     *
     * @param entity Entity to add the camera component to.
     * @returns A pointer to the newly created Camera.
     */
    public createCamera(entity: Entity): Camera;
    /**
     * Returns the Camera component of the given entity.
     *
     * @param entity An entity.
     * @returns A pointer to the Camera component for this entity or nullptr if the entity didn't
     * have a Camera component. The pointer is valid until destroyCameraComponent() is called or
     * the entity itself is destroyed.
     */
    public getCameraComponent(entity: Entity): Camera;
    /**
     * Destroys the Camera component associated with the given entity.
     *
     * @param entity An entity.
     */
    public destroyCameraComponent(entity: Entity): void;
    /**
     * Creates a Fence.
     *
     * @returns A pointer to the newly created Fence.
     */
    public createFence(): Fence;
    /**
     * Creates a Sync.
     *
     * @returns A pointer to the newly created Sync.
     */
    public createSync(): Sync;
    public destroyBufferObject(p: BufferObject): boolean;
    public destroyVertexBuffer(p: VertexBuffer): boolean;
    public destroyFence(p: Fence): boolean;
    public destroySync(p: Sync): boolean;
    public destroyIndexBuffer(p: IndexBuffer): boolean;
    public destroySkinningBuffer(p: SkinningBuffer): boolean;
    public destroyMorphTargetBuffer(p: MorphTargetBuffer): boolean;
    public destroyIndirectLight(p: IndirectLight): boolean;
    /**
     * Destroys a Material object
     *
     * @param p the material object to destroy
     */
    public destroyMaterial(p: Material): boolean;
    public destroyMaterialInstance(p: MaterialInstance): boolean;
    public destroyRenderer(p: Renderer): boolean;
    public destroyFramePacer(p: FramePacer): boolean;
    public destroyScene(p: Scene): boolean;
    public destroySkybox(p: Skybox): boolean;
    public destroyColorGrading(p: ColorGrading): boolean;
    public destroySwapChain(p: SwapChain): boolean;
    public destroyStream(p: Stream): boolean;
    public destroyTexture(p: Texture): boolean;
    public destroyRenderTarget(p: RenderTarget): boolean;
    public destroyView(p: View): boolean;
    public destroyInstanceBuffer(p: InstanceBuffer): boolean;
    public destroyEntity(e: Entity): void;
    /** Tells whether a BufferObject object is valid */
    public isValidBufferObject(p: BufferObject): boolean;
    /** Tells whether an VertexBuffer object is valid */
    public isValidVertexBuffer(p: VertexBuffer): boolean;
    /** Tells whether a Fence object is valid */
    public isValidFence(p: Fence): boolean;
    /** Tells whether a Sync object is valid */
    public isValidSync(p: Sync): boolean;
    /** Tells whether an IndexBuffer object is valid */
    public isValidIndexBuffer(p: IndexBuffer): boolean;
    /** Tells whether a SkinningBuffer object is valid */
    public isValidSkinningBuffer(p: SkinningBuffer): boolean;
    /** Tells whether a MorphTargetBuffer object is valid */
    public isValidMorphTargetBuffer(p: MorphTargetBuffer): boolean;
    /** Tells whether an IndirectLight object is valid */
    public isValidIndirectLight(p: IndirectLight): boolean;
    /** Tells whether an Material object is valid */
    public isValidMaterial(p: Material): boolean;
    /**
     * Tells whether an MaterialInstance object is valid. Use this if you already know which
     * Material this MaterialInstance belongs to. DO NOT USE getMaterial(), this would defeat the
     * purpose of validating the MaterialInstance.
     */
    public isValid(m: Material, p: MaterialInstance): boolean;
    /**
     * Tells whether an MaterialInstance object is valid. Use this if the Material the
     * MaterialInstance belongs to is not known. This method can be expensive.
     */
    public isValidExpensive(p: MaterialInstance): boolean;
    /** Tells whether a Renderer object is valid */
    public isValidRenderer(p: Renderer): boolean;
    /** Tells whether a Scene object is valid */
    public isValidScene(p: Scene): boolean;
    /** Tells whether a SkyBox object is valid */
    public isValidSkybox(p: Skybox): boolean;
    /** Tells whether a ColorGrading object is valid */
    public isValidColorGrading(p: ColorGrading): boolean;
    /** Tells whether a SwapChain object is valid */
    public isValidSwapChain(p: SwapChain): boolean;
    /** Tells whether a Stream object is valid */
    public isValidStream(p: Stream): boolean;
    /** Tells whether a Texture object is valid */
    public isValidTexture(p: Texture): boolean;
    /** Tells whether a RenderTarget object is valid */
    public isValidRenderTarget(p: RenderTarget): boolean;
    /** Tells whether a View object is valid */
    public isValidView(p: View): boolean;
    /** Tells whether an InstanceBuffer object is valid */
    public isValidInstanceBuffer(p: InstanceBuffer): boolean;
    /** Retrieve the count of each resource tracked by Engine. This is intended for debugging. @ { */
    public getBufferObjectCount(): number;
    public getViewCount(): number;
    public getSceneCount(): number;
    public getSwapChainCount(): number;
    public getStreamCount(): number;
    public getIndexBufferCount(): number;
    public getSkinningBufferCount(): number;
    public getMorphTargetBufferCount(): number;
    public getInstanceBufferCount(): number;
    public getVertexBufferCount(): number;
    public getIndirectLightCount(): number;
    public getMaterialCount(): number;
    public getTextureCount(): number;
    public getSkyboxeCount(): number;
    public getColorGradingCount(): number;
    public getRenderTargetCount(): number;
    /**
     * Cancel the pending asynchronous call pointed to by `id`, which is retrieved whenever you
     * invoke a non-blocking version of method on an object, such as `Texture::setImageAsync` or
     * `BufferObject::setBufferAsync`.
     *
     * Canceling does not suppress the completion callback of the call. The callback always runs
     * exactly once, on the handler the call was given: with `backend::AsyncCallStatus::CANCELED`
     * if the operation never ran, and with `COMPLETED` if it did. So a caller counting outstanding
     * operations always balances out, and whatever the callback owns is still released.
     *
     * @param id The unique identifier for the asynchronous call to be canceled.
     * @returns Returns true upon successful cancellation. It returns false if the asynchronous
     * operation cannot be canceled because it is currently running, has finished, or has
     * previously been canceled.
     */
    public cancelAsyncCall(id: number): boolean;
    /**
     * Kicks the hardware thread (e.g. the OpenGL, Vulkan or Metal thread) and blocks until all
     * commands to this point are executed. Note that does guarantee that the hardware is actually
     * finished.
     *
     * This is typically used right after destroying the SwapChain , in cases where a guarantee
     * about the SwapChain destruction is needed in a timely fashion, such as when responding to
     * Android's android.view.SurfaceHolder.Callback.surfaceDestroyed
     *
     * @remarks If the backend thread has encountered an unrecoverable error, this function becomes
     * a no-op.
     */
    public flushAndWait(): void;
    /**
     * Kicks the hardware thread (e.g. the OpenGL, Vulkan or Metal thread) and blocks until all
     * commands to this point are executed. Note that does guarantee that the hardware is actually
     * finished.
     *
     * A timeout can be specified, if for some reason this flushAndWait doesn't complete before the
     * timeout, it will return false, true otherwise.
     *
     * This is typically used right after destroying the SwapChain , in cases where a guarantee
     * about the SwapChain destruction is needed in a timely fashion, such as when responding to
     * Android's android.view.SurfaceHolder.Callback.surfaceDestroyed
     *
     * @remarks If the backend thread has encountered an unrecoverable error, this function becomes
     * a no-op and returns false.
     *
     * @param timeout A timeout in nanoseconds
     * @returns true if successful, false if flushAndWait timed out, in which case it wasn't
     * successful and commands might still be executing on both the CPU and GPU sides.
     */
    public flushAndWait(timeout: number): boolean;
    /**
     * Kicks the hardware thread (e.g. the OpenGL, Vulkan or Metal thread) but does not wait for
     * commands to be either executed or the hardware finished.
     *
     * This is typically used after creating a lot of objects to start draining the command queue
     * which has a limited size.
     *
     * @remarks If the backend thread has encountered an unrecoverable error, this function becomes
     * a no-op.
     */
    public flush(): void;
    /**
     * Get paused state of rendering thread.
     *
     * Warning: This is an experimental API.
     * @see setPaused
     */
    public isPaused(): boolean;
    /**
     * Pause or resume rendering thread.
     *
     * Warning: This is an experimental API. In particular, note the following caveats.
     *
     * Buffer callbacks will never be called as long as the rendering thread is paused. Do not rely
     * on a buffer callback to unpause the thread. While the rendering thread is paused, rendering
     * commands will continue to be queued until the buffer limit is reached. When the limit is
     * reached, the program will abort.
     */
    public setPaused(paused: boolean): void;
    /**
     * Drains the user callback message queue and immediately execute all pending callbacks.
     *
     * Typically this should be called once per frame right after the application's vsync tick, and
     * typically just before computing parameters (e.g. object positions) for the next frame. This
     * is useful because otherwise callbacks will be executed by filament at a later time, which
     * may increase latency in certain applications.
     */
    public pumpMessageQueues(): void;
    /**
     * Switch the command queue to unprotected mode. Protected mode can be activated via
     * Renderer::beginFrame() using a protected SwapChain.
     * @see Renderer
     * @see SwapChain
     */
    public unprotected(): void;
    /**
     * Returns the default Material.
     *
     * The default material is 80% white and uses the Material.Shading.LIT shading.
     *
     * @returns A pointer to the default Material instance (a singleton).
     */
    public getDefaultMaterial(): Material;
    /** Returns the resolved backend. */
    public getBackend(): Backend;
    /**
     * Invokes one iteration of the render loop, used only on single-threaded platforms.
     *
     * This should be called every time the windowing system needs to paint (e.g. at 60 Hz).
     */
    public execute(): void;
    /**
     * Get the current time. This is a convenience function that simply returns the time in
     * nanosecond since epoch of std::chrono::steady_clock. A possible implementation is:
     *
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ return
     * std::chrono::steady_clock::now().time_since_epoch().count();
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     *
     * @returns current time in nanosecond since epoch of std::chrono::steady_clock.
     * @see Renderer::beginFrame()
     */
    public static getSteadyClockTimeNano(): number;
    public getDebugRegistry(): DebugRegistry;
    /**
     * Check if a feature flag exists
     *
     * @param name name of the feature flag to check
     * @returns true if the feature flag exists, false otherwise
     */
    public hasFeatureFlag(name: string): boolean;
    /**
     * Set the value of a non-constant feature flag.
     *
     * @param name name of the feature flag to set
     * @param value value to set
     * @returns true if the value was set, false if the feature flag is constant or doesn't exist.
     */
    public setFeatureFlag(name: string, value: boolean): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** Engine::Builder is used to create a new filament Engine. */
export class Engine$Builder {
    constructor();
    /**
     * @param backend Which driver backend to use
     * @returns A reference to this Builder for chaining calls.
     */
    public backend(backend: Backend): Engine$Builder;
    /**
     * @param featureLevel The feature level at which initialize Filament.
     * @returns A reference to this Builder for chaining calls.
     */
    public featureLevel(featureLevel: FeatureLevel): Engine$Builder;
    /**
     * Warning: This is an experimental API. See Engine::setPaused(bool) for caveats.
     *
     * @param paused Whether to start the rendering thread paused.
     * @returns A reference to this Builder for chaining calls.
     */
    public paused(paused: boolean): Engine$Builder;
    /**
     * Set a feature flag value. This is the only way to set constant feature flags.
     *
     * @param name feature name
     * @param value true to enable, false to disable
     * @returns A reference to this Builder for chaining calls.
     */
    public feature(name: string, value: boolean): Engine$Builder;
    /**
     * Sets the builder used to create the default ColorGrading object.
     *
     * @param colorGrading Builder used to create the default color grading.
     * @returns A reference to this Builder for chaining calls.
     */
    public colorGrading(colorGrading: ColorGrading$Builder): Engine$Builder;
    /**
     * Creates an instance of Engine.
     *
     * @returns A pointer to the newly created Engine, or nullptr if the Engine couldn't be
     * created. nullptr if the GPU driver couldn't be initialized, for instance if it doesn't
     * support the right version of OpenGL or OpenGL ES.
     */
    public build(): Engine;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * An Entity is a handle to an object in the Entity Component System (ECS).
 *
 * Entities are created by the EntityManager and can be associated with various components
 * (e.g., Renderable, Transform, Light) to define their behavior and properties.
 */
export class Entity {
    constructor();
    public equals(e: Entity): boolean;
    public notEquals(e: Entity): boolean;
    public isNull(): boolean;
    public getId(): number;
    public clear(): void;
    public static smuggle(entity: Entity): number;
    public static import(identity: number): Entity;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * ---
 *
 * ### 1. Public API (Gameplay & Application Layer) This group is aimed at standard usage for
 * applications, renderers, and game systems. - **Entity Creation**: Methods like `create()`
 * and `create(size_t,` Entity*) allocate new or recycled Entity identities. - **Entity
 * Destruction**: Methods like `destroy(Entity)` and `destroy(size_t,` Entity*) logically kill
 * entities, instantly advancing the active timeline. - **Queries & Hooks**: Mechanisms to
 * query logical presence ( `isAlive())` or subscribe to global destruction notifications via
 * `registerChangeCallback().`
 *
 * ---
 *
 * ### 2. Internal Component API (ECS Integration & Component Managers) This group supports the
 * underlying asynchronous **Epoch-Based Reclamation (EBR)** garbage collector. Designed
 * exclusively for subclasses of `SingleInstanceComponentManagerBase` (e.g. `FCameraManager,`
 * `FTransformManager),` these methods govern thread-consensus and physical payload purging
 * budgets: - **Consensus Registration**: Methods like `registerWatermark()` and
 * `unregisterWatermark()` allow components to join or vacate the global timeline consensus. -
 * **Timeline Sweeps**: Methods like `advanceEpoch()` and `reclaimSafeEpochs()` seal completed
 * frames and process physical reclaiming boundaries. - **Missed Garbage Harvests**: APIs like
 * `getMissedGarbage()` enable Component Managers to retrieve logically dead Entity bitsets
 * precisely synced against their local watermarks in atomic, collision-free transaction
 * blocks.
 */
export class EntityManager {
    /**
     * @remarks It is recommended to cache this reference locally to bypass lookups.
     *
     * @returns Reference to the thread-safe global EntityManager.
     */
    public static get(): EntityManager;
    public flushNotifications(): void;
    /** @returns The maximum available 32-bit Entity identity limit. */
    public static getMaxEntityCount(): number;
    /** @returns Count of logical entities currently populated in the system. */
    public getEntityCount(): number;
    /**
     * @param n The number of Entity identities to generate.
     * @param entities Pointer to the output array receiving the populated Entity IDs.
     */
    public create(n: number, entities: Entity): void;
    /**
     * @param n The number of Entity identities to destroy.
     * @param entities Pointer to the contiguous array of Entities to logically kill.
     */
    public destroy(n: number, entities: Entity): void;
    /** @returns The populated Entity ID, or Entity.isNull() upon allocation failure. */
    public create(): Entity;
    /** @param e The Entity to logically kill. */
    public destroy(e: Entity): void;
    /**
     * @param e The Entity to test for presence.
     * @returns True if the Entity is active and logically alive, false if dead/destroyed.
     */
    public isAlive(e: Entity): boolean;
    /** @param l Pointer to the abstract Listener subclass. */
    public registerListener(l: EntityManager$Listener): void;
    /** @param l Pointer to the Listener instance to remove. */
    public unregisterListener(l: EntityManager$Listener): void;
    public advanceEpoch(): void;
    public reclaimSafeEpochs(): void;
    /** @returns The current epoch ID. */
    public getLatestEpochID(): number;
    public static getIndex(e: Entity): number;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

export class EntityManager$Listener {
    /**
     * @param n The number of entities contained in the destruction batch.
     * @param entities Pointer to the contiguous array of destroyed Entity identities.
     */
    public onEntitiesDestroyed(n: number, entities: Entity): void;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** Fence is used to synchronize the application main thread with filament's rendering thread. */
export class Fence {
    /**
     * Client-side wait on the Fence.
     *
     * Blocks the current thread until the Fence signals.
     *
     * @param mode Whether the command stream is flushed before waiting or not.
     * @param timeout Wait time out in nanoseconds. Using a `timeout` of 0 is a way to query the
     *     state of the fence. A `timeout` value of FENCE_WAIT_FOR_EVER is used to disable the timeout.
     * @returns FenceStatus::CONDITION_SATISFIED on success, FenceStatus::TIMEOUT_EXPIRED if the
     * time out expired or FenceStatus::ERROR in other cases.
     * @see #Mode
     */
    public wait(mode?: Fence$Mode, timeout?: number): FenceStatus;
    /**
     * Client-side wait on a Fence and destroy the Fence.
     *
     * @param fence Fence object to wait on.
     * @param mode Whether the command stream is flushed before waiting or not.
     * @returns FenceStatus::CONDITION_SATISFIED on success, FenceStatus::ERROR otherwise.
     */
    public static waitAndDestroy(fence: Fence, mode?: Fence$Mode): FenceStatus;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * FilamentAPI is used to define an API in filament. It ensures the class defining the API
 * can't be created, destroyed or copied by the caller.
 */
export class FilamentAPI {

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * For usage instructions, see the documentation for AssetLoader.
 *
 * This class owns a hierarchy of entities that have been loaded from a glTF asset. Every
 * entity has a filament::TransformManager component, and some entities also have `Name,`
 * `Renderable,` `Light,` `Camera,` or `Node` components.
 *
 * In addition to the aforementioned entities, an asset has strong ownership over a list of
 * filament::VertexBuffer, filament::IndexBuffer, filament::Texture, and, optionally, a simple
 * animation engine (gltfio::Animator).
 *
 * Clients must use ResourceLoader to create filament::Texture objects, compute tangent
 * quaternions, and upload data into vertex buffers and index buffers.
 */
export class FilamentAsset {
    /** Gets the number of entities returned by getEntities(). */
    public getEntityCount(): number;
    /** Gets the number of entities returned by getLightEntities(). */
    public getLightEntityCount(): number;
    /** Gets the list of entities in the asset that have renderable components. */
    public getRenderableEntities(): Entity;
    /** Gets the number of entities returned by getRenderableEntities(). */
    public getRenderableEntityCount(): number;
    /** Gets the number of entities returned by getCameraEntities(). */
    public getCameraEntityCount(): number;
    /**
     * Gets the transform root for the asset, which has no matching glTF node.
     *
     * This node exists for convenience, allowing users to transform the entire asset. For
     * instanced assets, this is a "super root" where each of its children is a root in a
     * particular instance. This allows users to transform all instances en masse if they wish to
     * do so.
     */
    public getRoot(): Entity;
    /**
     * Pops a ready renderable off the queue, or returns 0 if no renderables have become ready.
     *
     * NOTE: To determine the progress percentage or completion status, please use
     * ResourceLoader#asyncGetLoadProgress. To get the number of ready renderables, please use
     * popRenderables().
     *
     * This method allows clients to progressively add the asset's renderables to the scene as
     * textures gradually become ready through asynchronous loading. For example, on every frame
     * progressive applications can do something like this:
     *
     * while (Entity e = popRenderable()) { scene.addEntity(e); }
     *
     * Progressive reveal is not supported for dynamically added instances.
     * @see ResourceLoader#asyncBeginLoad
     * @see popRenderables()
     */
    public popRenderable(): Entity;
    /** Gets the number of resource URIs returned by getResourceUris(). */
    public getResourceUriCount(): number;
    /**
     * Gets the bounding box computed from the supplied min / max values in glTF accessors.
     *
     * This does not return a bounding box over all FilamentInstance, it's just a straightforward
     * AAAB that can be determined at load time from the asset data.
     */
    public getBoundingBox(): Aabb;
    /** Gets the NameComponentManager label for the given entity, if it exists. */
    public getName(arg0: Entity): string;
    /** Returns the first entity with the given name, or 0 if none exist. */
    public getFirstEntityByName(name: string): Entity;
    /** Gets the glTF extras string for a specific node, or for the asset, if it exists. */
    public getExtras(entity?: Entity): string;
    /** Gets the morph target name at the given index in the given entity. */
    public getMorphTargetNameAt(entity: Entity, targetIndex: number): string;
    /** Returns the number of morph targets in the given entity. */
    public getMorphTargetCountAt(entity: Entity): number;
    /**
     * Lazily creates a single LINES renderable that draws the transformed bounding-box hierarchy
     * for diagnostic purposes. The wireframe is owned by the asset so clients should not delete
     * it.
     */
    public getWireframe(): Entity;
    /** Returns the Filament engine associated with the AssetLoader that created this asset. */
    public getEngine(): Engine;
    /**
     * Reclaims CPU-side memory for URI strings, binding lists, and raw animation data.
     *
     * This should only be called after ResourceLoader::loadResources(). If this is an instanced
     * asset, this prevents creation of new instances.
     */
    public releaseSourceData(): void;
    /** Returns the number of scenes in the asset. */
    public getSceneCount(): number;
    /**
     * Returns the name of the given scene.
     *
     * Returns null if the given scene does not have a name or is out of bounds.
     */
    public getSceneName(sceneIndex: number): string;
    /**
     * Releases ownership of entities and their Filament components.
     *
     * This makes the client take responsibility for destroying Filament components (e.g.
     * Renderable, TransformManager component) as well as the underlying entities.
     */
    public detachFilamentComponents(): void;
    public areFilamentComponentsDetached(): boolean;
    /** Convenience function to get the first instance, or null if it doesn't exist. */
    public getInstance(): FilamentInstance;
    public getAssetInstanceCount(): number;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Every entity has a TransformManager component, and some entities also have `Name` or
 * `Renderable` components.
 * @see AssetLoader::createInstancedAsset()
 */
export class FilamentInstance {
    /** Gets the owner of this instance. */
    public getAsset(): FilamentAsset;
    /**
     * Gets the list of entities in this instance, one for each glTF node. All of these have a
     * Transform component. Some of the returned entities may also have a Renderable component or
     * Name component.
     */
    public getEntities(): Entity;
    /** Gets the number of entities returned by getEntities(). */
    public getEntityCount(): number;
    /** Gets the transform root for the instance, which has no matching glTF node. */
    public getRoot(): Entity;
    /**
     * Applies the given material variant to all primitives in this instance.
     *
     * Ignored if variantIndex is out of bounds.
     */
    public applyMaterialVariant(variantIndex: number): void;
    /** Returns the number of material variants in the asset. */
    public getMaterialVariantCount(): number;
    /** Returns the name of the given material variant, or null if it is out of bounds. */
    public getMaterialVariantName(variantIndex: number): string;
    /**
     * Returns the animation engine for the instance.
     *
     * Note that an animator can be obtained either from an individual instance, or from the
     * originating FilamentAsset. In the latter case, the animation frame is shared amongst all
     * instances. If individual control is desired, users must obtain the animator from the
     * individual instances.
     *
     * The animator is owned by the asset and should not be manually deleted.
     */
    public getAnimator(): Animator;
    /** Gets the number of skins. */
    public getSkinCount(): number;
    /** Gets the skin name at skin index. */
    public getSkinNameAt(skinIndex: number): string;
    /** Gets the number of joints at skin index. */
    public getJointCountAt(skinIndex: number): number;
    /** Gets joints at skin index. */
    public getJointsAt(skinIndex: number): Entity;
    /**
     * Attaches the given skin to the given node, which must have an associated mesh with
     * BONE_INDICES and BONE_WEIGHTS attributes.
     *
     * This is a no-op if the given skin index or target is invalid.
     */
    public attachSkin(skinIndex: number, target: Entity): void;
    /**
     * Detaches the given skin from the given node.
     *
     * This is a no-op if the given skin index or target is invalid.
     */
    public detachSkin(skinIndex: number, target: Entity): void;
    /**
     * Resets the AABB on all renderables by manually computing the bounding box.
     *
     * THIS IS ONLY USEFUL FOR MALFORMED ASSETS THAT DO NOT HAVE MIN/MAX SET UP CORRECTLY.
     *
     * Does not affect the return value of getBoundingBox() on the owning asset. Cannot be called
     * after releaseSourceData() on the owning asset. Can only be called after loadResources() or
     * asyncBeginLoad().
     */
    public recomputeBoundingBoxes(): void;
    /**
     * Gets the axis-aligned bounding box from the supplied min / max values in glTF accessors.
     *
     * If recomputeBoundingBoxes() has been called, then this returns the recomputed AABB.
     */
    public getBoundingBox(): Aabb;
    /** Gets the number of materials returned by getMaterialInstances(). */
    public getMaterialInstanceCount(): number;
    /**
     * Releases ownership of material instances.
     *
     * This makes the client take responsibility for destroying MaterialInstance objects. The
     * getMaterialInstances query becomes invalid after detachment.
     */
    public detachMaterialInstances(): void;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * FrameHistoryStream is a public helper class to iterate over new frames rendered since the
 * last query. It takes care of keeping track of the last processed frame ID and identifying
 * missing frames.
 *
 * Note: An instance of FrameHistoryStream must be kept alive (e.g., as a member variable)
 * rather than recreated transiently on the stack, in order to correctly track the last
 * processed frame ID across successive calls to getNewFrames().
 *
 * Example usage:
 */
export class FrameHistoryStream {
    /**
     * Queries the renderer's frame history and returns a NewFramesRange representing the new
     * frames rendered since the last query.
     */
    public getNewFrames(): FrameHistoryStream$NewFramesRange;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * A helper class representing a range of new frames. Obtained by calling
 * FrameHistoryStream::getNewFrames().
 */
export class FrameHistoryStream$NewFramesRange {
    /** Returns an iterator pointing to the beginning of the new frames. */
    public begin(): FrameHistoryStream$NewFramesRange$Iterator;
    /** Returns an iterator pointing to the end of the new frames. */
    public end(): FrameHistoryStream$NewFramesRange$Iterator;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** Iterator for NewFramesRange. Yields FrameHistoryStream::Result elements. */
export class FrameHistoryStream$NewFramesRange$Iterator {
    constructor();
    public equals(rhs: FrameHistoryStream$NewFramesRange$Iterator): boolean;
    public notEquals(rhs: FrameHistoryStream$NewFramesRange$Iterator): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** Result represents either a successfully retrieved FrameInfo, or a missing frame ID. */
export class FrameHistoryStream$Result {
    constructor();
    /**
     * Returns the frame ID associated with this result, regardless of whether the frame is valid
     * or missing.
     */
    public getFrameId(): number;
    /** Returns the missing frame ID. Only valid if operator bool() returns false. */
    public getMissingId(): number;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * FramePacer
 *
 * Coordinates frame scheduling and presentation timestamps across multi-threaded rendering
 * architectures.
 *
 * The FramePacer decouples the CPU rendering loop from fluctuating hardware display cadences,
 * acting as a deterministic filter between incoming platform VSYNC callbacks (such as
 * AChoreographer on Android) and native buffer presentation submissions (via
 * Renderer::setPresentationTime).
 *
 * Creation and destruction ========================
 *
 * A FramePacer object is created using the FramePacer::Builder and destroyed by calling
 * Engine::destroy(const FramePacer*).
 *
 * ~~~~~~~~~~~{.cpp} filament::Engine* engine = filament::Engine::create();
 *
 * filament::FramePacer* pacer = filament::FramePacer::Builder() .targetFrameRate(60.0f)
 * .latency(std::chrono::milliseconds(33)) // Configure 33ms target latency duration (~2 60Hz
 * frames) .build(*engine);
 *
 * // Inside your application's AChoreographer frame callback: void onChoreographerTick(const
 * filament::FramePacer::VsyncTick & tick) { if (pacer->setupFrame(tick) !=
 * filament::FramePacer::FrameStatus::ACCEPTED) { // Yield or skip rendering to maintain pacing
 * return; }
 *
 * // Evaluate if the GPU is delayed, bypassing FrameSkipper check via
 * Renderer::shouldRenderFrame() if (pacer->hasGpuFallenBehind(renderer)) {
 * renderer->skipFrame(tick.baseTime); return; }
 *
 * // Set presentation time which automatically switches Renderer to "paced mode"
 * pacer->applyPresentationTime(renderer);
 *
 * if (renderer->beginFrame(swapChain)) { renderer->render(view); renderer->endFrame(); } }
 *
 * engine->destroy(pacer); ~~~~~~~~~~~
 */
export class FramePacer {
    /**
     * Dynamically updates the active pacing targets mid-flight (e.g., for thermal or power
     * mitigation).
     *
     * @param config The new configuration targets to scale to on subsequent frames.
     */
    public configure(config: FramePacer$Configuration): void;
    /**
     * Retrieves the current configuration used by the FramePacer.
     *
     * @returns The active configuration targets.
     */
    public getConfiguration(): FramePacer$Configuration;
    /**
     * Prepares and evaluates the frame pacing state for the upcoming frame cycle.
     *
     * This must be called at the very beginning of the host display platform's VSYNC interrupt
     * loop (e.g., within a VSYNC callback such as AChoreographer on Android). It evaluates whether
     * the CPU rendering thread is ahead of the hardware pulse cadence or backlogged.
     *
     * @param tick Polled hardware VSYNC timing telemetry and optional target presentation
     *     timelines.
     * @returns FrameStatus::ACCEPTED if approved, or the specific SKIPPED reason.
     */
    public setupFrame(tick: FramePacer$VsyncTick): FramePacer$FrameStatus;
    /**
     * Advances the internal pacing pipeline to target an extra presentation frame in the future,
     * without advancing the ideal cadence clock (mExpectedBaseTime).
     *
     * This method is explicitly designed for latency recovery (Buffer Stuffing). If the pipeline
     * reports PacingStatus::DISPLAY_STARVING, the application may yield, OR it may choose to
     * render an extra frame during the current Vsync callback to mechanically stuff the queue
     * depth back to its target latency.
     *
     * Calling this method instantly extrapolates the presentation timestamp one target frame
     * period into the future. The subsequent call to `applyPresentationTime` will emit this new
     * timestamp, allowing the queue to grow without the FramePacer erroneously rejecting the next
     * real Vsync as spurious.
     *
     * This method acts as a safeguard against runaway clock extrapolation. It returns true if the
     * timestamp was successfully advanced, or false if it refused to stuff another frame because
     * the pipeline is already at or beyond the configured target latency.
     *
     * @returns true if the timestamp was safely advanced, false if refused to prevent
     * over-stuffing.
     */
    public setupExtraFrame(): boolean;
    /**
     * Checks if the GPU rendering pipeline has fallen behind the CPU submission rate.
     *
     * If the GPU is delayed, this method returns true and automatically rolls back any internal
     * cadence state advanced by `setupFrame()`. The client should skip the frame (via
     * `Renderer::skipFrame()`) and refrain from calling `applyPresentationTime()` or
     * `beginFrame()`.
     *
     * @param renderer The Filament Renderer displaying the target View.
     * @returns true if the GPU has fallen behind, false otherwise.
     */
    public hasGpuFallenBehind(renderer: Renderer): boolean;
    /**
     * Applies the computed Latency Offset timestamp directly onto the rendering command stream.
     *
     * This instructs the underlying display compositor (such as SurfaceFlinger) exactly when to
     * latch and present the buffer, eliminating micro-stutter. This must be called before
     * `Renderer::endFrame()`.
     *
     * Calling this method automatically applies the target presentation time, desired presentation
     * time, and rendering deadline onto the target Renderer (via `Renderer::setPresentationTime`,
     * `Renderer::setDesiredPresentationTime`, and `Renderer::setRenderingDeadline`).
     *
     * @param renderer The Filament Renderer displaying the target View.
     */
    public applyPresentationTime(renderer: Renderer): void;
    /**
     * Returns the current flow control status of the pacing pipeline.
     *
     * If the pipeline is DISPLAY_STARVING, the application may choose to recover by skipping a
     * frame to rebuild queue depth and calling resetPacing().
     *
     * @returns The active PacingStatus.
     */
    public getPacingStatus(): FramePacer$PacingStatus;
    /**
     * Forces the FramePacer to abandon its relative pacing state and rigidly re-anchor to the
     * configured target latency on the next frame.
     *
     * The application can call this when recovering from a dropped frame or to manually
     * re-establish the queue depth.
     */
    public resetPacing(): void;
    /**
     * Returns the actual pacing frame rate selected during the active frame pacing cycle.
     *
     * If the requested target frame rate is fuzzy-matched to an active display hardware cadence
     * (such as 60.0 FPS requested on a 59.94Hz broadcast screen), this returns the actual hardware
     * rate (59.94 FPS).
     *
     * Additionally, if the requested rate exceeds the maximum refresh capability of the active
     * physical display panel (such as 90 FPS requested on a 60Hz screen), this returns the clamped
     * maximum display refresh rate (60 FPS).
     *
     * @returns The active pacing frame rate in frames per second.
     */
    public getSelectedFrameRate(): number;
    /**
     * Returns whether the selected pacing frame rate is achieved exactly by the display hardware.
     *
     * @returns true if the selected rate is an exact integer fraction of the host display
     * platform's refresh rate, false if non-integer ratio pacing is active (such as 45 FPS on
     * 60Hz).
     */
    public isExactFrameRateAchieved(): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** Use Builder to construct a FramePacer object instance */
export class FramePacer$Builder {
    constructor();
    /**
     * Sets the desired frame rendering step in Hz.
     *
     * @param fps Target frame rate (e.g., 60.0f or 30.0f). Must be greater than 0.
     * @returns This Builder, for chaining calls.
     */
    public targetFrameRate(fps: number): FramePacer$Builder;
    /**
     * Sets the required latency window in terms of 60Hz display frames.
     *
     * @param frames The latency window in units of 60Hz frames (e.g. 2 frames = 33.3ms).
     * @returns This Builder, for chaining calls.
     */
    public latencyFrames(frames: number): FramePacer$Builder;
    /**
     * Creates the FramePacer object and returns a pointer to it.
     *
     * @param engine Reference to the filament::Engine to associate this FramePacer with.
     * @returns Pointer to the newly created FramePacer instance.
     */
    public build(engine: Engine): FramePacer;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * FramePipelineEstimator calculates the ideal refresh rate (throughput) and ideal structural
 * latency (pipeline depth) based on historical Renderer::FrameInfo telemetry.
 *
 * It implements a probabilistic timing model over the three primary rendering stages (Main
 * CPU, Backend driver, GPU execution) using historical mean (mu) and standard deviation
 * (sigma):
 *
 * 1. Determine Z-Score: Maps the target confidence interval (e.g. P90 = 1.282) to a normal
 * Z-score. 2. Effective Workload: Compute worst-case execution time per stage: mu + (Z *
 * sigma). 3. Ideal Throughput: Pipeline frame time is bounded entirely by the slowest
 * individual stage. 4. Ideal Structural Latency: Ceiling division of total transit time by
 * bottleneck frame time.
 */
export class FramePipelineEstimator {
    /**
     * Converts a TargetPercentile enum to its corresponding normal distribution Z-score.
     *
     * @param targetPercentile Desired confidence interval percentile.
     * @returns Standard normal distribution Z-score.
     */
    public static getZScore(targetPercentile: FramePipelineEstimator$TargetPercentile): number;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** A frustum defined by six planes */
export class Frustum {
    constructor();
    /**
     * Sets the frustum from the given projection matrix
     *
     * @param pv a 4x4 projection matrix
     */
    public setProjection(pv: mat4): void;
    /**
     * Returns the plane equation parameters with normalized normals
     *
     * @param plane Identifier of the plane to retrieve the equation of
     * @returns A plane equation encoded a float4 R such as R.x*x + R.y*y + R.z*z + R.w = 0
     */
    public getNormalizedPlane(plane: Frustum$Plane): float4;
    /**
     * Returns a copy of all six frustum planes in left, right, bottom, top, far, near order
     *
     * @param planes six plane equations encoded as in getNormalizedPlane() in left, right, bottom,
     *     top, far, near order
     */
    public getNormalizedPlanes(planes: float4): void;
    /**
     * Returns whether a box intersects the frustum (i.e. is visible)
     *
     * @param box The box to test against the frustum
     * @returns true if the box may intersects the frustum, false otherwise. In some situations a
     * box that doesn't intersect the frustum might be reported as though it does. However, a box
     * that does intersect the frustum is always reported correctly (true).
     */
    public intersectsBox(box: Box): boolean;
    /**
     * Returns whether a sphere intersects the frustum (i.e. is visible)
     *
     * @param sphere A sphere encoded as a center + radius.
     * @returns true if the sphere may intersects the frustum, false otherwise. In some situations
     * a sphere that doesn't intersect the frustum might be reported as though it does. However, a
     * sphere that does intersect the frustum is always reported correctly (true).
     */
    public intersectsFloat4(sphere: float4): boolean;
    /**
     * Returns whether the frustum contains a given point.
     *
     * @param p the point to test
     * @returns the maximum signed distance to the frustum. Negative if p is inside.
     */
    public contains(p: float3): number;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * IBLPrefilterContext creates and initializes GPU state common to all environment map filters
 * supported. Typically, only one instance per filament Engine of this object needs to exist.
 *
 * Usage Example: ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ #include
 * <filament /Engine.h> using namespace filament;
 *
 * Engine* engine = Engine::create();
 *
 * IBLPrefilterContext context(engine); IBLPrefilterContext::SpecularFilter filter(context);
 * Texture* texture = filter(environment_cubemap);
 *
 * IndirectLight* indirectLight = IndirectLight::Builder() .reflections(texture)
 * .build(engine); ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export class IBLPrefilterContext {

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** EquirectangularToCubemap is use to convert an equirectangluar image to a cubemap. */
export class IBLPrefilterContext$EquirectangularToCubemap {
    /**
     * Converts an equirectangular image to a cubemap.
     *
     * @param equirectangular Texture to convert to a cubemap. - Can't be null. - Must be a 2d
     *     texture - Must have equirectangular geometry, that is width == 2*height. - Must be allocated
     *     with all mip levels. - Must be SAMPLEABLE
     * @param outCubemap Output cubemap. If null the texture is automatically created with default
     *     parameters (size of 256 with 9 levels). - Must be a cubemap - Must have SAMPLEABLE and
     *     COLOR_ATTACHMENT usage bits
     * @returns returns outCubemap
     */
    public call(equirectangular: Texture, outCubemap?: Texture): Texture;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * IrradianceFilter is a GPU based implementation of the diffuse probe pre-integration filter.
 * An instance of IrradianceFilter is needed per filter configuration. A filter configuration
 * contains the filter's kernel and sample count.
 */
export class IBLPrefilterContext$IrradianceFilter {
    /**
     * Generates an irradiance cubemap. Mipmaps are not generated even if present.
     *
     * @param options Options for this environment
     * @param environmentCubemap Environment cubemap (input). Can't be null. This cubemap must be
     *     SAMPLEABLE and must have all its levels allocated. If Options.generateMipmap is true, the
     *     mipmap levels will be overwritten, otherwise it is assumed that all levels are correctly
     *     initialized.
     * @param outIrradianceTexture Output irradiance texture or, if null, it is automatically
     *     created with some default parameters. outIrradianceTexture must be a cubemap, it must have
     *     at least COLOR_ATTACHMENT and SAMPLEABLE usages.
     * @returns returns outIrradianceTexture
     */
    public call(options: IBLPrefilterContext$IrradianceFilter$Options, environmentCubemap: Texture, outIrradianceTexture?: Texture): Texture;
    /**
     * Generates a prefiltered cubemap.
     *
     * @param environmentCubemap Environment cubemap (input). Can't be null. This cubemap must be
     *     SAMPLEABLE and must have all its levels allocated. If Options.generateMipmap is true, the
     *     mipmap levels will be overwritten, otherwise it is assumed that all levels are correctly
     *     initialized.
     * @param outIrradianceTexture Output irradiance texture or, if null, it is automatically
     *     created with some default parameters. outIrradianceTexture must be a cubemap, it must have
     *     at least COLOR_ATTACHMENT and SAMPLEABLE usages.
     * @returns returns outReflectionsTexture
     */
    public call(environmentCubemap: Texture, outIrradianceTexture?: Texture): Texture;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * SpecularFilter is a GPU based implementation of the specular probe pre-integration filter.
 * An instance of SpecularFilter is needed per filter configuration. A filter configuration
 * contains the filter's kernel and sample count.
 */
export class IBLPrefilterContext$SpecularFilter {
    /**
     * Generates a prefiltered cubemap.
     *
     * @param options Options for this environment
     * @param environmentCubemap Environment cubemap (input). Can't be null. This cubemap must be
     *     SAMPLEABLE and must have all its levels allocated. If Options.generateMipmap is true, the
     *     mipmap levels will be overwritten, otherwise it is assumed that all levels are correctly
     *     initialized.
     * @param outReflectionsTexture Output prefiltered texture or, if null, it is automatically
     *     created with some default parameters. outReflectionsTexture must be a cubemap, it must have
     *     at least COLOR_ATTACHMENT and SAMPLEABLE usages and at least the same number of levels than
     *     requested by Config.
     * @returns returns outReflectionsTexture
     */
    public call(options: IBLPrefilterContext$SpecularFilter$Options, environmentCubemap: Texture, outReflectionsTexture?: Texture): Texture;
    /**
     * Generates a prefiltered cubemap.
     *
     * @param environmentCubemap Environment cubemap (input). Can't be null. This cubemap must be
     *     SAMPLEABLE and must have all its levels allocated. All mipmap levels will be overwritten.
     * @param outReflectionsTexture Output prefiltered texture or, if null, it is automatically
     *     created with some default parameters. outReflectionsTexture must be a cubemap, it must have
     *     at least COLOR_ATTACHMENT and SAMPLEABLE usages and at least the same number of levels than
     *     requested by Config.
     * @returns returns outReflectionsTexture
     */
    public call(environmentCubemap: Texture, outReflectionsTexture?: Texture): Texture;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * A buffer containing vertex indices into a VertexBuffer. Indices can be 16 or 32 bit. The
 * buffer itself is a GPU resource, therefore mutating the data can be relatively slow.
 * Typically these buffers are constant.
 *
 * It is possible, and even encouraged, to use a single index buffer for several Renderables.
 * @see VertexBuffer, RenderableManager
 */
export class IndexBuffer {
    /**
     * Copy-initializes a region of this IndexBuffer from the data provided.
     *
     * @param engine Reference to the filament::Engine to associate this IndexBuffer with.
     * @param buffer A BufferDescriptor representing the data used to initialize the IndexBuffer.
     *     BufferDescriptor points to raw, untyped data that will be interpreted as either 16-bit or
     *     32-bits indices based on the Type of this IndexBuffer.
     * @param byteOffset Offset in *bytes* into the IndexBuffer. Must be multiple of 4.
     */
    public setBuffer(engine: Engine, buffer: driver$BufferDescriptor, byteOffset?: number): void;
    /**
     * Returns the size of this IndexBuffer in elements.
     *
     * @returns The number of indices the IndexBuffer holds.
     */
    public getIndexCount(): number;
    /**
     * This non-blocking method checks if the resource has finished creation *successfully*. If the
     * resource creation was initiated asynchronously, it will return true only after all related
     * asynchronous tasks are complete, and only if none of them was canceled. If the resource was
     * created normally without using async method, it will always return true.
     *
     * A canceled asynchronous creation never populates the resource, so this method keeps
     * returning false for it. The object itself remains valid and must still be destroyed as
     * usual.
     *
     * @returns Whether the resource is created and usable.
     * @see Builder::async()
     */
    public isCreationComplete(): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

export class IndexBuffer$Builder {
    constructor();
    /**
     * Size of the index buffer in elements.
     *
     * @param indexCount Number of indices the IndexBuffer can hold.
     * @returns A reference to this Builder for chaining calls.
     */
    public indexCount(indexCount: number): IndexBuffer$Builder;
    /**
     * Type of the index buffer, 16-bit or 32-bit.
     *
     * @param indexType Type of indices stored in the IndexBuffer.
     * @returns A reference to this Builder for chaining calls.
     */
    public bufferType(indexType: IndexBuffer$IndexType): IndexBuffer$Builder;
    /**
     * Associate an optional name with this IndexBuffer for debugging purposes.
     *
     * name will show in error messages and should be kept as short as possible. The name is
     * truncated to a maximum of 128 characters.
     *
     * The name string is copied during this method so clients may free its memory after the
     * function returns.
     *
     * @deprecated Use name(utils::StaticString const & ) instead.
     *
     * @param name A string to identify this IndexBuffer
     * @param len Length of name, should be less than or equal to 128
     * @returns This Builder, for chaining calls.
     */
    public name(name: string, len: number): IndexBuffer$Builder;
    /**
     * Creates the IndexBuffer object and returns a pointer to it. After creation, the index buffer
     * is uninitialized. Use IndexBuffer::setBuffer() to initialize the IndexBuffer.
     *
     * @param engine Reference to the filament::Engine to associate this IndexBuffer with.
     * @returns pointer to the newly created object.
     * @see IndexBuffer::setBuffer
     */
    public build(engine: Engine): IndexBuffer;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * IndirectLight is used to simulate environment lighting, a form of global illumination.
 *
 * Environment lighting has a two components: 1. irradiance 2. reflections (specular component)
 *
 * Environments are usually captured as high-resolution HDR equirectangular images and
 * processed by the **cmgen** tool to generate the data needed by IndirectLight.
 *
 * Creation and destruction ========================
 *
 * An IndirectLight object is created using the IndirectLight::Builder and destroyed by calling
 * Engine::destroy(const IndirectLight*).
 *
 * ~~~~~~~~~~~{.cpp} filament::Engine* engine = filament::Engine::create();
 *
 * filament::IndirectLight* environment = filament::IndirectLight::Builder()
 * .reflections(cubemap) .build(*engine);
 *
 * engine->destroy(environment); ~~~~~~~~~~~
 *
 * Irradiance ==========
 *
 * The irradiance represents the light that comes from the environment and shines an object's
 * surface.
 *
 * The irradiance is calculated automatically from the Reflections (see below), and generally
 * doesn't need to be provided explicitly. However, it can be provided separately from the
 * Reflections as [spherical harmonics](https://en.wikipedia.org/wiki/Spherical_harmonics) (SH)
 * of 1, 2 or 3 bands, respectively 1, 4 or 9 coefficients.
 *
 * Reflections ===========
 *
 * The reflections on object surfaces (specular component) is calculated from a specially
 * filtered cubemap pyramid generated by the **cmgen** tool.
 *
 * @remarks Currently IndirectLight is intended to be used for "distant probes", that is, to
 * represent global illumination from a distant (i.e. at infinity) environment, such as the sky
 * or distant mountains. Only a single IndirectLight can be used in a Scene. This limitation
 * will be lifted in the future.
 *
 * @remarks Use the **cmgen** tool to generate the `SH` for a given environment.
 * @see Scene, Light, Texture, Skybox
 */
export class IndirectLight {
    /**
     * Sets the environment's intensity.
     *
     * Because the environment is encoded usually relative to some reference, the range can be
     * adjusted with this method.
     *
     * @param intensity Scale factor applied to the environment and irradiance such that the result
     *     is in lux, or lumen/m^2 (default = 30000)
     */
    public setIntensity(intensity: number): void;
    /** Returns the environment's intensity in lux , or lumen/m^2 . */
    public getIntensity(): number;
    /**
     * Sets the rigid-body transformation to apply to the IBL.
     *
     * @param rotation 3x3 rotation matrix. Must be a rigid-body transform.
     */
    public setRotation(rotation: mat3): void;
    /** Returns the rigid-body transformation applied to the IBL. */
    public getRotation(): mat3;
    /** Returns the associated reflection map, or null if it does not exist. */
    public getReflectionsTexture(): Texture;
    /** Returns the associated irradiance map, or null if it does not exist. */
    public getIrradianceTexture(): Texture;
    /**
     * Helper to estimate the direction of the dominant light in the environment represented by
     * spherical harmonics.
     *
     * This assumes that there is only a single dominant light (such as the sun in outdoors
     * environments), if it's not the case the direction returned will be an average of the various
     * lights based on their intensity.
     *
     * If there are no clear dominant light, as is often the case with low dynamic range (LDR)
     * environments, this method may return a wrong or unexpected direction.
     *
     * The dominant light direction can be used to set a directional light's direction, for
     * instance to produce shadows that match the environment.
     *
     * @param sh 3-band spherical harmonics
     * @returns A unit vector representing the direction of the dominant light
     * @see LightManager::Builder::direction()
     * @see getColorEstimate()
     */
    public static getDirectionEstimate(sh: float3): float3;
    /**
     * Helper to estimate the color and relative intensity of the environment represented by
     * spherical harmonics in a given direction.
     *
     * This can be used to set the color and intensity of a directional light. In this case make
     * sure to multiply this relative intensity by the the intensity of this indirect light.
     *
     * @param sh 3-band spherical harmonics
     * @param direction a unit vector representing the direction of the light to estimate the color
     *     of. Typically this the value returned by getDirectionEstimate().
     * @returns A vector of 4 floats where the first 3 components represent the linear color and
     * the 4th component represents the intensity of the dominant light
     * @see LightManager::Builder::color()
     * @see LightManager::Builder::intensity()
     * @see getDirectionEstimate, getIntensity, setIntensity
     */
    public static getColorEstimate(sh: float3, direction: float3): float4;
    /**
     * Helper to estimate the direction of the dominant light in the environment represented by
     * spherical harmonics. Spherical harmonics must be set in the Builder or the result is
     * undefined.
     * @see getDirectionEstimate(const math::float3)
     * @see Builder::irradiance(uint8_t, math::float3 const*)
     * @see Builder::radiance(uint8_t, math::float3 const*)
     */
    public getDirectionEstimate(): float3;
    /**
     * Helper to estimate the color and relative intensity of the environment represented by
     * spherical harmonics in a given direction. Spherical harmonics must be set in the Builder or
     * the result is undefined.
     * @see getColorEstimate(const math::float3, math::float3)
     * @see Builder::irradiance(uint8_t, math::float3 const*)
     * @see Builder::radiance(uint8_t, math::float3 const*)
     */
    public getColorEstimate(direction: float3): float4;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** Use Builder to construct an IndirectLight object instance */
export class IndirectLight$Builder {
    constructor();
    /**
     * Set the reflections cubemap mipmap chain.
     *
     * @param cubemap A mip-mapped cubemap generated by **cmgen**. Each cubemap level encodes a the
     *     irradiance for a roughness level.
     * @returns This Builder, for chaining calls.
     */
    public reflections(cubemap: Texture): IndirectLight$Builder;
    /**
     * Sets the irradiance as Spherical Harmonics.
     *
     * The irradiance must be pre-convolved by
     *
     * and pre-multiplied by the Lambertian diffuse BRDF
     *
     * and specified as Spherical Harmonics coefficients.
     *
     * Additionally, these Spherical Harmonics coefficients must be pre-scaled by the
     * reconstruction factors
     *
     * below.
     *
     * The final coefficients can be generated using the `cmgen` tool.
     *
     * The index in the `sh` array is given by:
     *
     * `index(l, m) = l * (l + 1) + m`
     *
     * index | l | m |
     *
     * |
     *
     * |
     *
     * |
     * :-----:|:---:|:---:|:------------------:|:---------------------:|:--------------------------------------------:
     * 0 | 0 | 0 | 0.282095 | 3.1415926 | 0.282095 1 | 1 | -1 | -0.488602 | 2.0943951 | -0.325735 2
     * | ^ | 0 | 0.488602 | ^ | 0.325735 3 | ^ | 1 | -0.488602 | ^ | -0.325735 4 | 2 | -2 |
     * 1.092548 | 0.785398 | 0.273137 5 | ^ | -1 | -1.092548 | ^ | -0.273137 6 | ^ | 0 | 0.315392 |
     * ^ | 0.078848 7 | ^ | 1 | -1.092548 | ^ | -0.273137 8 | ^ | 2 | 0.546274 | ^ | 0.136569
     *
     * Only 1, 2 or 3 bands are allowed.
     *
     * . (i.e. 1, 4 or 9 coefficients respectively).
     *
     * @remarks Because the coefficients are pre-scaled, `sh[0]` is the environment's average
     * irradiance.
     *
     * @param bands Number of spherical harmonics bands. Must be 1, 2 or 3.
     * @param sh Array containing the spherical harmonics coefficients. The size of the array must
     *     be
     * @returns This Builder, for chaining calls.
     * @see Material::Builder::sphericalHarmonicsBandCount()
     */
    public irradiance(bands: number, sh: float3): IndirectLight$Builder;
    /**
     * Sets the irradiance from the radiance expressed as Spherical Harmonics.
     *
     * The radiance must be specified as Spherical Harmonics coefficients
     *
     * The index in the `sh` array is given by:
     *
     * `index(l, m) = l * (l + 1) + m`
     *
     * index | l | m :-----:|:---:|:---: 0 | 0 | 0 1 | 1 | -1 2 | ^ | 0 3 | ^ | 1 4 | 2 | -2 5 | ^
     * | -1 6 | ^ | 0 7 | ^ | 1 8 | ^ | 2
     *
     * . (i.e. 1, 4 or 9 coefficients respectively).
     *
     * @param bands Number of spherical harmonics bands. Must be 1, 2 or 3.
     * @param sh Array containing the spherical harmonics coefficients. The size of the array must
     *     be
     * @returns This Builder, for chaining calls.
     */
    public radiance(bands: number, sh: float3): IndirectLight$Builder;
    /**
     * Sets the irradiance as a cubemap.
     *
     * The irradiance can alternatively be specified as a cubemap instead of Spherical Harmonics
     * coefficients. It may or may not be more efficient, depending on your hardware (essentially,
     * it's trading ALU for bandwidth).
     *
     * .
     *
     * @remarks This irradiance cubemap can be generated with the **cmgen** tool.
     *
     * @param cubemap Cubemap representing the Irradiance pre-convolved by
     * @returns This Builder, for chaining calls.
     * @see irradiance(uint8_t bands, math::float3 const* sh)
     */
    public irradiance(cubemap: Texture): IndirectLight$Builder;
    /**
     * (optional) Environment intensity.
     *
     * Because the environment is encoded usually relative to some reference, the range can be
     * adjusted with this method.
     *
     * @param envIntensity Scale factor applied to the environment and irradiance such that the
     *     result is in lux, or lumen/m^2 (default = 30000)
     * @returns This Builder, for chaining calls.
     */
    public intensity(envIntensity: number): IndirectLight$Builder;
    /**
     * Specifies the rigid-body transformation to apply to the IBL.
     *
     * @param rotation 3x3 rotation matrix. Must be a rigid-body transform.
     * @returns This Builder, for chaining calls.
     */
    public rotation(rotation: mat3): IndirectLight$Builder;
    /**
     * Creates the IndirectLight object and returns a pointer to it.
     *
     * @param engine Reference to the filament::Engine to associate this IndirectLight with.
     * @returns pointer to the newly created object or nullptr if exceptions are disabled and an
     * error occurred.
     */
    public build(engine: Engine): IndirectLight;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * InstanceBuffer holds draw (GPU) instance transforms. These can be provided to a renderable
 * to "offset" each draw instance.
 * @see RenderableManager::Builder::instances(size_t, InstanceBuffer*)
 */
export class InstanceBuffer {
    /** Returns the instance count specified when building this InstanceBuffer. */
    public getInstanceCount(): number;
    /**
     * Sets the local transform for each instance. Each local transform is relative to the
     * transform of the associated renderable. This forms a parent-child relationship between the
     * renderable and its instances, so adjusting the renderable's transform will affect all
     * instances.
     *
     * @param localTransforms an array of math::mat4f with length count, need not outlive this call
     * @param count the number of local transforms
     * @param offset index of the first instance to set local transforms
     */
    public setLocalTransforms(localTransforms: mat4, count: number, offset?: number): void;
    /**
     * Returns the local transform for a given instance.
     *
     * @param index The index of the instance.
     * @returns The local transform of the instance.
     */
    public getLocalTransform(index: number): mat4;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

export class InstanceBuffer$Builder {
    /**
     * Provide an initial local transform for each instance. Each local transform is relative to
     * the transform of the associated renderable. This forms a parent-child relationship between
     * the renderable and its instances, so adjusting the renderable's transform will - * affect
     * all instances.
     *
     * The array of math::mat4f must have length instanceCount, provided when constructing this
     * Builder.
     *
     * @param localTransforms an array of math::mat4f with length instanceCount, must remain valid
     *     until after build() is called
     */
    public localTransforms(localTransforms: mat4): InstanceBuffer$Builder;
    /**
     * Associate an optional name with this InstanceBuffer for debugging purposes.
     *
     * name will show in error messages and should be kept as short as possible. The name is
     * truncated to a maximum of 128 characters.
     *
     * The name string is copied during this method so clients may free its memory after the
     * function returns.
     *
     * @deprecated Use name(utils::StaticString const & ) instead.
     *
     * @param name A string to identify this InstanceBuffer
     * @param len Length of name, should be less than or equal to 128
     * @returns This Builder, for chaining calls.
     */
    public name(name: string, len: number): InstanceBuffer$Builder;
    /** Creates the InstanceBuffer object and returns a pointer to it. */
    public build(engine: Engine): InstanceBuffer;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * LightManager allows to create a light source in the scene, such as a sun or street lights.
 *
 * At least one light must be added to a scene in order to see anything (unless the
 * Material.Shading.UNLIT is used).
 *
 * Creation and destruction ========================
 *
 * A Light component is created using the LightManager::Builder and destroyed by calling
 * LightManager::destroy(utils::Entity).
 *
 * ~~~~~~~~~~~{.cpp} filament::Engine* engine = filament::Engine::create(); utils::Entity sun =
 * utils::EntityManager.get().create();
 *
 * filament::LightManager::Builder(Type::SUN) .castShadows(true) .build(*engine, sun);
 *
 * engine->getLightManager().destroy(sun); ~~~~~~~~~~~
 *
 * Light types ===========
 *
 * Lights come in three flavors: - directional lights - point lights - spot lights
 *
 * Directional lights ------------------
 *
 * Directional lights have a direction, but don't have a position. All light rays are parallel
 * and come from infinitely far away and from everywhere. Typically a directional light is used
 * to simulate the sun.
 *
 * Directional lights and spot lights are able to cast shadows.
 *
 * To create a directional light use Type.DIRECTIONAL or Type.SUN, both are similar, but the
 * later also draws a sun's disk in the sky and its reflection on glossy objects.
 *
 * By default, only the dominant directional light (the one with the highest intensity) of a
 * scene is evaluated. Several directional lights can be used by enabling
 * Engine::Config::enableMultipleDirectionalLights: the dominant one is still the only one that
 * can cast shadows and draw a sun's disk, and up to CONFIG_MAX_EXTRA_DIRECTIONAL_LIGHTS (4)
 * additional directional lights are evaluated without shadows; any further directional lights
 * are ignored. Scenes with a single directional light don't pay any cost for this feature.
 *
 * Point lights ------------
 *
 * Unlike directional lights, point lights have a position but emit light in all directions.
 * The intensity of the light diminishes with the inverse square of the distance to the light.
 * Builder.falloff() controls distance beyond which the light has no more influence.
 *
 * A scene can have multiple point lights.
 *
 * Spot lights -----------
 *
 * Spot lights are similar to point lights but the light it emits is limited to a cone defined
 * by Builder.spotLightCone() and the light's direction.
 *
 * A spot light is therefore defined by a position, a direction and inner and outer cones. The
 * spot light's influence is limited to inside the outer cone. The inner cone defines the
 * light's falloff attenuation.
 *
 * A physically correct spot light is a little difficult to use because changing the outer
 * angle of the cone changes the illumination levels, as the same amount of light is spread
 * over a changing volume. The coupling of illumination and the outer cone means that an artist
 * cannot tweak the influence cone of a spot light without also changing the perceived
 * illumination. It therefore makes sense to provide artists with a parameter to disable this
 * coupling. This is the difference between Type.FOCUSED_SPOT and Type.SPOT.
 *
 * Performance considerations ==========================
 *
 * Generally, adding lights to the scene hurts performance, however filament is designed to be
 * able to handle hundreds of lights in a scene under certain conditions. Here are some tips to
 * keep performances high.
 *
 * 1. Prefer spot lights to point lights and use the smallest outer cone angle possible.
 *
 * 2. Use the smallest possible falloff distance for point and spot lights. Performance is very
 * sensitive to overlapping lights. The falloff distance essentially defines a sphere of
 * influence for the light, so try to position point and spot lights such that they don't
 * overlap too much.
 *
 * On the other hand, a scene can contain hundreds of non overlapping lights without incurring
 * a significant overhead.
 * @see Builder.direction(), Builder.sunAngularRadius()
 * @see Builder.position(), Builder.falloff()
 * @see Builder.position(), Builder.direction(), Builder.falloff(), Builder.spotLightCone()
 */
export class LightManager {
    /**
     * Returns the number of component in the LightManager, note that component are not guaranteed
     * to be active. Use the EntityManager::isAlive() before use if needed.
     *
     * @returns number of component in the LightManager
     */
    public getComponentCount(): number;
    /**
     * Returns whether a particular Entity is associated with a component of this LightManager
     *
     * @param e An Entity.
     * @returns true if this Entity has a component associated with this manager.
     */
    public hasComponent(e: Entity): boolean;
    /** @returns true if the this manager has no components */
    public empty(): boolean;
    /**
     * Retrieve the `Entity` of the component from its `Instance`.
     *
     * @param i Instance of the component obtained from getInstance()
     */
    public getEntity(i: number): Entity;
    /**
     * Retrieve the Entities of all the components of this manager.
     *
     * @returns A list, in no particular order, of all the entities managed by this manager.
     */
    public getEntities(): Entity;
    /**
     * Gets an Instance representing the Light component associated with the given Entity.
     *
     * @remarks Use Instance::isValid() to make sure the component exists.
     *
     * @param e An Entity.
     * @returns An Instance object, which represents the Light component associated with the Entity
     * e.
     * @see hasComponent()
     */
    public getInstance(e: Entity): number;
    public destroy(e: Entity): void;
    public getType(i: number): LightManager$Type;
    /**
     * Helper function that returns if a light is a directional light
     *
     * @param i Instance of the component obtained from getInstance().
     * @returns true is this light is a type of directional light
     */
    public isDirectional(i: number): boolean;
    /**
     * Helper function that returns if a light is a point light
     *
     * @param i Instance of the component obtained from getInstance().
     * @returns true is this light is a type of point light
     */
    public isPointLight(i: number): boolean;
    /**
     * Helper function that returns if a light is a spot light
     *
     * @param i Instance of the component obtained from getInstance().
     * @returns true is this light is a type of spot light
     */
    public isSpotLight(i: number): boolean;
    /**
     * Enables or disables a light channel. Light channel 0 is enabled by default.
     *
     * @param channel light channel to enable or disable, between 0 and 7.
     * @param enable whether to enable (true) or disable (false) the specified light channel.
     */
    public setLightChannel(i: number, channel: number, enable?: boolean): void;
    /**
     * Returns whether a light channel is enabled on a specified light.
     *
     * @param i Instance of the component obtained from getInstance().
     * @param channel Light channel to query
     * @returns true if the light channel is enabled, false otherwise
     */
    public getLightChannel(i: number, channel: number): boolean;
    /**
     * Dynamically updates the light's position.
     *
     * @param i Instance of the component obtained from getInstance().
     * @param position Light's position in world space. The default is at the origin.
     * @see Builder.position()
     */
    public setPosition(i: number, position: float3): void;
    /** returns the light's position in world space */
    public getPosition(i: number): float3;
    /**
     * Dynamically updates the light's direction
     *
     * @param i Instance of the component obtained from getInstance().
     * @param direction Light's direction in world space. Should be a unit vector. The default is
     *     {0,-1,0}.
     * @see Builder.direction()
     */
    public setDirection(i: number, direction: float3): void;
    /** returns the light's direction in world space */
    public getDirection(i: number): float3;
    /**
     * Dynamically updates the light's hue as linear sRGB
     *
     * @param i Instance of the component obtained from getInstance().
     * @param color Color of the light specified in the linear sRGB color-space. The default is
     *     white {1,1,1}.
     * @see Builder.color(), getInstance()
     */
    public setColor(i: number, color: float3): void;
    /**
     * @param i Instance of the component obtained from getInstance().
     * @returns the light's color in linear sRGB
     */
    public getColor(i: number): float3;
    /**
     * Dynamically updates the light's intensity. The intensity can be negative.
     *
     * @param i Instance of the component obtained from getInstance().
     * @param intensity This parameter depends on the Light.Type: - For directional lights, it
     *     specifies the illuminance in *lux* (or *lumen/m^2*). - For point lights and spot lights, it
     *     specifies the luminous power in *lumen*.
     * @see Builder.intensity()
     */
    public setIntensity(i: number, intensity: number): void;
    /**
     * Dynamically updates the light's intensity. The intensity can be negative.
     *
     * Lightbulb type | Efficiency ----------------:|-----------: Incandescent | 2.2% Halogen |
     * 7.0% LED | 8.7% Fluorescent | 10.7%
     *
     * @param i Instance of the component obtained from getInstance().
     * @param watts Energy consumed by a lightbulb. It is related to the energy produced and
     *     ultimately the brightness by the `efficiency` parameter. This value is often available on
     *     the packaging of commercial lightbulbs.
     * @param efficiency Efficiency in percent. This depends on the type of lightbulb used.
     * @see Builder.intensity(float watts, float efficiency)
     */
    public setIntensity(i: number, watts: number, efficiency: number): void;
    /**
     * Dynamically updates the light's intensity in candela. The intensity can be negative.
     *
     * @remarks This method is equivalent to calling setIntensity(float intensity) for directional
     * lights (Type.DIRECTIONAL or Type.SUN).
     *
     * @param i Instance of the component obtained from getInstance().
     * @param intensity Luminous intensity in *candela*.
     * @see Builder.intensityCandela(float intensity)
     */
    public setIntensityCandela(i: number, intensity: number): void;
    /**
     * returns the light's luminous intensity in candela.
     *
     * @remarks for Type.FOCUSED_SPOT lights, the returned value depends on the `outer` cone angle.
     *
     * @param i Instance of the component obtained from getInstance().
     * @returns luminous intensity in candela.
     */
    public getIntensity(i: number): number;
    /**
     * Set the falloff distance for point lights and spot lights.
     *
     * @param i Instance of the component obtained from getInstance().
     * @param radius falloff distance in world units. Default is 1 meter.
     * @see Builder.falloff()
     */
    public setFalloff(i: number, radius: number): void;
    /**
     * returns the falloff distance of this light.
     *
     * @param i Instance of the component obtained from getInstance().
     * @returns the falloff distance of this light.
     */
    public getFalloff(i: number): number;
    /**
     * Dynamically updates a spot light's cone as angles
     *
     * @param i Instance of the component obtained from getInstance().
     * @param inner inner cone angle in *radians* between 0.00873 and outer
     * @param outer outer cone angle in *radians* between 0.00873 and pi/2
     * @see Builder.spotLightCone()
     */
    public setSpotLightCone(i: number, inner: number, outer: number): void;
    /**
     * returns the outer cone angle in *radians* between inner and pi/2.
     *
     * @param i Instance of the component obtained from getInstance().
     * @returns the outer cone angle of this light.
     */
    public getSpotLightOuterCone(i: number): number;
    /**
     * returns the inner cone angle in *radians* between 0 and pi/2.
     *
     * The value is recomputed from the initial values, thus is not precisely the same as the one
     * passed to setSpotLightCone() or Builder.spotLightCone().
     *
     * @param i Instance of the component obtained from getInstance().
     * @returns the inner cone angle of this light.
     */
    public getSpotLightInnerCone(i: number): number;
    /**
     * Dynamically updates the angular radius of a Type.SUN light
     *
     * The Sun as seen from Earth has an angular size of 0.526° to 0.545°
     *
     * @param i Instance of the component obtained from getInstance().
     * @param angularRadius sun's radius in degrees. Default is 0.545°.
     */
    public setSunAngularRadius(i: number, angularRadius: number): void;
    /**
     * returns the angular radius if the sun in degrees.
     *
     * @param i Instance of the component obtained from getInstance().
     * @returns the angular radius if the sun in degrees.
     */
    public getSunAngularRadius(i: number): number;
    /**
     * Dynamically updates the halo radius of a Type.SUN light. The radius of the halo is defined
     * as a multiplier of the sun angular radius.
     *
     * @param i Instance of the component obtained from getInstance().
     * @param haloSize radius multiplier. Default is 10.0.
     */
    public setSunHaloSize(i: number, haloSize: number): void;
    /**
     * returns the halo size of a Type.SUN light as a multiplier of the sun angular radius.
     *
     * @param i Instance of the component obtained from getInstance().
     * @returns the halo size
     */
    public getSunHaloSize(i: number): number;
    /**
     * Dynamically updates the halo falloff of a Type.SUN light. The falloff is a dimensionless
     * number used as an exponent.
     *
     * @param i Instance of the component obtained from getInstance().
     * @param haloFalloff halo falloff. Default is 80.0.
     */
    public setSunHaloFalloff(i: number, haloFalloff: number): void;
    /**
     * returns the halo falloff of a Type.SUN light as a dimensionless value.
     *
     * @param i Instance of the component obtained from getInstance().
     * @returns the halo falloff
     */
    public getSunHaloFalloff(i: number): number;
    /**
     * returns the shadow-map options for a given light
     *
     * @param i Instance of the component obtained from getInstance().
     * @returns A ShadowOption structure
     */
    public getShadowOptions(i: number): LightManager$ShadowOptions;
    /**
     * sets the shadow-map options for a given light
     *
     * @param i Instance of the component obtained from getInstance().
     * @param options A ShadowOption structure
     */
    public setShadowOptions(i: number, options: LightManager$ShadowOptions): void;
    /**
     * Whether this Light casts shadows (disabled by default)
     *
     * @remarks Warning: - Only a Type.DIRECTIONAL, Type.SUN, Type.SPOT, or Type.FOCUSED_SPOT light
     * can cast shadows
     *
     * @param i Instance of the component obtained from getInstance().
     * @param shadowCaster Enables or disables casting shadows from this Light.
     */
    public setShadowCaster(i: number, shadowCaster: boolean): void;
    /**
     * returns whether this light casts shadows.
     *
     * @param i Instance of the component obtained from getInstance().
     */
    public isShadowCaster(i: number): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** Use Builder to construct a Light object instance */
export class LightManager$Builder {
    /**
     * Enables or disables a light channel. Light channel 0 is enabled by default.
     *
     * @param channel Light channel to enable or disable, between 0 and 7.
     * @param enable Whether to enable or disable the light channel.
     * @returns This Builder, for chaining calls.
     */
    public lightChannel(channel: number, enable?: boolean): LightManager$Builder;
    /**
     * Whether this Light casts shadows (disabled by default)
     *
     * @param enable Enables or disables casting shadows from this Light.
     * @returns This Builder, for chaining calls.
     */
    public castShadows(enable: boolean): LightManager$Builder;
    /**
     * Sets the shadow-map options for this light.
     *
     * @returns This Builder, for chaining calls.
     */
    public shadowOptions(options: LightManager$ShadowOptions): LightManager$Builder;
    /**
     * Whether this light casts light (enabled by default)
     *
     * @remarks In some situations it can be useful to have a light in the scene that doesn't
     * actually emit light, but does cast shadows.
     *
     * @param enable Enables or disables lighting from this Light.
     * @returns This Builder, for chaining calls.
     */
    public castLight(enable: boolean): LightManager$Builder;
    /**
     * Sets the initial position of the light in world space.
     *
     * @remarks The Light's position is ignored for directional lights (Type.DIRECTIONAL or
     * Type.SUN)
     *
     * @param position Light's position in world space. The default is at the origin.
     * @returns This Builder, for chaining calls.
     */
    public position(position: float3): LightManager$Builder;
    /**
     * Sets the initial direction of a light in world space.
     *
     * @remarks The Light's direction is ignored for Type.POINT lights.
     *
     * @param direction Light's direction in world space. Should be a unit vector. The default is
     *     {0,-1,0}.
     * @returns This Builder, for chaining calls.
     */
    public direction(direction: float3): LightManager$Builder;
    /**
     * Sets the initial color of a light.
     *
     * @param color Color of the light specified in the linear sRGB color-space. The default is
     *     white {1,1,1}.
     * @returns This Builder, for chaining calls.
     */
    public color(color: float3): LightManager$Builder;
    /**
     * Sets the initial intensity of a light.
     *
     * For example, the sun's illuminance is about 100,000 lux.
     *
     * This method overrides any prior calls to intensity or intensityCandela.
     *
     * @param intensity This parameter depends on the Light.Type: - For directional lights, it
     *     specifies the illuminance in *lux* (or *lumen/m^2*). - For point lights and spot lights, it
     *     specifies the luminous power in *lumen*.
     * @returns This Builder, for chaining calls.
     */
    public intensity(intensity: number): LightManager$Builder;
    /**
     * Sets the initial intensity of a spot or point light in candela.
     *
     * This method overrides any prior calls to intensity or intensityCandela.
     *
     * @remarks This method is equivalent to calling intensity(float intensity) for directional
     * lights (Type.DIRECTIONAL or Type.SUN).
     *
     * @param intensity Luminous intensity in *candela*.
     * @returns This Builder, for chaining calls.
     */
    public intensityCandela(intensity: number): LightManager$Builder;
    /**
     * Sets the initial intensity of a light in watts.
     *
     * Lightbulb type | Efficiency ----------------:|-----------: Incandescent | 2.2% Halogen |
     * 7.0% LED | 8.7% Fluorescent | 10.7%
     *
     * This method overrides any prior calls to intensity or intensityCandela.
     *
     * @remarks This call is equivalent to `Builder::intensity(efficiency * 683 * watts);`
     *
     * @param watts Energy consumed by a lightbulb. It is related to the energy produced and
     *     ultimately the brightness by the `efficiency` parameter. This value is often available on
     *     the packaging of commercial lightbulbs.
     * @param efficiency Efficiency in percent. This depends on the type of lightbulb used.
     * @returns This Builder, for chaining calls.
     */
    public intensity(watts: number, efficiency: number): LightManager$Builder;
    /**
     * Set the falloff distance for point lights and spot lights.
     *
     * At the falloff distance, the light has no more effect on objects.
     *
     * The falloff distance essentially defines a *sphere of influence* around the light, and
     * therefore has an impact on performance. Larger falloffs might reduce performance
     * significantly, especially when many lights are used.
     *
     * Try to avoid having a large number of light's spheres of influence overlap.
     *
     * @remarks The Light's falloff is ignored for directional lights (Type.DIRECTIONAL or
     * Type.SUN)
     *
     * @param radius Falloff distance in world units. Default is 1 meter.
     * @returns This Builder, for chaining calls.
     */
    public falloff(radius: number): LightManager$Builder;
    /**
     * Defines a spot light'st angular falloff attenuation.
     *
     * A spot light is defined by a position, a direction and two cones, `inner` and `outer.` These
     * two cones are used to define the angular falloff attenuation of the spot light and are
     * defined by the angle from the center axis to where the falloff begins (i.e. cones are
     * defined by their half-angle).
     *
     * Both inner and outer are silently clamped to a minimum value of 0.5 degrees (~0.00873
     * radians) to avoid floating-point precision issues during rendering.
     *
     * @remarks The spot light cone is ignored for directional and point lights.
     *
     * @param inner inner cone angle in *radians* between 0.00873 and `outer`
     * @param outer outer cone angle in *radians* between 0.00873 inner and
     * @returns This Builder, for chaining calls.
     * @see Type.SPOT, Type.FOCUSED_SPOT
     */
    public spotLightCone(inner: number, outer: number): LightManager$Builder;
    /**
     * Defines the angular radius of the sun, in degrees, between 0.25° and 20.0°
     *
     * The Sun as seen from Earth has an angular size of 0.526° to 0.545°
     *
     * @param angularRadiusDeg sun's radius in degree. Default is 0.545°.
     * @returns This Builder, for chaining calls.
     */
    public sunAngularRadius(angularRadiusDeg: number): LightManager$Builder;
    /**
     * Defines the halo radius of the sun. The radius of the halo is defined as a multiplier of the
     * sun angular radius. Must be at least 1.0.
     *
     * @param haloSize radius multiplier. Default is 10.0.
     * @returns This Builder, for chaining calls.
     */
    public sunHaloSize(haloSize: number): LightManager$Builder;
    /**
     * Defines the halo falloff of the sun. The falloff is a dimensionless number used as an
     * exponent. Must be at least 1.0.
     *
     * @param haloFalloff halo falloff. Default is 80.0.
     * @returns This Builder, for chaining calls.
     */
    public sunHaloFalloff(haloFalloff: number): LightManager$Builder;
    /**
     * Adds the Light component to an entity.
     *
     * If exceptions are disabled and an error occurs, this function is a no-op. Success can be
     * checked by looking at the return value.
     *
     * If this component already exists on the given entity, it is first destroyed as if
     * destroy(utils::Entity e) was called.
     *
     * @remarks Warning: Currently, only 2048 lights can be created on a given Engine.
     *
     * @param engine Reference to the filament::Engine to associate this light with.
     * @param entity Entity to add the light component to.
     * @returns Success if the component was created successfully, Error otherwise.
     */
    public build(engine: Engine, entity: Entity): LightManager$Builder$Result;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * A Material defines the visual appearance of a surface.
 *
 * Materials are created from a binary blob generated by the material compiler (matc). A
 * Material is a template from which MaterialInstance objects can be created.
 */
export class Material {
    /**
     * Creates a new instance of this material. Material instances should be freed using
     * Engine::destroy(const MaterialInstance*).
     *
     * @param name Optional name to associate with the given material instance. If this is null,
     *     then the instance inherits the material's name.
     * @returns A pointer to the new instance.
     */
    public createInstance(name?: string): MaterialInstance;
    /** Returns the name of this material as a null-terminated string. */
    public getName(): string;
    /** Returns the shading model of this material. */
    public getShading(): Shading;
    /**
     * Returns the interpolation mode of this material. This affects how variables are
     * interpolated.
     */
    public getInterpolation(): Interpolation;
    /** Returns the blending mode of this material. */
    public getBlendingMode(): BlendingMode;
    /** Returns the vertex domain of this material. */
    public getVertexDomain(): VertexDomain;
    /** Returns the material's supported variants */
    public getSupportedVariants(): number;
    /**
     * Returns the material domain of this material. The material domain determines how the
     * material is used.
     */
    public getMaterialDomain(): MaterialDomain;
    /** Returns the default culling mode of this material. */
    public getCullingMode(): CullingMode;
    /**
     * Returns the transparency mode of this material. This value only makes sense when the
     * blending mode is transparent or fade.
     */
    public getTransparencyMode(): TransparencyMode;
    /** Indicates whether instances of this material will, by default, write to the color buffer. */
    public isColorWriteEnabled(): boolean;
    /** Indicates whether instances of this material will, by default, write to the depth buffer. */
    public isDepthWriteEnabled(): boolean;
    /** Indicates whether instances of this material will, by default, use depth testing. */
    public isDepthCullingEnabled(): boolean;
    /** Indicates whether this material is double-sided. */
    public isDoubleSided(): boolean;
    /** Indicates whether this material uses alpha to coverage. */
    public isAlphaToCoverageEnabled(): boolean;
    /** Returns the alpha mask threshold used when the blending mode is set to masked. */
    public getMaskThreshold(): number;
    /**
     * Indicates whether this material uses the shadowing factor as a color multiplier. This values
     * only makes sense when the shading mode is unlit.
     */
    public hasShadowMultiplier(): boolean;
    /** Indicates whether this material has specular anti-aliasing enabled */
    public hasSpecularAntiAliasing(): boolean;
    /** Returns the screen-space variance for specular-antialiasing, this value is between 0 and 1. */
    public getSpecularAntiAliasingVariance(): number;
    /** Returns the clamping threshold for specular-antialiasing, this value is between 0 and 1. */
    public getSpecularAntiAliasingThreshold(): number;
    /** Returns the refraction mode used by this material. */
    public getRefractionMode(): RefractionMode;
    /** Return the refraction type used by this material. */
    public getRefractionType(): RefractionType;
    /** Returns the reflection mode used by this material. */
    public getReflectionMode(): ReflectionMode;
    /** Returns the minimum required feature level for this material. */
    public getFeatureLevel(): FeatureLevel;
    /** Returns the number of parameters declared by this material. The returned value can be 0. */
    public getParameterCount(): number;
    /** Indicates whether an existing parameter is a sampler or not. */
    public isSampler(name: string): boolean;
    /**
     * Returns a view of the material source (.mat which is a JSON-ish file) string, if it has been
     * set. Otherwise, it returns a view of an empty string. The lifetime of the string_view is
     * tied to the lifetime of the Material.
     */
    public getSource(): string;
    /**
     * Gets the name of the transform field associated for the given sampler parameter. In the case
     * where the parameter does not have a transform name field, it will return nullptr.
     *
     * @param samplerName the name of the sampler parameter to query.
     * @returns If exists, the transform name value otherwise returns a nullptr.
     */
    public getParameterTransformName(samplerName: string): string;
    /**
     * Sets the value of the given parameter on this material's default instance.
     *
     * @param name The name of the material parameter
     * @param value The value of the material parameter
     * @see getDefaultInstance()
     */
    public setDefaultParameterBool(name: string, value: boolean): void;
    /**
     * Sets the value of the given parameter on this material's default instance.
     *
     * @param name The name of the material parameter
     * @param value The value of the material parameter
     * @see getDefaultInstance()
     */
    public setDefaultParameterInt(name: string, value: number): void;
    /**
     * Sets the value of the given parameter on this material's default instance.
     *
     * @param name The name of the material parameter
     * @param value The value of the material parameter
     * @see getDefaultInstance()
     */
    public setDefaultParameterString(name: string, value: number): void;
    /**
     * Sets the value of the given parameter on this material's default instance.
     *
     * @param name The name of the material parameter
     * @param value The value of the material parameter
     * @see getDefaultInstance()
     */
    public setDefaultParameterFloat(name: string, value: number): void;
    /**
     * Sets the value of the given parameter on this material's default instance.
     *
     * @param name The name of the material parameter
     * @param value The value of the material parameter
     * @see getDefaultInstance()
     */
    public setDefaultParameterFloat2(name: string, value: float2): void;
    /**
     * Sets the value of the given parameter on this material's default instance.
     *
     * @param name The name of the material parameter
     * @param value The value of the material parameter
     * @see getDefaultInstance()
     */
    public setDefaultParameterFloat3(name: string, value: float3): void;
    /**
     * Sets the value of the given parameter on this material's default instance.
     *
     * @param name The name of the material parameter
     * @param value The value of the material parameter
     * @see getDefaultInstance()
     */
    public setDefaultParameterFloat4(name: string, value: float4): void;
    /**
     * Sets the value of the given parameter on this material's default instance.
     *
     * @param name The name of the material parameter
     * @param value The value of the material parameter
     * @see getDefaultInstance()
     */
    public setDefaultParameterMat3f(name: string, value: mat3): void;
    /**
     * Sets the value of the given parameter on this material's default instance.
     *
     * @param name The name of the material parameter
     * @param value The value of the material parameter
     * @see getDefaultInstance()
     */
    public setDefaultParameterMat4f(name: string, value: mat4): void;
    /**
     * Sets a texture and sampler parameters on this material's default instance.
     *
     * @param name The name of the material texture parameter
     * @param texture The texture to set as parameter
     * @param sampler The sampler to be used with this texture
     * @see getDefaultInstance()
     */
    public setDefaultParameterTextureSampler(name: string, texture: Texture, sampler: TextureSampler): void;
    /**
     * Sets the color of the given parameter on this material's default instance.
     *
     * @param name The name of the material color parameter
     * @param type Whether the color is specified in the linear or sRGB space
     * @param color The color as a floating point red, green, blue tuple
     * @see getDefaultInstance()
     */
    public setDefaultParameterFloat3(name: string, type: RgbType, color: float3): void;
    /**
     * Sets the color of the given parameter on this material's default instance.
     *
     * @param name The name of the material color parameter
     * @param type Whether the color is specified in the linear or sRGB space
     * @param color The color as a floating point red, green, blue, alpha tuple
     * @see getDefaultInstance()
     */
    public setDefaultParameterFloat4(name: string, type: RgbaType, color: float4): void;
    /** Returns this material's default instance. */
    public getDefaultInstance(): MaterialInstance;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

export class Material$Builder {
    constructor();
    /**
     * Sets the quality of the indirect lights computations. This is only taken into account if
     * this material is lit and in the surface domain. This setting will affect the IndirectLight
     * computation if one is specified on the Scene and Spherical Harmonics are used for the
     * irradiance.
     *
     * @param shBandCount Number of spherical harmonic bands. Must be 1, 2 or 3 (default).
     * @returns Reference to this Builder for chaining calls.
     * @see IndirectLight
     */
    public sphericalHarmonicsBandCount(shBandCount: number): Material$Builder;
    /**
     * Set the quality of shadow sampling. This is only taken into account if this material is lit
     * and in the surface domain.
     */
    public shadowSamplingQuality(quality: Material$Builder$ShadowSamplingQuality): Material$Builder;
    /** Set the batching mode of the instances created from this material. */
    public uboBatching(uboBatchingMode: Material$UboBatchingMode): Material$Builder;
    /**
     * Creates the Material object and returns a pointer to it.
     *
     * @param engine Reference to the filament::Engine to associate this Material with.
     * @returns pointer to the newly created object or nullptr if exceptions are disabled and an
     * error occurred.
     */
    public build(engine: Engine): Material;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * A MaterialInstance represents a specific instance of a Material.
 *
 * While a Material defines the shader code and the set of parameters, a MaterialInstance holds
 * the specific values for those parameters.
 */
export class MaterialInstance {
    /**
     * Creates a new MaterialInstance using another MaterialInstance as a template for
     * initialization. The new MaterialInstance is an instance of the same Material of the template
     * instance and must be destroyed just like any other MaterialInstance.
     *
     * @param other A MaterialInstance to use as a template for initializing a new instance
     * @param name A name for the new MaterialInstance or nullptr to use the template's name
     * @returns A new MaterialInstance
     */
    public static duplicate(other: MaterialInstance, name?: string): MaterialInstance;
    /** @returns the Material associated with this instance */
    public getMaterial(): Material;
    /** @returns the name associated with this instance */
    public getName(): string;
    /** inline helper to provide the name as a null-terminated C string */
    public setParameterBool(name: string, value: boolean): void;
    /** inline helper to provide the name as a null-terminated C string */
    public setParameterInt(name: string, value: number): void;
    /** inline helper to provide the name as a null-terminated C string */
    public setParameterString(name: string, value: number): void;
    /** inline helper to provide the name as a null-terminated C string */
    public setParameterFloat(name: string, value: number): void;
    /** inline helper to provide the name as a null-terminated C string */
    public setParameterFloat2(name: string, value: float2): void;
    /** inline helper to provide the name as a null-terminated C string */
    public setParameterFloat3(name: string, value: float3): void;
    /** inline helper to provide the name as a null-terminated C string */
    public setParameterFloat4(name: string, value: float4): void;
    /** inline helper to provide the name as a null-terminated C string */
    public setParameterMat3f(name: string, value: mat3): void;
    /** inline helper to provide the name as a null-terminated C string */
    public setParameterMat4f(name: string, value: mat4): void;
    /**
     * Set a uniform array by name
     *
     * @param name Name of the parameter array as defined by Material. Cannot be nullptr.
     * @param nameLength Length in `char` of the name parameter.
     * @param values Array of values to set to the named parameter array.
     * @param count Size of the array to set.
     * @see Material::hasParameter
     */
    public setParameterLong(name: string, nameLength: number, values: boolean, count: number): void;
    /**
     * Set a uniform array by name
     *
     * @param name Name of the parameter array as defined by Material. Cannot be nullptr.
     * @param nameLength Length in `char` of the name parameter.
     * @param values Array of values to set to the named parameter array.
     * @param count Size of the array to set.
     * @see Material::hasParameter
     */
    public setParameterInt(name: string, nameLength: number, values: number, count: number): void;
    /**
     * Set a uniform array by name
     *
     * @param name Name of the parameter array as defined by Material. Cannot be nullptr.
     * @param nameLength Length in `char` of the name parameter.
     * @param values Array of values to set to the named parameter array.
     * @param count Size of the array to set.
     * @see Material::hasParameter
     */
    public setParameterString(name: string, nameLength: number, values: number, count: number): void;
    /**
     * Set a uniform array by name
     *
     * @param name Name of the parameter array as defined by Material. Cannot be nullptr.
     * @param nameLength Length in `char` of the name parameter.
     * @param values Array of values to set to the named parameter array.
     * @param count Size of the array to set.
     * @see Material::hasParameter
     */
    public setParameterFloat(name: string, nameLength: number, values: number, count: number): void;
    /**
     * Set a uniform array by name
     *
     * @param name Name of the parameter array as defined by Material. Cannot be nullptr.
     * @param nameLength Length in `char` of the name parameter.
     * @param values Array of values to set to the named parameter array.
     * @param count Size of the array to set.
     * @see Material::hasParameter
     */
    public setParameterFloat2(name: string, nameLength: number, values: float2, count: number): void;
    /**
     * Set a uniform array by name
     *
     * @param name Name of the parameter array as defined by Material. Cannot be nullptr.
     * @param nameLength Length in `char` of the name parameter.
     * @param values Array of values to set to the named parameter array.
     * @param count Size of the array to set.
     * @see Material::hasParameter
     */
    public setParameterFloat3(name: string, nameLength: number, values: float3, count: number): void;
    /**
     * Set a uniform array by name
     *
     * @param name Name of the parameter array as defined by Material. Cannot be nullptr.
     * @param nameLength Length in `char` of the name parameter.
     * @param values Array of values to set to the named parameter array.
     * @param count Size of the array to set.
     * @see Material::hasParameter
     */
    public setParameterFloat4(name: string, nameLength: number, values: float4, count: number): void;
    /**
     * Set a uniform array by name
     *
     * @param name Name of the parameter array as defined by Material. Cannot be nullptr.
     * @param nameLength Length in `char` of the name parameter.
     * @param values Array of values to set to the named parameter array.
     * @param count Size of the array to set.
     * @see Material::hasParameter
     */
    public setParameterMat3f(name: string, nameLength: number, values: mat3, count: number): void;
    /**
     * Set a uniform array by name
     *
     * @param name Name of the parameter array as defined by Material. Cannot be nullptr.
     * @param nameLength Length in `char` of the name parameter.
     * @param values Array of values to set to the named parameter array.
     * @param count Size of the array to set.
     * @see Material::hasParameter
     */
    public setParameterMat4f(name: string, nameLength: number, values: mat4, count: number): void;
    /**
     * Set a texture as the named parameter
     *
     * Note: Depth textures can't be sampled with a linear filter unless the comparison mode is set
     * to COMPARE_TO_TEXTURE.
     *
     * @param name Name of the parameter as defined by Material. Cannot be nullptr.
     * @param nameLength Length in `char` of the name parameter.
     * @param texture Non nullptr Texture object pointer.
     * @param sampler Sampler parameters.
     */
    public setParameterTextureSampler(name: string, nameLength: number, texture: Texture, sampler: TextureSampler): void;
    /**
     * Set an RGB color as the named parameter. A conversion might occur depending on the specified
     * type
     *
     * @param name Name of the parameter as defined by Material. Cannot be nullptr.
     * @param nameLength Length in `char` of the name parameter.
     * @param type Whether the color value is encoded as Linear or sRGB.
     * @param color Array of read, green, blue channels values.
     */
    public setParameterRgbType(name: string, nameLength: number, type: RgbType, color: float3): void;
    /**
     * Set an RGBA color as the named parameter. A conversion might occur depending on the
     * specified type
     *
     * @param name Name of the parameter as defined by Material. Cannot be nullptr.
     * @param nameLength Length in `char` of the name parameter.
     * @param type Whether the color value is encoded as Linear or sRGB/A.
     * @param color Array of read, green, blue and alpha channels values.
     */
    public setParameterRgbaType(name: string, nameLength: number, type: RgbaType, color: float4): void;
    /**
     * Set-up a custom scissor rectangle; by default it is disabled.
     *
     * The scissor rectangle gets clipped by the View's viewport, in other words, the scissor
     * cannot affect fragments outside of the View's Viewport.
     *
     * Currently the scissor is not compatible with dynamic resolution and should always be
     * disabled when dynamic resolution is used.
     *
     * @param left left coordinate of the scissor box relative to the viewport
     * @param bottom bottom coordinate of the scissor box relative to the viewport
     * @param width width of the scissor box
     * @param height height of the scissor box
     * @see unsetScissor
     * @see View::setViewport
     * @see View::setDynamicResolutionOptions
     */
    public setScissor(left: number, bottom: number, width: number, height: number): void;
    /**
     * Returns the scissor rectangle to its default disabled setting.
     *
     * Currently the scissor is not compatible with dynamic resolution and should always be
     * disabled when dynamic resolution is used.
     * @see View::setDynamicResolutionOptions
     */
    public unsetScissor(): void;
    /**
     * Sets a polygon offset that will be applied to all renderables drawn with this material
     * instance.
     *
     * The value of the offset is scale * dz + r * constant, where dz is the change in depth
     * relative to the screen area of the triangle, and r is the smallest value that is guaranteed
     * to produce a resolvable offset for a given implementation. This offset is added before the
     * depth test.
     *
     * @remarks Warning: using a polygon offset other than zero has a significant negative
     * performance impact, as most implementations have to disable early depth culling. DO NOT USE
     * unless absolutely necessary.
     *
     * @param scale scale factor used to create a variable depth offset for each triangle
     * @param constant scale factor used to create a constant depth offset for each triangle
     */
    public setPolygonOffset(scale: number, constant: number): void;
    /**
     * Overrides the minimum alpha value a fragment must have to not be discarded when the blend
     * mode is MASKED. Defaults to 0.4 if it has not been set in the parent Material. The specified
     * value should be between 0 and 1 and will be clamped if necessary.
     */
    public setMaskThreshold(threshold: number): void;
    /**
     * Gets the minimum alpha value a fragment must have to not be discarded when the blend mode is
     * MASKED
     */
    public getMaskThreshold(): number;
    /**
     * Sets the screen space variance of the filter kernel used when applying specular
     * anti-aliasing. The default value is set to 0.15. The specified value should be between 0 and
     * 1 and will be clamped if necessary.
     */
    public setSpecularAntiAliasingVariance(variance: number): void;
    /**
     * Gets the screen space variance of the filter kernel used when applying specular
     * anti-aliasing.
     */
    public getSpecularAntiAliasingVariance(): number;
    /**
     * Sets the clamping threshold used to suppress estimation errors when applying specular
     * anti-aliasing. The default value is set to 0.2. The specified value should be between 0 and
     * 1 and will be clamped if necessary.
     */
    public setSpecularAntiAliasingThreshold(threshold: number): void;
    /**
     * Gets the clamping threshold used to suppress estimation errors when applying specular
     * anti-aliasing.
     */
    public getSpecularAntiAliasingThreshold(): number;
    /**
     * Enables or disables double-sided lighting if the parent Material has double-sided
     * capability, otherwise prints a warning. If double-sided lighting is enabled, backface
     * culling is automatically disabled.
     */
    public setDoubleSided(doubleSided: boolean): void;
    /**
     * Returns whether double-sided lighting is enabled when the parent Material has double-sided
     * capability.
     */
    public isDoubleSided(): boolean;
    /** Specifies how transparent objects should be rendered (default is DEFAULT). */
    public setTransparencyMode(mode: TransparencyMode): void;
    /** Returns the transparency mode. */
    public getTransparencyMode(): TransparencyMode;
    /** Overrides the default triangle culling state that was set on the material. */
    public setCullingMode(culling: CullingMode): void;
    /**
     * Overrides the default triangle culling state that was set on the material separately for the
     * color and shadow passes
     */
    public setCullingMode(colorPassCullingMode: CullingMode, shadowPassCullingMode: CullingMode): void;
    /** Returns the face culling mode. */
    public getCullingMode(): CullingMode;
    /** Returns the face culling mode for the shadow passes. */
    public getShadowCullingMode(): CullingMode;
    /** Overrides the default color-buffer write state that was set on the material. */
    public setColorWrite(enable: boolean): void;
    /** Returns whether color write is enabled. */
    public isColorWriteEnabled(): boolean;
    /** Overrides the default depth-buffer write state that was set on the material. */
    public setDepthWrite(enable: boolean): void;
    /** Returns whether depth write is enabled. */
    public isDepthWriteEnabled(): boolean;
    /** Overrides the default depth testing state that was set on the material. */
    public setDepthCulling(enable: boolean): void;
    /** Overrides the default depth function state that was set on the material. */
    public setDepthFunc(depthFunc: SamplerCompareFunc): void;
    /** Returns the depth function state. */
    public getDepthFunc(): SamplerCompareFunc;
    /** Returns whether depth culling is enabled. */
    public isDepthCullingEnabled(): boolean;
    /** Overrides the default stencil-buffer write state that was set on the material. */
    public setStencilWrite(enable: boolean): void;
    /** Returns whether stencil write is enabled. */
    public isStencilWriteEnabled(): boolean;
    /**
     * Sets the stencil comparison function (default is StencilCompareFunc::A).
     *
     * It's possible to set separate stencil comparison functions; one for front-facing polygons,
     * and one for back-facing polygons. The face parameter determines the comparison function(s)
     * updated by this call.
     */
    public setStencilCompareFunction(func: SamplerCompareFunc, face?: StencilFace): void;
    /**
     * Sets the stencil fail operation (default is StencilOperation::KEEP).
     *
     * The stencil fail operation is performed to update values in the stencil buffer when the
     * stencil test fails.
     *
     * It's possible to set separate stencil fail operations; one for front-facing polygons, and
     * one for back-facing polygons. The face parameter determines the stencil fail operation(s)
     * updated by this call.
     */
    public setStencilOpStencilFail(op: StencilOperation, face?: StencilFace): void;
    /**
     * Sets the depth fail operation (default is StencilOperation::KEEP).
     *
     * The depth fail operation is performed to update values in the stencil buffer when the depth
     * test fails.
     *
     * It's possible to set separate depth fail operations; one for front-facing polygons, and one
     * for back-facing polygons. The face parameter determines the depth fail operation(s) updated
     * by this call.
     */
    public setStencilOpDepthFail(op: StencilOperation, face?: StencilFace): void;
    /**
     * Sets the depth-stencil pass operation (default is StencilOperation::KEEP).
     *
     * The depth-stencil pass operation is performed to update values in the stencil buffer when
     * both the stencil test and depth test pass.
     *
     * It's possible to set separate depth-stencil pass operations; one for front-facing polygons,
     * and one for back-facing polygons. The face parameter determines the depth-stencil pass
     * operation(s) updated by this call.
     */
    public setStencilOpDepthStencilPass(op: StencilOperation, face?: StencilFace): void;
    /**
     * Sets the stencil reference value (default is 0).
     *
     * The stencil reference value is the left-hand side for stencil comparison tests. It's also
     * used as the replacement stencil value when StencilOperation is REPLACE.
     *
     * It's possible to set separate stencil reference values; one for front-facing polygons, and
     * one for back-facing polygons. The face parameter determines the reference value(s) updated
     * by this call.
     */
    public setStencilReferenceValue(value: number, face?: StencilFace): void;
    /**
     * Sets the stencil read mask (default is 0xFF).
     *
     * The stencil read mask masks the bits of the values participating in the stencil comparison
     * test- both the value read from the stencil buffer and the reference value.
     *
     * It's possible to set separate stencil read masks; one for front-facing polygons, and one for
     * back-facing polygons. The face parameter determines the stencil read mask(s) updated by this
     * call.
     */
    public setStencilReadMask(readMask: number, face?: StencilFace): void;
    /**
     * Sets the stencil write mask (default is 0xFF).
     *
     * The stencil write mask masks the bits in the stencil buffer updated by stencil operations.
     *
     * It's possible to set separate stencil write masks; one for front-facing polygons, and one
     * for back-facing polygons. The face parameter determines the stencil write mask(s) updated by
     * this call.
     */
    public setStencilWriteMask(writeMask: number, face?: StencilFace): void;
    /**
     * PostProcess and compute domain material instance must be commited manually. This call has no
     * effect on surface domain materials.
     *
     * @param engine Filament engine
     */
    public commit(engine: Engine): void;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * - The `JitShaderProvider` implementation generates materials at run time (which can be slow)
 * and requires the filamat library, but produces streamlined shaders. See
 * createJitShaderProvider().
 *
 * - The `UbershaderProvider` implementation uses a small number of pre-built materials with
 * complex fragment shaders, but does not require any run time work or usage of filamat. See
 * createUbershaderProvider().
 *
 * Both implementations of MaterialProvider maintain a small cache of materials which must be
 * explicitly freed using destroyMaterials(). These materials are not freed automatically when
 * the MaterialProvider is destroyed, which allows clients to take ownership if desired.
 */
export class MaterialProvider {
    /** Gets the number of cached materials. */
    public getMaterialsCount(): number;
    /**
     * Destroys all cached materials.
     *
     * This is not called automatically when MaterialProvider is destroyed, which allows clients to
     * take ownership of the cache if desired.
     */
    public destroyMaterials(): void;
    /**
     * Returns true if the presence of the given vertex attribute is required.
     *
     * Some types of providers (e.g. ubershader) require dummy attribute values if the glTF model
     * does not provide them.
     */
    public needsDummyData(attrib: VertexAttribute): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * A container for vertex morphing data that supports both automatic and manual morphing.
 *
 * MorphTargetBuffer operates in a hybrid model depending on the attribute being morphed:
 *
 * 1. Automatic for Built-ins (positions/tangents): Enable via `withPositions(true)` or
 * `withTangents(true)`. The MorphTargetBuffer will allocate internal storage and hold the data
 * for these attributes, which you upload via `setPositionsAt()` or `setTangentsAt()`. The
 * framework automatically applies the morphing logic in the vertex shader.
 *
 * 2. Manual for Custom Data (e.g., UVs, colors): The MorphTargetBuffer does NOT hold data for
 * custom targets. The user is responsible for the full data pipeline: - Create and manage a
 * separate `Texture` to hold the morph target data (offsets). - In the material, declare a
 * `sampler2d_array` parameter. - Bind the `Texture` to the material instance. - In the vertex
 * shader, manually call `morphData2`, `morphData3`, or `morphData4` with the custom sampler to
 * apply the morphing.
 *
 * A MorphTargetBuffer object must be associated with a Renderable via
 * `RenderableManager::Builder::morphing()` to enable the morphing pipeline for all cases.
 * @see RenderableManager
 */
export class MorphTargetBuffer {
    /**
     * Updates positions for the given morph target.
     *
     * This method can only be called if the MorphTargetBuffer was built with
     * `withPositions(true)`. This is equivalent to the float4 method, but uses 1.0 for the 4th
     * component.
     *
     * @param engine Reference to the filament::Engine associated with this MorphTargetBuffer.
     * @param targetIndex the index of morph target to be updated.
     * @param positions pointer to at least "count" positions
     * @param count number of float3 vectors in positions
     * @param offset offset into the target buffer, expressed as a number of float3 vectors
     */
    public setPositionsAtLong(engine: Engine, targetIndex: number, positions: float3, count: number, offset?: number): void;
    /**
     * Updates positions for the given morph target.
     *
     * This method can only be called if the MorphTargetBuffer was built with
     * `withPositions(true)`.
     *
     * @param engine Reference to the filament::Engine associated with this MorphTargetBuffer.
     * @param targetIndex the index of morph target to be updated.
     * @param positions pointer to at least "count" positions
     * @param count number of float4 vectors in positions
     * @param offset offset into the target buffer, expressed as a number of float4 vectors
     */
    public setPositionsAtFloat4(engine: Engine, targetIndex: number, positions: float4, count: number, offset?: number): void;
    /**
     * Updates tangents for the given morph target.
     *
     * This method can only be called if the MorphTargetBuffer was built with `withTangents(true)`.
     * These quaternions must be represented as signed shorts, where real numbers in the [-1,+1]
     * range multiplied by 32767.
     *
     * @param engine Reference to the filament::Engine associated with this MorphTargetBuffer.
     * @param targetIndex the index of morph target to be updated.
     * @param tangents pointer to at least "count" tangents
     * @param count number of short4 quaternions in tangents
     * @param offset offset into the target buffer, expressed as a number of short4 vectors
     */
    public setTangentsAt(engine: Engine, targetIndex: number, tangents: float4, count: number, offset?: number): void;
    /**
     * Returns the vertex count of this MorphTargetBuffer.
     *
     * @returns The number of vertices the MorphTargetBuffer holds.
     */
    public getVertexCount(): number;
    /**
     * Returns the target count of this MorphTargetBuffer.
     *
     * @returns The number of targets the MorphTargetBuffer holds.
     */
    public getCount(): number;
    /**
     * Returns true if this MorphTargetBuffer has a position buffer.
     * @see Builder::withPositions
     */
    public hasPositions(): boolean;
    /**
     * Returns true if this MorphTargetBuffer has a tangent buffer.
     * @see Builder::withTangents
     */
    public hasTangents(): boolean;
    /**
     * Returns true if custom morphing is enabled
     * @see Builder::enableCustomMorphing
     */
    public isCustomMorphingEnabled(): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

export class MorphTargetBuffer$Builder {
    constructor();
    /**
     * Size of the morph targets in vertex counts.
     *
     * @param vertexCount Number of vertex counts the morph targets can hold.
     * @returns A reference to this Builder for chaining calls.
     */
    public vertexCount(vertexCount: number): MorphTargetBuffer$Builder;
    /**
     * Size of the morph targets in targets.
     *
     * @param count Number of targets the morph targets can hold.
     * @returns A reference to this Builder for chaining calls.
     */
    public count(count: number): MorphTargetBuffer$Builder;
    /**
     * Associate an optional name with this MorphTargetBuffer for debugging purposes.
     *
     * name will show in error messages and should be kept as short as possible. The name is
     * truncated to a maximum of 128 characters.
     *
     * The name string is copied during this method so clients may free its memory after the
     * function returns.
     *
     * @deprecated Use name(utils::StaticString const & ) instead.
     *
     * @param name A string to identify this MorphTargetBuffer
     * @param len Length of name, should be less than or equal to 128
     * @returns This Builder, for chaining calls.
     */
    public name(name: string, len: number): MorphTargetBuffer$Builder;
    /**
     * Enables and allocates the built-in buffer for position morphing.
     *
     * If enabled, `setPositionsAt` can be called to set the position data for each target. The
     * vertex position will be morphed automatically without any further actions.
     *
     * @param enable true to enable, false to disable. Default is true.
     * @returns A reference to this Builder for chaining calls.
     */
    public withPositions(enable?: boolean): MorphTargetBuffer$Builder;
    /**
     * Enables and allocates the built-in buffer for tangent/normal morphing.
     *
     * If enabled, `setTangentsAt` can be called to set the tangent data for each target. The
     * vertex position will be morphed automatically without any further actions.
     *
     * @param enable true to enable, false to disable. Default is true.
     * @returns A reference to this Builder for chaining calls.
     */
    public withTangents(enable?: boolean): MorphTargetBuffer$Builder;
    /**
     * Enables the custom morphing pipeline.
     *
     * When enabled, the `morphData2`, `morphData3`, and `morphData4` helper functions are
     * available in the vertex shader. You must provide a 2D array texture containing the morph
     * deltas, bind it to a `sampler2DArray` uniform, and call the appropriate `morphData` function
     * to apply the morphing to your custom attributes.
     *
     * Note: Unlike `withPositions` or `withTangents`, this does NOT allocate any internal storage.
     * You are responsible for managing the morph data texture.
     *
     * Custom morphing can be used together with automatic position and/or tangent morphing.
     *
     * @param enable true to enable, false to disable. Default is false.
     * @returns A reference to this Builder for chaining calls.
     */
    public enableCustomMorphing(enable: boolean): MorphTargetBuffer$Builder;
    /**
     * Creates the MorphTargetBuffer object and returns a pointer to it.
     *
     * @param engine Reference to the filament::Engine to associate this MorphTargetBuffer with.
     * @returns pointer to the newly created object.
     */
    public build(engine: Engine): MorphTargetBuffer;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * To access the name of an existing entity, clients should first use NameComponentManager to
 * get a temporary handle called an instance. Please note that instances are ephemeral; clients
 * should store entities, not instances.
 *
 * Usage example:
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ auto names = new
 * NameComponentManager(EntityManager::get()); names->addComponent(myEntity);
 * names->setName(names->getInstance(myEntity), "Jeanne d'Arc"); ... printf("%s\n",
 * names->getName(names->getInstance(myEntity));
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export class NameComponentManager {
    /**
     * Gets a temporary handle that can be used to access the name.
     *
     * @returns Non-zero handle if the entity has a name component, 0 otherwise.
     */
    public getInstance(e: Entity): number;
    /** Adds a name component to the given entity if it doesn't already exist. */
    public addComponent(e: Entity): void;
    /** Removes the name component to the given entity if it exists. */
    public removeComponent(e: Entity): void;
    /** Destroys the name component of the given entity. */
    public destroyComponents(entities: Entity, count: number): void;
    public destroy(e: Entity): void;
    /** Stores a copy of the given string and associates it with the given instance. */
    public setName(instance: number, name: string): void;
    /**
     * Retrieves the string associated with the given instance, or nullptr if none exists.
     *
     * @returns pointer to the copy that was made during setName()
     */
    public getName(instance: number): string;
    public gc(): void;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * NodeManager is used to add annotate entities with glTF-specific information.
 *
 * Node components are created by gltfio and exposed to users to allow inspection.
 *
 * Nodes do not store the glTF hierarchy or names; see TransformManager and
 * NameComponentManager.
 */
export class NodeManager {
    /**
     * Returns whether a particular Entity is associated with a component of this NodeManager
     *
     * @param e An Entity.
     * @returns true if this Entity has a component associated with this manager.
     */
    public hasComponent(e: Entity): boolean;
    /**
     * Gets an Instance representing the node component associated with the given Entity.
     *
     * @remarks Use Instance::isValid() to make sure the component exists.
     *
     * @param e An Entity.
     * @returns An Instance object, which represents the node component associated with the Entity
     * e.
     * @see hasComponent()
     */
    public getInstance(e: Entity): number;
    /**
     * Creates a node component and associates it with the given entity.
     *
     * If this component already exists on the given entity, it is first destroyed as if
     * destroy(Entity e) was called.
     *
     * @param entity An Entity to associate a node component with.
     * @see destroy()
     */
    public create(entity: Entity): void;
    /**
     * Destroys this component from the given entity.
     *
     * @param e An entity.
     * @see create()
     */
    public destroy(e: Entity): void;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Platform is an interface that abstracts how the backend (also referred to as Driver) is
 * created. The backend provides several common Platform concrete implementations, which are
 * selected automatically. It is possible however to provide a custom Platform when creating
 * the filament Engine.
 */
export class Platform {
    /**
     * Queries the underlying OS version.
     *
     * @returns The OS version.
     */
    public getOSVersion(): number;
    /**
     * Processes the platform's event queue when called from its primary event-handling thread.
     *
     * Internally, Filament might need to call this when waiting on a fence. It is only implemented
     * on platforms that need it, such as macOS + OpenGL. Returns false if this is not the main
     * thread, or if the platform does not need to perform any special processing.
     */
    public pumpEvents(): boolean;
    /**
     * Whether this platform supports compositor timing querying.
     *
     * @returns true if this Platform supports compositor timings, false otherwise [default]
     * @see queryCompositorTiming()
     * @see setPresentFrameId()
     * @see queryFrameTimestamps
     */
    public isCompositorTimingSupported(): boolean;
    /** @returns true if insertBlob is valid. */
    public hasInsertBlobFunc(): boolean;
    /** @returns true if retrieveBlob is valid. */
    public hasRetrieveBlobFunc(): boolean;
    /** @returns true if either of insertBlob or retrieveBlob are valid. */
    public hasBlobFunc(): boolean;
    /** @returns true if debugUpdateStat is valid. */
    public hasDebugUpdateStatFunc(): boolean;
    /**
     * To track backend-specific statistics, the backend implementation can call the
     * application-provided callback function debugUpdateStatFunc to associate or update a value
     * with a given key. It is possible for this function to be called multiple times with the same
     * key, in which case newer values should overwrite older values.
     *
     * This function can be called on either the Filament main thread or the Filament driver
     * thread.
     *
     * @param key a null-terminated C-string with the key of the debug statistic
     * @param intValue the updated integer value of key (the string value passed to the callback
     *     will be empty)
     */
    public debugUpdateStat(key: string, intValue: number): void;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

export class Platform$ExternalImage {

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

export class Platform$ExternalImageHandle {
    constructor();
    public equals(rhs: Platform$ExternalImageHandle): boolean;
    public get(): Platform$ExternalImage;
    public clear(): void;
    public reset(p: Platform$ExternalImage): void;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** Raster state descriptor */
export class RasterState {
    constructor();
    public equals(rhs: RasterState): boolean;
    public notEquals(rhs: RasterState): boolean;
    public disableBlending(): void;
    public hasBlending(): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * An offscreen render target that can be associated with a View and contains weak references
 * to a set of attached Texture objects.
 *
 * RenderTarget is intended to be used with the View's post-processing disabled for the most
 * part. especially when a DEPTH attachment is also used (see Builder::texture()).
 *
 * Custom RenderTarget are ultimately intended to render into textures that might be used
 * during the main render pass.
 *
 * Clients are responsible for the lifetime of all associated Texture attachments.
 * @see View
 */
export class RenderTarget {
    /**
     * Gets the texture set on the given attachment point
     *
     * @param attachment Attachment point
     * @returns A Texture object or nullptr if no texture is set for this attachment point
     */
    public getTexture(attachment: RenderTarget$AttachmentPoint): Texture;
    /**
     * Returns the mipmap level set on the given attachment point
     *
     * @param attachment Attachment point
     * @returns the mipmap level set on the given attachment point
     */
    public getMipLevel(attachment: RenderTarget$AttachmentPoint): number;
    /**
     * Returns the face of a cubemap set on the given attachment point
     *
     * @param attachment Attachment point
     * @returns A cubemap face identifier. This is only relevant if the attachment's texture is a
     * cubemap.
     */
    public getFace(attachment: RenderTarget$AttachmentPoint): TextureCubemapFace;
    /**
     * Returns the texture-layer set on the given attachment point
     *
     * @param attachment Attachment point
     * @returns A texture layer. This is only relevant if the attachment's texture is a 3D texture.
     */
    public getLayer(attachment: RenderTarget$AttachmentPoint): number;
    /**
     * Returns the number of color attachments usable by this instance of Engine. This method is
     * guaranteed to return at least MIN_SUPPORTED_COLOR_ATTACHMENTS_COUNT and at most
     * MAX_SUPPORTED_COLOR_ATTACHMENTS_COUNT.
     *
     * @returns Number of color attachments usable in a render target.
     */
    public getSupportedColorAttachmentsCount(): number;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** Use Builder to construct a RenderTarget object instance */
export class RenderTarget$Builder {
    constructor();
    /**
     * Sets a texture to a given attachment point.
     *
     * When using a DEPTH attachment, it is important to always disable post-processing in the
     * View. Failing to do so will cause the DEPTH attachment to be ignored in most cases.
     *
     * When the intention is to keep the content of the DEPTH attachment after rendering,
     * Usage::SAMPLEABLE must be set on the DEPTH attachment, otherwise the content of the DEPTH
     * buffer may be discarded.
     *
     * @param attachment The attachment point of the texture.
     * @param texture The associated texture object.
     * @returns A reference to this Builder for chaining calls.
     */
    public texture(attachment: RenderTarget$AttachmentPoint, texture: Texture): RenderTarget$Builder;
    /**
     * Sets the mipmap level for a given attachment point.
     *
     * @param attachment The attachment point of the texture.
     * @param level The associated mipmap level, 0 by default.
     * @returns A reference to this Builder for chaining calls.
     */
    public mipLevel(attachment: RenderTarget$AttachmentPoint, level: number): RenderTarget$Builder;
    /**
     * Sets the face for cubemap textures at the given attachment point.
     *
     * @param attachment The attachment point.
     * @param face The associated cubemap face.
     * @returns A reference to this Builder for chaining calls.
     */
    public face(attachment: RenderTarget$AttachmentPoint, face: TextureCubemapFace): RenderTarget$Builder;
    /**
     * Sets an index of a single layer for 2d array, cubemap array, and 3d textures at the given
     * attachment point.
     *
     * For cubemap array textures, layer is translated into an array index and face according to -
     * index: layer / 6 - face: layer % 6
     *
     * @param attachment The attachment point.
     * @param layer The associated cubemap layer.
     * @returns A reference to this Builder for chaining calls.
     */
    public layer(attachment: RenderTarget$AttachmentPoint, layer: number): RenderTarget$Builder;
    /**
     * Sets the starting index of the 2d array textures for multiview at the given attachment
     * point.
     *
     * This requires COLOR and DEPTH attachments (if set) to be of 2D array textures.
     *
     * @param attachment The attachment point.
     * @param layerCount The number of layers used for multiview, starting from baseLayer.
     * @param baseLayer The starting index of the 2d array texture.
     * @returns A reference to this Builder for chaining calls.
     */
    public multiview(attachment: RenderTarget$AttachmentPoint, layerCount: number, baseLayer?: number): RenderTarget$Builder;
    /**
     * Sets the number of samples used for MSAA (Multisample Anti-Aliasing).
     *
     * @param samples The number of samples used for multisampling.
     * @returns A reference to this Builder for chaining calls.
     */
    public samples(samples: number): RenderTarget$Builder;
    /**
     * Creates the RenderTarget object and returns a pointer to it.
     *
     * @returns pointer to the newly created object.
     */
    public build(engine: Engine): RenderTarget;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Factory and manager for renderables, which are entities that can be drawn.
 *
 * Renderables are bundles of primitives, each of which has its own geometry and material. All
 * primitives in a particular renderable share a set of rendering attributes, such as whether
 * they cast shadows or use vertex skinning.
 *
 * Usage example:
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ auto renderable =
 * utils::EntityManager::get().create();
 *
 * RenderableManager::Builder(1) .boundingBox({{ -1, -1, -1 }, { 1, 1, 1 }}) .material(0,
 * matInstance) .geometry(0, RenderableManager::PrimitiveType::TRIANGLES, vertBuffer,
 * indBuffer, 0, 3) .receiveShadows(false) .build(engine, renderable);
 *
 * scene->addEntity(renderable); ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * To modify the state of an existing renderable, clients should first use RenderableManager to
 * get a temporary handle called an instance. The instance can then be used to get or set the
 * renderable's state. Please note that instances are ephemeral; clients should store entities,
 * not instances.
 *
 * - For details about constructing renderables, see RenderableManager::Builder. - To associate
 * a 4x4 transform with an entity, see TransformManager. - To associate a human-readable label
 * with an entity, see utils::NameComponentManager.
 */
export class RenderableManager {
    /** Checks if the given entity already has a renderable component. */
    public hasComponent(e: Entity): boolean;
    /**
     * Gets a temporary handle that can be used to access the renderable state.
     *
     * @returns Non-zero handle if the entity has a renderable component, 0 otherwise.
     */
    public getInstance(e: Entity): number;
    /** @returns the number of Components */
    public getComponentCount(): number;
    /** @returns true if the this manager has no components */
    public empty(): boolean;
    /**
     * Retrieve the `Entity` of the component from its `Instance`.
     *
     * @param i Instance of the component obtained from getInstance()
     */
    public getEntity(i: number): Entity;
    /**
     * Retrieve the Entities of all the components of this manager.
     *
     * @returns A list, in no particular order, of all the entities managed by this manager.
     */
    public getEntities(): Entity;
    /** Destroys the renderable component in the given entity. */
    public destroy(e: Entity): void;
    /**
     * Changes the bounding box used for frustum culling. The renderable must not have
     * staticGeometry enabled.
     * @see Builder::boundingBox()
     * @see RenderableManager::getAxisAlignedBoundingBox()
     */
    public setAxisAlignedBoundingBox(instance: number, aabb: Box): void;
    /**
     * Gets the bounding box used for frustum culling.
     * @see Builder::boundingBox()
     * @see RenderableManager::setAxisAlignedBoundingBox()
     */
    public getAxisAlignedBoundingBox(instance: number): Box;
    /**
     * Changes the visibility bits.
     * @see Builder::layerMask()
     * @see View::setVisibleLayers().
     * @see RenderableManager::getLayerMask()
     */
    public setLayerMask(instance: number, select: number, values: number): void;
    /**
     * Get the visibility bits.
     * @see Builder::layerMask()
     * @see View::setVisibleLayers().
     * @see RenderableManager::getLayerMask()
     */
    public getLayerMask(instance: number): number;
    /**
     * Changes the coarse-level draw ordering.
     * @see Builder::priority().
     */
    public setPriority(instance: number, priority: number): void;
    /**
     * Get the coarse-level draw ordering.
     * @see Builder::priority().
     */
    public getPriority(instance: number): number;
    /**
     * Changes the channel a renderable is associated to.
     * @see Builder::channel().
     */
    public setChannel(instance: number, channel: number): void;
    /**
     * Get the channel a renderable is associated to.
     * @see Builder::channel().
     */
    public getChannel(instance: number): number;
    /**
     * Changes whether or not frustum culling is on.
     * @see Builder::culling()
     */
    public setCulling(instance: number, enable: boolean): void;
    /**
     * Get whether or not frustum culling is on.
     * @see Builder::culling()
     */
    public isCullingEnabled(instance: number): boolean;
    /**
     * Changes whether or not the large-scale fog is applied to this renderable
     * @see Builder::fog()
     */
    public setFogEnabled(instance: number, enable: boolean): void;
    /**
     * Returns whether large-scale fog is enabled for this renderable.
     *
     * @returns True if fog is enabled for this renderable.
     * @see Builder::fog()
     */
    public getFogEnabled(instance: number): boolean;
    /**
     * Enables or disables a light channel. Light channel 0 is enabled by default.
     * @see Builder::lightChannel()
     */
    public setLightChannel(instance: number, channel: number, enable: boolean): void;
    /**
     * Returns whether a light channel is enabled on a specified renderable.
     *
     * @param instance Instance of the component obtained from getInstance().
     * @param channel Light channel to query
     * @returns true if the light channel is enabled, false otherwise
     */
    public getLightChannel(instance: number, channel: number): boolean;
    /**
     * Changes whether or not the renderable casts shadows.
     * @see Builder::castShadows()
     */
    public setCastShadows(instance: number, enable: boolean): void;
    /**
     * Changes whether or not the renderable can receive shadows.
     * @see Builder::receiveShadows()
     */
    public setReceiveShadows(instance: number, enable: boolean): void;
    /**
     * Changes whether or not the renderable can use screen-space contact shadows.
     * @see Builder::screenSpaceContactShadows()
     */
    public setScreenSpaceContactShadows(instance: number, enable: boolean): void;
    /**
     * Checks if the renderable can cast shadows.
     * @see Builder::castShadows().
     */
    public isShadowCaster(instance: number): boolean;
    /**
     * Checks if the renderable can receive shadows.
     * @see Builder::receiveShadows().
     */
    public isShadowReceiver(instance: number): boolean;
    /**
     * Checks if the renderable can use screen-space contact shadows.
     * @see Builder::screenSpaceContactShadows().
     */
    public isScreenSpaceContactShadowsEnabled(instance: number): boolean;
    public setBones(instance: number, transforms: mat4, boneCount?: number, offset?: number): void;
    /**
     * Associates a region of a SkinningBuffer to a renderable instance
     *
     * Note: due to hardware limitations offset + 256 must be smaller or equal to
     * skinningBuffer->getBoneCount()
     *
     * @param instance Instance of the component obtained from getInstance().
     * @param skinningBuffer skinning buffer to associate to the instance
     * @param count Size of the region in bones, must be smaller or equal to 256.
     * @param offset Start offset of the region in bones
     */
    public setSkinningBuffer(instance: number, skinningBuffer: SkinningBuffer, count: number, offset: number): void;
    /**
     * Updates the vertex morphing weights on a renderable, all zeroes by default.
     *
     * The renderable must be built with morphing enabled, see Builder::morphing(). In legacy
     * morphing mode, only the first 4 weights are considered.
     *
     * @param instance Instance of the component obtained from getInstance().
     * @param weights Pointer to morph target weights to be update.
     * @param count Number of morph target weights.
     * @param offset Index of the first morph target weight to set at instance.
     */
    public setMorphWeights(instance: number, weights: number, count: number, offset?: number): void;
    /** Associates a MorphTargetBuffer to the given primitive. */
    public setMorphTargetBufferOffsetAt(instance: number, level: number, primitiveIndex: number, offset: number): void;
    /** Get a MorphTargetBuffer to the given renderable or null if it doesn't exist. */
    public getMorphTargetBuffer(instance: number): MorphTargetBuffer;
    /**
     * Gets the number of morphing in the given entity.
     * @see Builder::morphing()
     */
    public getMorphTargetCount(instance: number): number;
    /**
     * Gets the immutable number of primitives in the given renderable.
     * @see Builder::Builder(size_t count)
     */
    public getPrimitiveCount(instance: number): number;
    /**
     * Returns the number of instances for this renderable.
     *
     * @param instance Instance of the component obtained from getInstance().
     * @returns The number of instances.
     * @see Builder::instances()
     */
    public getInstanceCount(instance: number): number;
    /**
     * Changes the material instance binding for the given primitive.
     *
     * The MaterialInstance's material must have a feature level equal or lower to the engine's
     * selected feature level.
     * @see Builder::material()
     * @see Engine::setActiveFeatureLevel
     */
    public setMaterialInstanceAt(instance: number, primitiveIndex: number, materialInstance: MaterialInstance): void;
    /**
     * Clear the MaterialInstance for the given primitive.
     *
     * @param instance Renderable's instance
     * @param primitiveIndex Primitive index
     */
    public clearMaterialInstanceAt(instance: number, primitiveIndex: number): void;
    /** Retrieves the material instance that is bound to the given primitive. */
    public getMaterialInstanceAt(instance: number, primitiveIndex: number): MaterialInstance;
    /**
     * Changes the geometry for the given primitive.
     * @see Builder::geometry()
     */
    public setGeometryAt(instance: number, primitiveIndex: number, type: PrimitiveType, vertices: VertexBuffer, indices: IndexBuffer, offset: number, count: number): void;
    /**
     * Changes the geometry for the given primitive. (non-indexed version)
     * @see Builder::geometry()
     */
    public setGeometryAt(instance: number, primitiveIndex: number, type: PrimitiveType, vertices: VertexBuffer, offset: number, count: number): void;
    /**
     * Changes the drawing order for blended primitives. The drawing order is either global or
     * local (default) to this Renderable. In either case, the Renderable priority takes
     * precedence.
     *
     * @param instance the renderable of interest
     * @param primitiveIndex the primitive of interest
     * @param order draw order number (0 by default). Only the lowest 15 bits are used.
     * @see Builder::blendOrder(), setGlobalBlendOrderEnabledAt()
     */
    public setBlendOrderAt(instance: number, primitiveIndex: number, order: number): void;
    /**
     * Get the drawing order for blended primitives.
     *
     * @param instance the renderable of interest
     * @param primitiveIndex the primitive of interest
     * @see Builder::blendOrder(), setGlobalBlendOrderEnabledAt()
     */
    public getBlendOrderAt(instance: number, primitiveIndex: number): number;
    /**
     * Changes whether the blend order is global or local to this Renderable (by default).
     *
     * @param instance the renderable of interest
     * @param primitiveIndex the primitive of interest
     * @param enabled true for global, false for local blend ordering.
     * @see Builder::globalBlendOrderEnabled(), setBlendOrderAt()
     */
    public setGlobalBlendOrderEnabledAt(instance: number, primitiveIndex: number, enabled: boolean): void;
    /**
     * Get whether the blend order is global or local to this Renderable (by default).
     *
     * @param instance the renderable of interest
     * @param primitiveIndex the primitive of interest
     * @see Builder::globalBlendOrderEnabled(), setBlendOrderAt()
     */
    public isGlobalBlendOrderEnabledAt(instance: number, primitiveIndex: number): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** Adds renderable components to entities using a builder pattern. */
export class RenderableManager$Builder {
    /**
     * Specifies the geometry data for a primitive.
     *
     * Associates a vertex buffer and an index buffer with a primitive. Typically, each primitive
     * is specified with a pair of daisy-chained calls: `geometry(...)` and `material(...).`
     *
     * @param index zero-based index of the primitive, must be less than the count passed to
     *     Builder constructor
     * @param type specifies the topology of the primitive (e.g.,
     *     `RenderableManager::PrimitiveType::TRIANGLES)`
     * @param vertices specifies the vertex buffer, which in turn specifies a set of attributes
     * @param indices specifies the index buffer (either u16 or u32)
     * @param offset specifies where in the index buffer to start reading (expressed as a number of
     *     indices)
     * @param minIndex specifies the minimum index contained in the index buffer
     * @param maxIndex specifies the maximum index contained in the index buffer
     * @param count number of indices to read (for triangles, this should be a multiple of 3)
     */
    public geometry(index: number, type: PrimitiveType, vertices: VertexBuffer, indices: IndexBuffer, offset: number, minIndex: number, maxIndex: number, count: number): RenderableManager$Builder;
    public geometry(index: number, type: PrimitiveType, vertices: VertexBuffer, indices: IndexBuffer, offset: number, count: number): RenderableManager$Builder;
    public geometry(index: number, type: PrimitiveType, vertices: VertexBuffer, indices: IndexBuffer): RenderableManager$Builder;
    /**
     * Specifies the geometry data for a primitive. (non-indexed version)
     *
     * Filament primitives normally have an associated vertex buffer and index buffer. Typically,
     * each primitive is specified with a pair of daisy-chained calls: `geometry(...)` and
     * `material(...).`
     *
     * Non-indexed rendering: when `indices` is not provided, the primitive is treated as a
     * non-indexed draw and `offset` / `count` refer to vertex offset and vertex count
     * respectively.
     *
     * Attribute-less rendering: This can be used for procedural rendering, where the vertex shader
     * generates positions, UVs, etc procedurally, typically from `gl_VertexIndex` / `gl_VertexID`
     * / and `[[vertex_id]],` which can be accessed by calling `getVertexIndex()` in vertex shader.
     * The associated VertexBuffer may have `bufferCount` == 0 with no declared attributes (see
     * `VertexBuffer::Builder).` Attribute-less rendering requires `FEATURE_LEVEL_1` or higher as
     * GLES2 has no `gl_VertexID` and is incompatible with skinning and morphing.
     *
     * @param index zero-based index of the primitive, must be less than the count passed to
     *     Builder constructor
     * @param type specifies the topology of the primitive (e.g.,
     *     `RenderableManager::PrimitiveType::TRIANGLES)`
     * @param vertices specifies the vertex buffer, which in turn specifies a set of attributes
     * @param offset specifies where in the vertex buffer to start reading (expressed as a number
     *     of vertices)
     * @param count number of vertices to read (for triangles, this should be a multiple of 3)
     */
    public geometry(index: number, type: PrimitiveType, vertices: VertexBuffer, offset: number, count: number): RenderableManager$Builder;
    public geometry(index: number, type: PrimitiveType, vertices: VertexBuffer): RenderableManager$Builder;
    /**
     * Specify the type of geometry for this renderable. DYNAMIC geometry has no restriction,
     * STATIC_BOUNDS geometry means that both the bounds and the world-space transform of the
     * renderable are immutable. STATIC geometry has the same restrictions as STATIC_BOUNDS, but in
     * addition disallows skinning, morphing and changing the VertexBuffer or IndexBuffer in any
     * way.
     *
     * @param type type of geometry.
     */
    public geometryType(type: RenderableManager$Builder$GeometryType): RenderableManager$Builder;
    /**
     * Binds a material instance to the specified primitive.
     *
     * If no material is specified for a given primitive, Filament will fall back to a basic
     * default material.
     *
     * The MaterialInstance's material must have a feature level equal or lower to the engine's
     * selected feature level.
     *
     * @param index zero-based index of the primitive, must be less than the count passed to
     *     Builder constructor
     * @param materialInstance the material to bind
     * @see Engine::setActiveFeatureLevel
     */
    public material(index: number, materialInstance: MaterialInstance): RenderableManager$Builder;
    /**
     * The axis-aligned bounding box of the renderable.
     *
     * This is an object-space AABB used for frustum culling. For skinning and morphing, this
     * should encompass all possible vertex positions. It is mandatory unless culling is disabled
     * for the renderable.
     * @see computeAABB()
     */
    public boundingBox(axisAlignedBoundingBox: Box): RenderableManager$Builder;
    /**
     * Sets bits in a visibility mask. By default, this is 0x1.
     *
     * This feature provides a simple mechanism for hiding and showing groups of renderables in a
     * Scene. See View::setVisibleLayers().
     *
     * For example, to set bit 1 and reset bits 0 and 2 while leaving all other bits unaffected,
     * do: `builder.layerMask(7, 2)`.
     *
     * To change this at run time, see RenderableManager::setLayerMask.
     *
     * @param select the set of bits to affect
     * @param values the replacement values for the affected bits
     */
    public layerMask(select: number, values: number): RenderableManager$Builder;
    /**
     * Provides coarse-grained control over draw order.
     *
     * In general Filament reserves the right to re-order renderables to allow for efficient
     * rendering. However clients can control ordering at a coarse level using priority. The
     * priority is applied separately for opaque and translucent objects, that is, opaque objects
     * are always drawn before translucent objects regardless of the priority.
     *
     * For example, this could be used to draw a semitransparent HUD on top of everything, without
     * using a separate View. Note that priority is completely orthogonal to Builder::layerMask,
     * which merely controls visibility.
     *
     * The Skybox always using the lowest priority, so it's drawn last, which may improve
     * performance.
     *
     * @param priority clamped to the range [0..7], defaults to 4; 7 is lowest priority (rendered
     *     last).
     * @returns Builder reference for chaining calls.
     * @see Builder::blendOrder()
     * @see Builder::channel()
     * @see RenderableManager::setPriority()
     * @see RenderableManager::setBlendOrderAt()
     */
    public priority(priority: number): RenderableManager$Builder;
    /**
     * Set the channel this renderable is associated to. There can be 8 channels. All renderables
     * in a given channel are rendered together, regardless of anything else. They are sorted as
     * usual within a channel. Channels work similarly to priorities, except that they enforce the
     * strongest ordering.
     *
     * Channels 0 and 1 may not have render primitives using a material with `refractionType` set
     * to `screenspace`.
     *
     * @param channel clamped to the range [0..7], defaults to 2.
     * @returns Builder reference for chaining calls.
     * @see Builder::blendOrder()
     * @see Builder::priority()
     * @see RenderableManager::setBlendOrderAt()
     * @see RenderableManager::getChannel()
     */
    public channel(channel: number): RenderableManager$Builder;
    /**
     * Controls frustum culling, true by default.
     *
     * @remarks Do not confuse frustum culling with backface culling. The latter is controlled via
     * the material.
     */
    public culling(enable: boolean): RenderableManager$Builder;
    /**
     * Enables or disables a light channel. Light channel 0 is enabled by default.
     *
     * @param channel Light channel to enable or disable, between 0 and 7.
     * @param enable Whether to enable or disable the light channel.
     */
    public lightChannel(channel: number, enable?: boolean): RenderableManager$Builder;
    /**
     * Controls if this renderable casts shadows, false by default.
     *
     * If the View's shadow type is set to ShadowType::VSM, castShadows should only be disabled if
     * either is true: - receiveShadows is also disabled - the object is guaranteed to not cast
     * shadows on itself or other objects (for example, a ground plane)
     */
    public castShadows(enable: boolean): RenderableManager$Builder;
    /** Controls if this renderable receives shadows, true by default. */
    public receiveShadows(enable: boolean): RenderableManager$Builder;
    /**
     * Controls if this renderable uses screen-space contact shadows. This is more expensive but
     * can improve the quality of shadows, especially in large scenes. (off by default).
     */
    public screenSpaceContactShadows(enable: boolean): RenderableManager$Builder;
    /**
     * Allows bones to be swapped out and shared using SkinningBuffer.
     *
     * If skinning buffer mode is enabled, clients must call setSkinningBuffer() rather than
     * setBones(). This allows sharing of data between renderables.
     *
     * @param enabled If true, enables buffer object mode. False by default.
     */
    public enableSkinningBuffers(enabled?: boolean): RenderableManager$Builder;
    /**
     * Controls if this renderable is affected by the large-scale fog.
     *
     * @param enabled If true, enables large-scale fog on this object. Disables it otherwise. True
     *     by default.
     * @returns A reference to this Builder for chaining calls.
     */
    public fog(enabled?: boolean): RenderableManager$Builder;
    /**
     * Enables GPU vertex skinning for up to 255 bones, 0 by default.
     *
     * Skinning Buffer mode must be enabled.
     *
     * Each vertex can be affected by up to 4 bones simultaneously. The attached VertexBuffer must
     * provide data in the `BONE_INDICES` slot (uvec4) and the `BONE_WEIGHTS` slot (float4).
     *
     * See also RenderableManager::setSkinningBuffer() or SkinningBuffer::setBones(), which can be
     * called on a per-frame basis to advance the animation.
     *
     * @param skinningBuffer nullptr to disable, otherwise the SkinningBuffer to use
     * @param count 0 to disable, otherwise the number of bone transforms (up to 255)
     * @param offset offset in the SkinningBuffer
     */
    public skinning(skinningBuffer: SkinningBuffer, count: number, offset: number): RenderableManager$Builder;
    /**
     * Enables GPU vertex skinning for up to 255 bones, 0 by default.
     *
     * Skinning Buffer mode must be disabled.
     *
     * Each vertex can be affected by up to 4 bones simultaneously. The attached VertexBuffer must
     * provide data in the `BONE_INDICES` slot (uvec4) and the `BONE_WEIGHTS` slot (float4).
     *
     * See also RenderableManager::setBones(), which can be called on a per-frame basis to advance
     * the animation.
     *
     * @param boneCount 0 to disable, otherwise the number of bone transforms (up to 255)
     * @param transforms the initial set of transforms (one for each bone)
     */
    public skinning(boneCount: number, transforms: mat4): RenderableManager$Builder;
    public skinning(boneCount: number): RenderableManager$Builder;
    /**
     * Define bone indices and weights "pairs" for vertex skinning as a float2. The unsigned
     * int(pair.x) defines index of the bone and pair.y is the bone weight. The pairs substitute
     * `BONE_INDICES` and the `BONE_WEIGHTS` defined in the VertexBuffer. Both ways of indices and
     * weights definition must not be combined in one primitive. Number of pairs per vertex
     * bonesPerVertex is not limited to 4 bones. Vertex buffer used for `primitiveIndex` must be
     * set for advance skinning. All bone weights of one vertex should sum to one. Otherwise they
     * will be normalized. Data must be rectangular and number of bone pairs must be same for all
     * vertices of this primitive. The data is arranged sequentially, all bone pairs for the first
     * vertex, then for the second vertex, and so on.
     *
     * @param primitiveIndex zero-based index of the primitive, must be less than the primitive
     *     count passed to Builder constructor
     * @param indicesAndWeights pairs of bone index and bone weight for all vertices sequentially
     * @param count number of all pairs, must be a multiple of vertexCount of the primitive count =
     *     vertexCount * bonesPerVertex
     * @param bonesPerVertex number of bone pairs, same for all vertices of the primitive
     * @returns Builder reference for chaining calls.
     * @see VertexBuffer:Builder:advancedSkinning
     */
    public boneIndicesAndWeights(primitiveIndex: number, indicesAndWeights: float2, count: number, bonesPerVertex: number): RenderableManager$Builder;
    /**
     * Controls if the renderable has legacy vertex morphing targets, zero by default. This is
     * required to enable GPU morphing.
     *
     * For legacy morphing, the attached VertexBuffer must provide data in the appropriate
     * VertexAttribute slots ( `MORPH_POSITION_0` etc). Legacy morphing only supports up to 4 morph
     * targets and will be deprecated in the future. Legacy morphing must be enabled on the
     * material definition: either via the legacyMorphing material attribute or by calling
     * filamat::MaterialBuilder::useLegacyMorphing().
     *
     * See also RenderableManager::setMorphWeights(), which can be called on a per-frame basis to
     * advance the animation.
     */
    public morphingLong(targetCount: number): RenderableManager$Builder;
    /**
     * Controls if the renderable has vertex morphing targets, zero by default. This is required to
     * enable GPU morphing.
     *
     * Filament supports two morphing modes: standard (default) and legacy.
     *
     * For standard morphing, A MorphTargetBuffer must be provided. Standard morphing supports up
     * to `CONFIG_MAX_MORPH_TARGET_COUNT` morph targets.
     *
     * See also RenderableManager::setMorphWeights(), which can be called on a per-frame basis to
     * advance the animation.
     */
    public morphingMorphTargetBuffer(morphTargetBuffer: MorphTargetBuffer): RenderableManager$Builder;
    /**
     * Specifies the the range of the MorphTargetBuffer to use with this primitive.
     *
     * @param level the level of detail (lod), only 0 can be specified
     * @param primitiveIndex zero-based index of the primitive, must be less than the count passed
     *     to Builder constructor
     * @param offset specifies where in the morph target buffer to start reading (expressed as a
     *     number of vertices)
     */
    public morphing(level: number, primitiveIndex: number, offset: number): RenderableManager$Builder;
    /**
     * Sets the drawing order for blended primitives. The drawing order is either global or local
     * (default) to this Renderable. In either case, the Renderable priority takes precedence.
     *
     * @param primitiveIndex the primitive of interest
     * @param blendOrder draw order number (0 by default). Only the lowest 15 bits are used.
     * @returns Builder reference for chaining calls.
     * @see globalBlendOrderEnabled
     */
    public blendOrder(primitiveIndex: number, blendOrder: number): RenderableManager$Builder;
    /**
     * Sets whether the blend order is global or local to this Renderable (by default).
     *
     * @param primitiveIndex the primitive of interest
     * @param enabled true for global, false for local blend ordering.
     * @returns Builder reference for chaining calls.
     * @see blendOrder
     */
    public globalBlendOrderEnabled(primitiveIndex: number, enabled: boolean): RenderableManager$Builder;
    /**
     * Specifies the number of draw instances of this renderable. The default is 1 instance and the
     * maximum number of instances allowed is 32767. 0 is invalid.
     *
     * All instances are culled using the same bounding box, so care must be taken to make sure all
     * instances render inside the specified bounding box.
     *
     * The material must set its `instanced` parameter to `true` in order to use getInstanceIndex()
     * in the vertex or fragment shader to get the instance index and possibly adjust the position
     * or transform.
     *
     * @param instanceCount the number of instances silently clamped between 1 and 32767.
     */
    public instances(instanceCount: number): RenderableManager$Builder;
    /**
     * Specifies the number of draw instances of this renderable and an `InstanceBuffer` containing
     * their local transforms. The default is 1 instance and the maximum number of instances
     * allowed when supplying transforms is given by `Engine::getMaxAutomaticInstances` (64 on most
     * platforms). 0 is invalid. The `InstanceBuffer` must not be destroyed before this renderable.
     *
     * All instances are culled using the same bounding box, so care must be taken to make sure all
     * instances render inside the specified bounding box.
     *
     * The material must set its `instanced` parameter to `true` in order to use
     * `getInstanceIndex()` in the vertex or fragment shader to get the instance index.
     *
     * Only the `VERTEX_DOMAIN_OBJECT` vertex domain is supported.
     *
     * The local transforms of each instance can be updated with
     * `InstanceBuffer::setLocalTransforms.`
     *
     * @param instanceCount the number of instances, silently clamped between 1 and the result of
     *     Engine::getMaxAutomaticInstances().
     * @param instanceBuffer an InstanceBuffer containing at least instanceCount transforms
     * @see InstanceBuffer
     * @see instances(size_t, * math::mat4f const*)
     */
    public instances(instanceCount: number, instanceBuffer: InstanceBuffer): RenderableManager$Builder;
    /**
     * Adds the Renderable component to an entity.
     *
     * If exceptions are disabled and an error occurs, this function is a no-op. Success can be
     * checked by looking at the return value.
     *
     * If this component already exists on the given entity and the construction is successful, it
     * is first destroyed as if destroy(utils::Entity e) was called. In case of error, the existing
     * component is unmodified.
     *
     * @param engine Reference to the filament::Engine to associate this Renderable with.
     * @param entity Entity to add the Renderable component to.
     * @returns Success if the component was created successfully, Error otherwise.
     */
    public build(engine: Engine, entity: Entity): RenderableManager$Builder$Result;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * A Renderer instance represents an operating system's window.
 *
 * Typically, applications create a Renderer per window. The Renderer generates drawing
 * commands for the render thread and manages frame latency.
 *
 * A Renderer generates drawing commands from a View, itself containing a Scene description.
 *
 * Creation and Destruction ========================
 *
 * A Renderer is created using Engine.createRenderer() and destroyed using Engine.destroy(const
 * Renderer*).
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ #include <filament
 * /Renderer.h> #include <filament /Engine.h> using namespace filament;
 *
 * Engine* engine = Engine::create();
 *
 * Renderer* renderer = engine->createRenderer(); engine->destroy( &renderer );
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * @see Engine, View
 */
export class Renderer {
    /**
     * @returns the maximum supported frame history size.
     * @see getFrameInfoHistory()
     */
    public getMaxFrameHistorySize(): number;
    /**
     * Information about the display this Renderer is associated to. This information is needed to
     * accurately compute dynamic-resolution scaling and for frame-pacing.
     */
    public setDisplayInfo(info: Renderer$DisplayInfo): void;
    /** Set options controlling the desired frame-rate. */
    public setFrameRateOptions(options: Renderer$FrameRateOptions): void;
    /**
     * Set ClearOptions which are used at the beginning of a frame to clear or retain the SwapChain
     * content.
     */
    public setClearOptions(options: Renderer$ClearOptions): void;
    /**
     * Returns the ClearOptions currently set.
     *
     * @returns A reference to a ClearOptions structure.
     */
    public getClearOptions(): Renderer$ClearOptions;
    /**
     * Get the Engine that created this Renderer.
     *
     * @returns A pointer to the Engine instance this Renderer is associated to.
     */
    public getEngine(): Engine;
    /**
     * The use of this method is optional. It sets the VSYNC time expressed as the duration in
     * nanosecond since epoch of std::chrono::steady_clock. If called, passing 0 to
     * vsyncSteadyClockTimeNano in Renderer::BeginFrame will use this time instead.
     *
     * @param steadyClockTimeNano duration in nanosecond since epoch of std::chrono::steady_clock
     * @see Engine::getSteadyClockTimeNano()
     * @see Renderer::BeginFrame()
     */
    public setVsyncTime(steadyClockTimeNano: number): void;
    /**
     * Call skipFrame when momentarily skipping frames, for instance if the content of the scene
     * doesn't change.
     */
    public skipFrame(vsyncSteadyClockTimeNano?: number): void;
    /**
     * Returns true if the current frame should be rendered.
     *
     * This is a convenience method that returns the same value as beginFrame().
     *
     * @remarks This method will return false once a backend exception has been delivered to the
     * main thread.
     *
     * @returns *false* the current frame should be skipped, or an unrecoverable backend exception
     * has occurred. *true* the current frame can be rendered
     * @see beginFrame()
     */
    public shouldRenderFrame(): boolean;
    /**
     * Set up a frame for this Renderer.
     *
     * beginFrame() manages frame-pacing, and returns whether a frame should be drawn. The goal of
     * this is to skip frames when the GPU falls behind in order to keep the frame latency low.
     *
     * If a given frame takes too much time in the GPU, the CPU will get ahead of the GPU. The
     * display will draw the same frame twice producing a stutter. At this point, the CPU is ahead
     * of the GPU and depending on how many frames are buffered, latency increases.
     *
     * beginFrame() attempts to detect this situation and returns false in that case, indicating to
     * the caller to skip the current frame.
     *
     * When beginFrame() returns true, it is mandatory to render the frame and call endFrame().
     * However, when beginFrame() returns false, the caller has the choice to either skip the frame
     * and not call endFrame(), or proceed as though true was returned.
     *
     * @remarks All calls to render() must happen *after* beginFrame(). It is recommended to use
     * the same swapChain for every call to beginFrame, failing to do so can result is losing all
     * or part of the FrameInfo history.
     *
     * @remarks This method will return false if called again after a backend exception was already
     * thrown and delivered to the main thread.
     *
     * @param swapChain A pointer to the SwapChain instance to use.
     * @param vsyncSteadyClockTimeNano The time in nanosecond of when the current frame started, or
     *     0 if unknown. This value should be the timestamp of the last h/w vsync. It is expressed in
     *     the std::chrono::steady_clock time base. On Android this should be the frame time received
     *     from a Choreographer.
     * @returns *false* the current frame should be skipped, *true* the current frame must be drawn
     * and endFrame() must be called.
     * @see endFrame()
     */
    public beginFrame(swapChain: SwapChain, vsyncSteadyClockTimeNano?: number): boolean;
    /**
     * Set the time at which the frame must be presented to the display hardware.
     *
     * This value is used to configure the hardware and must typically be strictly smaller than the
     * desired presentation time (i.e. it must include some headroom but not too much). For
     * instance, on Android, it is typically set to desired_presentation_time - vsync_period / 2.
     * This behavior can vary on other platforms.
     *
     * This must be called before endFrame().
     *
     * @param monotonic_clock_ns the presentation configuration timestamp in nanoseconds on the
     *     steady clock.
     */
    public setPresentationTime(monotonic_clock_ns: number): void;
    /**
     * Set the real desired presentation time targeted for this frame.
     *
     * Unlike setPresentationTime(), which configures hardware headroom, this is the exact target
     * presentation time and is used for FrameInfo frame history reporting.
     *
     * This must be called before endFrame().
     *
     * @param monotonic_clock_ns the desired presentation timestamp in nanoseconds on the steady
     *     clock.
     */
    public setDesiredPresentationTime(monotonic_clock_ns: number): void;
    /**
     * Set the deadline time point on the steady clock by which CPU and GPU rendering must complete
     * for the buffer to meet its target display latching window.
     *
     * This must be called before endFrame().
     *
     * @param monotonic_clock_ns the deadline timestamp in nanoseconds on the steady clock.
     */
    public setRenderingDeadline(monotonic_clock_ns: number): void;
    /**
     * Render a View into this renderer's window.
     *
     * This is filament main rendering method, most of the CPU-side heavy lifting is performed
     * here. render() main function is to generate render commands which are asynchronously
     * executed by the Engine's render thread.
     *
     * render() generates commands for each of the following stages:
     *
     * 1. Shadow map passes, if needed. 2. Depth pre-pass. 3. Color pass. 4. Post-processing pass.
     *
     * A typical render loop looks like this:
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ #include <filament
     * /Renderer.h> #include <filament /View.h> using namespace filament;
     *
     * void renderLoop(Renderer* renderer, SwapChain* swapChain) { do { // typically we wait for
     * VSYNC and user input events if (renderer->beginFrame(swapChain)) { renderer->render(mView);
     * renderer->endFrame(); } } while (!quit()); }
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     *
     * @remarks render() must be called from the Engine's main thread (or external synchronization
     * must be provided). In particular, calls to render() on different Renderer instances **must**
     * be synchronized.
     *
     * @param view A pointer to the view to render.
     * @see beginFrame(), endFrame(), View
     */
    public render(view: View): void;
    /**
     * Copy the currently rendered view to the indicated swap chain, using the indicated source and
     * destination rectangle.
     *
     * @param dstSwapChain The swap chain into which the frame should be copied.
     * @param dstViewport The destination rectangle in which to draw the view.
     * @param srcViewport The source rectangle to be copied.
     * @param flags One or more CopyFrameFlag behavior configuration flags.
     */
    public copyFrame(dstSwapChain: SwapChain, dstViewport: Viewport, srcViewport: Viewport, flags?: number): void;
    /**
     * Reads back the content of the SwapChain associated with this Renderer.
     *
     * The following formats are always supported: - PixelBufferDescriptor::PixelDataFormat::RGBA -
     * PixelBufferDescriptor::PixelDataFormat::RGBA_INTEGER
     *
     * The following types are always supported: - PixelBufferDescriptor::PixelDataType::UBYTE -
     * PixelBufferDescriptor::PixelDataType::UINT - PixelBufferDescriptor::PixelDataType::INT -
     * PixelBufferDescriptor::PixelDataType::FLOAT
     *
     * Other combinations of format/type may be supported. If a combination is not supported, this
     * operation may fail silently. Use a DEBUG build to get some logs about the failure.
     *
     * Framebuffer as seen on User buffer (PixelBufferDescriptor & ) screen
     *
     * +--------------------+ | | .stride .alignment | | ----------------------->--> | |
     * O----------------------+--+ low addresses | | | | | | | w | | | .top | | | < ---------> | |
     * V | | | +---------+ | | +---------+ | | | | ^ | | ======> | | | | | | x | h| | | |.left| | |
     * | +------>| v | | +---->| | | | | +.........+ | | +.........+ | | | ^ | | | | | y | |
     * +----------------------+--+ high addresses O------------+-------+
     *
     * readPixels() must be called within a frame, meaning after beginFrame() and before
     * endFrame(). Typically, readPixels() will be called after render().
     *
     * After issuing this method, the callback associated with `buffer` will be invoked on the main
     * thread, indicating that the read-back has completed. Typically, this will happen after
     * multiple calls to beginFrame(), render(), endFrame().
     *
     * It is also possible to use a Fence to wait for the read-back.
     *
     * @param xoffset Left offset of the sub-region to read back.
     * @param yoffset Bottom offset of the sub-region to read back.
     * @param width Width of the sub-region to read back.
     * @param height Height of the sub-region to read back.
     * @param buffer Client-side buffer where the read-back will be written.
     */
    public readPixels(xoffset: number, yoffset: number, width: number, height: number, buffer: driver$PixelBufferDescriptor): void;
    /**
     * Finishes the current frame and schedules it for display.
     *
     * endFrame() schedules the current frame to be displayed on the Renderer's window.
     *
     * @remarks All calls to render() must happen *before* endFrame(). endFrame() must be called if
     * beginFrame() returned true, otherwise, endFrame() must not be called unless the caller
     * ignored beginFrame()'s return value.
     * @see beginFrame()
     */
    public endFrame(): void;
    /**
     * Reads back the content of the provided RenderTarget.
     *
     * The following formats are always supported: - PixelBufferDescriptor::PixelDataFormat::RGBA -
     * PixelBufferDescriptor::PixelDataFormat::RGBA_INTEGER
     *
     * The following types are always supported: - PixelBufferDescriptor::PixelDataType::UBYTE -
     * PixelBufferDescriptor::PixelDataType::UINT - PixelBufferDescriptor::PixelDataType::INT -
     * PixelBufferDescriptor::PixelDataType::FLOAT
     *
     * Other combinations of format/type may be supported. If a combination is not supported, this
     * operation may fail silently. Use a DEBUG build to get some logs about the failure.
     *
     * Framebuffer as seen on User buffer (PixelBufferDescriptor & ) screen
     *
     * +--------------------+ | | .stride .alignment | | ----------------------->--> | |
     * O----------------------+--+ low addresses | | | | | | | w | | | .top | | | < ---------> | |
     * V | | | +---------+ | | +---------+ | | | | ^ | | ======> | | | | | | x | h| | | |.left| | |
     * | +------>| v | | +---->| | | | | +.........+ | | +.........+ | | | ^ | | | | | y | |
     * +----------------------+--+ high addresses O------------+-------+
     *
     * Typically readPixels() will be called after render() and before endFrame().
     *
     * After issuing this method, the callback associated with `buffer` will be invoked on the main
     * thread, indicating that the read-back has completed. Typically, this will happen after
     * multiple calls to beginFrame(), render(), endFrame().
     *
     * It is also possible to use a Fence to wait for the read-back.
     *
     * OpenGL only: if issuing a readPixels on a RenderTarget backed by a Texture that had data
     * uploaded to it via setImage, the data returned from readPixels will be y-flipped with
     * respect to the setImage call.
     *
     * Note: the texture that backs the COLOR attachment for `renderTarget` must have
     * TextureUsage::BLIT_SRC as part of its usage.
     *
     * @param renderTarget RenderTarget to read back from.
     * @param xoffset Left offset of the sub-region to read back.
     * @param yoffset Bottom offset of the sub-region to read back.
     * @param width Width of the sub-region to read back.
     * @param height Height of the sub-region to read back.
     * @param buffer Client-side buffer where the read-back will be written.
     */
    public readPixels(renderTarget: RenderTarget, xoffset: number, yoffset: number, width: number, height: number, buffer: driver$PixelBufferDescriptor): void;
    /**
     * Render a standalone View into its associated RenderTarget
     *
     * This call is mostly equivalent to calling render(View*) inside a beginFrame / endFrame
     * block, but incurs less overhead. It can be used as a poor man's compute API.
     *
     * @remarks renderStandaloneView() must be called from the Engine's main thread (or external
     * synchronization must be provided). In particular, calls to renderStandaloneView() on
     * different Renderer instances **must** be synchronized.
     *
     * @param view A pointer to the view to render. This View must have a RenderTarget associated
     *     to it.
     */
    public renderStandaloneView(view: View): void;
    /**
     * Returns the material time in seconds evaluated for the current frame. This value is constant
     * for all views rendered during a frame. When available, this time is projected forward to the
     * predicted presentation time on the display; otherwise, it evaluates at the vsync time of
     * beginFrame(). The epoch is set with setMaterialTimeEpoch().
     *
     * In materials, this value can be queried using `vec4 getUserTime()`. The value returned is a
     * highp vec4 encoded as follows:
     *
     * time.x = (float)Renderer.getMaterialTime(); time.y = Renderer.getMaterialTime() - time.x;
     *
     * It follows that the following invariants are true:
     *
     * (double)time.x + (double)time.y == Renderer.getMaterialTime() time.x ==
     * (float)Renderer.getMaterialTime()
     *
     * This "float-float" encoding allows the shader code to perform high precision (i.e. double)
     * time calculations when needed despite the lack of double precision in the shader (e.g. using
     * Dekker's algorithms). For example, to compute (double)time * vertex in the material, use the
     * following construct:
     *
     * vec3 result = time.x * vertex + time.y * vertex;
     *
     * Most of the time, high precision computations are not required, but be aware that the
     * precision of time.x rapidly diminishes as time passes:
     *
     * time | precision --------+---------- 16.7s | us 4h39 | ms 77h | 1/60s
     *
     * In other words, it is only possible to get microsecond accuracy for about 16s or millisecond
     * accuracy for just under 5h.
     *
     * This problem can be mitigated by calling setMaterialTimeEpoch(), or using high precision
     * time as described above.
     *
     * @returns The time in seconds since setMaterialTimeEpoch() was last called.
     * @see setMaterialTimeEpoch()
     */
    public getMaterialTime(): number;
    /**
     * Backward compatibility helper for getUserTime().
     *
     * @deprecated Use getMaterialTime() instead.
     */
    public getUserTime(): number;
    /**
     * Sets the material time epoch to the specified steady clock timestamp in nanoseconds, i.e.
     * resets the material time to zero relative to that time.
     *
     * Use this method to keep the precision of time high in materials, in practice it should be
     * called at least when the application is paused, e.g. Activity.onPause() in Android.
     *
     * @param monotonic_clock_ns the steady clock timestamp in nanoseconds to set as the material
     *     time epoch.
     * @see getMaterialTime()
     */
    public setMaterialTimeEpoch(monotonic_clock_ns: number): void;
    /**
     * Backward compatibility helper for resetUserTime().
     *
     * @deprecated Use setMaterialTimeEpoch() instead.
     */
    public resetUserTime(): void;
    /**
     * Requests the next frameCount frames to be skipped. For Debugging.
     *
     * @param frameCount number of frames to skip.
     */
    public skipNextFrames(frameCount: number): void;
    /**
     * Remainder count of frame to be skipped
     *
     * @returns remaining frames to be skipped
     */
    public getFrameToSkipCount(): number;
    /**
     * Queries whether the GPU execution has fallen behind the CPU rendering execution.
     *
     * This is highly useful when managing the application's presentation loop manually (e.g. with
     * the `FramePacer`), allowing the client to proactively detect and react to a latency build-up
     * before continuing with frame execution.
     *
     * @returns true if the GPU pipeline is delayed, false if ready.
     */
    public hasGpuFallenBehind(): boolean;
    /**
     * Sets the physical clock time when the frame scheduling callback was entered. Helper overload
     * accepting raw nanoseconds since epoch.
     *
     * @param timeSteadyClockNano Monotonic steady clock timestamp in nanoseconds since epoch.
     */
    public setFrameScheduleTime(timeSteadyClockNano: number): void;
    /**
     * Stalls the render thread (GPU submission pipeline) for the given duration in nanoseconds.
     *
     * This is useful for simulating long rendering frames (e.g. testing buffer stuffing recovery)
     * without blocking the application's main event loop thread.
     *
     * @param duration_ns the duration to pause the render thread in nanoseconds.
     */
    public pauseRenderThread(duration_ns: number): void;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * For a usage example, see the documentation for AssetLoader.
 *
 * ResourceLoader must be destroyed on the same thread that calls filament::Renderer::render()
 * because it listens to filament::backend::BufferDescriptor callbacks in order to determine
 * when to free CPU-side data blobs.
 */
export class ResourceLoader {
    public setConfiguration(config: ResourceConfiguration): void;
    /**
     * Feeds the binary content of an external resource into the loader's URI cache.
     *
     * On some platforms, `ResourceLoader` does not know how to download external resources on its
     * own (external resources might come from a filesystem, a database, or the internet) so this
     * method allows clients to download external resources and push them to the loader.
     *
     * Every resource should be passed in before calling #loadResources or #asyncBeginLoad. See
     * also FilamentAsset#getResourceUris.
     *
     * When loading GLB files (as opposed to JSON-based glTF files), clients typically do not need
     * to call this method.
     */
    public addResourceData(uri: string, buffer: driver$BufferDescriptor): void;
    /**
     * Register a plugin that can consume PNG / JPEG content and produce filament::Texture objects.
     *
     * Destruction of the given provider is the client's responsibility and must be done after the
     * destruction of this ResourceLoader.
     */
    public addTextureProvider(mimeType: string, provider: TextureProvider): void;
    /** Checks if the given resource has already been added to the URI cache. */
    public hasResourceData(uri: string): boolean;
    /**
     * Frees memory by evicting the URI cache that was populated via addResourceData.
     *
     * This can be called only after a model is fully loaded or after loading has been cancelled.
     */
    public evictResourceData(): void;
    /**
     * Loads resources for the given asset from the filesystem or data cache and "finalizes" the
     * asset by transforming the vertex data format if necessary, decoding image files, supplying
     * tangent data, etc.
     *
     * Returns false if resources have already been loaded, or if one or more resources could not
     * be loaded.
     *
     * Note: this method is synchronous and blocks until all textures have been decoded. For an
     * asynchronous alternative, see #asyncBeginLoad.
     */
    public loadResources(asset: FilamentAsset): boolean;
    /**
     * Starts an asynchronous resource load.
     *
     * Returns false if the loading process was unable to start.
     *
     * This is an alternative to #loadResources and requires periodic calls to #asyncUpdateLoad. On
     * multi-threaded systems this creates threads for texture decoding.
     */
    public asyncBeginLoad(asset: FilamentAsset): boolean;
    /** Gets the status of an asynchronous resource load as a percentage in [0,1]. */
    public asyncGetLoadProgress(): number;
    /**
     * Updates an asynchronous load by performing any pending work that must take place on the main
     * thread.
     *
     * Clients must periodically call this until #asyncGetLoadProgress returns 100%. After progress
     * reaches 100%, calling this is harmless; it just does nothing.
     */
    public asyncUpdateLoad(): void;
    /**
     * Cancels pending decoder jobs, frees all CPU-side texel data, and flushes the Engine.
     *
     * Calling this is only necessary if the asyncBeginLoad API was used and cancellation is
     * required before progress reaches 100%.
     */
    public asyncCancelLoad(): void;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * A Scene is a flat container of Renderable and Light instances.
 *
 * A Scene doesn't provide a hierarchy of Renderable objects, i.e.: it's not a scene-graph.
 * However, it manages the list of objects to render and the list of lights. Renderable and
 * Light objects can be added or removed from a Scene at any time.
 *
 * A Renderable *must* be added to a Scene in order to be rendered, and the Scene must be
 * provided to a View.
 *
 * Creation and Destruction ========================
 *
 * A Scene is created using Engine.createScene() and destroyed using Engine.destroy(const
 * Scene*).
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ #include <filament /Scene.h>
 * #include <filament /Engine.h> using namespace filament;
 *
 * Engine* engine = Engine::create();
 *
 * Scene* scene = engine->createScene(); engine->destroy( &scene );
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * @see View, Renderable, Light
 */
export class Scene {
    /**
     * Sets the Skybox.
     *
     * The Skybox is drawn last and covers all pixels not touched by geometry.
     *
     * @param skybox The Skybox to use to fill untouched pixels, or nullptr to unset the Skybox.
     */
    public setSkybox(skybox: Skybox): void;
    /**
     * Returns the Skybox associated with the Scene.
     *
     * @returns The associated Skybox, or nullptr if there is none.
     */
    public getSkybox(): Skybox;
    /**
     * Set the IndirectLight to use when rendering the Scene.
     *
     * Currently, a Scene may only have a single IndirectLight. This call replaces the current
     * IndirectLight.
     *
     * @param ibl The IndirectLight to use when rendering the Scene or nullptr to unset.
     * @see getIndirectLight
     */
    public setIndirectLight(ibl: IndirectLight): void;
    /**
     * Get the IndirectLight or nullptr if none is set.
     *
     * @returns the the IndirectLight or nullptr if none is set
     * @see setIndirectLight
     */
    public getIndirectLight(): IndirectLight;
    /**
     * Adds an Entity to the Scene.
     *
     * @param entity The entity is ignored for rendering purposes if it doesn't have a Renderable
     *     or Light component.
     */
    public addEntity(entity: Entity): void;
    /**
     * Adds a list of entities to the Scene.
     *
     * @param entities Array containing entities to add to the scene.
     * @param count Size of the entity array.
     */
    public addEntities(entities: Entity, count: number): void;
    /**
     * Removes the Renderable from the Scene.
     *
     * @param entity The Entity to remove from the Scene. If the specified `entity` doesn't exist,
     *     this call is ignored.
     */
    public remove(entity: Entity): void;
    /**
     * Removes a list of entities to the Scene.
     *
     * This is equivalent to calling remove in a loop. If any of the specified entities do not
     * exist in the scene, they are skipped.
     *
     * @param entities Array containing entities to remove from the scene.
     * @param count Size of the entity array.
     */
    public removeEntities(entities: Entity, count: number): void;
    /** Remove all entities to the Scene. */
    public removeAllEntities(): void;
    /**
     * Returns the total number of Entities in the Scene, whether alive or not.
     *
     * @returns Total number of Entities in the Scene.
     */
    public getEntityCount(): number;
    /**
     * Returns the number of active (alive) Renderable objects in the Scene.
     *
     * @returns The number of active (alive) Renderable objects in the Scene.
     */
    public getRenderableCount(): number;
    /**
     * Returns the number of active (alive) Light objects in the Scene.
     *
     * @returns The number of active (alive) Light objects in the Scene.
     */
    public getLightCount(): number;
    /**
     * Returns true if the given entity is in the Scene.
     *
     * @returns Whether the given entity is in the Scene.
     */
    public hasEntity(entity: Entity): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * SkinningBuffer is used to hold skinning data (bones). It is a simple wraper around a
 * structured UBO.
 * @see RenderableManager::setSkinningBuffer
 */
export class SkinningBuffer {
    /**
     * Updates the bone transforms in the range [offset, offset + count).
     *
     * @param engine Reference to the filament::Engine to associate this SkinningBuffer with.
     * @param transforms pointer to at least count mat4f
     * @param count number of mat4f elements in transforms
     * @param offset offset in elements (not bytes) in the SkinningBuffer (not in transforms)
     * @see RenderableManager::setSkinningBuffer
     */
    public setBones(engine: Engine, transforms: mat4, count: number, offset?: number): void;
    /**
     * Returns the size of this SkinningBuffer in elements.
     *
     * @returns The number of bones the SkinningBuffer holds.
     */
    public getBoneCount(): number;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

export class SkinningBuffer$Builder {
    constructor();
    /**
     * Size of the skinning buffer in bones.
     *
     * Due to limitation in the GLSL, the SkinningBuffer must always by a multiple of 256, this
     * adjustment is done automatically, but can cause some memory overhead. This memory overhead
     * can be mitigated by using the same SkinningBuffer to store the bone information for multiple
     * RenderPrimitives.
     *
     * @param boneCount Number of bones the skinning buffer can hold.
     * @returns A reference to this Builder for chaining calls.
     */
    public boneCount(boneCount: number): SkinningBuffer$Builder;
    /**
     * The new buffer is created with identity bones
     *
     * @param initialize true to initializing the buffer, false to not.
     * @returns A reference to this Builder for chaining calls.
     */
    public initialize(initialize?: boolean): SkinningBuffer$Builder;
    /**
     * Associate an optional name with this SkinningBuffer for debugging purposes.
     *
     * name will show in error messages and should be kept as short as possible. The name is
     * truncated to a maximum of 128 characters.
     *
     * The name string is copied during this method so clients may free its memory after the
     * function returns.
     *
     * @deprecated Use name(utils::StaticString const & ) instead.
     *
     * @param name A string to identify this SkinningBuffer
     * @param len Length of name, should be less than or equal to 128
     * @returns This Builder, for chaining calls.
     */
    public name(name: string, len: number): SkinningBuffer$Builder;
    /**
     * Creates the SkinningBuffer object and returns a pointer to it.
     *
     * @param engine Reference to the filament::Engine to associate this SkinningBuffer with.
     * @returns pointer to the newly created object.
     * @see SkinningBuffer::setBones
     */
    public build(engine: Engine): SkinningBuffer;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Skybox
 *
 * When added to a Scene, the Skybox fills all untouched pixels.
 *
 * Creation and destruction ========================
 *
 * A Skybox object is created using the Skybox::Builder and destroyed by calling
 * Engine::destroy(const Skybox*).
 *
 * ~~~~~~~~~~~{.cpp} filament::Engine* engine = filament::Engine::create();
 *
 * filament::IndirectLight* skybox = filament::Skybox::Builder() .environment(cubemap)
 * .build(*engine);
 *
 * engine->destroy(skybox); ~~~~~~~~~~~
 *
 * @remarks Currently only Texture based sky boxes are supported.
 * @see Scene, IndirectLight
 */
export class Skybox {
    public setColor(color: float4): void;
    /**
     * Sets bits in a visibility mask. By default, this is 0x1.
     *
     * This provides a simple mechanism for hiding or showing this Skybox in a Scene.
     *
     * For example, to set bit 1 and reset bits 0 and 2 while leaving all other bits unaffected,
     * call: `setLayerMask(7, 2)`.
     *
     * @param select the set of bits to affect
     * @param values the replacement values for the affected bits
     * @see View::setVisibleLayers().
     */
    public setLayerMask(select: number, values: number): void;
    /** @returns the visibility mask bits */
    public getLayerMask(): number;
    /** Returns the skybox's intensity in lux, or lumen/m^2. */
    public getIntensity(): number;
    /** @returns the associated texture */
    public getTexture(): Texture;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** Use Builder to construct an Skybox object instance */
export class Skybox$Builder {
    constructor();
    /**
     * Set the environment map (i.e. the skybox content).
     *
     * The Skybox is rendered as though it were an infinitely large cube with the camera inside it.
     * This means that the cubemap which is mapped onto the cube's exterior will appear mirrored.
     * This follows the OpenGL conventions.
     *
     * The cmgen tool generates reflection maps by default which are therefore ideal to use as
     * skyboxes.
     *
     * @param cubemap This Texture must be a cube map.
     * @returns This Builder, for chaining calls.
     * @see Texture
     */
    public environment(cubemap: Texture): Skybox$Builder;
    /**
     * Indicates whether the sun should be rendered. The sun can only be rendered if there is at
     * least one light of type SUN in the scene. The default value is false.
     *
     * @param show True if the sun should be rendered, false otherwise
     * @returns This Builder, for chaining calls.
     */
    public showSun(show: boolean): Skybox$Builder;
    /**
     * Skybox intensity when no IndirectLight is set on the Scene.
     *
     * This call is ignored when an IndirectLight is set on the Scene, and the intensity of the
     * IndirectLight is used instead.
     *
     * @param envIntensity Scale factor applied to the skybox texel values such that the result is
     *     in lux, or lumen/m^2 (default = 30000)
     * @returns This Builder, for chaining calls.
     * @see IndirectLight::Builder::intensity
     */
    public intensity(envIntensity: number): Skybox$Builder;
    /**
     * Sets the skybox to a constant color. Default is opaque black.
     *
     * Ignored if an environment is set.
     *
     * @param color the constant color
     * @returns This Builder, for chaining calls.
     */
    public color(color: float4): Skybox$Builder;
    /**
     * Set the rendering priority of the Skybox. By default, it is set to the lowest priority (7)
     * such that the Skybox is always rendered after the opaque objects, to reduce overdraw when
     * depth culling is enabled.
     *
     * @param priority clamped to the range [0..7], defaults to 7; 7 is lowest priority (rendered
     *     last).
     * @returns Builder reference for chaining calls.
     * @see RenderableManager::Builder::priority()
     */
    public priority(priority: number): Skybox$Builder;
    /**
     * Creates the Skybox object and returns a pointer to it.
     *
     * @param engine Reference to the filament::Engine to associate this Skybox with.
     * @returns pointer to the newly created object.
     */
    public build(engine: Engine): Skybox;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Stream is used to attach a video stream to a Filament `Texture`.
 *
 * Note that the `Stream` class is fairly Android centric. It supports two different
 * configurations:
 *
 * - ACQUIRED.....connects to an Android AHardwareBuffer - NATIVE.......connects to an Android
 * SurfaceTexture
 *
 * Before explaining these different configurations, let's review the high-level structure of
 * an AR or video application that uses Filament:
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ while (true) {
 *
 * // Misc application work occurs here, such as: // - Writing the image data for a video frame
 * into a Stream // - Moving the Filament Camera
 *
 * if (renderer->beginFrame(swapChain)) { renderer->render(view); renderer->endFrame(); } }
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Let's say that the video image data at the time of a particular invocation of `beginFrame`
 * becomes visible to users at time A. The 3D scene state (including the camera) at the time of
 * that same invocation becomes apparent to users at time B.
 *
 * - If time A matches time B, we say that the stream is {synchronized}. - Filament invokes
 * low-level graphics commands on the {driver thread}. - The thread that calls `beginFrame` is
 * called the {main thread}.
 *
 * For ACQUIRED streams, there is no need to perform the copy because Filament explicitly
 * acquires the stream, then releases it later via a callback function. This configuration is
 * especially useful when the Vulkan backend is enabled.
 *
 * NATIVE streams are deprecated because they are backend specific and do not make any
 * synchronization guarantee.
 *
 * Please see `sample-stream-test` and `sample-hello-camera` for usage examples.
 * @see backend::StreamType
 * @see Texture#setExternalStream
 * @see Engine#destroyStream
 */
export class Stream {
    /** Indicates whether this stream is a NATIVE stream or ACQUIRED stream. */
    public getStreamType(): StreamType;
    /**
     * Updates the size of the incoming stream. Whether this value is used is stream dependent. On
     * Android, it must be set when using Builder::stream(long externalTextureId).
     *
     * @param width new width of the incoming stream
     * @param height new height of the incoming stream
     */
    public setDimensions(width: number, height: number): void;
    /**
     * Returns the presentation time of the currently displayed frame in nanosecond.
     *
     * This value can change at any time.
     *
     * @returns timestamp in nanosecond.
     */
    public getTimestamp(): number;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Constructs a Stream object instance.
 *
 * By default, Stream objects are ACQUIRED and must have external images pushed to them via
 * Stream::setAcquiredImage .
 *
 * To create a NATIVE stream, call the stream method on the builder.
 */
export class Stream$Builder {
    constructor();
    /**
     * @param width initial width of the incoming stream. Whether this value is used is stream
     *     dependent. On Android, it must be set when using Builder::stream(long externalTextureId).
     * @returns This Builder, for chaining calls.
     */
    public width(width: number): Stream$Builder;
    /**
     * @param height initial height of the incoming stream. Whether this value is used is stream
     *     dependent. On Android, it must be set when using Builder::stream(long externalTextureId).
     * @returns This Builder, for chaining calls.
     */
    public height(height: number): Stream$Builder;
    /**
     * Associate an optional name with this Stream for debugging purposes.
     *
     * name will show in error messages and should be kept as short as possible. The name is
     * truncated to a maximum of 128 characters.
     *
     * The name string is copied during this method so clients may free its memory after the
     * function returns.
     *
     * @deprecated Use name(utils::StaticString const & ) instead.
     *
     * @param name A string to identify this Stream
     * @param len Length of name, should be less than or equal to 128
     * @returns This Builder, for chaining calls.
     */
    public name(name: string, len: number): Stream$Builder;
    /**
     * Creates the Stream object and returns a pointer to it.
     *
     * @param engine Reference to the filament::Engine to associate this Stream with.
     * @returns pointer to the newly created object.
     */
    public build(engine: Engine): Stream;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * A swap chain represents an Operating System's *native* renderable surface.
 *
 * Typically, it's a native window or a view. Because a SwapChain is initialized from a native
 * object, it is given to filament as a `void *`, which must be of the proper type for each
 * platform filament is running on.
 *
 * When Engine::create() is used without specifying a Platform, the `nativeWindow` parameter
 * above must be of type:
 *
 * Platform | nativeWindow type :---------------|:----------------------------: Android |
 * ANativeWindow* macOS - OpenGL | NSView* macOS - Metal | CAMetalLayer* iOS - OpenGL |
 * CAEAGLLayer* iOS - Metal | CAMetalLayer* X11 | Window Windows | HWND
 *
 * Otherwise, the `nativeWindow` is defined by the concrete implementation of Platform.
 *
 * Examples:
 *
 * Android -------
 *
 * On Android, an `ANativeWindow*` can be obtained from a Java `Surface` object using:
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ #include <android
 * /native_window_jni.h> // parameters // env: JNIEnv* // surface: jobject ANativeWindow* win =
 * ANativeWindow_fromSurface(env, surface);
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * A `Surface` can be retrieved from a `SurfaceView` or `SurfaceHolder` easily using
 * `SurfaceHolder.getSurface()` and/or `SurfaceView.getHolder()`.
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~{.java}
 * // using a TextureView.SurfaceTextureListener: public void
 * onSurfaceTextureAvailable(SurfaceTexture surfaceTexture, int width, int height) { mSurface =
 * new Surface(surfaceTexture); // mSurface can now be used in JNI to create an ANativeWindow.
 * } ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Linux -----
 *
 * Example using SDL:
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ SDL_SysWMinfo wmi;
 * SDL_VERSION( &wmi .version); SDL_GetWindowWMInfo(sdlWindow, &wmi ); Window nativeWindow =
 * (Window) wmi.info.x11.window;
 *
 * using namespace filament; Engine* engine = Engine::create(); SwapChain* swapChain =
 * engine->createSwapChain((void*) nativeWindow);
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Windows -------
 *
 * Example using SDL:
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ SDL_SysWMinfo wmi;
 * SDL_VERSION( &wmi .version); FILAMENT_CHECK_POSTCONDITION(SDL_GetWindowWMInfo(sdlWindow,
 * &wmi )) < < "SDL version unsupported!"; HDC nativeWindow = (HDC) wmi.info.win.hdc;
 *
 * using namespace filament; Engine* engine = Engine::create(); SwapChain* swapChain =
 * engine->createSwapChain((void*) nativeWindow);
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * OSX ---
 *
 * On OSX, any `NSView` can be used *directly* as a `nativeWindow` with createSwapChain().
 *
 * Example using SDL/Objective-C:
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~{.mm} #include <filament
 * /Engine.h>
 *
 * #include <Cocoa /Cocoa.h> #include <SDL _syswm.h>
 *
 * SDL_SysWMinfo wmi; SDL_VERSION( &wmi .version); NSWindow* win = (NSWindow*)
 * wmi.info.cocoa.window; NSView* view = [win contentView]; void* nativeWindow = view;
 *
 * using namespace filament; Engine* engine = Engine::create(); SwapChain* swapChain =
 * engine->createSwapChain(nativeWindow);
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * @remarks To use a `TextureView` as a SwapChain, it is necessary to first get its
 * `SurfaceTexture`, for instance using `TextureView.SurfaceTextureListener` and then create a
 * `Surface`:
 *
 * @remarks Warning: Don't use reflection to access the `mNativeObject` field, it won't work.
 * @see Engine
 */
export class SwapChain {
    /**
     * Return whether createSwapChain supports the CONFIG_PROTECTED_CONTENT flag. The default
     * implementation returns false.
     *
     * @param engine A pointer to the filament Engine
     * @returns true if CONFIG_PROTECTED_CONTENT is supported, false otherwise.
     */
    public static isProtectedContentSupported(engine: Engine): boolean;
    /**
     * Return whether createSwapChain supports the CONFIG_SRGB_COLORSPACE flag. The default
     * implementation returns false.
     *
     * @param engine A pointer to the filament Engine
     * @returns true if CONFIG_SRGB_COLORSPACE is supported, false otherwise.
     */
    public static isSRGBSwapChainSupported(engine: Engine): boolean;
    /**
     * Return whether createSwapChain supports the CONFIG_MSAA_*_SAMPLES flag. The default
     * implementation returns false.
     *
     * @param engine A pointer to the filament Engine
     * @param samples The number of samples
     * @returns true if CONFIG_MSAA_*_SAMPLES is supported, false otherwise.
     */
    public static isMSAASwapChainSupported(engine: Engine, samples: number): boolean;
    /**
     * Sets the intended frame rate for this SwapChain.
     *
     * @param frameRate The intended frame rate in frames per second. 0.0f clears/resets the rate.
     * @param compatibility Frame rate compatibility mode (default: DEFAULT).
     * @param strategy Change strategy for non-seamless transitions (default: ONLY_IF_SEAMLESS).
     */
    public setFrameRate(frameRate: number, compatibility?: Platform$FrameRateCompatibility, strategy?: Platform$ChangeFrameRateStrategy): void;
    /**
     * Returns whether this SwapChain currently has a FrameScheduledCallback set.
     *
     * @returns true, if the last call to setFrameScheduledCallback set a callback
     * @see SwapChain::setFrameCompletedCallback
     */
    public isFrameScheduledCallbackSet(): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

export class Sync {

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Texture
 *
 * The Texture class supports: - 2D textures - 3D textures - Cube maps - mip mapping
 *
 * Creation and destruction ========================
 *
 * A Texture object is created using the Texture::Builder and destroyed by calling
 * Engine::destroy(const Texture*).
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~{.cpp}
 * filament::Engine* engine = filament::Engine::create();
 *
 * filament::Texture* texture = filament::Texture::Builder() .width(64) .height(64)
 * .build(*engine);
 *
 * engine->destroy(texture);
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export class Texture {
    /** @returns Whether a backend supports a particular format. */
    public static isTextureFormatSupported(engine: Engine, format: TextureFormat): boolean;
    /** @returns Whether a backend supports mipmapping of a particular format. */
    public static isTextureFormatMipmappable(engine: Engine, format: TextureFormat): boolean;
    /** @returns Whether particular format is compressed */
    public static isTextureFormatCompressed(format: TextureFormat): boolean;
    /** @returns Whether this backend supports protected textures. */
    public static isProtectedTexturesSupported(engine: Engine): boolean;
    /** @returns Whether a backend supports texture swizzling. */
    public static isTextureSwizzleSupported(engine: Engine): boolean;
    public static computeTextureDataSize(format: PixelDataFormat, type: PixelDataType, stride: number, height: number, alignment: number): number;
    /** @returns Whether a combination of texture format, pixel format and type is valid. */
    public static validatePixelFormatAndType(internalFormat: TextureFormat, format: PixelDataFormat, type: PixelDataType): boolean;
    /**
     * @returns the maximum size in texels of a texture of type `type.` At least 2048 for 2D
     * textures, 256 for 3D textures.
     */
    public static getMaxTextureSize(engine: Engine, type: SamplerType): number;
    /** @returns the maximum number of layers supported by texture arrays. At least 256. */
    public static getMaxArrayTextureLayers(engine: Engine): number;
    /**
     * Returns the width of a 2D or 3D texture level
     *
     * @param level texture level.
     * @returns Width in texel of the specified `level,` clamped to 1.
     */
    public getWidth(level?: number): number;
    /**
     * Returns the height of a 2D or 3D texture level
     *
     * @param level texture level.
     * @returns Height in texel of the specified `level,` clamped to 1.
     */
    public getHeight(level?: number): number;
    /**
     * Returns the depth of a 3D texture level
     *
     * @param level texture level.
     * @returns Depth in texel of the specified `level,` clamped to 1.
     */
    public getDepth(level?: number): number;
    /**
     * Returns the maximum number of levels this texture can have.
     *
     * @returns maximum number of levels this texture can have.
     */
    public getLevels(): number;
    /**
     * Return this texture Sampler as set by Builder::sampler().
     *
     * @returns this texture Sampler as set by Builder::sampler()
     */
    public getTarget(): SamplerType;
    /**
     * Return this texture InternalFormat as set by Builder::format().
     *
     * @returns this texture InternalFormat as set by Builder::format().
     */
    public getFormat(): TextureFormat;
    /**
     * Updates a sub-image of a 3D texture or 2D texture array for a level. Cubemaps are treated
     * like a 2D array of six layers.
     *
     * @param engine Engine this texture is associated to.
     * @param level Level to set the image for.
     * @param xoffset Left offset of the sub-region to update.
     * @param yoffset Bottom offset of the sub-region to update.
     * @param zoffset Depth offset of the sub-region to update.
     * @param width Width of the sub-region to update.
     * @param height Height of the sub-region to update.
     * @param depth Depth of the sub-region to update.
     * @param buffer Client-side buffer containing the image to set. The driver will invoke the
     *     callback associated with this buffer when the data has been consumed.
     * @see Builder::sampler()
     */
    public setImage(engine: Engine, level: number, xoffset: number, yoffset: number, zoffset: number, width: number, height: number, depth: number, buffer: driver$PixelBufferDescriptor): void;
    /**
     * inline helper to update a 2D texture
     * @see setImage(Engine & engine, size_t level, uint32_t xoffset, uint32_t yoffset, uint32_t
     * zoffset, uint32_t width, uint32_t height, uint32_t depth, PixelBufferDescriptor & & buffer)
     */
    public setImage(engine: Engine, level: number, buffer: driver$PixelBufferDescriptor): void;
    /**
     * inline helper to update a 2D texture
     * @see setImage(Engine & engine, size_t level, uint32_t xoffset, uint32_t yoffset, uint32_t
     * zoffset, uint32_t width, uint32_t height, uint32_t depth, PixelBufferDescriptor & & buffer)
     */
    public setImage(engine: Engine, level: number, xoffset: number, yoffset: number, width: number, height: number, buffer: driver$PixelBufferDescriptor): void;
    /**
     * Specify the external stream to associate with this Texture. Typically, the external stream
     * is OS specific, and can be a video or camera stream. There are many restrictions when using
     * an external stream as a texture, such as: - only the level of detail (lod) 0 can be
     * specified - only nearest or linear filtering is supported - the size and format of the
     * texture is defined by the external stream
     *
     * @param engine Engine this texture is associated to.
     * @param stream A Stream object
     * @see Builder::sampler(), Stream
     */
    public setExternalStream(engine: Engine, stream: Stream): void;
    /**
     * Generates all the mipmap levels automatically. This requires the texture to have a
     * color-renderable format and usage set to BLIT_SRC | BLIT_DST. If unspecified, usage bits are
     * set automatically.
     *
     * @param engine Engine this texture is associated to.
     */
    public generateMipmaps(engine: Engine): void;
    /**
     * This non-blocking method checks if the resource has finished creation *successfully*. If the
     * resource creation was initiated asynchronously, it will return true only after all related
     * asynchronous tasks are complete, and only if none of them was canceled. If the resource was
     * created normally without using async method, it will always return true.
     *
     * A canceled asynchronous creation never populates the resource, so this method keeps
     * returning false for it. The object itself remains valid and must still be destroyed as
     * usual.
     *
     * @returns Whether the resource is created and usable.
     * @see Builder::async()
     */
    public isCreationComplete(): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** Use Builder to construct a Texture object instance */
export class Texture$Builder {
    constructor();
    /**
     * Specifies the width in texels of the texture. Doesn't need to be a power-of-two.
     *
     * @param width Width of the texture in texels (default: 1).
     * @returns This Builder, for chaining calls.
     */
    public width(width: number): Texture$Builder;
    /**
     * Specifies the height in texels of the texture. Doesn't need to be a power-of-two.
     *
     * @param height Height of the texture in texels (default: 1).
     * @returns This Builder, for chaining calls.
     */
    public height(height: number): Texture$Builder;
    /**
     * Specifies the depth in texels of the texture. Doesn't need to be a power-of-two. The depth
     * controls the number of layers in a 2D array texture. Values greater than 1 effectively
     * create a 3D texture.
     *
     * @param depth Depth of the texture in texels (default: 1).
     * @returns This Builder, for chaining calls.
     */
    public depth(depth: number): Texture$Builder;
    /**
     * Specifies the numbers of mip map levels. This creates a mip-map pyramid. The maximum number
     * of levels a texture can have is such that max(width, height, level) / 2^MAX_LEVELS = 1
     *
     * @param levels Number of mipmap levels for this texture.
     * @returns This Builder, for chaining calls.
     */
    public levels(levels: number): Texture$Builder;
    /**
     * Specifies the numbers of samples used for MSAA (Multisample Anti-Aliasing).
     *
     * Calling this method implicitly indicates the texture is used as a render target. Hence, this
     * method should not be used in conjunction with other methods that are semantically
     * conflicting like `setImage`.
     *
     * If this is invoked for array textures, it means this texture is used for multiview.
     *
     * @param samples Number of samples for this texture.
     * @returns This Builder, for chaining calls.
     */
    public samples(samples: number): Texture$Builder;
    /**
     * Specifies the type of sampler to use.
     *
     * @param target Sampler type
     * @returns This Builder, for chaining calls.
     * @see Sampler
     */
    public sampler(target: SamplerType): Texture$Builder;
    /**
     * Specifies the *internal* format of this texture.
     *
     * The internal format specifies how texels are stored (which may be different from how they're
     * specified in setImage()). InternalFormat specifies both the color components and the data
     * type used.
     *
     * @param format Format of the texture's texel.
     * @returns This Builder, for chaining calls.
     * @see InternalFormat, setImage
     */
    public format(format: TextureFormat): Texture$Builder;
    /**
     * Specifies if the texture will be used as a render target attachment.
     *
     * If the texture is potentially rendered into, it may require a different memory layout, which
     * needs to be known during construction.
     *
     * @param usage Defaults to Texture::Usage::DEFAULT; c.f. Texture::Usage::COLOR_ATTACHMENT.
     * @returns This Builder, for chaining calls.
     */
    public usage(usage: TextureUsage): Texture$Builder;
    /**
     * Specifies how a texture's channels map to color components
     *
     * Texture Swizzle is only supported if isTextureSwizzleSupported() returns true.
     *
     * @param r texture channel for red component
     * @param g texture channel for green component
     * @param b texture channel for blue component
     * @param a texture channel for alpha component
     * @returns This Builder, for chaining calls.
     * @see Texture::isTextureSwizzleSupported()
     */
    public swizzle(r: TextureSwizzle, g: TextureSwizzle, b: TextureSwizzle, a: TextureSwizzle): Texture$Builder;
    /**
     * Associate an optional name with this Texture for debugging purposes.
     *
     * name will show in error messages and should be kept as short as possible. The name is
     * truncated to a maximum of 128 characters.
     *
     * The name string is copied during this method so clients may free its memory after the
     * function returns.
     *
     * @deprecated Use name(utils::StaticString const & ) instead.
     *
     * @param name A string to identify this Texture
     * @param len Length of name, should be less than or equal to 128
     * @returns This Builder, for chaining calls.
     */
    public name(name: string, len: number): Texture$Builder;
    /**
     * Creates an external texture. The content must be set using setExternalImage(). The sampler
     * can be SAMPLER_EXTERNAL or SAMPLER_2D depending on the format. Generally YUV formats must
     * use SAMPLER_EXTERNAL. This depends on the backend features and is not validated.
     *
     * If the Sampler is set to SAMPLER_EXTERNAL, external() is implied.
     */
    public external(): Texture$Builder;
    /**
     * Creates the Texture object and returns a pointer to it.
     *
     * @param engine Reference to the filament::Engine to associate this Texture with.
     * @returns pointer to the newly created object.
     */
    public build(engine: Engine): Texture;
    /**
     * Specify a native texture to import as a Filament texture.
     *
     * The texture id is backend-specific: - OpenGL: GLuint texture ID - Metal: id <MTLTexture >
     *
     * With Metal, the id <MTLTexture > object should be cast to an intptr_t using CFBridgingRetain
     * to transfer ownership to Filament. Filament will release ownership of the texture object
     * when the Filament texture is destroyed.
     *
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~{.cpp} id
     * <MTLTexture > metalTexture = ... filamentTexture->import((intptr_t)
     * CFBridgingRetain(metalTexture)); // free to release metalTexture
     *
     * // after using texture: engine->destroy(filamentTexture); // metalTexture is released
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     *
     * @remarks Warning: This method should be used as a last resort. This API is subject to change
     * or removal.
     *
     * @param id a backend specific texture identifier
     * @returns This Builder, for chaining calls.
     */
    public import(id: number): Texture$Builder;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * TextureProvider is an interface that allows clients to implement their own texture decoding
 * facility for JPEG, PNG, or KTX2 content. It constructs Filament Texture objects
 * synchronously, but populates their miplevels asynchronously.
 *
 * gltfio calls all public methods from the foreground thread, i.e. the thread that the
 * Filament engine was created with. However the implementation may create 0 or more background
 * threads to perform decoding work.
 *
 * The following pseudocode illustrates how this interface could be used, but in practice the
 * only client is the gltfio ResourceLoader.
 *
 * filament::Engine* engine = ...; TextureProvider* provider = createStbProvider(engine);
 *
 * for (auto filename : textureFiles) { std::vector <uint8 _t> buf = readEntireFile(filename);
 * Texture* texture = provider->pushTexture(buf.data(), buf.size(), "image/png", 0); if
 * (texture == nullptr) { puts(provider->getPushMessage()); exit(1); } }
 *
 * // At this point, the returned textures can be bound to material instances, but none of
 * their // miplevel images have been populated yet.
 *
 * while (provider->getPoppedCount() < provider->getPushedCount()) { sleep(200);
 *
 * // The following call gives the provider an opportunity to reap the results of any //
 * background decoder work that has been completed (e.g. by calling Texture::setImage).
 * provider->updateQueue();
 *
 * // Check for textures that now have all their miplevels initialized. while (Texture* texture
 * = provider->popTexture()) { printf("%p has all its miplevels ready.\n", texture); } }
 *
 * delete provider;
 */
export class TextureProvider {
    /**
     * Polls textures in the queue and uploads mipmap images if any have emerged from the decoder.
     *
     * This gives the provider an opportunity to call Texture::setImage() on the foreground thread.
     * If needed, it can also call Texture::generateMipmaps() here.
     *
     * Items in the decoding queue can become "poppable" only during this call.
     */
    public updateQueue(): void;
    /**
     * Returns a failure message for the most recent call to pushTexture(), or null for success.
     *
     * Note that this method does not pertain to the decoding process. If decoding fails, clients
     * to can pop the incomplete texture off the queue and obtain a failure message using the
     * getPopFailure() method.
     *
     * The returned string is owned by the provider and becomes invalid after the next call to
     * pushTexture().
     */
    public getPushMessage(): string;
    /**
     * Returns a failure message for the most recent call to popTexture(), or null for success.
     *
     * If the most recent call to popTexture() returned null, then no error occurred and this
     * returns null. If the most recent call to popTexture() returned a "complete" texture (i.e.
     * all miplevels present), then this returns null. This returns non-null only if an error or
     * cancellation occurred while decoding the popped texture.
     *
     * The returned string is owned by the provider and becomes invalid after the next call to
     * popTexture().
     */
    public getPopMessage(): string;
    /**
     * Waits for all outstanding decoding jobs to complete.
     *
     * Clients should call updateQueue() afterwards if they wish to update the push / pop queue.
     */
    public waitForCompletion(): void;
    /**
     * Cancels all not-yet-started decoding jobs and waits for all other jobs to complete.
     *
     * Jobs that have already started cannot be canceled. Textures whose decoding process has been
     * cancelled will be made poppable on the subsequent call to updateQueue().
     */
    public cancelDecoding(): void;
    /** Total number of successful push calls since the provider was created. */
    public getPushedCount(): number;
    /** Total number of successful pop calls since the provider was created. */
    public getPoppedCount(): number;
    /** Total number of textures that have become ready-to-pop since the provider was created. */
    public getDecodedCount(): number;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** TextureSampler defines how a texture is accessed. */
export class TextureSampler {
    constructor();
    /**
     * Sets the minification filter
     *
     * @param v Minification filter
     */
    public setMinFilter(v: SamplerMinFilter): void;
    /**
     * Sets the magnification filter
     *
     * @param v Magnification filter
     */
    public setMagFilter(v: SamplerMagFilter): void;
    /**
     * Sets the wrap mode for the s (horizontal) texture coordinate
     *
     * @param v wrap mode
     */
    public setWrapModeS(v: SamplerWrapMode): void;
    /**
     * Sets the wrap mode for the t (vertical) texture coordinate
     *
     * @param v wrap mode
     */
    public setWrapModeT(v: SamplerWrapMode): void;
    /**
     * Sets the wrap mode for the r (depth, for 3D textures) texture coordinate
     *
     * @param v wrap mode
     */
    public setWrapModeR(v: SamplerWrapMode): void;
    /**
     * This controls anisotropic filtering.
     *
     * @param anisotropy Amount of anisotropy, should be a power-of-two. The default is 1. The
     *     maximum permissible value is 128.
     */
    public setAnisotropy(anisotropy: number): void;
    /**
     * Sets the compare mode and function.
     *
     * @param mode Compare mode
     * @param func Compare function
     */
    public setCompareMode(mode: SamplerCompareMode, func?: SamplerCompareFunc): void;
    /** returns the minification filter value */
    public getMinFilter(): SamplerMinFilter;
    /** returns the magnification filter value */
    public getMagFilter(): SamplerMagFilter;
    /** returns the s-coordinate wrap mode (horizontal) */
    public getWrapModeS(): SamplerWrapMode;
    /** returns the t-coordinate wrap mode (vertical) */
    public getWrapModeT(): SamplerWrapMode;
    /** returns the r-coordinate wrap mode (depth) */
    public getWrapModeR(): SamplerWrapMode;
    /** returns the anisotropy value */
    public getAnisotropy(): number;
    /** returns the compare mode */
    public getCompareMode(): SamplerCompareMode;
    /** returns the compare function */
    public getCompareFunc(): SamplerCompareFunc;
    public getSamplerParams(): SamplerParams;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * TransformManager is used to add transform components to entities.
 *
 * A Transform component gives an entity a position and orientation in space in the coordinate
 * space of its parent transform. The TransformManager takes care of computing the world-space
 * transform of each component (i.e. its transform relative to the root).
 *
 * Creation and destruction ========================
 *
 * A transform component is created using TransformManager::create() and destroyed by calling
 * TransformManager::destroy().
 *
 * ~~~~~~~~~~~{.cpp} filament::Engine* engine = filament::Engine::create(); utils::Entity
 * object = utils::EntityManager.get().create();
 *
 * auto & tcm = engine->getTransformManager();
 *
 * // create the transform component tcm.create(object);
 *
 * // set its transform auto i = tcm.getInstance(object); tcm.setTransform(i,
 * mat4f::translation({ 0, 0, -1 }));
 *
 * // destroy the transform component tcm.destroy(object); ~~~~~~~~~~~
 */
export class TransformManager {
    /**
     * Returns whether a particular Entity is associated with a component of this TransformManager
     *
     * @param e An Entity.
     * @returns true if this Entity has a component associated with this manager.
     */
    public hasComponent(e: Entity): boolean;
    /**
     * Gets an Instance representing the transform component associated with the given Entity.
     *
     * @remarks Use Instance::isValid() to make sure the component exists.
     *
     * @param e An Entity.
     * @returns An Instance object, which represents the transform component associated with the
     * Entity e.
     * @see hasComponent()
     */
    public getInstance(e: Entity): number;
    /** @returns the number of Components */
    public getComponentCount(): number;
    /** @returns true if the this manager has no components */
    public empty(): boolean;
    /**
     * Retrieve the `Entity` of the component from its `Instance`.
     *
     * @param i Instance of the component obtained from getInstance()
     */
    public getEntity(i: number): Entity;
    /**
     * Retrieve the Entities of all the components of this manager.
     *
     * @returns A list, in no particular order, of all the entities managed by this manager.
     */
    public getEntities(): Entity;
    /**
     * Enables or disable the accurate translation mode. Disabled by default.
     *
     * When accurate translation mode is active, the translation component of all transforms is
     * maintained at double precision. This is only useful if the mat4 version of setTransform() is
     * used, as well as getTransformAccurate().
     *
     * @param enable true to enable the accurate translation mode, false to disable.
     * @see isAccurateTranslationsEnabled
     * @see create(utils::Entity, Instance, const math::mat4 & );
     * @see setTransform(Instance, const math::mat4 & )
     * @see getTransformAccurate
     * @see getWorldTransformAccurate
     */
    public setAccurateTranslationsEnabled(enable: boolean): void;
    /**
     * Returns whether the high precision translation mode is active.
     *
     * @returns true if accurate translations mode is active, false otherwise
     * @see setAccurateTranslationsEnabled
     */
    public isAccurateTranslationsEnabled(): boolean;
    /**
     * Creates a transform component and associate it with the given entity.
     *
     * If this component already exists on the given entity, it is first destroyed as if
     * destroy(utils::Entity e) was called.
     *
     * @param entity An Entity to associate a transform component to.
     * @param parent The Instance of the parent transform, or Instance{} if no parent.
     * @param localTransform The transform to initialize the transform component with. This is
     *     always relative to the parent.
     * @see destroy()
     */
    public createMat4f(entity: Entity, parent: number, localTransform: mat4): void;
    public createMat4d(entity: Entity, parent: number, localTransform: mat4): void;
    public create(entity: Entity, parent?: number): void;
    /**
     * Destroys this component from the given entity, children are orphaned.
     *
     * @remarks If this transform had children, these are orphaned, which means their local
     * transform becomes a world transform. Usually it's nonsensical. It's recommended to make sure
     * that a destroyed transform doesn't have children.
     *
     * @param e An entity.
     * @see create()
     */
    public destroy(e: Entity): void;
    /**
     * Re-parents an entity to a new one.
     *
     * @param i The instance of the transform component to re-parent
     * @param newParent The instance of the new parent transform
     * @see getInstance()
     */
    public setParent(i: number, newParent: number): void;
    /**
     * Returns the parent of a transform component, or the null entity if it is a root.
     *
     * @param i The instance of the transform component to query.
     */
    public getParent(i: number): Entity;
    /**
     * Returns the number of children of a transform component.
     *
     * @param i The instance of the transform component to query.
     * @returns The number of children of the queried component.
     */
    public getChildCount(i: number): number;
    /**
     * Gets a list of children for a transform component.
     *
     * @param i The instance of the transform component to query.
     * @param children Pointer to array-of-Entity. The array must have at least "count" elements.
     * @param count The maximum number of children to retrieve.
     * @returns The number of children written to the pointer.
     */
    public getChildren(i: number, children: Entity, count: number): number;
    /**
     * Returns an iterator to the Instance of the first child of the given parent.
     *
     * A child_iterator can only safely be dereferenced if it's different from
     * getChildrenEnd(parent)
     *
     * @param parent Instance of the parent
     * @returns A forward iterator pointing to the first child of the given parent.
     */
    public getChildrenBegin(parent: number): TransformManager$children_iterator;
    /**
     * Returns an undreferencable iterator representing the end of the children list
     *
     * This iterator cannot be dereferenced
     *
     * @param parent Instance of the parent
     * @returns A forward iterator.
     */
    public getChildrenEnd(parent: number): TransformManager$children_iterator;
    /**
     * Gets a range wrapper to iterate over children of a transform component. Enables elegant
     * range-based for-loops.
     *
     * @param parent The instance of the parent transform
     * @returns A children_range object
     */
    public getChildrenRange(parent: number): TransformManager$children_range;
    /**
     * Sets a local transform of a transform component.
     *
     * @param ci The instance of the transform component to set the local transform to.
     * @param localTransform The local transform (i.e. relative to the parent).
     * @see getTransform()
     */
    public setTransformMat4f(ci: number, localTransform: mat4): void;
    /**
     * Sets a local transform of a transform component and keeps double precision translation. All
     * other values of the transform are stored at single precision.
     *
     * @param ci The instance of the transform component to set the local transform to.
     * @param localTransform The local transform (i.e. relative to the parent).
     * @see getTransform()
     */
    public setTransformMat4d(ci: number, localTransform: mat4): void;
    /**
     * Returns the local transform of a transform component.
     *
     * @param ci The instance of the transform component to query the local transform from.
     * @returns The local transform of the component (i.e. relative to the parent). This always
     * returns the value set by setTransform().
     * @see setTransform()
     */
    public getTransform(ci: number): mat4;
    /**
     * Returns the local transform of a transform component.
     *
     * @param ci The instance of the transform component to query the local transform from.
     * @returns The local transform of the component (i.e. relative to the parent). This always
     * returns the value set by setTransform().
     * @see setTransform()
     */
    public getTransformAccurate(ci: number): mat4;
    /**
     * Return the world transform of a transform component.
     *
     * @param ci The instance of the transform component to query the world transform from.
     * @returns The world transform of the component (i.e. relative to the root). This is the
     * composition of this component's local transform with its parent's world transform.
     * @see setTransform()
     */
    public getWorldTransform(ci: number): mat4;
    /**
     * Return the world transform of a transform component.
     *
     * @param ci The instance of the transform component to query the world transform from.
     * @returns The world transform of the component (i.e. relative to the root). This is the
     * composition of this component's local transform with its parent's world transform.
     * @see setTransform()
     */
    public getWorldTransformAccurate(ci: number): mat4;
    /**
     * Opens a local transform transaction. During a transaction, getWorldTransform() can return an
     * invalid transform until commitLocalTransformTransaction() is called. However, setTransform()
     * will perform significantly better and in constant time.
     *
     * This is useful when updating many transforms and the transform hierarchy is deep (say more
     * than 4 or 5 levels).
     *
     * @remarks If the local transform transaction is already open, this is a no-op.
     * @see commitLocalTransformTransaction(), setTransform()
     */
    public openLocalTransformTransaction(): void;
    /**
     * Commits the currently open local transform transaction. When this returns, calls to
     * getWorldTransform() will return the proper value.
     *
     * @remarks If the local transform transaction is not open, this is a no-op.
     * @see openLocalTransformTransaction(), setTransform()
     */
    public commitLocalTransformTransaction(): void;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

export class TransformManager$children_iterator {
    public equals(other: TransformManager$children_iterator): boolean;
    public notEquals(other: TransformManager$children_iterator): boolean;
    public isAtEnd(): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

export class TransformManager$children_range {
    public begin(): TransformManager$children_iterator;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * TrsTransformManager is used to add entities with glTF-specific trs information.
 *
 * Trs information here just used for Animation, DON'T use for transform.
 */
export class TrsTransformManager {
    /**
     * Returns whether a particular Entity is associated with a component of this
     * TrsTransformManager
     *
     * @param e An Entity.
     * @returns true if this Entity has a component associated with this manager.
     */
    public hasComponent(e: Entity): boolean;
    /**
     * Gets an Instance representing the trs transform component associated with the given Entity.
     *
     * @remarks Use Instance::isValid() to make sure the component exists.
     *
     * @param e An Entity.
     * @returns An Instance object, which represents the trs transform component associated with
     * the Entity e.
     * @see hasComponent()
     */
    public getInstance(e: Entity): number;
    /**
     * Creates a trs transform component and associates it with the given entity.
     *
     * If this component already exists on the given entity, it is first destroyed as if
     * destroy(Entity e) was called.
     *
     * @param entity An Entity to associate a trs transform component with.
     * @see destroy()
     */
    public create(entity: Entity): void;
    public create(entity: Entity, translation: float3, rotation: quatf, scale: float3): void;
    /**
     * Destroys this component from the given entity.
     *
     * @param e An entity.
     * @see create()
     */
    public destroy(e: Entity): void;
    public setTranslation(ci: number, translation: float3): void;
    public getTranslation(ci: number): float3;
    public setRotation(ci: number, rotation: quatf): void;
    public getRotation(ci: number): quatf;
    public setScale(ci: number, scale: float3): void;
    public getScale(ci: number): float3;
    public setTrs(ci: number, translation: float3, rotation: quatf, scale: float3): void;
    public getTransform(ci: number): mat4;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Holds a set of buffers that define the geometry of a Renderable.
 *
 * The geometry of the Renderable itself is defined by a set of vertex attributes such as
 * position, color, normals, tangents, etc...
 *
 * There is no need to have a 1-to-1 mapping between attributes and buffer. A buffer can hold
 * the data of several attributes -- attributes are then referred as being "interleaved".
 *
 * The buffers themselves are GPU resources, therefore mutating their data can be relatively
 * slow. For this reason, it is best to separate the constant data from the dynamic data into
 * multiple buffers.
 *
 * It is possible, and even encouraged, to use a single vertex buffer for several Renderables.
 * @see IndexBuffer, RenderableManager
 */
export class VertexBuffer {
    /**
     * Returns the vertex count.
     *
     * @returns Number of vertices in this vertex buffer set.
     */
    public getVertexCount(): number;
    /**
     * copy-initializes the specified buffer from the given buffer data.
     *
     * Do not use this if you called enableBufferObjects() on the Builder.
     *
     * @param engine Reference to the filament::Engine to associate this VertexBuffer with.
     * @param bufferIndex Index of the buffer to initialize. Must be between 0 and
     *     Builder::bufferCount() - 1.
     * @param buffer A BufferDescriptor representing the data used to initialize the buffer at
     *     index `bufferIndex.` BufferDescriptor points to raw, untyped data that will be copied as-is
     *     into the buffer.
     * @param byteOffset Offset in *bytes* into the buffer at index `bufferIndex` of this vertex
     *     buffer set. Must be multiple of 4.
     */
    public setBufferAt(engine: Engine, bufferIndex: number, buffer: driver$BufferDescriptor, byteOffset?: number): void;
    /**
     * Swaps in the given buffer object.
     *
     * To use this, you must first call enableBufferObjects() on the Builder.
     *
     * @param engine Reference to the filament::Engine to associate this VertexBuffer with.
     * @param bufferIndex Index of the buffer to initialize. Must be between 0 and
     *     Builder::bufferCount() - 1.
     * @param bufferObject The handle to the GPU data that will be used in this buffer slot.
     */
    public setBufferObjectAt(engine: Engine, bufferIndex: number, bufferObject: BufferObject): void;
    /**
     * This non-blocking method checks if the resource has finished creation *successfully*. If the
     * resource creation was initiated asynchronously, it will return true only after all related
     * asynchronous tasks are complete, and only if none of them was canceled. If the resource was
     * created normally without using async method, it will always return true.
     *
     * A canceled asynchronous creation never populates the resource, so this method keeps
     * returning false for it. The object itself remains valid and must still be destroyed as
     * usual.
     *
     * @returns Whether the resource is created and usable.
     * @see Builder::async()
     */
    public isCreationComplete(): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

export class VertexBuffer$Builder {
    constructor();
    /**
     * Defines how many buffers will be created in this vertex buffer set. These buffers are later
     * referenced by index from 0 to `bufferCount` - 1.
     *
     * This call is mandatory. The default is 0.
     *
     * @param bufferCount Number of buffers in this vertex buffer set. The maximum value is 8.
     * @returns A reference to this Builder for chaining calls.
     */
    public bufferCount(bufferCount: number): VertexBuffer$Builder;
    /**
     * Size of each buffer in the set in vertex.
     *
     * @param vertexCount Number of vertices in each buffer in this set.
     * @returns A reference to this Builder for chaining calls.
     */
    public vertexCount(vertexCount: number): VertexBuffer$Builder;
    /**
     * Allows buffers to be swapped out and shared using BufferObject.
     *
     * If buffer objects mode is enabled, clients must call setBufferObjectAt rather than
     * setBufferAt. This allows sharing of data between VertexBuffer objects, but it may slightly
     * increase the memory footprint of Filament's internal bookkeeping.
     *
     * @param enabled If true, enables buffer object mode. False by default.
     */
    public enableBufferObjects(enabled?: boolean): VertexBuffer$Builder;
    /**
     * Sets up an attribute for this vertex buffer set.
     *
     * Using `byteOffset` and `byteStride,` attributes can be interleaved in the same buffer.
     *
     * This is a no-op if the `attribute` is an invalid enum. This is a no-op if the `bufferIndex`
     * is out of bounds.
     *
     * @remarks Warning: VertexAttribute::TANGENTS must be specified as a quaternion and is how
     * normals are specified.
     *
     * @remarks Warning: Not all backends support 3-component attributes that are not floats. For
     * help with conversion, see geometry::Transcoder.
     *
     * @param attribute The attribute to set up.
     * @param bufferIndex The index of the buffer containing the data for this attribute. Must be
     *     between 0 and bufferCount() - 1.
     * @param attributeType The type of the attribute data (e.g. byte, float3, etc...)
     * @param byteOffset Offset in *bytes* into the buffer `bufferIndex`
     * @param byteStride Stride in *bytes* to the next element of this attribute. When set to zero
     *     the attribute size, as defined by `attributeType` is used.
     * @returns A reference to this Builder for chaining calls.
     * @see VertexAttribute
     */
    public attribute(attribute: VertexAttribute, bufferIndex: number, attributeType: ElementType, byteOffset?: number, byteStride?: number): VertexBuffer$Builder;
    /**
     * Sets whether a given attribute should be normalized. By default attributes are not
     * normalized. A normalized attribute is mapped between 0 and 1 in the shader. This applies
     * only to integer types.
     *
     * This is a no-op if the `attribute` is an invalid enum.
     *
     * @param attribute Enum of the attribute to set the normalization flag to.
     * @param normalized true to automatically normalize the given attribute.
     * @returns A reference to this Builder for chaining calls.
     */
    public normalized(attribute: VertexAttribute, normalized?: boolean): VertexBuffer$Builder;
    /**
     * Sets advanced skinning mode. Bone data, indices and weights will be set in
     * RenderableManager:Builder:boneIndicesAndWeights methods. Works with or without buffer
     * objects.
     *
     * @param enabled If true, enables advanced skinning mode. False by default.
     * @returns A reference to this Builder for chaining calls.
     * @see RenderableManager:Builder:boneIndicesAndWeights
     */
    public advancedSkinning(enabled: boolean): VertexBuffer$Builder;
    /**
     * Associate an optional name with this VertexBuffer for debugging purposes.
     *
     * name will show in error messages and should be kept as short as possible. The name is
     * truncated to a maximum of 128 characters.
     *
     * The name string is copied during this method so clients may free its memory after the
     * function returns.
     *
     * @deprecated Use name(utils::StaticString const & ) instead.
     *
     * @param name A string to identify this VertexBuffer
     * @param len Length of name, should be less than or equal to 128
     * @returns This Builder, for chaining calls.
     */
    public name(name: string, len: number): VertexBuffer$Builder;
    /**
     * Creates the VertexBuffer object and returns a pointer to it.
     *
     * @param engine Reference to the filament::Engine to associate this VertexBuffer with.
     * @returns pointer to the newly created object.
     */
    public build(engine: Engine): VertexBuffer;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * A View encompasses all the state needed for rendering a Scene.
 *
 * Renderer::render() operates on View objects. These View objects specify important parameters
 * such as: - The Scene - The Camera - The Viewport - Some rendering parameters
 *
 * For example, in a game, a View could be used for the main scene and another one for the
 * game's user interface. More View instances could be used for creating special effects (e.g.
 * a View is akin to a rendering pass).
 *
 * @remarks View instances are heavy objects that internally cache a lot of data needed for
 * rendering. It is not advised for an application to use many View objects.
 * @see Renderer, Scene, Camera, RenderTarget
 */
export class View {
    /**
     * Sets the View's name. Only useful for debugging.
     *
     * @param name Pointer to the View's name. The string is copied.
     */
    public setName(name: string): void;
    /**
     * Returns the View's name
     *
     * @returns a pointer owned by the View instance to the View's name.
     */
    public getName(): string;
    /**
     * Set this View instance's Scene.
     *
     * @remarks There is no reference-counting. If a Scene is destroyed before it is dissociated
     * from a View, it will be automatically dissociated from that View (setting the View's Scene
     * to nullptr).
     *
     * @param scene Associate the specified Scene to this View. A Scene can be associated to
     *     several View instances. `scene` can be nullptr to dissociate the currently set Scene from
     *     this View. The View doesn't take ownership of the Scene pointer (which acts as a reference).
     */
    public setScene(scene: Scene): void;
    /**
     * Returns the Scene currently associated with this View.
     *
     * @returns A pointer to the Scene associated to this View. nullptr if no Scene is set.
     */
    public getScene(): Scene;
    /**
     * Specifies an offscreen render target to render into.
     *
     * By default, the view's associated render target is nullptr, which corresponds to the
     * SwapChain associated with the engine.
     *
     * A view with a custom render target cannot rely on Renderer::ClearOptions, which only apply
     * to the SwapChain. Such view can use a Skybox instead.
     *
     * @param renderTarget Render target associated with view, or nullptr for the swap chain.
     */
    public setRenderTarget(renderTarget: RenderTarget): void;
    /**
     * Gets the offscreen render target associated with this view.
     *
     * Returns nullptr if the render target is the swap chain (which is default).
     * @see setRenderTarget
     */
    public getRenderTarget(): RenderTarget;
    /**
     * Sets the rectangular region to render to.
     *
     * The viewport specifies where the content of the View (i.e. the Scene) is rendered in the
     * render target. The Render target is automatically clipped to the Viewport.
     *
     * @param viewport The Viewport to render the Scene into. The Viewport is a value-type, it is
     *     therefore copied. The parameter can be discarded after this call returns.
     */
    public setViewport(viewport: Viewport): void;
    /**
     * Returns the rectangular region that gets rendered to.
     *
     * @returns A constant reference to View's viewport.
     */
    public getViewport(): Viewport;
    /**
     * Sets this View's Camera.
     *
     * @remarks There is no reference-counting. Make sure to dissociate a Camera from all Views
     * before destroying it.
     *
     * @param camera Associate the specified Camera to this View. A Camera can be associated to
     *     several View instances. `camera` can be nullptr to dissociate the currently set Camera from
     *     this View. The View doesn't take ownership of the Camera pointer (which acts as a
     *     reference). If the camera isn't set, Renderer::render() will result in a no-op.
     */
    public setCamera(camera: Camera): void;
    /**
     * Returns whether a Camera is set.
     *
     * @returns true if a camera is set.
     * @see setCamera()
     */
    public hasCamera(): boolean;
    /**
     * Returns the Camera currently associated with this View. Undefined behavior if hasCamera() is
     * false.
     *
     * @returns A reference to the Camera associated to this View if hasCamera() is true.
     * @see hasCamera()
     */
    public getCamera(): Camera;
    /**
     * Sets whether a channel must clear the depth buffer before all primitives are rendered.
     * Channel depth clear is off by default for all channels. This is orthogonal to
     * Renderer::setClearOptions().
     *
     * @param channel between 0 and 7
     * @param enabled true to enable clear, false to disable
     */
    public setChannelDepthClearEnabled(channel: number, enabled: boolean): void;
    /**
     * @param channel between 0 and 7
     * @returns true if this channel has depth clear enabled.
     */
    public isChannelDepthClearEnabled(channel: number): boolean;
    /**
     * Sets the blending mode used to draw the view into the SwapChain.
     *
     * @param blendMode either BlendMode::OPAQUE or BlendMode::TRANSLUCENT
     * @see getBlendMode
     */
    public setBlendMode(blendMode: BlendMode): void;
    /**
     * @returns blending mode set by setBlendMode
     * @see setBlendMode
     */
    public getBlendMode(): BlendMode;
    /**
     * Sets which layers are visible.
     *
     * Renderable objects can have one or several layers associated to them. Layers are represented
     * with an 8-bits bitmask, where each bit corresponds to a layer.
     *
     * This call sets which of those layers are visible. Renderables in invisible layers won't be
     * rendered.
     *
     * @remarks By default only layer 0 (bitmask 0x01) is visible.
     *
     * @remarks This is a convenient way to quickly show or hide sets of Renderable objects.
     *
     * @param select a bitmask specifying which layer to set or clear using `values.`
     * @param values a bitmask where each bit sets the visibility of the corresponding layer (1:
     *     visible, 0: invisible), only layers in `select` are affected.
     * @see RenderableManager::setLayerMask().
     */
    public setVisibleLayers(select: number, values: number): void;
    /**
     * Helper function to enable or disable a visibility layer.
     *
     * @param layer layer between 0 and 7 to enable or disable
     * @param enabled true to enable the layer, false to disable it
     * @see RenderableManager::setVisibleLayers()
     */
    public setLayerEnabled(layer: number, enabled: boolean): void;
    /**
     * Get the visible layers.
     * @see View::setVisibleLayers()
     */
    public getVisibleLayers(): number;
    /**
     * Enables or disables shadow mapping. Enabled by default.
     *
     * @param enabled true enables shadow mapping, false disables it.
     * @see LightManager::Builder::castShadows(), RenderableManager::Builder::receiveShadows(),
     * RenderableManager::Builder::castShadows(),
     */
    public setShadowingEnabled(enabled: boolean): void;
    /** @returns whether shadowing is enabled */
    public isShadowingEnabled(): boolean;
    /**
     * Enables or disables screen space refraction. Enabled by default.
     *
     * @param enabled true enables screen space refraction, false disables it.
     */
    public setScreenSpaceRefractionEnabled(enabled: boolean): void;
    /** @returns whether screen space refraction is enabled */
    public isScreenSpaceRefractionEnabled(): boolean;
    /**
     * Sets how many samples are to be used for MSAA in the post-process stage. Default is 1 and
     * disables MSAA. Note that post-processing is disabled at FL0. If the feature level is set to
     * 0, values passed to this function are ignored.
     *
     * @deprecated use setMultiSampleAntiAliasingOptions instead
     *
     * @remarks Anti-aliasing can also be performed in the post-processing stage, generally at
     * lower cost. See setAntialiasing.
     *
     * @param count number of samples to use for multi-sampled anti-aliasing. 0: treated as 1 1: no
     *     anti-aliasing n: sample count. Effective sample could be different depending on the GPU
     *     capabilities.
     * @see setAntialiasing
     */
    public setSampleCount(count?: number): void;
    /**
     * Returns the sample count set by setSampleCount(). Effective sample count could be different.
     * A value of 0 or 1 means MSAA is disabled.
     *
     * @deprecated use getMultiSampleAntiAliasingOptions instead
     *
     * @returns value set by setSampleCount().
     */
    public getSampleCount(): number;
    /**
     * Enables or disables anti-aliasing in the post-processing stage. Enabled by default. MSAA can
     * be enabled in addition, see setSampleCount().
     *
     * @remarks For MSAA anti-aliasing, see setSamplerCount().
     *
     * @param type FXAA for enabling, NONE for disabling anti-aliasing.
     * @see setSampleCount
     */
    public setAntiAliasing(type: AntiAliasing): void;
    /**
     * Queries whether anti-aliasing is enabled during the post-processing stage. To query whether
     * MSAA is enabled, see getSampleCount().
     *
     * @returns The post-processing anti-aliasing method.
     */
    public getAntiAliasing(): AntiAliasing;
    /**
     * Enables or disable temporal anti-aliasing (TAA). Disabled by default.
     *
     * @param options temporal anti-aliasing options
     */
    public setTemporalAntiAliasingOptions(options: TemporalAntiAliasingOptions): void;
    /**
     * Returns temporal anti-aliasing options.
     *
     * @returns temporal anti-aliasing options
     */
    public getTemporalAntiAliasingOptions(): TemporalAntiAliasingOptions;
    /**
     * Enables or disable screen-space reflections. Disabled by default.
     *
     * @param options screen-space reflections options
     */
    public setScreenSpaceReflectionsOptions(options: ScreenSpaceReflectionsOptions): void;
    /**
     * Returns screen-space reflections options.
     *
     * @returns screen-space reflections options
     */
    public getScreenSpaceReflectionsOptions(): ScreenSpaceReflectionsOptions;
    /**
     * Enables or disable screen-space guard band. Disabled by default.
     *
     * @param options guard band options
     */
    public setGuardBandOptions(options: GuardBandOptions): void;
    /**
     * Returns screen-space guard band options.
     *
     * @returns guard band options
     */
    public getGuardBandOptions(): GuardBandOptions;
    /**
     * Enables or disable multi-sample anti-aliasing (MSAA). Disabled by default. Note that MSAA is
     * a post-processing effect, and post-processing is disabled at FL0. If the feature level is
     * set to 0, values passed to this function are ignored.
     *
     * @param options multi-sample anti-aliasing options
     */
    public setMultiSampleAntiAliasingOptions(options: MultiSampleAntiAliasingOptions): void;
    /**
     * Returns multi-sample anti-aliasing options.
     *
     * @returns multi-sample anti-aliasing options
     */
    public getMultiSampleAntiAliasingOptions(): MultiSampleAntiAliasingOptions;
    /**
     * Sets this View's color grading transforms.
     *
     * @remarks There is no reference-counting. Make sure to dissociate a ColorGrading from all
     * Views before destroying it.
     *
     * @param colorGrading Associate the specified ColorGrading to this View. A ColorGrading can be
     *     associated to several View instances. `colorGrading` can be nullptr to dissociate the
     *     currently set ColorGrading from this View. Doing so will revert to the use of the default
     *     color grading transforms. The View doesn't take ownership of the ColorGrading pointer (which
     *     acts as a reference).
     */
    public setColorGrading(colorGrading: ColorGrading): void;
    /**
     * Returns the color grading transforms currently associated to this view.
     *
     * @returns A pointer to the ColorGrading associated to this View.
     */
    public getColorGrading(): ColorGrading;
    /**
     * Sets ambient occlusion options.
     *
     * @param options Options for ambient occlusion.
     */
    public setAmbientOcclusionOptions(options: AmbientOcclusionOptions): void;
    /**
     * Gets the ambient occlusion options.
     *
     * @returns ambient occlusion options currently set.
     */
    public getAmbientOcclusionOptions(): AmbientOcclusionOptions;
    /**
     * Enables or disables bloom in the post-processing stage. Disabled by default.
     *
     * @param options options. Values may be silently clamped to valid ranges.
     */
    public setBloomOptions(options: BloomOptions): void;
    /**
     * Queries the bloom options.
     *
     * @returns the current bloom options for this view.
     */
    public getBloomOptions(): BloomOptions;
    /**
     * Enables or disables fog. Disabled by default.
     *
     * @param options options
     */
    public setFogOptions(options: FogOptions): void;
    /**
     * Queries the fog options.
     *
     * @returns the current fog options for this view.
     */
    public getFogOptions(): FogOptions;
    /**
     * Enables or disables Depth of Field. Disabled by default.
     *
     * @param options options
     */
    public setDepthOfFieldOptions(options: DepthOfFieldOptions): void;
    /**
     * Queries the depth of field options.
     *
     * @returns the current depth of field options for this view.
     */
    public getDepthOfFieldOptions(): DepthOfFieldOptions;
    /**
     * Enables or disables the vignetted effect in the post-processing stage. Disabled by default.
     *
     * @param options options
     */
    public setVignetteOptions(options: VignetteOptions): void;
    /**
     * Queries the vignette options.
     *
     * @returns the current vignette options for this view.
     */
    public getVignetteOptions(): VignetteOptions;
    /**
     * Enables or disables dithering in the post-processing stage. Enabled by default.
     *
     * @param dithering dithering type
     */
    public setDithering(dithering: Dithering): void;
    /**
     * Queries whether dithering is enabled during the post-processing stage.
     *
     * @returns the current dithering type for this view.
     */
    public getDithering(): Dithering;
    /**
     * Sets the dynamic resolution options for this view. Dynamic resolution options controls
     * whether dynamic resolution is enabled, and if it is, how it behaves.
     *
     * @param options The dynamic resolution options to use on this view
     */
    public setDynamicResolutionOptions(options: DynamicResolutionOptions): void;
    /**
     * Returns the dynamic resolution options associated with this view.
     *
     * @returns value set by setDynamicResolutionOptions().
     */
    public getDynamicResolutionOptions(): DynamicResolutionOptions;
    /**
     * Returns the last dynamic resolution scale factor used by this view. This value is updated
     * when Renderer::render(View*) is called
     *
     * @returns a float2 where x is the horizontal and y the vertical scale factor.
     * @see Renderer::render
     */
    public getLastDynamicResolutionScale(): float2;
    /**
     * Sets the rendering quality for this view. Refer to RenderQuality for more information about
     * the different settings available.
     *
     * @param renderQuality The render quality to use on this view
     */
    public setRenderQuality(renderQuality: RenderQuality): void;
    /**
     * Returns the render quality used by this view.
     *
     * @returns value set by setRenderQuality().
     */
    public getRenderQuality(): RenderQuality;
    /**
     * Sets options relative to dynamic lighting for this view.
     *
     * Together zLightNear and zLightFar must be chosen so that the visible influence of lights is
     * spread between these two values.
     *
     * @param zLightNear Distance from the camera where the lights are expected to shine. This
     *     parameter can affect performance and is useful because depending on the scene, lights that
     *     shine close to the camera may not be visible -- in this case, using a larger value can
     *     improve performance. e.g. when standing and looking straight, several meters of the ground
     *     isn't visible and if lights are expected to shine there, there is no point using a short
     *     zLightNear. This value is clamped between the camera near and far plane. (Default 5m).
     * @param zLightFar Distance from the camera after which lights are not expected to be visible.
     *     Similarly to zLightNear, setting this value properly can improve performance. This value is
     *     clamped between the camera near and far plane. (Default 100m).
     */
    public setDynamicLightingOptions(zLightNear: number, zLightFar: number): void;
    /**
     * Sets the grid size for grid-based world origin snapping.
     *
     * The world origin used for rendering will snap to a grid of this size. This avoids
     * recomputing all transforms every frame when the camera moves within a grid cell.
     *
     * Hysteresis is applied automatically to avoid rapid snapping near edges.
     *
     * @param size The size of the grid cell in world units. If set to 0 or negative, the grid size
     *     is automatically calculated based on the camera frustum.
     */
    public setGridSize(size: number): void;
    /**
     * Returns the grid size used for grid-based world origin snapping.
     *
     * @returns The grid size in world units. A value of 0 or negative means automatic calculation
     * is enabled.
     */
    public getGridSize(): number;
    /**
     * Returns the effective grid size used for grid-based world origin snapping. If grid size was
     * set to 0 or negative, this returns the automatically calculated size.
     *
     * @returns The effective grid size in world units.
     */
    public getEffectiveGridSize(): number;
    public setShadowType(shadow: ShadowType): void;
    /**
     * Returns the shadow mapping technique used by this View.
     *
     * @returns value set by setShadowType().
     */
    public getShadowType(): ShadowType;
    /**
     * Sets VSM shadowing options that apply across the entire View.
     *
     * Additional light-specific VSM options can be set with LightManager::setShadowOptions.
     *
     * Only applicable when shadow type is set to ShadowType::VSM.
     *
     * @remarks Warning: This API is still experimental and subject to change.
     *
     * @param options Options for shadowing.
     * @see setShadowType
     */
    public setVsmShadowOptions(options: VsmShadowOptions): void;
    /**
     * Returns the VSM shadowing options associated with this View.
     *
     * @returns value set by setVsmShadowOptions().
     */
    public getVsmShadowOptions(): VsmShadowOptions;
    /**
     * Sets soft shadowing options that apply across the entire View.
     *
     * Additional light-specific soft shadow parameters can be set with
     * LightManager::setShadowOptions.
     *
     * Only applicable when shadow type is set to ShadowType::PCSS.
     *
     * @remarks Warning: This API is still experimental and subject to change.
     *
     * @param options Options for shadowing.
     * @see setShadowType
     */
    public setSoftShadowOptions(options: SoftShadowOptions): void;
    /**
     * Returns the soft shadowing options associated with this View.
     *
     * @returns value set by setSoftShadowOptions().
     */
    public getSoftShadowOptions(): SoftShadowOptions;
    /**
     * Enables or disables post processing. Enabled by default.
     *
     * Post-processing includes: - Depth-of-field - Bloom - Vignetting - Temporal Anti-aliasing
     * (TAA) - Color grading & gamma encoding - Dithering - FXAA - Dynamic scaling
     *
     * Disabling post-processing forgoes color correctness as well as some anti-aliasing techniques
     * and should only be used for debugging, UI overlays or when using custom render targets (see
     * RenderTarget).
     *
     * @param enabled true enables post processing, false disables it.
     * @see setBloomOptions, setColorGrading, setAntiAliasing, setDithering, setSampleCount
     */
    public setPostProcessingEnabled(enabled: boolean): void;
    /** Returns true if post-processing is enabled. See setPostProcessingEnabled() for more info. */
    public isPostProcessingEnabled(): boolean;
    /**
     * Inverts the winding order of front faces. By default front faces use a counter-clockwise
     * winding order. When the winding order is inverted, front faces are faces with a clockwise
     * winding order.
     *
     * Changing the winding order will directly affect the culling mode in materials (see
     * Material::getCullingMode()).
     *
     * Inverting the winding order of front faces is useful when rendering mirrored reflections
     * (water, mirror surfaces, front camera in AR, etc.).
     *
     * @param inverted True to invert front faces, false otherwise.
     */
    public setFrontFaceWindingInverted(inverted: boolean): void;
    /**
     * Returns true if the winding order of front faces is inverted. See
     * setFrontFaceWindingInverted() for more information.
     */
    public isFrontFaceWindingInverted(): boolean;
    /**
     * Enables or disables transparent picking. Disabled by default.
     *
     * When transparent picking is enabled, View::pick() will pick from both transparent and opaque
     * renderables. When disabled, View::pick() will only pick from opaque renderables.
     *
     * @remarks Transparent picking will create an extra pass for rendering depth from both
     * transparent and opaque renderables.
     *
     * @param enabled true enables transparent picking, false disables it.
     */
    public setTransparentPickingEnabled(enabled: boolean): void;
    /**
     * Returns true if transparent picking is enabled. See setTransparentPickingEnabled() for more
     * information.
     */
    public isTransparentPickingEnabled(): boolean;
    /**
     * Enables use of the stencil buffer.
     *
     * The stencil buffer is an 8-bit, per-fragment unsigned integer stored alongside the depth
     * buffer. The stencil buffer is cleared at the beginning of a frame and discarded after the
     * color pass.
     *
     * Each fragment's stencil value is set during rasterization by specifying stencil operations
     * on a Material. The stencil buffer can be used as a mask for later rendering by setting a
     * Material's stencil comparison function and reference value. Fragments that don't pass the
     * stencil test are then discarded.
     *
     * If post-processing is disabled, then the SwapChain must have the CONFIG_HAS_STENCIL_BUFFER
     * flag set in order to use the stencil buffer.
     *
     * A renderable's priority (see RenderableManager::setPriority) is useful to control the order
     * in which primitives are drawn.
     *
     * @param enabled True to enable the stencil buffer, false disables it (default)
     */
    public setStencilBufferEnabled(enabled: boolean): void;
    /**
     * Returns true if the stencil buffer is enabled. See setStencilBufferEnabled() for more
     * information.
     */
    public isStencilBufferEnabled(): boolean;
    /**
     * Sets the stereoscopic rendering options for this view.
     *
     * Currently, only one type of stereoscopic rendering is supported: side-by-side. Side-by-side
     * stereo rendering splits the viewport into two halves: a left and right half. Eye 0 will
     * render to the left half, while Eye 1 will render into the right half.
     *
     * Currently, the following features are not supported with stereoscopic rendering: -
     * post-processing - shadowing - punctual lights
     *
     * Stereo rendering depends on device and platform support. To check if stereo rendering is
     * supported, use Engine::isStereoSupported(). If stereo rendering is not supported, then the
     * stereoscopic options have no effect.
     *
     * @param options The stereoscopic options to use on this view
     */
    public setStereoscopicOptions(options: StereoscopicOptions): void;
    /**
     * Returns the stereoscopic options associated with this View.
     *
     * @returns value set by setStereoscopicOptions().
     */
    public getStereoscopicOptions(): StereoscopicOptions;
    /** debugging: allows to entirely disable frustum culling. (culling enabled by default). */
    public setFrustumCullingEnabled(culling: boolean): void;
    /** debugging: returns whether frustum culling is enabled. */
    public isFrustumCullingEnabled(): boolean;
    /** debugging: sets the Camera used for rendering. It may be different from the culling camera. */
    public setDebugCamera(camera: Camera): void;
    /** debugging: enable or disable froxel visualisation for this view. */
    public setFroxelVizEnabled(enabled: boolean): void;
    public getFroxelConfigurationInfo(): View$FroxelConfigurationInfoWithAge;
    /**
     * Set the value of material global variables. There are up-to four such variable each of type
     * float4. These variables can be read in a user Material with `getMaterialGlobal{0|1|2|3}()`.
     * All variable start with a default value of { 0, 0, 0, 1 }
     *
     * @param index index of the variable to set between 0 and 3.
     * @param value new value for the variable.
     * @see getMaterialGlobal
     */
    public setMaterialGlobal(index: number, value: float4): void;
    /**
     * Get the value of the material global variables. All variable start with a default value of {
     * 0, 0, 0, 1 }
     *
     * @param index index of the variable to set between 0 and 3.
     * @returns current value of the variable.
     * @see setMaterialGlobal
     */
    public getMaterialGlobal(index: number): float4;
    /**
     * Get an Entity representing the large scale fog object. This entity is always inherited by
     * the View's Scene.
     *
     * It is for example possible to create a TransformManager component with this Entity and apply
     * a transformation globally on the fog.
     *
     * @returns an Entity representing the large scale fog object.
     */
    public getFogEntity(): Entity;
    /**
     * Returns the most recent number of visible renderables for the current Scene as calculated
     * the last time Renderer::render() was called with this View and Scene.
     *
     * Returns -1 if the cache is invalid (e.g. before the first render call, or if the scene was
     * detached).
     *
     * @returns the number of visible renderables, or -1 if no value is available.
     */
    public getVisibleRenderableCount(): number;
    /**
     * When certain temporal features are used (e.g.: TAA or Screen-space reflections), the view
     * keeps a history of previous frame renders associated with the Renderer the view was last
     * used with. When switching Renderer, it may be necessary to clear that history by calling
     * this method. Similarly, if the whole content of the screen change, like when a cut-scene
     * starts, clearing the history might be needed to avoid artifacts due to the previous frame
     * being very different.
     */
    public clearFrameHistory(engine: Engine): void;
    /**
     * Activates or deactivates ambient occlusion.
     *
     * @deprecated use setAmbientOcclusionOptions() instead
     *
     * @param ambientOcclusion Type of ambient occlusion to use.
     * @see setAmbientOcclusionOptions
     */
    public setAmbientOcclusion(ambientOcclusion: View$AmbientOcclusion): void;
    /**
     * Queries the type of ambient occlusion active for this View.
     *
     * @deprecated use getAmbientOcclusionOptions() instead
     *
     * @returns ambient occlusion type.
     * @see getAmbientOcclusionOptions
     */
    public getAmbientOcclusion(): View$AmbientOcclusion;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Viewport describes a view port in pixel coordinates
 *
 * A view port is represented by its left-bottom coordinate, width and height in pixels.
 */
export class Viewport {
    constructor();
    /**
     * Returns whether the area of the view port is null.
     *
     * @returns true if either width or height is 0 pixel.
     */
    public empty(): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Helper that enables camera interaction similar to sketchfab or Google Maps.
 *
 * Clients notify the camera manipulator of various mouse or touch events, then periodically
 * call its getLookAt() method so that they can adjust their camera(s). Three modes are
 * supported: ORBIT, MAP, and FREE_FLIGHT. To construct a manipulator instance, the desired
 * mode is passed into the create method.
 *
 * Usage example:
 *
 * using CameraManipulator = camutils::Manipulator <float >; CameraManipulator* manip;
 *
 * void init() { manip = CameraManipulator::Builder() .viewport(1024, 768)
 * .build(camutils::Mode::ORBIT); }
 *
 * void onMouseDown(int x, int y) { manip->grabBegin(x, y, false); }
 *
 * void onMouseMove(int x, int y) { manip->grabUpdate(x, y); }
 *
 * void onMouseUp(int x, int y) { manip->grabEnd(); }
 *
 * void gameLoop() { while (true) { filament::math::float3 eye, center, up; manip->getLookAt(
 * &eye , &center , &up ); camera->lookAt(eye, center, up); render(); } }
 * @see Bookmark
 */
export class camutils$Manipulator {
    /** Gets the immutable mode of the manipulator. */
    public getMode(): camutils$Mode;
    /** Sets the viewport dimensions. The manipulator uses this to process grab events and raycasts. */
    public setViewport(width: number, height: number): void;
    /**
     * Starts a grabbing session (i.e. the user is dragging around in the viewport).
     *
     * In MAP mode, this starts a panning session. In ORBIT mode, this starts either rotating or
     * strafing. In FREE_FLIGHT mode, this starts a nodal panning session.
     *
     * @param x X-coordinate for point of interest in viewport space
     * @param y Y-coordinate for point of interest in viewport space
     * @param strafe ORBIT mode only; if true, starts a translation rather than a rotation
     */
    public grabBegin(x: number, y: number, strafe: boolean): void;
    /**
     * Updates a grabbing session.
     *
     * This must be called at least once between grabBegin / grabEnd to dirty the camera.
     */
    public grabUpdate(x: number, y: number): void;
    /** Ends a grabbing session. */
    public grabEnd(): void;
    /**
     * Signals that a key is now in the down state.
     *
     * In FREE_FLIGHT mode, the camera is translated forward and backward and strafed left and
     * right depending on the depressed keys. This allows WASD-style movement.
     */
    public keyDown(key: camutils$Manipulator$Key): void;
    /**
     * Signals that a key is now in the up state.
     * @see keyDown
     */
    public keyUp(key: camutils$Manipulator$Key): void;
    /**
     * In MAP and ORBIT modes, dollys the camera along the viewing direction. In FREE_FLIGHT mode,
     * adjusts the move speed of the camera.
     *
     * @param x X-coordinate for point of interest in viewport space, ignored in FREE_FLIGHT mode
     * @param y Y-coordinate for point of interest in viewport space, ignored in FREE_FLIGHT mode
     * @param scrolldelta In MAP and ORBIT modes, negative means "zoom in", positive means "zoom
     *     out" In FREE_FLIGHT mode, negative means "slower", positive means "faster"
     */
    public scroll(x: number, y: number, scrolldelta: number): void;
    /**
     * Processes input and updates internal state.
     *
     * This must be called once every frame before getLookAt is valid.
     *
     * @param deltaTime The amount of time, in seconds, passed since the previous call to update.
     */
    public update(deltaTime: number): void;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

export class camutils$Manipulator$Builder {
    public viewport(width: number, height: number): camutils$Manipulator$Builder;
    /** Width and height of the viewing area */
    public targetPosition(x: number, y: number, z: number): camutils$Manipulator$Builder;
    /** World-space position of interest, defaults to (0,0,0) */
    public upVector(x: number, y: number, z: number): camutils$Manipulator$Builder;
    /** Orientation for the home position, defaults to (0,1,0) */
    public zoomSpeed(val: number): camutils$Manipulator$Builder;
    /** Multiplied with scroll delta, defaults to 0.01 */
    public orbitHomePosition(x: number, y: number, z: number): camutils$Manipulator$Builder;
    /** Initial eye position in world space, defaults to (0,0,1) */
    public orbitSpeed(x: number, y: number): camutils$Manipulator$Builder;
    /** Multiplied with viewport delta, defaults to 0.01 */
    public fovDirection(fov: camutils$Fov): camutils$Manipulator$Builder;
    /** The axis that's held constant when viewport changes */
    public fovDegrees(degrees: number): camutils$Manipulator$Builder;
    /** The full FOV (not the half-angle) */
    public farPlane(distance: number): camutils$Manipulator$Builder;
    /** The distance to the far plane */
    public mapExtent(worldWidth: number, worldHeight: number): camutils$Manipulator$Builder;
    /** The ground size for computing home position */
    public mapMinDistance(mindist: number): camutils$Manipulator$Builder;
    /** Constrains the zoom-in level */
    public flightStartPosition(x: number, y: number, z: number): camutils$Manipulator$Builder;
    /** Initial eye position in world space, defaults to (0,0,0) */
    public flightStartOrientation(pitch: number, yaw: number): camutils$Manipulator$Builder;
    /** Initial orientation in pitch and yaw, defaults to (0,0) */
    public flightMaxMoveSpeed(maxSpeed: number): camutils$Manipulator$Builder;
    /** The maximum camera speed in world units per second, defaults to 10 */
    public flightSpeedSteps(steps: number): camutils$Manipulator$Builder;
    /** The number of speed steps adjustable with scroll wheel, defaults to 80 */
    public flightPanSpeed(x: number, y: number): camutils$Manipulator$Builder;
    /** Multiplied with viewport delta, defaults to 0.01,0.01 */
    public flightMoveDamping(damping: number): camutils$Manipulator$Builder;
    /**
     * Applies a deceleration to camera movement, defaults to 0 (no damping) Lower values give
     * slower damping times, a good default is 15 Too high a value may lead to instability
     */
    public groundPlane(a: number, b: number, c: number, d: number): camutils$Manipulator$Builder;
    /** Raycast function for accurate grab-and-pan */
    public panning(enabled: boolean): camutils$Manipulator$Builder;
    /**
     * Creates a new camera manipulator, either ORBIT, MAP, or FREE_FLIGHT.
     *
     * Clients can simply use "delete" to destroy the manipulator.
     */
    public build(mode: camutils$Mode): camutils$Manipulator;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * A color space in Filament is always an RGB color space. A specific RGB color space is
 * defined by the following properties: Three chromaticities of the red, green and blue
 * primaries, which define the gamut of the color space. A white point chromaticity that
 * defines the stimulus to which color space values are normalized (also just called "white").
 * An opto-electronic transfer function, also called opto-electronic conversion function or
 * often, and approximately, gamma function. An electro-optical transfer function, also called
 * electo-optical conversion function or often, and approximately, gamma function.
 *
 * Primaries and white point chromaticities In this implementation, the chromaticity of the
 * primaries and the white point of an RGB color space is defined in the CIE xyY color space.
 * This color space separates the chromaticity of a color, the x and y components, and its
 * luminance, the Y component. Since the primaries and the white point have full brightness,
 * the Y component is assumed to be 1 and only the x and y components are needed to encode
 * them.
 *
 * Transfer functions A transfer function is a color component conversion function, defined as
 * a single variable, monotonic mathematical function. It is applied to each individual
 * component of a color. They are used to perform the mapping between linear tristimulus values
 * and non-linear electronic signal value. The opto-electronic transfer function (OETF or OECF)
 * encodes tristimulus values in a scene to a non-linear electronic signal value.
 */
export class color$ColorSpace {
    public equals(rhs: color$ColorSpace): boolean;
    public getPrimaries(): color$Primaries;
    public getWhitePoint(): float2;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Defines the chromaticities of the primaries for a color space. The chromaticities are
 * expressed as three pairs of xy coordinates (in xyY) for the red, green, and blue
 * chromaticities.
 */
export class color$Gamut {
    public getPrimaries(): color$Primaries;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Intermediate class used when building a color space using the "-" syntax:
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ // Declares a "linear sRGB"
 * color space. ColorSpace myColorSpace = Rec709-Linear-D65;
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export class color$PartialColorSpace {

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * MaterialBuilder builds Filament materials from shader code.
 *
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ #include <filamat
 * /MaterialBuilder.h> using namespace filamat;
 *
 * // Must be called before any materials can be built. MaterialBuilder::init();
 *
 * MaterialBuilder builder; builder .name("My material") .material("void material (inout
 * MaterialInputs material) {" " prepareMaterial(material);" " material.baseColor.rgb =
 * float3(1.0, 0.0, 0.0);" "}") .shading(MaterialBuilder::Shading::LIT)
 * .targetApi(MaterialBuilder::TargetApi::ALL) .platform(MaterialBuilder::Platform::ALL);
 *
 * Package package = builder.build(); if (package.isValid()) { // success! }
 *
 * // Call when finished building all materials to release internal // MaterialBuilder
 * resources. MaterialBuilder::shutdown();
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * @see filament::Material
 */
export class filamat$MaterialBuilder {
    constructor();
    public noSamplerValidation(enabled: boolean): filamat$MaterialBuilder;
    /** Enable generation of ESSL 1.0 code in FL0 materials. */
    public includeEssl1(enabled: boolean): filamat$MaterialBuilder;
    /** Set the name of this material. */
    public name(name: string): filamat$MaterialBuilder;
    /** Set the commandline parameters of matc. Used for debugging purpose. */
    public compilationParameters(params: string): filamat$MaterialBuilder;
    /** Set the shading model. */
    public shading(shading: Shading): filamat$MaterialBuilder;
    /** Set the interpolation mode. */
    public interpolation(interpolation: Interpolation): filamat$MaterialBuilder;
    /** Add a parameter (i.e., a uniform) to this material. */
    public parameter(name: string, type: UniformType, precision?: Precision): filamat$MaterialBuilder;
    /** Add a parameter array to this material. */
    public parameter(name: string, size: number, type: UniformType, precision?: Precision): filamat$MaterialBuilder;
    /** Custom variables (all float4). */
    public variable(v: filamat$MaterialBuilder$Variable, name: string): filamat$MaterialBuilder;
    public variable(v: filamat$MaterialBuilder$Variable, name: string, precision: Precision): filamat$MaterialBuilder;
    /**
     * Require a specified attribute.
     *
     * position is always required and normal depends on the shading model.
     */
    public require(attribute: VertexAttribute): filamat$MaterialBuilder;
    /** Specify the domain that this material will operate in. */
    public materialDomain(materialDomain: MaterialDomain): filamat$MaterialBuilder;
    /**
     * Set the code content of this material.
     *
     * Surface Domain --------------
     *
     * Materials in the SURFACE domain must declare a function: ~~~~~ void material(inout
     * MaterialInputs material) { prepareMaterial(material); material.baseColor.rgb = float3(1.0,
     * 0.0, 0.0); } ~~~~~ this function *must* call `prepareMaterial(material)` before it returns.
     *
     * Post-process Domain -------------------
     *
     * Materials in the POST_PROCESS domain must declare a function: ~~~~~ void postProcess(inout
     * PostProcessInputs postProcess) { postProcess.color = float4(1.0); } ~~~~~
     *
     * @param code The source code of the material. Expected it to be all inlined. (#includes are
     *     resolved.)
     * @param line The line number offset of the material, where 0 is the first line. Used for
     *     error reporting
     */
    public material(code: string, line?: number): filamat$MaterialBuilder;
    /**
     * Set the vertex code content of this material.
     *
     * Surface Domain --------------
     *
     * Materials in the SURFACE domain must declare a function:
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ void
     * materialVertex(inout MaterialVertexInputs material) {
     *
     * } ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     *
     * Post-process Domain -------------------
     *
     * Materials in the POST_PROCESS domain must declare a function:
     * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ void
     * postProcessVertex(inout PostProcessVertexInputs postProcess) {
     *
     * } ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     *
     * @param code The source code of the material. Expected it to be all inlined. (#includes are
     *     resolved.)
     * @param line The line number offset of the material, where 0 is the first line. Used for
     *     error reporting
     */
    public materialVertex(code: string, line?: number): filamat$MaterialBuilder;
    public quality(quality: ShaderQuality): filamat$MaterialBuilder;
    public featureLevel(featureLevel: FeatureLevel): filamat$MaterialBuilder;
    /**
     * Set the blending mode for this material. When set to MASKED, alpha to coverage is turned on.
     * You can override this behavior using alphaToCoverage(false).
     */
    public blending(blending: BlendingMode): filamat$MaterialBuilder;
    /** Set the blend function for this material. blending must be et to CUSTOM. */
    public customBlendFunctions(srcRGB: BlendFunction, srcA: BlendFunction, dstRGB: BlendFunction, dstA: BlendFunction): filamat$MaterialBuilder;
    /**
     * Set the blending mode of the post-lighting color for this material. Only OPAQUE, TRANSPARENT
     * and ADD are supported, the default is TRANSPARENT. This setting requires the material
     * properties "postLightingColor" and "postLightingMixFactor" to be set.
     */
    public postLightingBlending(blending: BlendingMode): filamat$MaterialBuilder;
    /** Set the vertex domain for this material. */
    public vertexDomain(domain: VertexDomain): filamat$MaterialBuilder;
    /**
     * How triangles are culled by default (doesn't affect points or lines, BACK by default).
     * Material instances can override this.
     */
    public culling(culling: CullingMode): filamat$MaterialBuilder;
    /** Enable / disable color-buffer write (enabled by default, material instances can override). */
    public colorWrite(enable: boolean): filamat$MaterialBuilder;
    /**
     * Enable / disable depth-buffer write (enabled by default for opaque, disabled for others,
     * material instances can override).
     */
    public depthWrite(enable: boolean): filamat$MaterialBuilder;
    /** Enable / disable depth based culling (enabled by default, material instances can override). */
    public depthCulling(enable: boolean): filamat$MaterialBuilder;
    /** Enable / disable instanced primitives (disabled by default). */
    public instanced(enable: boolean): filamat$MaterialBuilder;
    /**
     * Double-sided materials don't cull faces, equivalent to culling(CullingMode::NONE).
     * doubleSided() overrides culling() if called. When called with "false", this enables the
     * capability for a run-time toggle.
     */
    public doubleSided(doubleSided: boolean): filamat$MaterialBuilder;
    /**
     * Any fragment with an alpha below this threshold is clipped (MASKED blending mode only). The
     * mask threshold can also be controlled by using the float material parameter called
     * `_maskThreshold`, or by calling filament::MaterialInstance::setMaskThreshold
     * "MaterialInstance::setMaskThreshold".
     */
    public maskThreshold(threshold: number): filamat$MaterialBuilder;
    /**
     * Enables or disables alpha-to-coverage. When enabled, the coverage of a fragment is based on
     * its alpha value. This parameter is only useful when MSAA is in use. Alpha to coverage is
     * enabled automatically when the blend mode is set to MASKED; this behavior can be overridden
     * by calling alphaToCoverage(false).
     */
    public alphaToCoverage(enable: boolean): filamat$MaterialBuilder;
    /** The material output is multiplied by the shadowing factor (UNLIT model only). */
    public shadowMultiplier(shadowMultiplier: boolean): filamat$MaterialBuilder;
    /** This material casts transparent shadows. The blending mode must be TRANSPARENT or FADE. */
    public transparentShadow(transparentShadow: boolean): filamat$MaterialBuilder;
    /**
     * Enables or disables colored penumbrae for any shadows cast on this material. The material
     * must be set on a shadow receiver for this parameter to take effect. This property is always
     * enabled when the shading model is set to `Shading::SUBSURFACE`.
     */
    public coloredPenumbra(coloredPenumbra: boolean): filamat$MaterialBuilder;
    /**
     * Reduces specular aliasing for materials that have low roughness. Turning this feature on
     * also helps preserve the shapes of specular highlights as an object moves away from the
     * camera. When turned on, two float material parameters are added to control the effect:
     * `_specularAAScreenSpaceVariance` and `_specularAAThreshold`. You can also use
     * filament::MaterialInstance::setSpecularAntiAliasingVariance
     * "MaterialInstance::setSpecularAntiAliasingVariance" and
     * filament::MaterialInstance::setSpecularAntiAliasingThreshold
     * "setSpecularAntiAliasingThreshold"
     *
     * Disabled by default.
     */
    public specularAntiAliasing(specularAntiAliasing: boolean): filamat$MaterialBuilder;
    /**
     * Sets the screen-space variance of the filter kernel used when applying specular
     * anti-aliasing. The default value is set to 0.15. The specified value should be between 0 and
     * 1 and will be clamped if necessary.
     */
    public specularAntiAliasingVariance(screenSpaceVariance: number): filamat$MaterialBuilder;
    /**
     * Sets the clamping threshold used to suppress estimation errors when applying specular
     * anti-aliasing. The default value is set to 0.2. The specified value should be between 0 and
     * 1 and will be clamped if necessary.
     */
    public specularAntiAliasingThreshold(threshold: number): filamat$MaterialBuilder;
    /**
     * Enables or disables the index of refraction (IoR) change caused by the clear coat layer when
     * present. When the IoR changes, the base color is darkened. Disabling this feature preserves
     * the base color as initially specified.
     *
     * Enabled by default.
     */
    public clearCoatIorChange(clearCoatIorChange: boolean): filamat$MaterialBuilder;
    /** Enable / disable flipping of the Y coordinate of UV attributes, enabled by default. */
    public flipUV(flipUV: boolean): filamat$MaterialBuilder;
    /** Enable / disable the cheapest linear fog, disabled by default. */
    public linearFog(enabled: boolean): filamat$MaterialBuilder;
    /** Enable / disable shadow far attenuation, enabled by default. */
    public shadowFarAttenuation(enabled: boolean): filamat$MaterialBuilder;
    /** Enable / disable multi-bounce ambient occlusion, disabled by default on mobile. */
    public multiBounceAmbientOcclusion(multiBounceAO: boolean): filamat$MaterialBuilder;
    /** Set the specular ambient occlusion technique. Disabled by default on mobile. */
    public specularAmbientOcclusion(specularAO: SpecularAmbientOcclusion): filamat$MaterialBuilder;
    /** Specify the refraction */
    public refractionMode(refraction: RefractionMode): filamat$MaterialBuilder;
    /** Specify the refraction type */
    public refractionType(refractionType: RefractionType): filamat$MaterialBuilder;
    /** Specifies how reflections should be rendered (default is DEFAULT). */
    public reflectionMode(mode: ReflectionMode): filamat$MaterialBuilder;
    /** Specifies how transparent objects should be rendered (default is DEFAULT). */
    public transparencyMode(mode: TransparencyMode): filamat$MaterialBuilder;
    /** Specify the number of eyes for stereoscopic rendering */
    public stereoscopicEyeCount(eyeCount: number): filamat$MaterialBuilder;
    /**
     * Enable / disable custom surface shading. Custom surface shading requires the LIT shading
     * model. In addition, the following function must be defined in the fragment block:
     *
     * ~~~~~ vec3 surfaceShading(const MaterialInputs materialInputs, const ShadingData
     * shadingData, const LightData lightData) {
     *
     * return vec3(1.0); // Compute surface shading with custom BRDF, etc. } ~~~~~
     *
     * This function is invoked once per light. Please refer to the materials documentation for
     * more information about the different parameters.
     *
     * @param customSurfaceShading Enables or disables custom surface shading
     */
    public customSurfaceShading(customSurfaceShading: boolean): filamat$MaterialBuilder;
    /**
     * Specifies desktop vs mobile; works in concert with TargetApi to determine the shader models
     * (used to generate code) and final output representations (spirv and/or text).
     */
    public platform(platform: filamat$MaterialBuilderBase$Platform): filamat$MaterialBuilder;
    /**
     * Specifies OpenGL, Vulkan, or Metal. This can be called repeatedly to build for multiple
     * APIs. Works in concert with Platform to determine the shader models (used to generate code)
     * and final output representations (spirv and/or text). If linking against filamat_lite, only
     * `OPENGL` is allowed.
     */
    public targetApi(targetApi: filamat$MaterialBuilderBase$TargetApi): filamat$MaterialBuilder;
    /**
     * Specifies the level of optimization to apply to the shaders (default is PERFORMANCE). If
     * linking against filamat_lite, this _must_ be called with Optimization::NONE.
     */
    public optimization(optimization: filamat$MaterialBuilderBase$Optimization): filamat$MaterialBuilder;
    /** If true, will output the generated GLSL shader code to stdout. */
    public printShaders(printShaders: boolean): filamat$MaterialBuilder;
    /**
     * If true, this will write the raw generated GLSL for each variant to a text file in the
     * current directory. The file will be named after the material name and the variant name. Its
     * extension will be derived from the shader stage. For example, mymaterial_0x0e.frag,
     * mymaterial_0x18.vert, etc.
     */
    public saveRawVariants(saveRawVariants: boolean): filamat$MaterialBuilder;
    /** If true, will include debugging information in generated SPIRV. */
    public generateDebugInfo(generateDebugInfo: boolean): filamat$MaterialBuilder;
    /** Specifies a list of variants that should be filtered out during code generation. */
    public variantFilter(variantFilter: number): filamat$MaterialBuilder;
    /** Adds a new preprocessor macro definition to the shader code. Can be called repeatedly. */
    public shaderDefine(name: string, value: string): filamat$MaterialBuilder;
    /**
     * Add a new fragment shader output variable. Only valid for materials in the POST_PROCESS
     * domain.
     */
    public output(qualifier: filamat$MaterialBuilder$VariableQualifier, target: filamat$MaterialBuilder$OutputTarget, precision: Precision, type: filamat$MaterialBuilder$OutputType, name: string, location?: number): filamat$MaterialBuilder;
    public enableFramebufferFetch(): filamat$MaterialBuilder;
    public vertexDomainDeviceJittered(enabled: boolean): filamat$MaterialBuilder;
    /**
     * Legacy morphing uses the data in the VertexAttribute slots ( `MORPH_POSITION_0,` etc) and is
     * limited to 4 morph targets. See filament::RenderableManager::Builder::morphing().
     */
    public useLegacyMorphing(): filamat$MaterialBuilder;
    /** specify compute kernel group size */
    public groupSize(groupSize: uint3): filamat$MaterialBuilder;
    /**
     * Force Filament to use its default variant for depth passes. Useful if a material provides a
     * custom vertex shader which can be skipped during depth-only passes.
     */
    public useDefaultDepthVariant(): filamat$MaterialBuilder;
    /**
     * Sets the source ASCII material (aka .mat file). The provided `source` string_view must
     * remain valid until MaterialBuilder::build() is called.
     */
    public materialSource(source: string): filamat$MaterialBuilder;
    /** Set the (client requested) api level that the material is supposed to be compiled against. */
    public setApiLevel(apiLevel: number): filamat$MaterialBuilder;
    /** Add a subpass parameter to this material. */
    public subpass(subpassType: SubpassType, format: SamplerFormat, precision: Precision, name: string): filamat$MaterialBuilder;
    public subpassString(subpassType: SubpassType, format: SamplerFormat, name: string): filamat$MaterialBuilder;
    public subpassPrecision(subpassType: SubpassType, precision: Precision, name: string): filamat$MaterialBuilder;
    public subpass(subpassType: SubpassType, name: string): filamat$MaterialBuilder;
    public hasSamplerType(samplerType: SamplerType): boolean;
    public getParameterCount(): number;
    public getSubpassCount(): number;
    public getVariantFilter(): number;
    public getFeatureLevel(): FeatureLevel;
    public getApiLevel(): number;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

export class filamat$MaterialBuilderBase {
    /**
     * Initialize MaterialBuilder.
     *
     * init must be called first before building any materials.
     */
    public static init(): void;
    /**
     * Release internal MaterialBuilder resources.
     *
     * Call shutdown when finished building materials to release all internal resources. After
     * calling shutdown, another call to MaterialBuilder::init must precede another material build.
     */
    public static shutdown(): void;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

export class filamat$Package {
    constructor();
    public getSize(): number;
    public setValid(valid: boolean): void;
    public isValid(): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * This API can be used to read meshes stored in the "filamesh" format produced by the command
 * line tool of the same name. This file format is documented in "docs/filamesh.md" in the
 * Filament distribution.
 */
export class filamesh$MeshReader {

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

export class filamesh$MeshReader$MaterialRegistry {
    constructor();
    public unregisterAll(): void;
    public numRegistered(): number;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** The surface orientation helper can be used to populate Filament-style TANGENTS buffers. */
export class geometry$SurfaceOrientation {
    /** Returns the vertex count. */
    public getVertexCount(): number;
    /**
     * Converts quaternions into the desired output format and writes up to "quatCount" to the
     * given output pointer. Normally quatCount should be equal to the vertex count. The optional
     * stride is the desired quat-to-quat stride in bytes. @ {
     */
    public getQuatsLong(out: quatf, quatCount: number, stride?: number): void;
    public getQuatsShort4(out: float4, quatCount: number, stride?: number): void;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * The Builder is used to construct an immutable surface orientation helper.
 *
 * Clients provide pointers into their own data, which is synchronously consumed during
 * build(). At a minimum, clients must supply a vertex count. They can supply data in any of
 * the following combinations:
 *
 * 1. normals only ........................... not recommended, selects arbitrary orientation
 * 2. normals + tangents ..................... sign of W determines bitangent orientation 3.
 * normals + uvs + positions + indices .... selects Lengyel’s Method 4. positions + indices
 * .................... generates normals for flat shading only
 *
 * Additionally, the client-side data has the following type constraints:
 *
 * - Normals must be float3 - Tangents must be float4 - UVs must be float2 - Positions must be
 * float3 - Triangles must be uint3 or ushort3
 *
 * Currently, mikktspace is not supported because it requires re-indexing the mesh. Instead we
 * use the method described by Eric Lengyel in "Foundations of Game Engine Development" (Volume
 * 2, Chapter 7).
 */
export class geometry$SurfaceOrientation$Builder {
    constructor();
    /** This attribute is required. */
    public vertexCount(vertexCount: number): geometry$SurfaceOrientation$Builder;
    public normals(arg0: float3, stride?: number): geometry$SurfaceOrientation$Builder;
    public tangents(arg0: float4, stride?: number): geometry$SurfaceOrientation$Builder;
    public uvs(arg0: float2, stride?: number): geometry$SurfaceOrientation$Builder;
    public positions(arg0: float3, stride?: number): geometry$SurfaceOrientation$Builder;
    public triangleCount(triangleCount: number): geometry$SurfaceOrientation$Builder;
    /** Generates quats or returns null if the submitted data is an incomplete combination. */
    public build(): geometry$SurfaceOrientation;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * This class builds Filament-style TANGENTS buffers given an input mesh.
 *
 * This class enables the client to chose between several algorithms. The client can retrieve
 * the result through the `get` methods on the class. If the chosen algorithm did not remesh
 * the input, the client is advised to just use the data they provided instead of querying. For
 * example, if the chosen method is Algorithm::FRISVAD, then the client should not need to call
 * getPositions(). We will simply copy from the input `positions` in that case.
 *
 * If the client calls getPositions() and positions were not provided as input, we will throw
 * and exception. Similar behavior will apply to UVs.
 *
 * This class supersedes the implementation in SurfaceOrientation.h
 */
export class geometry$TangentSpaceMesh {
    /**
     * Destroy the mesh object
     *
     * @param mesh A pointer to a TangentSpaceMesh ready to be destroyed
     */
    public static destroy(mesh: geometry$TangentSpaceMesh): void;
    /**
     * Number of output vertices
     *
     * The number of output vertices can be the same as the input if the selected algorithm did not
     * "remesh" the input.
     *
     * @returns The number of vertices
     */
    public getVertexCount(): number;
    /**
     * Get output vertex positions. Assumes the `out` param is at least of getVertexCount() length
     * (while accounting for `stride`). The output vertices can be the same as the input if the
     * selected algorithm did not "remesh" the input. The remeshed vertices are not guarranteed to
     * have correlation in order with the input mesh.
     *
     * @param out Client-allocated array that will be used for copying out positions.
     * @param stride Stride for iterating through `out`
     */
    public getPositions(out: float3, stride?: number): void;
    /**
     * Get output UVs. Assumes the `out` param is at least of getVertexCount() length (while
     * accounting for `stride`). The output uvs can be the same as the input if the selected
     * algorithm did not "remesh" the input. The remeshed UVs are not guarranteed to have
     * correlation in order with the input mesh.
     *
     * @param out Client-allocated array that will be used for copying out UVs.
     * @param stride Stride for iterating through `out`
     */
    public getUVs(out: float2, stride?: number): void;
    /**
     * Get output tangent space. Assumes the `out` param is at least of getVertexCount() length
     * (while accounting for `stride`).
     *
     * @param out Client-allocated array that will be used for copying out tangent space in 32-bit
     *     floating points.
     * @param stride Stride for iterating through `out`
     */
    public getQuatsLong(out: quatf, stride?: number): void;
    /**
     * Get output tangent space. Assumes the `out` param is at least of getVertexCount() length
     * (while accounting for `stride`).
     *
     * @param out Client-allocated array that will be used for copying out tangent space in 16-bit
     *     signed integers.
     * @param stride Stride for iterating through `out`
     */
    public getQuatsShort4(out: float4, stride?: number): void;
    /**
     * Get number of output triangles. The number of output triangles is the same as the number of
     * input triangles. However, when a "remesh" is carried out the output triangles are not
     * guarranteed to have any correlation with the input.
     *
     * @returns The number of vertices
     */
    public getTriangleCount(): number;
    /** @returns Whether the TBN algorithm remeshed the input. */
    public remeshed(): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Use this class to provide input to the TangentSpaceMesh computation. **Important**:
 * Computation of the tangent space is intended to be synchronous (working on the same thread).
 * Client is expected to keep the input immutable and in a good state for the duration of both
 * computation *and* query. That is, when querying the result of the tangent spaces, part of
 * the result might depend on the input data.
 */
export class geometry$TangentSpaceMesh$Builder {
    constructor();
    /**
     * Client must provide this parameter
     *
     * @param vertexCount The input number of vertcies
     */
    public vertexCount(vertexCount: number): geometry$TangentSpaceMesh$Builder;
    /**
     * @param normals The input normals
     * @param stride The stride for iterating through `normals`
     * @returns Builder
     */
    public normals(normals: float3, stride?: number): geometry$TangentSpaceMesh$Builder;
    /**
     * @param tangents The input tangents. The `w` component is for use with Algorithm::SIGN_OF_W.
     * @param stride The stride for iterating through `tangents`
     * @returns Builder
     */
    public tangents(tangents: float4, stride?: number): geometry$TangentSpaceMesh$Builder;
    /**
     * @param uvs The input uvs
     * @param stride The stride for iterating through `uvs`
     * @returns Builder
     */
    public uvs(uvs: float2, stride?: number): geometry$TangentSpaceMesh$Builder;
    /**
     * @param positions The input positions
     * @param stride The stride for iterating through `positions`
     * @returns Builder
     */
    public positions(positions: float3, stride?: number): geometry$TangentSpaceMesh$Builder;
    /**
     * @param triangleCount The input number of triangles
     * @returns Builder
     */
    public triangleCount(triangleCount: number): geometry$TangentSpaceMesh$Builder;
    /**
     * The Client can provide an algorithm hint to produce the tangents.
     *
     * @param algorithm The algorithm hint.
     * @returns Builder
     */
    public algorithm(algorithm: geometry$TangentSpaceMesh$Algorithm): geometry$TangentSpaceMesh$Builder;
    /**
     * Computes the tangent space mesh. The resulting mesh object is owned by the callee. The
     * callee must call TangentSpaceMesh::destroy on the object once they are finished with it.
     *
     * The state of the Builder will be reset after each call to build(). The client needs to
     * populate the builder with parameters again if they choose to re-use it.
     *
     * @returns A TangentSpaceMesh
     */
    public build(): geometry$TangentSpaceMesh;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Creates a function object that can convert vertex attribute data into tightly packed floats.
 *
 * This is especially useful for 3-component formats which are not supported by all backends.
 * e.g. The Vulkan minspec includes float3 but not short3.
 *
 * Usage Example: ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ using
 * filament::geometry::Transcoder; using filament::geometry::ComponentType;
 *
 * Transcoder transcode({ .componentType = ComponentType::BYTE, .normalized = true,
 * .componentCount = 3, .inputStrideBytes = 0 });
 *
 * transcode(outputPtr, inputPtr, count);
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * The interpretation of signed normalized data is consistent with Vulkan and OpenGL ES 3.0+.
 * Note that this slightly differs from earlier versions of OpenGL ES. For example, a signed
 * byte value of -127 maps exactly to -1.0f under ES3 and VK rules, but not ES2.
 */
export class geometry$Transcoder {

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Ktx1Bundle is a structured set of opaque data blobs that can be passed straight to the GPU,
 * such that a single bundle corresponds to a single texture object. It is well suited for
 * storing block-compressed texture data.
 *
 * One bundle may be comprised of several mipmap levels, cubemap faces, and array elements. The
 * number of blobs is immutable, and is determined as follows.
 *
 * blob_count = mip_count * array_length * (cubemap ? 6 : 1)
 *
 * Bundles can be quickly serialized to a certain file format (see below link), but this class
 * lives in the image lib rather than imageio because it has no dependencies, and does not
 * support CPU decoding.
 *
 * https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/
 */
export class image$Ktx1Bundle {
    /**
     * Serializes the bundle into the given target memory. Returns false if there's not enough
     * memory.
     *
     * Typically, this method is used to write out the contents of a KTX file.
     *
     * @remarks Asserts via `FILAMENT_CHECK_POSTCONDITION` if internal payload constraints are
     * violated.
     */
    public serialize(destination: number, numBytes: number): boolean;
    /**
     * Computes the size (in bytes) of the serialized bundle.
     *
     * @remarks Asserts via `FILAMENT_CHECK_POSTCONDITION` if internal LOD sizes are inconsistent
     * or total size overflows 32-bit bounds.
     */
    public getSerializedLength(): number;
    /** Gets or sets information about the texture object, such as format and type. */
    public getInfo(): image$KtxInfo;
    public info(): image$KtxInfo;
    /** Gets or sets key/value metadata. */
    public getMetadata(key: string, valueSize?: number): string;
    public setMetadata(key: string, value: string): void;
    /**
     * Parses the key="sh" metadata and returns 3 bands of data.
     *
     * Assumes 3 bands for a total of 9 RGB coefficients. Returns true if successful.
     */
    public getSphericalHarmonics(result: float3): boolean;
    /** Gets the number of miplevels (this is never zero). */
    public getNumMipLevels(): number;
    /** Gets the number of array elements (this is never zero). */
    public getArrayLength(): number;
    /** Returns whether or not this is a cubemap. */
    public isCubemap(): boolean;
    /**
     * Copies the given data into the blob at the given index, replacing whatever is already there.
     * Returns false if the given blob index is out of bounds.
     */
    public setBlob(index: image$KtxBlobIndex, data: number, size: number): boolean;
    /**
     * Allocates the blob at the given index to the given number of bytes. This allows subsequent
     * calls to setBlob to be thread-safe.
     */
    public allocateBlob(index: image$KtxBlobIndex, size: number): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * LinearImage is a handle to packed floating point data arranged into a row-major grid.
 *
 * We use this object as input/output for core algorithms that wish to be agnostic of source
 * and destination formats. The number of channels is arbitrary (1 or more) but we often use
 * 3-channel images to represent color data.
 *
 * The underlying pixel data has shared ownership semantics to allow clients to easily pass
 * around the image object without incurring a deep copy. Shared access to pixels is not thread
 * safe.
 *
 * By convention, we do not use channel major order (i.e. planar). However we provide a free
 * function in ImageOps to combine planar data. Pixels are stored such that the row stride is
 * simply width * channels * sizeof(float).
 */
export class image$LinearImage {
    constructor();
    public getWidth(): number;
    public getHeight(): number;
    public getChannels(): number;
    public reset(): void;
    public isValid(): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/** Value of a single point sample, allocated according to the number of image channels. */
export class image$SingleSample {
    public get(index: number): number;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

export class ktxreader$Ktx2Reader {
    /**
     * Requests that the reader constructs Filament textures with given internal format.
     *
     * This MUST be called at least once before calling load().
     *
     * As a reminder, a basis-encoded KTX2 can be quickly transcoded to any number of formats, so
     * you need to tell it what formats your hw supports. That's why this method exists.
     *
     * Call requestFormat as many times as needed; formats that are submitted early are considered
     * higher priority.
     *
     * If BasisU knows a priori that the given format is not available (e.g. if the build has
     * disabled it), the format is not added and FORMAT_UNSUPPORTED is returned.
     *
     * Returns FORMAT_ALREADY_REQUESTED if the given format has already been requested.
     *
     * Hint: BasisU supports the following uncompressed formats: RGBA8, RGB565, RGBA4.
     */
    public requestFormat(format: TextureFormat): ktxreader$Ktx2Reader$Result;
    /** Removes the given format from the list, or does nothing if it hasn't been requested. */
    public unrequestFormat(format: TextureFormat): void;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Asynchronous Interface ======================
 *
 * Alternative API suitable for asynchronous transcoding of mipmap levels. If unsure that you
 * need to use this, then don't, just call load() instead. Usage pseudocode:
 *
 * auto async = reader->asyncCreate(data, size, TransferFunction::LINEAR); mTexture =
 * async->getTexture(); auto backgroundThread = spawnThread({ async->doTranscoding(); })
 * backgroundThread.wait(); async->uploadImages(); reader->asyncDestroy(async);
 *
 * In the documentation comments, "foreground thread" refers to the thread that the Filament
 * Engine was created on.
 */
export class ktxreader$Ktx2Reader$Async {
    /**
     * Loads all mipmaps from the KTX2 file and transcodes them to the resolved format.
     *
     * This does not return until all mipmaps have been transcoded. This is typically called from a
     * background thread.
     */
    public doTranscoding(): ktxreader$Ktx2Reader$Result;
    /**
     * Uploads pending mipmaps to the texture.
     *
     * This can safely be called while doTranscoding() is still working in another thread. Since
     * this calls Texture::setImage(), it should be called from the foreground thread; see "Thread
     * safety" in the documentation for filament::Engine.
     */
    public uploadImages(): void;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * The AutomationEngine makes it easy to push a bag of settings values to Filament. It can also
 * be used to iterate through settings permutations for testing purposes.
 *
 * When creating an automation engine for testing purposes, clients give it an immutable
 * reference to an AutomationSpec. It is always in one of two states: running or idle. The
 * running state can be entered immediately (startRunning) or by requesting batch mode
 * (startBatchMode).
 *
 * When executing a test, clients should call tick() after each frame is rendered, which gives
 * automation an opportunity to push settings to Filament, increment the current test index (if
 * enough time has elapsed), and request an asynchronous screenshot.
 *
 * The time to sleep between tests is configurable and can be set to zero. Automation also
 * waits a specified minimum number of frames between tests.
 *
 * Batch mode is meant for non-interactive applications. In batch mode, automation defers
 * applying the first test case until the client unblocks it via signalBatchMode(). This is
 * useful when waiting for a large model file to become fully loaded. Batch mode also offers a
 * query (shouldClose) that is triggered after the last test has been invoked.
 */
export class viewer$AutomationEngine {
    /**
     * Shortcut constructor that creates an automation engine from a JSON string.
     *
     * This constructor can be used if the user does not need to monitor how the settings change
     * over time and does not need ownership over the AutomationSpec.
     *
     * An example of a JSON spec can be found by searching the repo for DEFAULT_AUTOMATION. This is
     * documented using a JSON schema (look for viewer/schemas/automation.json).
     *
     * @param jsonSpec Valid JSON string that conforms to the automation schema.
     * @param size Number of characters in the JSON string.
     * @returns Automation engine or null if unable to read the JSON.
     */
    public static createFromJSON(jsonSpec: string, size: number): viewer$AutomationEngine;
    /**
     * Creates an automation engine for the sole purpose of pushing settings, or for executing the
     * default test sequence.
     *
     * To see how the default test sequence is generated, search for DEFAULT_AUTOMATION.
     */
    public static createDefault(): viewer$AutomationEngine;
    /**
     * Activates the automation test. During the subsequent call to tick(), the first test is
     * applied and automation enters the running state.
     */
    public startRunning(): void;
    /**
     * Activates the automation test, but enters a paused state until the user calls
     * signalBatchMode().
     */
    public startBatchMode(): void;
    /**
     * Notifies the automation engine that time has passed, a new frame has been rendered.
     *
     * This is when settings get applied, screenshots are (optionally) exported, and the internal
     * test counter is potentially incremented.
     *
     * @param content Contains the Filament View, Materials, and Renderer that get modified.
     * @param deltaTime The amount of time that has passed since the previous tick in seconds.
     */
    public tick(engine: Engine, content: viewer$AutomationEngine$ViewerContent, deltaTime: number): void;
    /**
     * Mutates a set of client-owned Filament objects according to a JSON string.
     *
     * This method is an alternative to tick(). It allows clients to use the automation engine as a
     * remote control, as opposed to iterating through a predetermined test sequence.
     *
     * This updates the stashed Settings object, then pushes those settings to the given Filament
     * objects. Clients can optionally call getColorGrading() after calling this method.
     *
     * @param json Contains the JSON string with a set of changes that need to be pushed.
     * @param jsonLength Number of characters in the json string.
     * @param content Contains a set of Filament objects that you want to mutate.
     */
    public applySettings(engine: Engine, json: string, jsonLength: number, content: viewer$AutomationEngine$ViewerContent): void;
    /**
     * Gets a color grading object that corresponds to the latest settings.
     *
     * This method either returns a cached instance, or it destroys the cached instance and creates
     * a new one.
     */
    public getColorGrading(engine: Engine): ColorGrading;
    /**
     * Gets the current viewer options.
     *
     * NOTE: Focal length here might be different from the user-specified value, due to DoF
     * options.
     */
    public getViewerOptions(): viewer$ViewerOptions;
    /** Gets the current full settings object. */
    public getSettings(): viewer$Settings;
    /** Signals that batch mode can begin. Call this after all meshes and textures finish loading. */
    public signalBatchMode(): void;
    /** Cancels an in-progress automation session. */
    public stopRunning(): void;
    /** Signals that the application is closing, so all pending screenshots should be cancelled. */
    public terminate(): void;
    /**
     * Configures the automation engine for users who wish to set up a custom sleep time between
     * tests, etc.
     */
    public setOptions(options: viewer$AutomationEngine$Options): void;
    /** Returns true if automation is in batch mode and all tests have finished. */
    public shouldClose(): boolean;
    /**
     * Convenience function that writes out a JSON file to disk containing all settings.
     *
     * @param filename Desired JSON filename.
     */
    public static exportSettings(settings: viewer$Settings, filename: string): void;
    public static exportScreenshot(view: View, renderer: Renderer, filename: string, autoclose: boolean, automationEngine: viewer$AutomationEngine): void;
    public getOptions(): viewer$AutomationEngine$Options;
    public isRunning(): boolean;
    public currentTest(): number;
    public testCount(): number;
    public isBatchModeEnabled(): boolean;
    public getStatusMessage(): string;
    public requestClose(): void;
    public isTerminated(): boolean;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

/**
 * Immutable list of Settings objects generated from a JSON spec.
 *
 * Each top-level item in the JSON spec is an object with "name", "base" and "permute". The
 * "base" object specifies a single set of changes to apply to default settings. The optional
 * "permute" object specifies a cross product of changes to apply to the base.
 *
 * The following example generates a total of 5 test cases. [{ "name": "simple", "base": {
 * "view.dof.cocScale": 1.0, "view.bloom.strength": 0.5 }, "permute": { "view.bloom.enabled":
 * [false, true], "view.dof.enabled": [false, true] } }, { "name": "ppoff", "base": {
 * "view.postProcessingEnabled": false } }]
 */
export class viewer$AutomationSpec {
    public static generate(jsonSpec: string, size: number): viewer$AutomationSpec;
    public static generateDefaultTestCases(): viewer$AutomationSpec;
    public size(): number;
    public getName(index: number): string;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}

export class viewer$JsonSerializer {
    constructor();
    public writeJson(in_: viewer$Settings): string;

    /** Releases the wasm object this handle refers to. */
    public delete(): void;
}
