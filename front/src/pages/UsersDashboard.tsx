import React, { SyntheticEvent, useCallback, useEffect, useState } from 'react'

import { Link, Redirect } from 'react-router-dom'

import { useAuth } from '../context/auth'
import api, { ApiError } from '../services/api'

interface User {
  id: string
  name: string
  role: string
}

function canAdminUsers(user: Omit<User, 'id' | 'name'>) {
  return user.role === 'admin'
}

const UsersDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [error, setError] = useState('')
  
  const { user, signOut } = useAuth()

  useEffect(() => {
    if (user) {
      if (canAdminUsers(user)) {
        api.get<User[]>('users').then(response => {
          setUsers(response.data.filter(u => u.name !== user.name))
        }).catch(err => {
          if (err.message === 'Network Error') {
            setError('Network Error')
          } else {
            const { response } = err as ApiError
  
            setError(response?.data.error || 'Request error')
          }
        })
      }
    }
  }, [user])

  const handleChangeUserRole = useCallback(
    async (name: string, role: string): Promise<void> => {
      try {
        const response = await api.put<User>(`users/${name}`, { role })
        const user = response.data

        setUsers(users => users.map(u => u.id === user.id ? user : u))
      } catch (err) {
        if (err.message === 'Network Error') {
          setError('Network Error')
        } else {
          const { response } = err as ApiError

          setError(response?.data.error || 'Request error')
        }
      }
    },
    []
  )

  const handleReloadUsers = useCallback(
    async (e: SyntheticEvent<HTMLButtonElement>): Promise<void> => {
      e.preventDefault()

      try {
        const response = await api.get<User[]>('users')

        setUsers(response.data.filter(u => u.name !== user.name))
      } catch (err) {
        if (err.message === 'Network Error') {
          setError('Network Error')
        } else {
          const { response } = err as ApiError

          setError(response?.data.error || 'Request error')
        }
      }
    },
    [user]
  )

  if (!user) {
    return <Redirect to="/" />
  }

  if (!canAdminUsers(user)) {
    return <Redirect to="/dashboard" />
  }

  return (
    <>
      <h1>Users Dashboard</h1>
      {error && (
        <>
          <span>{error}</span>
          <br />
        </>
      )}
      <Link to='/dashboard'>&lt; Dashboard</Link>
      <br />
      {users.map(user => (
        <div  key={user.id}>
          <p>{user.name}: {user.role}</p>
          <select
            defaultValue={user.role}
            onChange={e => handleChangeUserRole(user.name, e.target.value)}
          >
            <option value="superuser">superuser</option>
            <option value="user">user</option>
          </select>
        </div>
      ))}
      <br />
      <button onClick={handleReloadUsers}>Fetch Users</button>
      <br />
      <br />
      <br />
      <button onClick={signOut}>Exit</button>
    </>
  )
}

export default UsersDashboard
