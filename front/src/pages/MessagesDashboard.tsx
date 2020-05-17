import React, { useCallback, useEffect, useState } from 'react'

import { AsyncOptions, useAsync } from 'react-async'
import { Link, Redirect } from 'react-router-dom'

import { useAuth } from '../context/auth'
import api, { ApiError, cancelToken } from '../services/api'

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

const getMessagesRequest = async(
  data: any[],
  props: any,
  options: AsyncOptions<{}>
) => {
  const response = await api.get<Message[]>('messages', {
    cancelToken: cancelToken(options.signal)
  })
  return response.data
}

const MessagesDashboard: React.FC = () => {
  const [error, setError] = useState('')
  
  const { user, signOut } = useAuth()

  const {
    data: messages,
    error: failure,
    run: getMessages
  } = useAsync({ deferFn: getMessagesRequest, initialValue: [] })

  useEffect(() => {
    if (user && canListMessages(user)) {
      getMessages()
    }
  }, [getMessages, user])

  const handleReloadMessages = useCallback(e => {
    e.preventDefault()
    getMessages()
  }, [getMessages])

  useEffect(() => {
    if (failure) {
      if (failure.message === 'Network Error') {
        setError('Network Error')
      } else {
        const { response } = failure as ApiError

        setError(response?.data.error || 'Request error')
      }
    }
  }, [failure])

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
      {!!messages?.length && (
        <ul>
          {messages.map(message => (
            <li key={message.id}>{message.sender}: {message.content}</li>
          ))}
        </ul>
      )}
      <br />
      <button onClick={handleReloadMessages}>Sync Messages</button>
      <br />
      <br />
      <br />
      <button onClick={signOut}>Exit</button>
    </>
  )
}

export default MessagesDashboard
