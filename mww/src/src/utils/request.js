/* global window */
import axios from 'axios'

const fetch = (options) => {
  let {
    method = 'get',
    data,
    url,
    callBack = () => {}
  } = options

  if (method === 'get' && url.indexOf('?') !== -1) {
    url = url + '&time=' + Math.random()
  } else if (method === 'get' && url.indexOf('?') === -1) {
    url = url + '?time=' + Math.random()
  }
  // const cloneData = lodash.cloneDeep(data)
  const cloneData = data
  switch (method.toLowerCase()) {
    case 'get':
      return axios.get(url, {
        params: cloneData
      })
    case 'delete':
      return axios.delete(url, {
        data: cloneData
      })
    case 'post':
      if (Object.prototype.toString.call(cloneData) === '[object FormData]') {
        return axios.post(url, cloneData, {
          onUploadProgress: (progressEvent) => {
            callBack(progressEvent)
          }
        })
      } else {
        return axios.post(url, cloneData)
      }
    case 'put':
      return axios.put(url, cloneData)
    case 'patch':
      return axios.patch(url, cloneData)
    default:
      return axios(options)
  }
}

export default function request (options) {
  return fetch(options).then((response) => {
    return response
  }).catch((error) => {
    return { error }
  })
}
