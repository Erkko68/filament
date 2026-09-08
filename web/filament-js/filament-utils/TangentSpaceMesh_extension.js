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

    /// geometry$TangentSpaceMesh ::class::

    Filament.geometry$TangentSpaceMesh$Builder.prototype.normals = function(buffer, stride = 0) {
        buffer = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        this.norPointer = Filament._malloc(buffer.byteLength);
        Filament.HEAPU8.set(buffer, this.norPointer);
        this._normals(this.norPointer, stride);
        return this;
    };

    Filament.geometry$TangentSpaceMesh$Builder.prototype.tangents = function(buffer, stride = 0) {
        buffer = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        this.tanPointer = Filament._malloc(buffer.byteLength);
        Filament.HEAPU8.set(buffer, this.tanPointer);
        this._tangents(this.tanPointer, stride);
        return this;
    };

    Filament.geometry$TangentSpaceMesh$Builder.prototype.uvs = function(buffer, stride = 0) {
        buffer = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        this.uvsPointer = Filament._malloc(buffer.byteLength);
        Filament.HEAPU8.set(buffer, this.uvsPointer);
        this._uvs(this.uvsPointer, stride);
        return this;
    };

    Filament.geometry$TangentSpaceMesh$Builder.prototype.positions = function(buffer, stride = 0) {
        buffer = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        this.posPointer = Filament._malloc(buffer.byteLength);
        Filament.HEAPU8.set(buffer, this.posPointer);
        this._positions(this.posPointer, stride);
        return this;
    };

    Filament.geometry$TangentSpaceMesh$Builder.prototype.triangles16 = function(buffer) {
        buffer = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        this.t16Pointer = Filament._malloc(buffer.byteLength);
        Filament.HEAPU8.set(buffer, this.t16Pointer);
        this._triangles16(this.t16Pointer);
        return this;
    };

    Filament.geometry$TangentSpaceMesh$Builder.prototype.triangles32 = function(buffer) {
        buffer = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        this.t32Pointer = Filament._malloc(buffer.byteLength);
        Filament.HEAPU8.set(buffer, this.t32Pointer);
        this._triangles32(this.t32Pointer);
        return this;
    };

    Filament.geometry$TangentSpaceMesh$Builder.prototype.build = function() {
        const result = this._build();
        this.delete();
        if ('norPointer' in this) Filament._free(this.norPointer);
        if ('tanPointer' in this) Filament._free(this.tanPointer);
        if ('uvsPointer' in this) Filament._free(this.uvsPointer);
        if ('posPointer' in this) Filament._free(this.posPointer);
        if ('t16Pointer' in this) Filament._free(this.t16Pointer);
        if ('t32Pointer' in this) Filament._free(this.t32Pointer);
        return result;
    };

    Filament.geometry$TangentSpaceMesh.prototype._getQuats = function(buf, attribType) {
        if (attribType === Filament.backend$ElementType.FLOAT4) {
            this._getQuatsQuatf(buf, 0);
        } else if (attribType === Filament.backend$ElementType.HALF4) {
            this._getQuatsQuath(buf, 0);
        } else {
            this._getQuatsShort4(buf, 0);
        }
    };

    Filament.geometry$TangentSpaceMesh.prototype.getQuats = function(attribType = Filament.backend$ElementType.SHORT4) {
        const nverts = this.getVertexCount();
        const byteSize = (attribType === Filament.backend$ElementType.FLOAT4 ? 16 : 8) * nverts;
        const buf = Filament._malloc(byteSize);
        this._getQuats(buf, attribType);
        const arrayBuffer = Filament.HEAPU8.subarray(buf, buf + byteSize).slice().buffer;
        Filament._free(buf);
        if (attribType === Filament.backend$ElementType.FLOAT4) return new Float32Array(arrayBuffer);
        if (attribType === Filament.backend$ElementType.HALF4) return new Uint16Array(arrayBuffer);
        return new Int16Array(arrayBuffer);
    };

    Filament.geometry$TangentSpaceMesh.prototype.getPositions = function(stride = 0) {
        const nverts = this.getVertexCount();
        const byteSize = 12 * nverts;
        const buf = Filament._malloc(byteSize);
        this._getPositions(buf, stride);
        const arrayBuffer = Filament.HEAPU8.subarray(buf, buf + byteSize).slice().buffer;
        Filament._free(buf);
        return new Float32Array(arrayBuffer);
    };

    Filament.geometry$TangentSpaceMesh.prototype.getUVs = function(stride = 0) {
        const nverts = this.getVertexCount();
        const byteSize = 8 * nverts;
        const buf = Filament._malloc(byteSize);
        this._getUVs(buf, stride);
        const arrayBuffer = Filament.HEAPU8.subarray(buf, buf + byteSize).slice().buffer;
        Filament._free(buf);
        return new Float32Array(arrayBuffer);
    };

    Filament.geometry$TangentSpaceMesh.prototype.getTriangles16 = function() {
        const ntris = this.getTriangleCount();
        const byteSize = 6 * ntris;
        const buf = Filament._malloc(byteSize);
        this._getTriangles16(buf);
        const arrayBuffer = Filament.HEAPU8.subarray(buf, buf + byteSize).slice().buffer;
        Filament._free(buf);
        return new Uint16Array(arrayBuffer);
    };

    Filament.geometry$TangentSpaceMesh.prototype.getTriangles32 = function() {
        const ntris = this.getTriangleCount();
        const byteSize = 12 * ntris;
        const buf = Filament._malloc(byteSize);
        this._getTriangles32(buf);
        const arrayBuffer = Filament.HEAPU8.subarray(buf, buf + byteSize).slice().buffer;
        Filament._free(buf);
        return new Uint32Array(arrayBuffer);
    };

});
