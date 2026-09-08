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

    /// View ::core class::

    /// setAmbientOcclusionOptions ::method::
    /// overrides ::argument:: Dictionary with AmbientOcclusionOptions properties.
    Filament.View.prototype.setAmbientOcclusionOptions = function(overrides) {
        this._setAmbientOcclusionOptions(this.getAmbientOcclusionOptions(overrides));
    };

    /// setDepthOfFieldOptions ::method::
    /// overrides ::argument:: Dictionary with DepthOfFieldOptions properties.
    Filament.View.prototype.setDepthOfFieldOptions = function(overrides) {
        this._setDepthOfFieldOptions(this.getDepthOfFieldOptions(overrides));
    };

    /// setMultiSampleAntiAliasingOptions ::method::
    /// overrides ::argument:: Dictionary with MultiSampleAntiAliasingOptions properties.
    Filament.View.prototype.setMultiSampleAntiAliasingOptions = function(overrides) {
        this._setMultiSampleAntiAliasingOptions(this.getMultiSampleAntiAliasingOptions(overrides));
    };

    /// setTemporalAntiAliasingOptions ::method::
    /// overrides ::argument:: Dictionary with TemporalAntiAliasingOptions properties.
    Filament.View.prototype.setTemporalAntiAliasingOptions = function(overrides) {
        this._setTemporalAntiAliasingOptions(this.getTemporalAntiAliasingOptions(overrides));
    };

    /// setScreenSpaceReflectionsOptions ::method::
    /// overrides ::argument:: Dictionary with ScreenSpaceReflectionsOptions properties.
    Filament.View.prototype.setScreenSpaceReflectionsOptions = function(overrides) {
        this._setScreenSpaceReflectionsOptions(this.getScreenSpaceReflectionsOptions(overrides));
    };

    /// setBloomOptions ::method::
    /// overrides ::argument:: Dictionary with BloomOptions properties.
    Filament.View.prototype.setBloomOptions = function(overrides) {
        this._setBloomOptions(this.getBloomOptions(overrides));
    };

    /// setFogOptions ::method::
    /// overrides ::argument:: Dictionary with FogOptions properties.
    Filament.View.prototype.setFogOptions = function(overrides) {
        this._setFogOptions(this.getFogOptions(overrides));
    };

    /// setVignetteOptions ::method::
    /// overrides ::argument:: Dictionary with VignetteOptions properties.
    Filament.View.prototype.setVignetteOptions = function(overrides) {
        this._setVignetteOptions(this.getVignetteOptions(overrides));
    };

    /// setGuardBandOptions ::method::
    /// overrides ::argument:: Dictionary with GuardBandOptions properties.
    Filament.View.prototype.setGuardBandOptions = function(overrides) {
        this._setGuardBandOptions(this.getGuardBandOptions(overrides));
    };

    /// setStereoscopicOptions ::method::
    /// overrides ::argument:: Dictionary with StereoscopicOptions properties.
    Filament.View.prototype.setStereoscopicOptions = function(overrides) {
        this._setStereoscopicOptions(this.getStereoscopicOptions(overrides));
    };

    /// setVsmShadowOptions ::method::
    /// overrides ::argument:: Dictionary with VsmShadowOptions properties.
    Filament.View.prototype.setVsmShadowOptions = function(overrides) {
        this._setVsmShadowOptions(this.getVsmShadowOptions(overrides));
    };

    /// setSoftShadowOptions ::method::
    /// overrides ::argument:: Dictionary with SoftShadowOptions properties.
    Filament.View.prototype.setSoftShadowOptions = function(overrides) {
        this._setSoftShadowOptions(this.getSoftShadowOptions(overrides));
    };

    /// setDynamicResolutionOptions ::method::
    /// overrides ::argument:: Dictionary with DynamicResolutionOptions properties.
    Filament.View.prototype.setDynamicResolutionOptions = function(overrides) {
        this._setDynamicResolutionOptions(this.getDynamicResolutionOptions(overrides));
    };

    /// setRenderQuality ::method::
    /// overrides ::argument:: Dictionary with RenderQuality properties.
    Filament.View.prototype.setRenderQuality = function(overrides) {
        this._setRenderQuality(this.getRenderQuality(overrides));
    };

    /// getDirectionalShadowCameras ::method::
    /// ::retval:: Array of [Camera] objects
    Filament.View.prototype.getDirectionalShadowCameras = function() {
        return Filament.vectorToArray(this._getDirectionalShadowCameras());
    };

});
