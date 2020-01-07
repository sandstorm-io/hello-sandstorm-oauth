const http = require('http');
const fs = require('fs');
const request = require('request')
const static = require('node-static');

const fileServer = new static.Server('./static');

// return a promise for the full body of a request.
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = ""
    req.on('data', (chunk) => { body += chunk; })
    req.on('end', () => { resolve(body); })
  })
}

function handlePowerboxToken(req, resp) {
  getRequestBody(req).then((body) => {
    const sessionId = req.headers['x-sandstorm-session-id'];
    request({
      proxy: process.env.HTTP_PROXY,
      method: 'POST',
      url: 'http://http-bridge/session/' + sessionId + '/claim',
      json: {
        requestToken: body,
        requiredPermissions: [],
      },
    }, (err, bridgeResponse, body) => {
      if(err) {
        resp.writeHead(500, {})
        resp.end()
      } else {
        fs.promises.writeFile('/var/token', body.cap).then(() => {
          // TODO: redirect
          resp.writeHead(200, {})
          resp.end()
        })
      }
    });
  })
}

let keytext = null;

function fetchKeyText() {
  return new Promise((resolve, reject) => {
    if(keytext !== null) {
      resolve(keytext);
      return;
    }
    return fs.promises.readFile('/var/token').then((token) => {
      request({
        proxy: process.env.HTTP_PROXY,
        headers: {
          // Use sandstorm for auth:
          'Authorization': 'Bearer ' + token,

          // Recommended by github docs:
          'Accept': 'application/vnd.github.v3+json',
        },

        // It doesn't matter what we put for the host part of the url;
        // Sandstorm will replace it with whatever the user supplied via the
        // powerbox. The 'Authorization' header decides where we go.
        //
        // It would probably still be better to use the expected host here,
        // but just to demo:
        url: 'http://example.com/users/zenhack/keys',
      }, (err, githubResponse, body) => {
        if(err) {
          reject(err);
          return;
        }
        console.log(githubResponse)
        keytext = body;
        resolve(keytext)
      })
    })
  })
}

function handleKeyText(resp) {
    fetchKeyText()
      .then((data) => {
        resp.writeHead(200, {'content-type': 'text/plain'})
        resp.write(keytext)
        resp.end()
      })
      .catch((err) => {
        console.log(err)
        resp.writeHead(400, {'content-type': 'text/plain'})
        resp.write("Couldn't restore our token; try requesting one?")
        resp.end()
      })
}

http.createServer((request, response) => {
  if(request.url === '/powerbox-token' && request.method === 'POST') {
    handlePowerboxToken(request, response)
  } else if(request.url === '/keytext' && request.method === 'GET') {
    handleKeyText(response)
  } else {
    fileServer.serve(request, response);
  }
}).listen(8000);
