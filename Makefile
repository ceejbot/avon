all: test

build: clean configure compile

configure:
	@node-gyp configure

compile: configure
	node-gyp build
	npm install .

test: build
	@npm test

clean:
	node-gyp clean

.PHONY: clean test build
