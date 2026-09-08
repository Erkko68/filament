/*
 * Copyright (C) 2018 The Android Open Source Project
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

Filament.registerClassExtension(function() {

    /// Engine ::core class::

    Filament.Engine.SINGLE_THREADED = 0xFFFFFFFF;

    /// create ::static method:: Creates an Engine instance for the given canvas.
    /// canvas ::argument:: the canvas DOM element
    /// options ::argument:: optional WebGL 2.0 context configuration. Also accepts
    /// [Engine$Builder] settings `backend`, `featureLevel`, `features`, `colorGrading`, and `paused`.
    /// config ::argument:: optional [Engine$Config]
    /// ::retval:: an instance of [Engine]
    Filament.Engine.create = function (canvas, options, config) {
        if (!canvas.id) {
            canvas.id = 'filament-canvas-' + Math.random().toString(36).substr(2, 9);
        }
        const canvasId = '#' + canvas.id;

        const backend = (options && options.backend !== undefined) ?
              options.backend : Filament.backend$Backend.DEFAULT;

        if (backend !== Filament.backend$Backend.WEBGPU) {
            const defaults = {
                majorVersion: 2,
                minorVersion: 0,
                antialias: false,
                depth: true,
                alpha: false
            };
            const glOptions = Object.assign(defaults, options);

            // Create the WebGL 2.0 context.
            const ctx = canvas.getContext("webgl2", glOptions);

            // Enable all desired extensions by calling getExtension on each one.
            ctx.getExtension('WEBGL_compressed_texture_s3tc');
            ctx.getExtension('WEBGL_compressed_texture_s3tc_srgb');
            ctx.getExtension('WEBGL_compressed_texture_astc');
            ctx.getExtension('WEBGL_compressed_texture_etc');

            // These transient globals are used temporarily during Engine construction.
            window.filament_glOptions = glOptions;
            window.filament_glContext = ctx;
        }

        // Register the GL context with emscripten and create the Engine via Builder.
        const defaultConfig = Filament.Engine.createDefaultConfig();
        const finalConfig = Object.assign(defaultConfig, config);

        const builder = new Filament.Engine$Builder();
        builder.backend(backend);
        builder.config(finalConfig);
        if (options) {
            if (options.featureLevel !== undefined) {
                builder.featureLevel(options.featureLevel);
            }
            if (options.features) {
                if (Array.isArray(options.features)) {
                    builder.features(options.features);
                } else {
                    for (const name in options.features) {
                        builder.feature(name, options.features[name]);
                    }
                }
            }
            if (options.colorGrading) {
                builder.colorGrading(options.colorGrading);
            }
            if (options.paused !== undefined) {
                builder.paused(options.paused);
            }
        }
        const engine = builder.build();

        // Annotate the engine with the GL context to support multiple canvases.
        if (backend !== Filament.backend$Backend.WEBGPU) {
            engine.context = window.filament_glContext;
            engine.handle = window.filament_contextHandle;
        }
        engine.canvasId = canvasId;

        // Ensure that we do not pollute the global namespace.
        delete window.filament_glOptions;
        delete window.filament_glContext;
        delete window.filament_contextHandle;

        return engine;
    };

    Filament.Engine.prototype.createSwapChain = function() {
        if (this.canvasId) {
            return this._createSwapChainForCanvas(this.canvasId);
        }
        return this._createSwapChain();
    };

    Filament.Engine.prototype.execute = function() {
        window.filament_contextHandle = this.handle;
        this._execute();
        delete window.filament_contextHandle;
    };

    /// createMaterial ::method::
    /// package ::argument:: asset string, or Uint8Array, or [Buffer] with filamat contents
    /// options ::argument:: optional dictionary with `uboBatching` key.
    /// ::retval:: [Material]
    Filament.Engine.prototype.createMaterial = function(buffer, options) {
        buffer = getBufferDescriptor(buffer);
        let uboBatching = false;
        if (options && typeof options.uboBatching === 'boolean') {
            uboBatching = options.uboBatching;
        }
        const result = this._createMaterial(buffer, uboBatching);
        buffer.delete();
        return result;
    };

    /// createTextureFromKtx1 ::method:: Utility function that creates a [Texture] from a KTX1 file.
    /// buffer ::argument:: asset string, or Uint8Array, or [Buffer] with KTX1 file contents
    /// options ::argument:: Options dictionary.
    /// ::retval:: [Texture]
    Filament.Engine.prototype.createTextureFromKtx1 = function(buffer, options) {
        const ktx = new Filament.Ktx1Bundle(getBufferDescriptor(buffer));
        const result = Filament.createTextureFromKtx1(this, ktx, options);
        ktx.delete();
        return result;
    };

    /// createTextureFromKtx2 ::method:: Utility function that creates a [Texture] from a KTX2 file.
    /// buffer ::argument:: asset string, or Uint8Array, or [Buffer] with KTX2 file contents
    /// options ::argument:: Options dictionary.
    /// ::retval:: [Texture]
    Filament.Engine.prototype.createTextureFromKtx2 = function(buffer, options) {
        let isAlphaPremultiplied = false;
        if (options && typeof options.isAlphaPremultiplied === 'boolean') {
            isAlphaPremultiplied = options.isAlphaPremultiplied;
        }
        let ubershaderProvider = null;
        if (options && options.ubershaderProvider instanceof Filament.gltfio$UbershaderProvider) {
            ubershaderProvider = options.ubershaderProvider;
        }
        buffer = getBufferDescriptor(buffer);
        const reader = new Filament.Ktx2Reader(this, isAlphaPremultiplied, ubershaderProvider);
        const result = reader.requestFormatAndDecode(buffer);
        reader.delete();
        buffer.delete();
        return result;
    };

    /// createIblFromKtx1 ::method:: Utility that creates an [IndirectLight] from a KTX file.
    /// buffer ::argument:: asset string, or Uint8Array, or [Buffer] with KTX file contents
    /// options ::argument:: Options dictionary.
    /// ::retval:: [IndirectLight]
    Filament.Engine.prototype.createIblFromKtx1 = function(buffer, options) {
        const ktx = new Filament.Ktx1Bundle(getBufferDescriptor(buffer));
        const result = Filament.createIblFromKtx1(this, ktx, options);
        ktx.delete();
        return result;
    };

    /// createSkyFromKtx1 ::method:: Utility function that creates a [Skybox] from a KTX file.
    /// buffer ::argument:: asset string, or Uint8Array, or [Buffer] with KTX file contents
    /// options ::argument:: Options dictionary.
    /// ::retval:: [Skybox]
    Filament.Engine.prototype.createSkyFromKtx1 = function(buffer, options) {
        const ktx = new Filament.Ktx1Bundle(getBufferDescriptor(buffer));
        const result = Filament.createSkyFromKtx1(this, ktx, options);
        ktx.delete();
        return result;
    };

    /// createTextureFromPng ::method:: Creates a 2D [Texture] from the raw contents of a PNG file.
    /// buffer ::argument:: asset string, or Uint8Array, or [Buffer] with PNG file contents
    /// options ::argument:: object with optional `srgb`, `noalpha`, and `nomips` keys.
    /// ::retval:: [Texture]
    Filament.Engine.prototype.createTextureFromPng = function(buffer, options) {
        return Filament.createTextureFromPng(this, getBufferDescriptor(buffer), options);
    };

    /// createTextureFromJpeg ::method:: Creates a 2D [Texture] from the contents of a JPEG file.
    /// buffer ::argument:: asset string, or Uint8Array, or [Buffer] with JPEG file contents
    /// options ::argument:: JavaScript object with optional `srgb` and `nomips` keys.
    /// ::retval:: [Texture]
    Filament.Engine.prototype.createTextureFromJpeg = function(buffer, options) {
        return Filament.createTextureFromJpeg(this, getBufferDescriptor(buffer), options);
    };

    /// loadFilamesh ::method:: Consumes the contents of a filamesh file and creates a renderable.
    /// buffer ::argument:: asset string, or Uint8Array, or [Buffer] with filamesh contents
    /// definstance ::argument:: Optional default [MaterialInstance]
    /// matinstances ::argument:: Optional in-out object that gets populated with a \
    /// name-to-[MaterialInstance] mapping.
    /// ::retval:: JavaScript object with `renderable`, `vertexBuffer`, and `indexBuffer` properties.
    Filament.Engine.prototype.loadFilamesh = function(buffer, definstance, matinstances) {
        return Filament.loadFilamesh(this, getBufferDescriptor(buffer), definstance, matinstances);
    };

    /// createAssetLoader ::method::
    /// ::retval:: [gltfio$AssetLoader]
    Filament.Engine.prototype.createAssetLoader = function() {
        const defaultMaterials = new Filament.gltfio$UbershaderProvider(this);
        const names = new Filament.gltfio$NodeManager();
        return new Filament.gltfio$AssetLoader(this, defaultMaterials, names);
    };

});
