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

    /// gltfio$AssetLoader ::class::

    Filament.gltfio$AssetLoader.prototype.createAsset = function(buffer) {
        buffer = getBufferDescriptor(buffer);
        const result = this._createAsset(buffer);
        buffer.delete();
        return result;
    };

    Filament.gltfio$AssetLoader.prototype.createInstancedAsset = function(buffer, instances) {
        buffer = getBufferDescriptor(buffer);
        const asset = this._createInstancedAsset(buffer, instances.length);
        buffer.delete();
        const instancesVector = asset._getAssetInstances();
        for (let i = 0; i < instancesVector.size(); i++) {
            instances[i] = instancesVector.get(i);
        }
        return asset;
    };

    Filament.gltfio$AssetLoader.prototype.getMaterials = function() {
        return Filament.vectorToArray(this._getMaterials());
    };

});
