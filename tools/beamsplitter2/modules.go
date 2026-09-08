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

package main

import "beamsplitter2/emit"

// The web bindings are built as two WebAssembly binaries, and each binary is made
// of one or more modules. The distinction matters for correctness, not tidiness:
//
//   - Within a binary every type must be registered exactly once, so each class
//     belongs to the single module whose headers declare it.
//   - Across binaries registrations are independent, so filamat-js repeats the
//     enums it shares with filament-js rather than borrowing them.
//
// A module's Headers list is both what clang is asked to parse and what decides
// which declarations belong to it.

// Target is one binary: one WebAssembly module today, and whatever the unit of
// linkage turns out to be for a platform added later. The modules are the
// emitter's output directories; a declaration belongs to the one whose headers
// declare it.
type Target struct {
	Name     string
	Modules  []emit.Module
	Includes []string // include directories, relative to the repository root
}

// filamentIncludes are the include directories shared by everything.
var filamentIncludes = []string{
	"filament/include",
	"filament/backend/include",
	"libs/filabridge/include",
	"libs/utils/include",
	"libs/math/include",
	"third_party/robin-map/include",
}

// Targets is the whole build surface.
var Targets = []Target{
	{
		Name: "filament-js",
		Includes: append([]string{
			"libs/ktxreader/include",
			"libs/camutils/include",
			"libs/geometry/include",
			"libs/filameshio/include",
			"libs/viewer/include",
			"libs/gltfio/include",
			"libs/image/include",
			"libs/iblprefilter/include",
		}, filamentIncludes...),
		Modules: []emit.Module{
			{
				Name: "filament",
				Headers: []string{
					"filament/Box.h",
					"filament/FilamentAPI.h",
					"filament/BufferObject.h",
					"filament/Camera.h",
					"filament/Color.h",
					"filament/ColorGrading.h",
					"filament/ColorSpace.h",
					"filament/DebugRegistry.h",
					"filament/Engine.h",
					"filament/Exposure.h",
					"filament/Fence.h",
					"filament/FrameHistoryStream.h",
					"filament/FramePacer.h",
					"filament/FramePipelineEstimator.h",
					"filament/Frustum.h",
					"filament/IndexBuffer.h",
					"filament/IndirectLight.h",
					"filament/InstanceBuffer.h",
					"filament/LightManager.h",
					"filament/Material.h",
					"filament/MaterialEnums.h",
					"filament/MaterialInstance.h",
					"filament/MorphTargetBuffer.h",
					"filament/Options.h",
					"filament/RenderTarget.h",
					"filament/RenderableManager.h",
					"filament/Renderer.h",
					"filament/Scene.h",
					"filament/SkinningBuffer.h",
					"filament/Skybox.h",
					"filament/Stream.h",
					"filament/SwapChain.h",
					"filament/Sync.h",
					"filament/Texture.h",
					"filament/TextureSampler.h",
					"filament/ToneMapper.h",
					"filament/TransformManager.h",
					"filament/VertexBuffer.h",
					"filament/View.h",
					"filament/Viewport.h",
					"backend/BufferDescriptor.h",
					"backend/Platform.h",
					"backend/DriverEnums.h",
					"utils/Entity.h",
					"utils/EntityManager.h",
					"utils/NameComponentManager.h",
				},
			},
			{
				Name: "filament-utils",
				Headers: []string{
					"ktxreader/Ktx1Reader.h",
					"ktxreader/Ktx2Reader.h",
					"camutils/Bookmark.h",
					"camutils/Manipulator.h",
					"geometry/SurfaceOrientation.h",
					"geometry/TangentSpaceMesh.h",
					"geometry/Transcoder.h",
					"filameshio/MeshReader.h",
					"filameshio/filamesh.h",
					"viewer/AutomationEngine.h",
					"viewer/AutomationSpec.h",
					"viewer/Settings.h",
					"image/ColorTransform.h",
					"image/ImageOps.h",
					"image/ImageSampler.h",
					"image/Ktx1Bundle.h",
					"image/LinearImage.h",
					"filament-iblprefilter/IBLPrefilterContext.h",
				},
			},
			{
				Name: "gltfio",
				Headers: []string{
					"gltfio/Animator.h",
					"gltfio/AssetLoader.h",
					"gltfio/FilamentAsset.h",
					"gltfio/FilamentInstance.h",
					"gltfio/MaterialProvider.h",
					"gltfio/math.h",
					"gltfio/NodeManager.h",
					"gltfio/ResourceLoader.h",
					"gltfio/TextureProvider.h",
					"gltfio/TrsTransformManager.h",
				},
			},
		},
	},
	{
		Name:     "filamat-js",
		Includes: append([]string{"libs/filamat/include"}, filamentIncludes...),
		Modules: []emit.Module{
			{
				Name: "filamat",
				Headers: []string{
					"filamat/Enums.h",
					"filamat/MaterialBuilder.h",
					"filamat/Package.h",
					// MaterialBuilder's signatures are written in these enums, and
					// filamat-js is a separate binary, so it registers its own copies.
					"backend/DriverEnums.h",
					"filament/MaterialEnums.h",
				},
			},
		},
	},
}

// AllHeaders is every header the target parses. They go into one translation unit
// so that a type has the same identity in each module that names it.
func (t Target) AllHeaders() []string {
	var out []string
	for _, m := range t.Modules {
		out = append(out, m.Headers...)
	}
	return out
}
