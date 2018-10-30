import { request, config } from '../utils'
import { host } from '../utils/config'

export async function query (params) {
  return request({
    url: host + 'user/userInfo',
    method: 'get',
  })
}

