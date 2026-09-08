cmake_minimum_required(VERSION 3.19)

project(filament-js)

set(EXTERN_POSTJS_SRC
  ${CMAKE_CURRENT_SOURCE_DIR}/wasmloader.js
  ${CMAKE_CURRENT_SOURCE_DIR}/extensions_common.js
  ${CMAKE_CURRENT_SOURCE_DIR}/filament/BufferObject_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/filament/Camera_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/filament/ColorGrading_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/filament/Engine_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/filament/IndexBuffer_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/filament/LightManager_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/filament/Material_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/filament/Renderer_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/filament/Scene_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/filament/Texture_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/filament/VertexBuffer_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/filament/View_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/filament-utils/Ktx1Bundle_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/filament-utils/Manipulator_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/filament-utils/SurfaceOrientation_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/filament-utils/TangentSpaceMesh_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/gltfio/AssetLoader_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/gltfio/FilamentAsset_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/gltfio/FilamentInstance_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/gltfio/MaterialProvider_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/gltfio/NodeManager_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/gltfio/ResourceLoader_extension.js
  ${CMAKE_CURRENT_SOURCE_DIR}/utilities.js)

# The generated bindings and the list of them both come from beamsplitter:
#   cd tools/beamsplitter2 && go run . -emit ../../web/filament-js
include(${CMAKE_CURRENT_SOURCE_DIR}/generated_sources.cmake)

set(CPP_SRC
  ${FILAMENT_GENERATED_SRC}
  ${FILAMENT_UTILS_GENERATED_SRC}
  ${GLTFIO_GENERATED_SRC})

# The emcc options are not documented well, the best place to find them is the source:
# https://github.com/kripken/emscripten/blob/main/src/settings.js

if (WASM_PTHREADS)
  set(COPTS "${COPTS} -pthread")
  set(LOPTS "${LOPTS} -pthread")
endif()

# The following setting is required because we disable RTTI.
set(COPTS "${COPTS} -DEMSCRIPTEN_HAS_UNBOUND_TYPE_NAMES=0")

# Uncomment the following line to check for leaks
# set(LOPTS "${LOPTS} --memoryprofiler")

set(LOPTS "${LOPTS} --bind")
set(LOPTS "${LOPTS} -s ALLOW_MEMORY_GROWTH=1")
set(LOPTS "${LOPTS} -s EXPORTED_FUNCTIONS=['_malloc','_free']")
set(LOPTS "${LOPTS} -s EXPORTED_RUNTIME_METHODS=['HEAP8','HEAP16','HEAP32','HEAPU8','HEAPU16','HEAPU32','HEAPF32','HEAPF64']")
set(LOPTS "${LOPTS} -s MODULARIZE=1")
set(LOPTS "${LOPTS} -s EXPORT_NAME=Filament")
set(LOPTS "${LOPTS} -s USE_WEBGL2=1")
set(LOPTS "${LOPTS} -s FULL_ES3")
set(LOPTS "${LOPTS} -s MIN_WEBGL_VERSION=2")
set(LOPTS "${LOPTS} -s MAX_WEBGL_VERSION=2")

if (FILAMENT_SUPPORTS_WEBGPU)
    set(LOPTS "${LOPTS} --use-port=emdawnwebgpu")
endif()

foreach (JS_FILENAME ${EXTERN_POSTJS_SRC})
  set(LOPTS "${LOPTS} --extern-post-js ${JS_FILENAME}")
endforeach()

set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} ${LOPTS}")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${COPTS}")

add_executable(filament-js ${CPP_SRC})

set_target_properties(filament-js PROPERTIES
    LINK_DEPENDS "${EXTERN_POSTJS_SRC}"
    OUTPUT_NAME filament)

target_include_directories(filament-js PRIVATE ${CMAKE_CURRENT_SOURCE_DIR})
target_link_libraries(filament-js PRIVATE filament math utils ktxreader filameshio uberarchive gltfio_core viewer camutils)

# Optional standalone filamat-js WebAssembly target
option(FILAMENT_JS_BUILD_FILAMAT "Build standalone filamat-js WebAssembly target" ON)
if (FILAMENT_JS_BUILD_FILAMAT)
  add_executable(filamat-js ${FILAMAT_GENERATED_SRC})
  set_target_properties(filamat-js PROPERTIES
      OUTPUT_NAME filamat)
  target_include_directories(filamat-js PRIVATE ${CMAKE_CURRENT_SOURCE_DIR})
  target_link_libraries(filamat-js PRIVATE filamat utils)
endif()

# Copy package.json (et al) into the output folder to allow "npm publish" to gather the
# artifacts that it needs.

set(RESOURCES )
foreach (RESOURCE package.json README.md filament.d.ts test.html)
    add_custom_command(
        OUTPUT ${PROJECT_BINARY_DIR}/${RESOURCE}
        DEPENDS ${CMAKE_CURRENT_SOURCE_DIR}/${RESOURCE}
        COMMAND ${CMAKE_COMMAND} -E copy ${CMAKE_CURRENT_SOURCE_DIR}/${RESOURCE} ${PROJECT_BINARY_DIR})
    list(APPEND RESOURCES ${PROJECT_BINARY_DIR}/${RESOURCE})
endforeach()

add_custom_target(npm_package ALL DEPENDS ${RESOURCES})
