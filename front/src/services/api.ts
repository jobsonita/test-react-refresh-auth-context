import axios, { AxiosError } from 'axios'

export type ApiError = AxiosError<{
  error: string
}>

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

export default api
