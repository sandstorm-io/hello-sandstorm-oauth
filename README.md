This is a simple hello-world example for using sandstorm's OAuth support
via the Powerbox, with sandstorm-http-bridge. Relevant official docs are
[here][1].

# Summary

* Apps wanting to talk to an oauth-based API can use the Powerbox to
  request access. Sandstorm itself will manage credentials, which
  means the app doesn't need direct access to the user's account,
  nor does it need its own client id and client secret with the
  oauth service.
* This only works for services that are set up for the local
  Sandstorm server. Right now this means at most GitHub and Google,
  but we could add more in principle (and probably will). Go through
  the process of setting these services up as login providers if you
  want users to be able to use their APIs.
* The same mechanism can be used to request access to other HTTP
  endpoints, either authenticated via HTTP basic auth or not at all.

The basic flow for this is:

1. JavaScript running in the browser requests a capability token for an
   API from Sandstorm, using the postMessage API. You need to pass a
   powerbox descriptor, which specifies what kind of object you want
   access to. This is usually constructed as part of building the app,
   and then embedded in the application for use at run time.
2. On acquiring a token from Sandstorm, the browser-side code posts
   the token to its server.
3. Via a request to sandstorm-http-bridge, the server exchanges this
   token for a different one, which can be used to actually make
   requests.
4. The app can now make requests to the service, by including the
   token it got from the bridge in the Authorization header.

# The Example

The example provided here requests access to the user's GitHub account
with the `read:public_key` scope, and uses this to fetch and display
the user's public key.

The client side code for the example is in `./static/`; these are just
static files served to the browser. The server is in `./server/main.js`.
The script `gen-pb-req.sh` is used to generate the powerbox
descriptor from the data in `powerbox-request.capnp`.

One caveat with this example is that it depends on a couple prs that
haven't landed yet:

- https://github.com/sandstorm-io/sandstorm/pull/3181
- https://github.com/sandstorm-io/sandstorm/pull/3180

## Building

Assuming you're on a Linux box with nodejs 10.x, sandstorm, and
capnproto installed, you can run the app in dev mode via:

```
./build.sh
spk dev
```

[1]: https://docs.sandstorm.io/en/latest/developing/powerbox/
