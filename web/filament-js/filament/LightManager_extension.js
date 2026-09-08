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

    /// LightManager ::core class::

    /// setShadowOptions ::method::
    /// instance ::argument:: Instance of a light component obtained from `getInstance`.
    /// overrides ::argument:: Dictionary with one or more of the following properties: \
    /// `mapSize`, `shadowCascades`, `constantBias`, `normalBias`, `shadowFar`, `shadowNearHint`, \
    /// `shadowFarHint`, `stable`, `lispsm`, `polygonOffsetConstant`, `polygonOffsetSlope`, \
    /// `screenSpaceContactShadows`, `stepCount`, `maxShadowDistance`, `shadowBulbRadius`, \
    /// `penumbraScale`, `penumbraRatioScale`, `maxPenumbraRatio`, `maxSearchRadius`, \
    /// `cascadeSplitPositions`, `vsm`.
    Filament.LightManager.prototype.setShadowOptions = function(instance, overrides) {
        this._setShadowOptions(instance, Filament.shadowOptions(overrides));
    };

    Filament.LightManager$Builder.prototype.shadowOptions = function(overrides) {
        return this._shadowOptions(Filament.shadowOptions(overrides));
    };

});
