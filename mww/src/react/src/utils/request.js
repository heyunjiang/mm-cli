/* global window */
import axios from 'axios'
import qs from 'qs'
import jsonp from 'jsonp'
import lodash from 'lodash'
import pathToRegexp from 'path-to-regexp'
import { message } from 'antd'
import { YQL, CORS } from './config'

const fetch = (options) => {
  let {
    method = 'get',
    data,
    fetchType,
    url,
    callBack = ()=>{},
  } = options

  if(method == 'get' && url.indexOf('?')!=-1){
    url = url+'&time='+Math.random()
  }else if(method == 'get' && url.indexOf('?')==-1){
    url = url+'?time='+Math.random()
  }
  // const cloneData = lodash.cloneDeep(data)
  const cloneData = data
  // try {
  //   let domin = ''
  //   if (url.match(/[a-zA-z]+:\/\/[^/]*/)) {
  //     domin = url.match(/[a-zA-z]+:\/\/[^/]*/)[0]
  //     url = url.slice(domin.length)
  //   }
  //   const match = pathToRegexp.parse(url)
  //   url = pathToRegexp.compile(url)(data)
  //   for (let item of match) {
  //     if (item instanceof Object && item.name in cloneData) {
  //       delete cloneData[item.name]
  //     }
  //   }
  //   url = domin + url
  // } catch (e) {
  //   console.log(e.message)
  // }

  /*if (fetchType === 'JSONP') {
    return new Promise((resolve, reject) => {
      jsonp(url, {
        param: `${qs.stringify(data)}&callback`,
        name: `jsonp_${new Date().getTime()}`,
        timeout: 4000,
      }, (error, result) => {
        if (error) {
          reject(error)
        }
        resolve({ statusText: 'OK', status: 200, data: result })
      })
    })
  } else if (fetchType === 'YQL') {
    url = `http://query.yahooapis.com/v1/public/yql?q=select * from json where url='${options.url}?${encodeURIComponent(qs.stringify(options.data))}'&format=json`
    data = null
  }*/

  switch (method.toLowerCase()) {
    case 'get':
      return axios.get(url, {
        params: cloneData,
      })
    case 'delete':
      return axios.delete(url, {
        data: cloneData,
      })
    case 'post':
      if(Object.prototype.toString.call(cloneData) == '[object FormData]'){
        return axios.post(url, cloneData, {
          onUploadProgress: (progressEvent)=>{
            callBack(progressEvent)
          }
        })
      }else{
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
    const { statusText, status } = response
    let data = response.data
    if(typeof(data) == 'string' && data.indexOf('<!DOCTYPE html>')>-1){
      //其他项目不应该在这里写，应该把这个做成一个通用的模块
      window.location.href = window.location.origin+'/plmPortal/index.html'
    }
    return {
      success: true,
      message: statusText,
      statusCode: status,
      data,
    }
  }).catch((error) => {
    const { response } = error
    let msg
    let statusCode
    if (response && response instanceof Object) {
      const { data, statusText } = response
      statusCode = response.status
      msg = data.message || statusText
    } else {
      statusCode = 600
      msg = error.message || 'Network Error'
    }
    return { success: false, statusCode, message: msg }
  })
}
