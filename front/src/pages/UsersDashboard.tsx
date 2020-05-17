import React, { useCallback, useEffect, useState } from 'react'

import { AsyncOptions, useAsync } from 'react-async'
import { Link, Redirect } from 'react-router-dom'

import api, { ApiError, cancelToken } from '../context/api'
import { useAuth } from '../context/auth'

interface User {
  id: string
  name: string
  role: string
}

const getUsersRequest = async (
  data: any[],
  props: any,
  options: AsyncOptions<{}>
) => {
  const response = await api.get<User[]>('users', {
    cancelToken: cancelToken(options.signal)
  })
  return response.data
}

const setUserRoleRequest = async (
  [name, role]: string[],
  props: any,
  options: AsyncOptions<{}>
) => {
  const response = await api.put<User>(`users/${name}`, { role }, {
    cancelToken: cancelToken(options.signal)
  })
  return response.data
}

function canAdminUsers(user: Omit<User, 'id' | 'name'>) {
  return user.role === 'admin'
}

const UsersDashboard: React.FC = () => {
  const [error, setError] = useState('')

  const { user, signOut } = useAuth()

  const {
    data: users,
    error: failureGetUsers,
    run: getUsers,
  } = useAsync({ deferFn: getUsersRequest, initialValue: [] })

  useEffect(() => {
    if (user && canAdminUsers(user)) {
      getUsers()
    }
  }, [getUsers, user])

  const handleReloadUsers = useCallback(e => {
    e.preventDefault()
    getUsers()
  }, [getUsers])

  const {
    data: successUpdatedUser,
    error: failureUpdateUser,
    run: setUserRole
  } = useAsync({ deferFn: setUserRoleRequest })

  const handleChangeUserRole = useCallback((name: string, role: string) => {
    setUserRole(name, role)
  }, [setUserRole])

  useEffect(() => {
    if (successUpdatedUser) {
      getUsers()
    }
  }, [successUpdatedUser, getUsers])

  useEffect(() => {
    if (failureGetUsers) {
      if (failureGetUsers.message === 'Network Error') {
        setError('Network Error')
      } else {
        const { response } = failureGetUsers as ApiError

        setError(response?.data.error || 'Request error')
      }
    }
  }, [failureGetUsers])

  useEffect(() => {
    if (failureUpdateUser) {
      if (failureUpdateUser.message === 'Network Error') {
        setError('Network Error')
      } else {
        const { response } = failureUpdateUser as ApiError

        setError(response?.data.error || 'Request error')
      }
    }
  }, [failureUpdateUser])

  if (!user.name) {
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
      {users?.filter(u => u.name !== user.name).map(user => (
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
      <button onClick={handleReloadUsers}>Sync Users</button>
      <br />
      <br />
      <br />
      <button onClick={signOut}>Exit</button>
    </>
  )
}

export default UsersDashboard
