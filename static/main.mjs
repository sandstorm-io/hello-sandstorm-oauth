import { post } from './http.mjs';
import { powerboxRequest } from './rpc.mjs';
import { pbDescriptor } from './pb-descriptor.mjs';

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('request-btn').addEventListener('click', () => {
    powerboxRequest({
      query: pbDescriptor,
      saveLabel: {defaultText: "Your GitHub account, for fetching your public key."},
    }).then((response) => {
      post('/powerbox-token', response.token)
    }).then(() => {
      window.location.href = '/keytext';
    })
  })
})
