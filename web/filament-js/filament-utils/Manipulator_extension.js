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

    /// camutils$Manipulator ::class::

    /**
     * Attaches the manipulator to a canvas and starts listening for mouse and wheel events.
     */
    Filament.camutils$Manipulator.prototype.attach = function(canvas) {
        const manip = this;

        this.onMouseDown = (e) => {
            manip.grabBegin(e.offsetX, -e.offsetY, e.shiftKey);
        };
        this.onMouseMove = (e) => {
            manip.grabUpdate(e.offsetX, -e.offsetY);
        };
        this.onMouseUp = (e) => {
            manip.grabEnd();
        };
        this.onWheel = (e) => {
            e.preventDefault();
            // Camutils expects a scroll delta where negative means "zoom in".
            // DOM wheel deltaY is positive for "scroll down" (zoom out).
            manip.scroll(e.offsetX, e.offsetY, e.deltaY / 4.0);
        };

        canvas.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
        canvas.addEventListener('wheel', this.onWheel, { passive: false });
    };

    /**
     * Detaches the manipulator from its canvas and stops listening for events.
     */
    Filament.camutils$Manipulator.prototype.detach = function(canvas) {
        canvas.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
        canvas.removeEventListener('wheel', this.onWheel);
    };

});
