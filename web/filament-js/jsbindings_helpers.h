/*
 * Copyright (C) 2026 The Android Open Source Project
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

#pragma once

#include <viewer/AutomationEngine.h>
#include <viewer/AutomationSpec.h>
#include <viewer/Settings.h>
#include <viewer/ViewerGui.h>

#include <ktxreader/Ktx1Reader.h>
#include <ktxreader/Ktx2Reader.h>

#include <gltfio/Animator.h>
#include <gltfio/AssetLoader.h>
#include <gltfio/FilamentAsset.h>
#include <gltfio/FilamentInstance.h>
#include <gltfio/MaterialProvider.h>
#include <gltfio/NodeManager.h>
#include <gltfio/ResourceLoader.h>
#include <gltfio/TextureProvider.h>

#include <geometry/SurfaceOrientation.h>
#include <geometry/TangentSpaceMesh.h>

#include <filameshio/MeshReader.h>

#include <filament/BufferObject.h>
#include <filament/Camera.h>
#include <filament/ColorGrading.h>
#include <filament/ColorSpace.h>
#include <filament/Engine.h>
#include <filament/Fence.h>
#include <filament/Frustum.h>
#include <filament/IndexBuffer.h>
#include <filament/IndirectLight.h>
#include <filament/LightManager.h>
#include <filament/Material.h>
#include <filament/MaterialInstance.h>
#include <filament/MorphTargetBuffer.h>
#include <filament/RenderableManager.h>
#include <filament/Renderer.h>
#include <filament/RenderTarget.h>
#include <filament/Scene.h>
#include <filament/SkinningBuffer.h>
#include <filament/Skybox.h>
#include <filament/SwapChain.h>
#include <filament/Texture.h>
#include <filament/ToneMapper.h>
#include <filament/TransformManager.h>
#include <filament/VertexBuffer.h>
#include <filament/View.h>
#include <filament/Viewport.h>

#include <camutils/Bookmark.h>
#include <camutils/Manipulator.h>

#include <utils/EntityManager.h>
#include <utils/Log.h>
#include <utils/NameComponentManager.h>
#include <utils/Path.h>

#include <numeric>
#include <memory>
#include <string>
#include <vector>

#include <math/mat4.h>
#include <math/vec2.h>
#include <math/vec3.h>
#include <math/vec4.h>

#include <emscripten.h>
#include <emscripten/bind.h>
#include <materials/uberarchive.h>
#include <stb_image.h>

// Avoid warnings for deprecated Filament APIs.
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"

using namespace emscripten;
using namespace filament;
using namespace filamesh;
using namespace geometry;
using namespace filament::gltfio;
using namespace image;
using namespace ktxreader;
using namespace filament::viewer;

namespace em = emscripten;

#if __has_feature(cxx_rtti)
#error Filament JS bindings require RTTI to be disabled.
#endif

// Many methods require a thin layer of C++ glue which is elegantly expressed with a lambda.
// However, passing a bare lambda into embind's daisy chain requires a cast to a function pointer.
#define EMBIND_LAMBDA(retval, arglist, impl) (retval (*) arglist) [] arglist impl

// Builder functions that return "this" have verbose binding declarations, this macro reduces
// the amount of boilerplate.
#define BUILDER_FUNCTION(name, btype, arglist, impl) \
        function(name, EMBIND_LAMBDA(btype*, arglist, impl), allow_raw_pointers())

namespace {

// We avoid directly exposing backend::BufferDescriptor because embind does not support move
// semantics and void* doesn't make sense to JavaScript anyway. This little wrapper class is exposed
// to JavaScript as "driver$BufferDescriptor", but clients will normally use our "Filament.Buffer"
// helper function (implemented in utilities.js)
struct BufferDescriptor {
    BufferDescriptor() {}
    // This form is used when JavaScript sends a buffer into WASM.
    BufferDescriptor(uint32_t byteLength) {
        this->bd.reset(new backend::BufferDescriptor(malloc(byteLength), byteLength,
                [](void* buffer, size_t size, void* user) { free(buffer); }));
    }
    // This form is used when WASM needs to return a buffer to JavaScript.
    BufferDescriptor(uint8_t* data, uint32_t size) {
        this->bd.reset(new backend::BufferDescriptor(data, size));
    }
    val getBytes() {
        unsigned char *byteBuffer = (unsigned char*) bd->buffer;
        size_t bufferLength = bd->size;
        return val(typed_memory_view(bufferLength, byteBuffer));
    }
    // In order to match its JavaScript counterpart, the Buffer wrapper needs to use reference
    // counting, and the easiest way to achieve that is with shared_ptr.
    std::shared_ptr<backend::BufferDescriptor> bd;
};

// Exposed to JavaScript as "driver$PixelBufferDescriptor", but clients will normally use the
// PixelBuffer or CompressedPixelBuffer helper functions (implemented in utilities.js)
struct PixelBufferDescriptor {
    PixelBufferDescriptor(uint32_t byteLength, backend::PixelDataFormat fmt, backend::PixelDataType dtype) {
        this->pbd.reset(new backend::PixelBufferDescriptor(malloc(byteLength), byteLength,
                fmt, dtype, [](void* buffer, size_t size, void* user) { free(buffer); }));
    }
    // Note that embind allows overloading based on number of arguments, but not on types.
    // It's fine to have two constructors but they can't both have the same number of arguments.
    PixelBufferDescriptor(uint32_t byteLength, backend::CompressedPixelDataType cdtype, int imageSize,
            bool compressed) {
        assert(compressed == true);
        // For compressed cubemaps, the image size should be one-sixth the size of the entire blob.
        assert(imageSize == byteLength || imageSize == byteLength / 6);
        this->pbd.reset(new backend::PixelBufferDescriptor(malloc(byteLength), byteLength,
                cdtype, imageSize, [](void* buffer, size_t size, void* user) { free(buffer); }));
    }
    val getBytes() {
        unsigned char* byteBuffer = (unsigned char*) pbd->buffer;
        size_t bufferLength = pbd->size;
        return val(typed_memory_view(bufferLength, byteBuffer));
    }
    // In order to match its JavaScript counterpart, the Buffer wrapper needs to use reference
    // counting, and the easiest way to achieve that is with shared_ptr.
    std::shared_ptr<backend::PixelBufferDescriptor> pbd;
};

// Small structure whose sole purpose is to return decoded image data to JavaScript.
struct DecodedImage {
    int width;
    int height;
    int encoded_ncomp;
    int decoded_ncomp;
    BufferDescriptor decoded_data;
};

// JavaScript clients should call [createTextureFromPng] rather than calling this directly.
inline DecodedImage decodeImage(BufferDescriptor encoded_data, int requested_ncomp) {
    DecodedImage result;
    stbi_uc* decoded_data = stbi_load_from_memory(
            (stbi_uc const *) encoded_data.bd->buffer,
            encoded_data.bd->size,
            &result.width,
            &result.height,
            &result.encoded_ncomp,
            requested_ncomp);
    const uint32_t decoded_size = result.width * result.height * requested_ncomp;
    result.decoded_data = BufferDescriptor(decoded_data, decoded_size);
    result.decoded_data.bd->setCallback([](void* buffer, size_t size, void* user) {
        stbi_image_free(buffer);
    });
    result.decoded_ncomp = requested_ncomp;
    return result;
}

} // anonymous namespace

// In JavaScript, a flat contiguous representation is best for matrices (see gl-matrix) so we
// need to define a small wrapper here.
struct flatmat4 {
    filament::math::mat4f m;
    float& operator[](int i) { return m[i / 4][i % 4]; }
};

struct flatmat3 {
    filament::math::mat3f m;
    float& operator[](int i) { return m[i / 3][i % 3]; }
};

using EntityVector = std::vector<utils::Entity>;

// Classes whose destructor Filament keeps to itself get their raw_destructor
// specialization from the generated file that binds them, so none belongs here.

// MeshReader::Mesh reaches its buffers through raw pointers, which a value
// object has no way to carry, so what loadMeshFromBuffer hands to JavaScript
// is this, bound as a class with accessors.
struct FilameshMesh {
    utils::Entity renderable;
    VertexBuffer* vertexBuffer;
    IndexBuffer* indexBuffer;
};

// These little wrappers exist to get around RTTI requirements in embind.
struct UbershaderProvider {
    MaterialProvider* provider;
    void destroyMaterials() { provider->destroyMaterials(); }
};

struct StbProvider { TextureProvider* provider; };
struct Ktx2Provider { TextureProvider* provider; };
struct WebpProvider { TextureProvider* provider; };

// The camera manipulator is a class template, which cannot be generated:
// a binding needs the arguments it is given.
using CamManipulator = camutils::Manipulator<float>;
using CamBuilder = CamManipulator::Builder;
using CamBookmark = camutils::Bookmark<float>;

inline const auto getLookAt = [] (const CamManipulator* manip, em::val eye, em::val target, em::val up) {
    filament::math::float3 eyePos, targetPos, upVector;
    manip->getLookAt(&eyePos, &targetPos, &upVector);
    eye.set(0, eyePos.x); eye.set(1, eyePos.y); eye.set(2, eyePos.z);
    target.set(0, targetPos.x); target.set(1, targetPos.y); target.set(2, targetPos.z);
    up.set(0, upVector.x); up.set(1, upVector.y); up.set(2, upVector.z);
};

inline const auto raycast = [] (const CamManipulator* manip, int x, int y, em::val result) {
    filament::math::float3 res;
    if (manip->raycast(x, y, &res)) {
        result.set(0, res.x); result.set(1, res.y); result.set(2, res.z);
        return true;
    }
    return false;
};

inline const auto getRay = [] (const CamManipulator* manip, int x, int y, em::val origin, em::val dir) {
    filament::math::float3 o, d;
    manip->getRay(x, y, &o, &d);
    origin.set(0, o.x); origin.set(1, o.y); origin.set(2, o.z);
    dir.set(0, d.x); dir.set(1, d.y); dir.set(2, d.z);
};
