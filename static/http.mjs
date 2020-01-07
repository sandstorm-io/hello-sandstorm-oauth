// A slightly more ergonmic wrapper around XMLHttpRequest.
// `post(url, data)` posts the data to the url, and returns a promise
// which resolves to the xhr after it completes.
export function post(url, data) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(xhr)
    }

    xhr.open('POST', url);
    xhr.send(data);
  })
}
