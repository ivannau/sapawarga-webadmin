import axios from 'axios'
import { Message } from 'element-ui'
import store from '@/store'
import router from '@/router'
import { getToken } from '@/utils/auth'
import { ResponseRequest } from '@/utils/constantVariable'
import i18n from '@/lang'

// create axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // api base_url
  withCredentials: false, // cookies
  timeout: 30000 // request timeout
})
const serviceV2 = axios.create({
  baseURL: process.env.VUE_APP_BASE_API_V2, // api base_url
  withCredentials: false, // cookies
  timeout: 30000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // Do something before request is sent
    if (store.getters.token) {
      // token-- ['X-Token']
      config.headers['Authorization'] = 'Bearer ' + getToken()
    }
    return config
  },
  error => {
    // Do something with request error
    Promise.reject(error)
  }
)

// response interceptor
const ResponseInterceptorOnSuccess = response => {
  const res = response.data

  return res
}
const ResponseInterceptorOnError = error => {
  if (error.code === ResponseRequest.TIMEOUT) {
    Message({
      message: i18n.t('errors.request-timeout'),
      type: 'error',
      duration: 5 * 1000
    })
  }

  if (error.message === ResponseRequest.NETWORKERROR) {
    Message({
      message: i18n.t('errors.request-timeout'),
      type: 'error',
      duration: 5 * 1000
    })
  }

  if (error.response && error.response.status === ResponseRequest.FORBIDDEN) {
    router.push('/403')
  }

  if (error.response && error.response.status === ResponseRequest.NOTFOUND) {
    router.push('/404')
  }

  if (error.response && error.response.status === ResponseRequest.SERVERERROR) {
    let message = i18n.t('errors.internal-server-error')
    if (error.response.data.data !== undefined) {
      message = error.response.data.data.message
    }
    Message({
      message: message,
      type: 'error',
      duration: 5 * 1000
    })
  }

  if (error.response && error.response.status !== ResponseRequest.UNPROCESSABLE) {
    Message({
      message: i18n.t('errors.internal-server-error'),
      type: 'error',
      duration: 5 * 1000
    })
  }

  return Promise.reject(error)
}

service.interceptors.response.use(
  ResponseInterceptorOnSuccess, ResponseInterceptorOnError
)
serviceV2.interceptors.response.use(
  ResponseInterceptorOnSuccess, ResponseInterceptorOnError
)

export const request = service
export const requestV2 = serviceV2
export default service
