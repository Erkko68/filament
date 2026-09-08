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

    /// gltfio$FilamentAsset ::class::

    Filament.gltfio$FilamentAsset.prototype.loadResources = function(onDone, onFetched, basePath,
            asyncInterval, config) {
        const asset = this;
        const engine = this.getEngine();
        const interval = asyncInterval || 30;
        const defaults = {
            normalizeSkinningWeights: true,
        };
        config = Object.assign(defaults, config || {});

        basePath = basePath || document.location;
        onFetched = onFetched || ((name) => {});
        onDone = onDone || (() => {});

        // Construct two lists of URI strings to fetch: textures and non-textures.
        let textureUris = new Set();
        let bufferUris = new Set();
        const absoluteToRelativeUri = {};
        for (const relativeUri of this.getResourceUris()) {
            const absoluteUri = '' + new URL(relativeUri, basePath);
            absoluteToRelativeUri[absoluteUri] = relativeUri;
            if (isTexture(relativeUri)) {
                textureUris.add(absoluteUri);
                continue;
            }
            bufferUris.add(absoluteUri);
        }
        textureUris = Array.from(textureUris);
        bufferUris = Array.from(bufferUris);

        // Construct a resource loader and start decoding after all textures are fetched.
        const resourceLoader = new Filament.gltfio$ResourceLoader(engine,
                config.normalizeSkinningWeights);

        const stbProvider = new Filament.gltfio$StbProvider(engine);
        const ktx2Provider = new Filament.gltfio$Ktx2Provider(engine);

        resourceLoader.addTextureProvider("image/jpeg", stbProvider);
        resourceLoader.addTextureProvider("image/png", stbProvider);
        resourceLoader.addTextureProvider("image/ktx2", ktx2Provider);

        const onComplete = () => {
            resourceLoader.asyncBeginLoad(asset);

            const timer = setInterval(() => {
                resourceLoader.asyncUpdateLoad();
                const progress = resourceLoader.asyncGetLoadProgress();
                if (progress >= 1) {
                    clearInterval(timer);
                    resourceLoader.delete();
                    stbProvider.delete();
                    onDone();
                }
            }, interval);
        };

        // Download all non-texture resources and invoke the callback when done.
        if (bufferUris.length == 0) {
            onComplete();
        } else {
            Filament.fetch(bufferUris, onComplete, function(absoluteUri) {
                const buffer = getBufferDescriptor(absoluteUri);
                const relativeUri = absoluteToRelativeUri[absoluteUri];
                resourceLoader.addResourceData(relativeUri, buffer);
                buffer.delete();
                onFetched(relativeUri);
            });
        }

        // Begin downloading all texture resources, no completion callback necessary.
        Filament.fetch(textureUris, null, function(absoluteUri) {
            const buffer = getBufferDescriptor(absoluteUri);
            const relativeUri = absoluteToRelativeUri[absoluteUri];
            resourceLoader.addResourceData(relativeUri, buffer);
            buffer.delete();
            onFetched(relativeUri);
        });
    };

    Filament.gltfio$FilamentAsset.prototype.getEntities = function() {
        return Filament.vectorToArray(this._getEntities());
    };

    Filament.gltfio$FilamentAsset.prototype.getEntitiesByName = function(name) {
        return Filament.vectorToArray(this._getEntitiesByName(name));
    };

    Filament.gltfio$FilamentAsset.prototype.getEntitiesByPrefix = function(prefix) {
        return Filament.vectorToArray(this._getEntitiesByPrefix(prefix));
    };

    Filament.gltfio$FilamentAsset.prototype.getLightEntities = function() {
        return Filament.vectorToArray(this._getLightEntities());
    };

    Filament.gltfio$FilamentAsset.prototype.getRenderableEntities = function() {
        return Filament.vectorToArray(this._getRenderableEntities());
    };

    Filament.gltfio$FilamentAsset.prototype.getCameraEntities = function() {
        return Filament.vectorToArray(this._getCameraEntities());
    };

    Filament.gltfio$FilamentAsset.prototype.getResourceUris = function() {
        return Filament.vectorToArray(this._getResourceUris());
    };

    Filament.gltfio$FilamentAsset.prototype.getAssetInstances = function() {
        return Filament.vectorToArray(this._getAssetInstances());
    };

    Filament.gltfio$FilamentAsset.prototype.getMorphTargetNames = function(entity) {
        return Filament.vectorToArray(this._getMorphTargetNames(entity));
    };

    if (Filament.gltfio$FilamentAsset && Filament.gltfio$FilamentAsset.prototype.addEntitiesToScene) {
        const origAddEntitiesToScene = Filament.gltfio$FilamentAsset.prototype.addEntitiesToScene;
        Filament.gltfio$FilamentAsset.prototype.addEntitiesToScene = function(scene, sceneFilter) {
            if (sceneFilter === undefined) {
                sceneFilter = 1;
            }
            return origAddEntitiesToScene.call(this, scene, sceneFilter);
        };
    }

});
