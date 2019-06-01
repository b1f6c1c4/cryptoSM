CFLAGS=-O3 -Isrc/libtommath/headers -Isrc/libtomcrypt/headers -DLTC_SOURCE
CXXFLAGS=$(CFLAGS)

CFILES=$(shell find src/ -type f -name '*.c')
HFILES=$(shell find src/ -type f -name '*.h')
HPPFILES=$(wildcard src/wasm/*.hpp)

all: bin/garble.js

define c-to-obj

obj/emcc/$(basename $(FILE)).o: src/$(FILE) $$(HFILES)
	mkdir -p $$(shell dirname $$@)
	emcc -c --std=c99 -o $$@ $$(CFLAGS) $$<

obj/emcc/lib.a: obj/emcc/$(basename $(FILE)).o

endef

$(foreach FILE,$(patsubst src/%,%,$(CFILES)),$(eval $(call c-to-obj, $(FILE))))

obj/emcc/lib.a:
	mkdir -p $(shell dirname $@)
	emar -r $@ $^

obj/emcc/main.o: src/wasm/main.emcc.cpp $(HFILES) $(HPPFILES)
	mkdir -p $(shell dirname $@)
	em++ -c --std=c++17 -o $@ $(CXXFLAGS) $<

bin/garble.js: src/wasm/main.post.js obj/emcc/main.o obj/emcc/lib.a
	mkdir -p $(shell dirname $@)
	em++ -o $@ --post-js $^ \
		-s EXTRA_EXPORTED_RUNTIME_METHODS='["ccall"]' \
		-s DEMANGLE_SUPPORT=1

clean:
	rm -rf bin/ obj/
