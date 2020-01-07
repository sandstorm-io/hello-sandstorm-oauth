// A helper module for making rpc requests to the grain's parent frame.
// via postMessage. Relevant documentation:
//
// https://docs.sandstorm.io/en/latest/developing/powerbox/
//
// The interface this exposes is slightly higher level; it hooks up the
// event listener and manages rpcIds for you, abstracting them behind
// promises, so you can just call:
//
// powerboxRequest({query: ..., saveLabel: ...}).then((response) => {
//    // send the token to the server.
// })

const outstandingRequests = {};
let initDone = false;
let nextId = 1;

function handleMessage(event) {
  if(event.source !== window.parent) {
    // SECURITY: ignore postMessages that didn't come from the parent frame.
    return;
  }

  const response = event.data;
  const req = outstandingRequests[response.rpcId]

  if(req === undefined) {
    console.warn("Unknown rpc request; ignoring.");
    return;
  }

  if(response.error || response.canceled) {
    req.reject(response);
  } else {
    req.resolve(response);
  }
  delete outstandingRequests[response.rpcId];
}

export function powerboxRequest(msg) {
  if(!initDone) {
    window.addEventListener('message', handleMessage);
    initDone = true;
  }

  msg.rpcId = nextId;
  nextId++;
  const result = new Promise((resolve, reject) => {
    outstandingRequests[msg.rpcId] = {resolve, reject};
  })
  window.parent.postMessage({ powerboxRequest: msg }, '*');
  return result;
}
