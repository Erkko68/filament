# beamsplitter2

Reads Filament's public C++ headers and writes the bindings: embind and
TypeScript for the web, JNI shims and Java for Android.

```
beamsplitter2 -out ir.json                    # the whole public API, as JSON
beamsplitter2 -emit web/filament-js           # the embind bindings and the .d.ts
beamsplitter2 -platform jni -emit android     # the JNI shims and the Java
beamsplitter2 -explain Camera                 # why each member was or was not bound
beamsplitter2 -header filament/Camera.h       # one header, for debugging
```

## The pipeline

```
  Filament headers
        |
        |  one umbrella per target, so a type has one identity      main.go
        v
  clang++ -ast-dump=json                                            clang/
        |
        |  facts only: what is declared, and where                  ir/
        v
      ir.API  ── classes, enums, methods, fields, types
        |
        |  verdicts: what can be bound, and why                     rules/
        |  reached by iterating to a fixed point
        v
      ir.API  ── every entity now carries a Decision
        |
        +─────────────────────────────+
        |                             |
        v                             v
   emit/js  + emit/ts            emit/jni + emit/java               platform.go
   embind + .d.ts                shims + native declarations
        |                             |
        v                             v
   web/filament-js/              android/*-android/
```

Each stage may only add. The parser never decides, the rules never write C++,
and an emitter never asks a question the IR cannot answer. That is what makes
`ir.json` worth reading: every field in it is either a fact clang reported or a
verdict a named rule recorded, and `-explain` can always say which.

## The three kinds of knowledge

Deciding what to bind mixes three things that grow at different rates, and they
are kept apart so that only the last one grows at all.

| kind | lives in | grows with |
|---|---|---|
| facts about C++ | `rules/cpp.go` | never — it is the language |
| what a target can carry | `emit/*/target.go` | a new platform |
| conventions of this codebase | `rules/filament.go` | new Filament types |

A target is asked about **types**, of which there are finitely many, and never
about methods, of which there are unboundedly many. A method added to a header
is classified without touching the tool.

The Filament file is a table rather than code, and it is short: a
`BufferDescriptor` is a buffer, an `Invocable` is a callback, a `Manipulator` is
read at `float`, `setParameter` is used at these nine types. Nothing else in the
tool needs to know anything about Filament.

## Why a fixed point

The verdicts depend on each other: a method can only be bound if the types it
names are, and a class is only worth binding if something on it survived. So
`rules.Apply` starts from *everything is bindable* and takes away until nothing
changes. Beginning from nothing would be self-fulfilling — no first pass could
bind anything.

Each pass can only reject, never re-accept, so the count of bound entities falls
monotonically and it terminates.

## What the two targets disagree about

The same C++ reaches two boundaries that find different things hard, which is
the reason the question belongs to the target and not to the rules.

| | embind | JNI |
|---|---|---|
| 64-bit integer | needs `-sWASM_BIGINT` | `jlong`, free |
| struct by value | a `value_object`, free | a Java class and a copy either way |
| overload dispatch | argument count alone | the full signature |
| `utils::Entity` | an object with methods | an `int`, which its own header says |

## Decisions worth knowing

**One translation unit per target.** Every header of a target is included from
one generated umbrella, so a type named from two headers is one type. Parsing
them separately would give two.

**A value is anything a copy can carry.** A struct crosses as a Java object
holding the members — unless one of its methods would modify it, because the
method would modify the copy and nothing else and nothing would say so. Filament
writes several builders as structs, and that rule is what keeps them handles.

**Names are resolved, not stripped.** Dropping namespaces can make two
declarations one name. `filament::Viewport` keeps `Viewport` and
`filament::backend::Viewport` takes back as much of its namespace as it needs.
Before that, embind registered the name twice and threw at module load.

**A colliding overload is named after what tells it apart.** `Engine::destroy`
has twenty-two overloads; no target dispatches on a pointer type. Each is named
from the last parameter that has not already named another, which produces
`destroyBufferObject` and `setParameterFloat3` without either being written
down.

**The generated files never overwrite the hand-written ones.** They carry a
`_generated` suffix, and each ends in a section that lists what the rules
refused and preserves whatever a developer wrote there last time.

**Java and JNI are one binding.** The JVM finds a native by the name of its
symbol, and a name built from a different spelling on either side compiles,
links, and throws at the first call. Both halves are generated from one table,
and `verify-java.sh` compares them.

## Verifying

Each script proves one thing, and says which:

| | proves |
|---|---|
| `verify-js.sh` | the embind bindings compile against the real headers |
| `verify-ts.sh` | the declarations are TypeScript, and describe registrations that exist |
| `verify-jni.sh` | the shims compile against the real headers |
| `verify-java.sh` | `javac -h` and the shims agree on every symbol |

The last one is the one that catches what nothing else can. It found the
overload suffix being taken from the C++ name rather than the Java one, which
was thirty-odd symbols the JVM would never have looked for: valid C++, valid
Java, `UnsatisfiedLinkError` at the first call.

## Where it stands

1192 methods bound for the web and 1203 for Android, out of 1442 that a caller
could plausibly want — everything but the operators, the copy constructors, the
deleted and the protected. 83% either way. Against the hand-written web
bindings, name for name, 87%.

What is refused is refused for a reason the IR records, and the largest groups
are not oversights:

- `operator=`, and the `->`/`*`/`++` of iterators. No target has them.
- move-only callbacks (`Invocable&&`) and the async ones. These need a bridge
  that keeps a JavaScript function or a Java object alive across a thread, which
  is a design rather than a rule.
- bit-fields and unions, which have no address and no way to say which member is
  live.
- `std::chrono`, `std::atomic`, `T**`, and the `CString`/`StaticString` family.

## Layout

```
main.go        the command: flags, and parse-everything-then-do-one-thing
platform.go    what a platform owes the pipeline, and the table of them
modules.go     which headers make up which module of which binary
clang/         running clang++ and decoding the part of its JSON we read
ir/            the IR, and the parser that fills it in
rules/         the policy: what can be bound, and why
emit/js, ts    embind bindings and the TypeScript that describes them
emit/jni, java JNI shims and the Java that declares them
```
