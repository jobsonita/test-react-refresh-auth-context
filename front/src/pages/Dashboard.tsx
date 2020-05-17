import React, { FormEvent, useCallback, useEffect, useState } from 'react'

import { Link, Redirect } from 'react-router-dom'

import { useAuth } from '../context/auth'
import api, { ApiError } from '../services/api'

interface User {
  role: string
}

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function canListMessages(user: User) {
  return user.role === 'admin' || user.role === 'superuser'
}

function canAdminUsers(user: User) {
  return user.role === 'admin'
}

const Dashboard: React.FC = () => {
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const { user, signOut } = useAuth()

  useEffect(() => {
    if (user) {
      api.get<{ message: string }>('welcome').then(response => {
        setWelcomeMessage(response.data.message)
      }).catch(err => {
        if (err.message === 'Network Error') {
          setError('Network Error')
        } else {
          const { response } = err as ApiError

          setError(response?.data.error || 'Login error')
        }
      })
    }
  }, [user])

  const handleAddMessage = useCallback(
    async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault()
      setError('')

      try {
        await api.post('messages', { message })
      } catch (err) {
        if (err.message === 'Network Error') {
          setError('Network Error')
        } else {
          const { response } = err as ApiError

          setError(response?.data.error || 'Request error')
        }
      }
    },
    [message]
  )

  if (!user) {
    return <Redirect to="/" />
  }

  return (
    <>
      <h1>{capitalize(user.role)} Dashboard</h1>
      <h2>{welcomeMessage}</h2>
      {error && (
        <>
          <span>{error}</span>
          <br />
        </>
      )}
      {canListMessages(user) && (
        <>
          <Link to='/messages'>Messages Dashboard &gt;</Link>
          <br />
          <br />
        </>
      )}
      {canAdminUsers(user) && (
        <>
          <Link to='/admin'>Users Dashboard &gt;</Link>
          <br />
          <br />
          <br />
        </>
      )}
      <form onSubmit={handleAddMessage}>
        <input
          name="message"
          placeholder="Leave a message"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <br />
        <br />
        <button type="submit">Send message</button>
      </form>
      <br />
      <br />
      <button onClick={signOut}>Exit</button>
    </>
  )
}

export default Dashboard
