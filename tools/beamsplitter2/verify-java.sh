#!/usr/bin/env bash
# Checks that the two halves of the JNI bindings agree.
#
# javac -h writes the header it would expect for every native it compiled, which
# is the JVM's own answer to what each symbol is called. Comparing that against
# the symbols the shims define is the only way to know the bindings will link:
# a name that is wrong compiles on both sides and throws UnsatisfiedLinkError at
# the first call.
#
# Override JAVA_HOME if the JDK lives somewhere else.
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

JAVA_HOME="${JAVA_HOME:-$(/usr/libexec/java_home 2>/dev/null || true)}"
JAVAC="${JAVA_HOME:+$JAVA_HOME/bin/}javac"
if ! command -v "$JAVAC" >/dev/null 2>&1; then
    echo "verify-java.sh: no javac (set JAVA_HOME)" >&2
    exit 1
fi

SOURCES=()
while IFS= read -r file; do SOURCES+=("$file"); done \
    < <(find "$ROOT/android" -name '*_generated.java' | sort)
if [ ${#SOURCES[@]} -eq 0 ]; then
    echo "verify-java.sh: no generated Java; run beamsplitter2 -platform jni -emit android" >&2
    exit 1
fi

if ! output=$("$JAVAC" -nowarn -d "$WORK/classes" -h "$WORK/headers" "${SOURCES[@]}" 2>&1); then
    echo "FAIL the generated Java does not compile"
    echo "$output" | grep -E 'error:' | head -10 | sed 's/^/       /'
    exit 1
fi
echo "ok   ${#SOURCES[@]} Java sources compile"

grep -ho 'Java_[A-Za-z0-9_]*' "$WORK/headers"/*.h | sort -u > "$WORK/expected"
find "$ROOT/android" -name '*_generated.cpp' -print0 \
    | xargs -0 grep -ho 'Java_[A-Za-z0-9_]*' | sort -u > "$WORK/defined"

# Only the natives javac expects have to be defined. A shim with no declaration
# would be dead code, so that direction is reported too.
missing=$(comm -23 "$WORK/expected" "$WORK/defined")
extra=$(comm -13 "$WORK/expected" "$WORK/defined")

if [ -n "$missing" ]; then
    echo "FAIL $(echo "$missing" | wc -l | tr -d ' ') natives declared in Java with no shim"
    echo "$missing" | head -10 | sed 's/^/       /'
fi
if [ -n "$extra" ]; then
    echo "FAIL $(echo "$extra" | wc -l | tr -d ' ') shims no Java declaration asks for"
    echo "$extra" | head -10 | sed 's/^/       /'
fi
if [ -n "$missing" ] || [ -n "$extra" ]; then
    exit 1
fi

echo "ok   $(wc -l < "$WORK/expected" | tr -d ' ') symbols agree between the Java and the shims"
