#!/usr/bin/env bash
# Checks the generated TypeScript declarations against the bindings they declare.
#
# Two things can be wrong with a declaration file, and only one of them is a
# TypeScript question. The first is whether it is valid TypeScript, which tsc
# answers. The second is whether it describes the bindings that actually exist:
# a declared method with no registration behind it type-checks, ships, and is
# undefined at run time. That is the same failure the JNI symbols have, and it is
# checked the same way -- by comparing the two halves the tool wrote.
#
#   tools/beamsplitter2/verify-ts.sh
#
# tsc is fetched with npx if it is not on PATH; the cross-check needs neither.
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
WEB="$ROOT/web/filament-js"
DTS="$WEB/filament.d.ts"

if [ ! -f "$DTS" ]; then
    echo "verify-ts.sh: no $DTS; run beamsplitter2 -emit web/filament-js" >&2
    exit 1
fi

failed=0

# 1. Is it TypeScript?
if command -v tsc >/dev/null 2>&1; then
    TSC=(tsc)
elif command -v npx >/dev/null 2>&1; then
    TSC=(npx -y -p typescript tsc)
else
    TSC=()
fi
if [ ${#TSC[@]} -eq 0 ]; then
    echo "skip no tsc and no npx: not checking that the declarations parse"
elif output=$("${TSC[@]}" --noEmit --skipLibCheck "$DTS" 2>&1); then
    echo "ok   the declarations compile"
else
    echo "FAIL the declarations do not compile"
    echo "$output" | head -10 | sed 's/^/       /'
    failed=$((failed + 1))
fi

# 2. Do they describe what is registered?
python3 - "$WEB" <<'PYTHON'
import glob, os, re, sys

web = sys.argv[1]

# What embind registers: the name of each declaration, and of each member on it.
registered = {}
opening = re.compile(r'(?:class_|value_object|value_array|enum_)<[^;]*?>\("([^"]+)"\)')
member = re.compile(r'\.(?:class_function|function|field|property|class_property|value|element)\("([^"]+)"')
for path in glob.glob(os.path.join(web, '*', '*_generated.cpp')):
    text = open(path).read()
    blocks = list(opening.finditer(text))
    for i, block in enumerate(blocks):
        end = blocks[i + 1].start() if i + 1 < len(blocks) else len(text)
        registered.setdefault(block.group(1), set()).update(
            m.group(1) for m in member.finditer(text[block.end():end]))

# What the declarations promise. Only the generated half: everything above the
# marker describes bindings a person wrote by hand, which are not in these files.
declared = {}
text = open(os.path.join(web, 'filament.d.ts')).read()
marker = text.find('// ===== GENERATED DECLARATIONS =====')
if marker < 0:
    print("FAIL filament.d.ts has no generated section")
    sys.exit(1)
text = text[marker:]
current = None
for line in text.splitlines():
    head = re.match(r'\s*(?:export )?(?:declare )?(?:class|interface|enum) ([A-Za-z0-9_$]+)', line)
    if head:
        current = head.group(1)
        declared.setdefault(current, set())
        continue
    if current is None:
        continue
    if line.startswith('}'):
        current = None
        continue
    m = re.match(r'\s+(?:public |static |readonly )*([A-Za-z0-9_$]+)\s*[(:?=]', line)
    # delete is embind's own: every class it registers gets one, and nothing
    # registers it. A constructor is registered as .constructor<>, not by name.
    if m and m.group(1) not in ('constructor', 'delete'):
        declared[current].add(m.group(1))

missing = sorted(name for name in declared if name not in registered)
if missing:
    print("FAIL %d declared types are not registered by any binding" % len(missing))
    for name in missing[:10]:
        print("       %s" % name)
    sys.exit(1)

gaps = []
for name, members in sorted(declared.items()):
    for m in sorted(members - registered.get(name, set())):
        gaps.append("%s.%s" % (name, m))
if gaps:
    print("FAIL %d declared members have no registration behind them" % len(gaps))
    for gap in gaps[:10]:
        print("       %s" % gap)
    sys.exit(1)

print("ok   %d types and %d members are declared and registered alike"
      % (len(declared), sum(len(v) for v in declared.values())))
PYTHON
[ $? -ne 0 ] && failed=$((failed + 1))

exit $((failed != 0))
