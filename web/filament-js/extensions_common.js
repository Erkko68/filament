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

// Private utility that converts an asset string or Uint8Array into a low-level buffer descriptor.
// Note that the low-level buffer descriptor must be manually deleted.
function getBufferDescriptor(buffer) {
    if ('string' == typeof buffer || buffer instanceof String) {
        buffer = Filament.assets[buffer];
    }
    if (buffer && buffer.buffer instanceof ArrayBuffer) {
        buffer = Filament.Buffer(buffer);
    }
    return buffer;
}

function isTexture(uri) {
    if (uri.endsWith(".png") || uri.endsWith(".ktx2") || uri.endsWith(".jpg") || uri.endsWith(".jpeg")) {
        return true;
    }
    return false;
}

Filament.vectorToArray = function(vector) {
    const result = [];
    for (let i = 0; i < vector.size(); i++) {
        result.push(vector.get(i));
    }
    return result;
};

Filament.shadowOptions = function(overrides) {
    const options = {
        mapSize: 1024,
        shadowCascades: 1,
        constantBias: 0.001,
        normalBias: 1.0,
        shadowFar: 0.0,
        shadowNearHint: 1.0,
        shadowFarHint: 100.0,
        stable: false,
        lispsm: true,
        polygonOffsetConstant: 0.5,
        polygonOffsetSlope: 2.0,
        screenSpaceContactShadows: false,
        stepCount: 8,
        maxShadowDistance: 0.3,
        shadowBulbRadius: 0.02,
        penumbraScale: 1.0,
        penumbraRatioScale: 1.0,
        maxPenumbraRatio: 0.0,
        maxSearchRadius: 0.0,
        cascadeSplitPositions: [0.125, 0.25, 0.50],
        vsm: { elvsm: false, blurWidth: 0.0 },
        transform: [0, 0, 0, 1]
    };
    if (overrides && overrides.vsm) {
        overrides = Object.assign({}, overrides,
                { vsm: Object.assign({}, options.vsm, overrides.vsm) });
    }
    return Object.assign(options, overrides);
};

Filament._classExtensions = Filament._classExtensions || [];
Filament.registerClassExtension = function(fn) {
    Filament._classExtensions.push(fn);
};

Filament.loadClassExtensions = function() {
    for (const ext of Filament._classExtensions) {
        ext();
    }
    // Generic auto-delete on build() for all Filament builders
    for (const key of Object.keys(Filament)) {
        if (key.endsWith('$Builder') && Filament[key] && Filament[key].prototype) {
            const proto = Filament[key].prototype;
            if (proto._build && !proto.build) {
                proto.build = function(...args) {
                    const result = this._build(...args);
                    this.delete();
                    return result;
                };
            }
        }
    }
};
