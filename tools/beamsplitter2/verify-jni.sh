#!/usr/bin/env bash
# Syntax-checks generated JNI shims against the real Filament headers.
#
# This is the acceptance check for the JNI emitter, and it is only half of one:
# it proves the C++ compiles, not that the symbol names are the ones the JVM will
# look for. Nothing can prove that until the Java side is generated too.
#
#   tools/beamsplitter2/verify-jni.sh                    # every generated file
#   tools/beamsplitter2/verify-jni.sh android/filament-android/src/main/cpp/Camera_generated.cpp
#
# Override JAVA_HOME if the JDK lives somewhere else.
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

JAVA_HOME="${JAVA_HOME:-$(/usr/libexec/java_home 2>/dev/null || true)}"
if [ -z "$JAVA_HOME" ] || [ ! -f "$JAVA_HOME/include/jni.h" ]; then
    echo "verify-jni.sh: no jni.h under JAVA_HOME (set JAVA_HOME to a JDK)" >&2
    exit 1
fi

# jni_md.h, which jni.h includes, sits in a directory named after the platform.
JNI_MD="$(dirname "$(find "$JAVA_HOME/include" -name jni_md.h | head -1)")"

# The include path comes from the tool, which is where the header lists live.
INCLUDES=("-I$JAVA_HOME/include" "-I$JNI_MD")
while IFS= read -r dir; do INCLUDES+=("-I$ROOT/$dir"); done \
    < <(cd "$ROOT/tools/beamsplitter2" && go run . -includes)

FILES=("$@")
if [ ${#FILES[@]} -eq 0 ]; then
    while IFS= read -r file; do FILES+=("$file"); done \
        < <(find "$ROOT/android" -name '*_generated.cpp' | sort)
fi

failed=0
for file in "${FILES[@]}"; do
    # -std=c++20 and -fno-rtti match the Filament build.
    if output=$(clang++ -fsyntax-only -std=c++20 -fno-rtti "${INCLUDES[@]}" "$file" 2>&1); then
        echo "ok   ${file#"$ROOT"/}"
    else
        echo "FAIL ${file#"$ROOT"/}"
        echo "$output" | grep -E '(error|warning):' | head -8 | sed 's/^/       /'
        failed=$((failed + 1))
    fi
done

if [ "$failed" -ne 0 ]; then
    echo "$failed file(s) failed to compile" >&2
    exit 1
fi
