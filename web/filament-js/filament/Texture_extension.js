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

    /// Texture ::core class::

    Filament.Texture.prototype.setImage = function(engine, level, pbd) {
        this._setImage(engine, level, pbd);
        pbd.delete();
    };

    Filament.Texture.prototype.getWidth = function(engine, level = 0) {
        return this._getWidth(engine, level);
    };

    Filament.Texture.prototype.getHeight = function(engine, level = 0) {
        return this._getHeight(engine, level);
    };

    Filament.Texture.prototype.getDepth = function(engine, level = 0) {
        return this._getDepth(engine, level);
    };

    Filament.Texture.prototype.getLevels = function(engine) {
        return this._getLevels(engine);
    };

});
