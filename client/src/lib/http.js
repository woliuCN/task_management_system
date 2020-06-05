import 'axios'

// 响应拦截器，在响应之前对数据进行拦截并执行操作。
axios.interceptors.response.use(
  data => {
    return data
  },
  err => {
    const errCodeMsg = {
      500: '服务器错误，请联系网络管理员寻求帮助',
      404: '未找到资源',
      400: '请求错误',
      401: '认证失效，请重新登录'
    }

    const shouldReLoginCode = [1001, 1002, 1004]

    // 将 错误信息 更改成对应的提示信息，并且 401 返回登录
    if (err.message === 'Network Error') {
      err.message = '网络错误'
      return Promise.reject(err)
    }
    const {
      status,
      data: { code }
    } = err.response
    if (errCodeMsg[status]) {
      if (status === 401 && !shouldReLoginCode.includes(code)) {
        err.message = err.response.data.message
      } else {
        if (shouldReLoginCode.includes(code)) {
          router.push('/login')
        }
        err.message = errCodeMsg[status]
      }
    }
    return Promise.reject(err)
  }
)

// 初始化实例
const Axios = axios.create()

const http = {}

http.get = (url, params) => {
  return Axios({
    method: 'get',
    url: url,
    data: params
  })
}

http.post = (url, params) => {
  return Axios({
    method: 'post',
    url: url,
    data: params,
    header: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  })
}

http.delete = (url, params) => {
  return Axios({
    method: 'delete',
    url: url,
    data: params,
    header: {
      'Content-Type': 'application/json;charset=utf-8'
    }
  })
}

export default http
