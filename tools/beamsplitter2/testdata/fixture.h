// Fixture for the beamsplitter2 tests. It reproduces, in miniature, every shape
// the real Filament headers rely on, so the tests do not need the engine sources.
#pragma once

#include <stddef.h>
#include <stdint.h>

namespace fx {
namespace math {
namespace details {
template<typename T> struct TVec2 { T x, y; };
template<typename T> struct TVec3 { T x, y, z; };
template<typename T> struct TVec4 { T x, y, z, w; };
template<typename T> struct TMat33 { T m[9]; };
template<typename T> struct TMat44 { T m[16]; };
template<typename T> struct TQuaternion { T x, y, z, w; };
}  // namespace details

// vecN is an alias template, so float3 is spelled vec3<float> and only desugars
// to TVec3<float> one level further down.
template<typename T> using vec3 = details::TVec3<T>;

using float2 = details::TVec2<float>;
using float3 = vec3<float>;
using float4 = details::TVec4<float>;
using mat3f  = details::TMat33<float>;
using mat4   = details::TMat44<double>;
using mat4f  = details::TMat44<float>;
using quatf  = details::TQuaternion<float>;
}  // namespace math

enum class Mode : uint8_t { Fast, Nice };

struct Viewport {
    int32_t left;
    int32_t bottom;
    uint32_t width;
    uint32_t height;
};

class Buffer {
public:
    Buffer(void* data, size_t size);
    Buffer(Buffer&& other);
};

/**
 * A widget, for testing documentation capture.
 */
class Widget {
public:
    using Callback = void (*)(void* user);

    enum class Fov { Vertical, Horizontal };

    class Builder {
    public:
        Builder() noexcept;
        Builder& width(uint32_t w) noexcept;
        Builder& mode(Mode m) noexcept;
        Widget* build() noexcept;
    private:
        int hidden;
    };

    /**
     * Points the widget at a target.
     * @param eye where the widget is
     * @param center what it looks at
     * @return nothing useful
     */
    void lookAt(const math::float3& eye, const math::float3& center);

    void setTransform(const math::mat4& m);
    void setSmallTransform(const math::mat3f& m);
    void setOrientation(const math::quatf& q);
    void setViewport(Viewport vp);
    void setName(const char* name);
    void setMode(Mode m);
    void setPoints(const math::float3* points, size_t count);
    void setBuffer(Buffer&& buffer);
    void onDone(Callback cb);
    void setOpaque(void* opaque);

    // Getter and setter pair, plus a read-only getter and a boolean getter.
    float getExposure() const;
    void setExposure(float exposure);
    uint32_t getWidth() const;
    bool isVisible() const;

    // Overloads, which the IR must mark as such.
    void resize(uint32_t w);
    void resize(uint32_t w, uint32_t h);

    Widget& operator=(const Widget& other);

private:
    void internalOnly();
};

class Engine {
public:
    Widget* createWidget();
    void destroy(const Widget* widget);
};

// A class template: only concrete specializations could ever be bound.
template<typename T> class Holder {
public:
    T get() const;
};

}  // namespace fx
