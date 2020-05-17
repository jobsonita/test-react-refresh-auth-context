import React, { createContext, useContext, useMemo } from 'react'

import { useApi } from './api'

interface User {
  name: string,
  role: string
}

interface AuthContextData {
  user: User
  signIn(name: string, cancel: AbortSignal): Promise<boolean>
  signOut(): void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export const AuthProvider: React.FC = ({ children }) => {
  const { token, signIn, signOut } = useApi()

  const user = useMemo<User>(() => {
    if (token) {
      try {
        return JSON.parse(token)
      } catch(err) {
        // noop
      }
    }
    return {}
  }, [token])

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
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
