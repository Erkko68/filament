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

    /// Renderer ::core class::

    /// setClearOptions ::method::
    /// overrides ::argument:: Dictionary with one or more of the following properties: \
    /// `clearColor`, `clear`, `discard`.
    Filament.Renderer.prototype.setClearOptions = function(overrides) {
        const options = {
            clearColor: [0.0, 0.0, 0.0, 1.0],
            clear: true,
            discard: true
        };
        this._setClearOptions(Object.assign(options, overrides));
    };

    /// readPixels ::method::
    ///
    /// Reads pixels from the current SwapChain.
    ///
    /// The returned Promise resolves to an Object with the following properties:
    /// - `data`: Uint8Array or Float32Array containing pixel data
    /// - `width`: width of the returned image
    /// - `height`: height of the returned image
    /// - `format`: PixelDataFormat
    /// - `type`: PixelDataType
    ///
    /// Overload 1:
    /// - `x`: non-negative integer
    /// - `y`: non-negative integer
    /// - `width`: positive integer
    /// - `height`: positive integer
    /// - `format`: optional, PixelDataFormat (defaults to RGBA)
    /// - `type`: optional, PixelDataType (defaults to UBYTE)
    ///
    /// Overload 2:
    /// - `renderTarget`: RenderTarget
    /// - `x`: non-negative integer
    /// - `y`: non-negative integer
    /// - `width`: positive integer
    /// - `height`: positive integer
    /// - `format`: optional, PixelDataFormat (defaults to RGBA)
    /// - `type`: optional, PixelDataType (defaults to UBYTE)
    Filament.Renderer.prototype.readPixels = function(...args) {
        let renderTarget = null;
        let x, y, width, height, format, type;

        if (args[0] instanceof Filament.RenderTarget) {
            [renderTarget, x, y, width, height, format, type] = args;
        } else {
            [x, y, width, height, format, type] = args;
        }

        format = format || Filament.PixelDataFormat.RGBA;
        type = type || Filament.PixelDataType.UBYTE;

        return new Promise((resolve, reject) => {
            const callback = (data, width, height, format, type) => {
                resolve({ data, width, height, format, type });
            };
            if (renderTarget) {
                this._readPixelsRenderTarget(renderTarget, x, y, width, height, format, type, callback);
            } else {
                this._readPixels(x, y, width, height, format, type, callback);
            }
        });
    };

});
