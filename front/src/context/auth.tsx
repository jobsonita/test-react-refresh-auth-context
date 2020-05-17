import React, { createContext, useCallback, useContext, useState, useEffect } from 'react'

import api from '../services/api'

interface User {
  name: string,
  role: string
}

interface AuthState {
  user: User
}

interface AuthContextData {
  user: User
  signIn(name: string): Promise<void>
  signOut(): void
}

interface AuthRefreshEventDetail {
  user: User
}

type AuthRefreshEvent = CustomEvent<AuthRefreshEventDetail>

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>(() => {
    const user = localStorage.getItem('@RefreshTest:user')

    if (user) {
      return { user: JSON.parse(user) }
    }

    return {} as AuthState
  })

  useEffect(() => {
    const authRefreshHandler = ((event: AuthRefreshEvent) => {
      const { user } = event.detail

      localStorage.setItem('@RefreshTest:user', JSON.stringify(user))
  
      setData({ user })
    }) as EventListener

    const element = document.querySelector('#root')

    element?.addEventListener('authRefresh', authRefreshHandler)

    return () => {
      element?.removeEventListener('authRefresh', authRefreshHandler)
    }
  }, [])

  const signIn = useCallback(async (name: string) => {
    const response = await api.post('sessions', { name })

    const user = response.data as User

    localStorage.setItem('@RefreshTest:user', JSON.stringify(user))

    api.defaults.headers.Authorization = user.name

    setData({ user })
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem('@RefreshTest:user')

    api.defaults.headers.Authorization = ''

    setData({} as AuthState)
  }, [])

  return (
    <AuthContext.Provider value={{ user: data.user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
