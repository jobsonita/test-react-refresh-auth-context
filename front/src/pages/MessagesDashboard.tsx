import React, { SyntheticEvent, useCallback, useEffect, useState } from 'react'

import { Link, Redirect } from 'react-router-dom'

import { useAuth } from '../context/auth'
import api, { ApiError } from '../services/api'

interface User {
  role: string
}

interface Message {
  id: string
  sender: string
  content: string
}

function canListMessages(user: User) {
  return user.role === 'admin' || user.role === 'superuser'
}

const MessagesDashboard: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState('')
  
  const { user, signOut } = useAuth()

  useEffect(() => {
    if (user) {
      if (canListMessages(user)) {
        api.get<Message[]>('messages').then(response => {
          setMessages(response.data)
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

  const handleReloadMessages = useCallback(
    async (e: SyntheticEvent<HTMLButtonElement>): Promise<void> => {
      e.preventDefault()

      try {
        const response = await api.get<Message[]>('messages')

        setMessages(response.data)
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

  if (!user) {
    return <Redirect to="/" />
  }

  if (!canListMessages(user)) {
    return <Redirect to="/dashboard" />
  }

  return (
    <>
      <h1>Messages Dashboard</h1>
      {error && (
        <>
          <span>{error}</span>
          <br />
        </>
      )}
      <Link to='/dashboard'>&lt; Dashboard</Link>
      <br />
      {messages.length > 0 && (
        <ul>
          {messages.map(message => (
            <li key={message.id}>{message.sender}: {message.content}</li>
          ))}
        </ul>
      )}
      <br />
      <button onClick={handleReloadMessages}>Fetch Messages</button>
      <br />
      <br />
      <br />
      <button onClick={signOut}>Exit</button>
    </>
  )
}

export default MessagesDashboard
