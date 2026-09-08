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

    /// gltfio$ResourceLoader ::class::

    Filament.gltfio$ResourceLoader.prototype.addTextureProvider = function(mime, provider) {
        if (provider instanceof Filament.gltfio$StbProvider) {
            return this.addStbProvider(mime, provider);
        }
        if (provider instanceof Filament.gltfio$Ktx2Provider) {
            return this.addKtx2Provider(mime, provider);
        }
        if (typeof Filament.gltfio$WebpProvider !== 'undefined' && provider instanceof Filament.gltfio$WebpProvider) {
            return this.addWebpProvider(mime, provider);
        }
        throw new Error("Unsupported texture provider");
    };

});
