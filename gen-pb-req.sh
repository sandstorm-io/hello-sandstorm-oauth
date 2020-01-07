#!/usr/bin/env sh

req=$(capnp eval -I/opt/sandstorm/latest/usr/include -p \
	powerbox-request.capnp descriptor \
	| base64 -w0)

echo "export const pbDescriptor = ['$req'];" > static/pb-descriptor.mjs
