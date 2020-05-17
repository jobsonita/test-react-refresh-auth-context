import React, { createContext, useCallback, useContext, useState, useEffect } from 'react'

import axios, { AxiosError } from 'axios'
import createAuthRefreshInterceptor from 'axios-auth-refresh'

export type ApiError = AxiosError<{ error: string }>

interface User {
  name: string
}

const parseToken = (token: string | null | undefined): User | null => {
  if (token) {
    try {
      return JSON.parse(token)
    } catch (err) {
      // noop
    }
  }
  return null
}

const loadAuthorization = () => {
  const token = localStorage.getItem('@RefreshTest:token')
  const user = parseToken(token)
  return user?.name || ''
}

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: loadAuthorization()
  }
})

interface ApiContextData {
  token: string
  signIn(name: string, cancel: AbortSignal): Promise<boolean>
  signOut(): void
}

const ApiContext = createContext<ApiContextData>({} as ApiContextData)

export const ApiProvider: React.FC = ({ children }) => {
  const [token, setToken] = useState(
    () => localStorage.getItem('@RefreshTest:token') || ''
  )

  const refreshSession = useCallback(async () => {
    if (api.defaults.headers.Authorization) {
      const response = await api.put<User>('sessions')
      // TODO: update context somehow
      /* Third attempt: api context - doesn't work well, unfortunately */
      const token = JSON.stringify(response.data)
      setToken(token)
      return token
    }
  }, [])

  useEffect(() => {
    createAuthRefreshInterceptor(
      api,
      async failedRequest => {
        const token = await refreshSession()

        const user = parseToken(token)
        failedRequest.response.config.headers.Authorization = user?.name || ''
      }
    )
  }, [refreshSession])

  useEffect(() => {
    const user = parseToken(token)
    api.defaults.headers.Authorization = user?.name || ''
  }, [token])

  const signIn = useCallback(async (name: string, cancel: AbortSignal) => {
    const response = await api.post('sessions', { name }, {
      cancelToken: cancelToken(cancel)
    })

    const token = JSON.stringify(response.data)

    localStorage.setItem('@RefreshTest:token', token)
    setToken(token)

    return true
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem('@RefreshTest:token')
    setToken('')
  }, [])

  return (
    <ApiContext.Provider value={{ token, signIn, signOut }}>
      {children}
    </ApiContext.Provider>
  )
}

export const useApi = (): ApiContextData => {
  const context = useContext(ApiContext)

  if (!context) {
    throw new Error('useApi must be used within an ApiProvider')
  }

  return context
}

export const cancelToken = (cancel: AbortSignal) => {
  return new axios.CancelToken(interrupt => {
    cancel.addEventListener('abort', (e) => { interrupt(JSON.stringify(e)) })
  })
}

export default api
