import axios, { AxiosError } from 'axios'

import createAuthRefreshInterceptor from 'axios-auth-refresh'

export type ApiError = AxiosError<{
  error: string
}>

interface User {
  name: string
}

const loadAuthorization = () => {
  const user = localStorage.getItem('@RefreshTest:user')

  let name = ''

  if (user) {
    try {
      name = JSON.parse(user).name
    } catch (err) {
      // noop
    }
  }

  return name
}

const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: loadAuthorization()
  }
})

const refresh_session = async () => {
  if (api.defaults.headers.Authorization) {
    const response = await api.put<User>('/sessions')
    const user = response.data
    // TODO: update context somehow
    /* First attempt: brute force through localStorage - solves for F5 */
    localStorage.setItem('@RefreshTest:user', JSON.stringify(user))
    return user.name
  }
}

createAuthRefreshInterceptor(
  api,
  async failedRequest => {
    const name = await refresh_session()
    failedRequest.response.config.headers.Authorization = name
  }
)

export default api
