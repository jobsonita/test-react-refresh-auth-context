import React from 'react'

import { ApiProvider } from './api'
import { AuthProvider } from './auth'

export const AppProvider: React.FC = ({ children }) => {
  return (
    <ApiProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ApiProvider>
  )
}
