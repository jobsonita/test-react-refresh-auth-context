import React, { useCallback, useEffect, useState } from 'react'

import { Async, AsyncOptions, useAsync } from 'react-async'
import { Link, Redirect } from 'react-router-dom'

import api, { ApiError, cancelToken } from '../context/api'
import { useAuth } from '../context/auth'

interface User {
  role: string
}

interface WelcomeMessage {
  message: string
}

function capitalize(word: string | null | undefined) {
  if (word) {
    return word.charAt(0).toUpperCase() + word.slice(1)
  } else {
    return ''
  }
}

function canListMessages(user: User) {
  return user.role === 'admin' || user.role === 'superuser'
}

function canAdminUsers(user: User) {
  return user.role === 'admin'
}

const getWelcomeMessageRequest = async (
  data: any,
  options: AsyncOptions<{}>
) => {
  const response = await api.get<WelcomeMessage>('welcome', {
    cancelToken: cancelToken(options.signal)
  })
  return response.data.message
}

const addMessageRequest = async (
  [message]: string[],
  props: any,
  options: AsyncOptions<{}>
) => {
  return api.post('messages', { message }, {
    cancelToken: cancelToken(options.signal)
  })
}

const Dashboard: React.FC = () => {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const { user, signOut } = useAuth()

  const { data: success, error: failure, run: addMessage } = useAsync({
    deferFn: addMessageRequest
  })

  const handleAddMessage = useCallback(e => {
    e.preventDefault()
    addMessage(message)
  }, [addMessage, message])

  useEffect(() => {
    if (failure) {
      if (failure.message === 'Network Error') {
        setError('Network Error')
      } else {
        const { response } = failure as ApiError

        setError(response?.data.error || 'Registration error')
      }
    }
  }, [failure])

  if (!user.name) {
    return <Redirect to="/" />
  }

  return (
    <>
      <h1>{capitalize(user.role)} Dashboard</h1>
      <Async promiseFn={getWelcomeMessageRequest}>
        <Async.Fulfilled>
          {(welcomeMessage: string) => <h2>{welcomeMessage}</h2>}
        </Async.Fulfilled>
        <Async.Rejected>
          {(error: string) => <span>Request failed</span>}
        </Async.Rejected>
      </Async>
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
        <br />
        {success && (
          <>
            <span>Message sent</span>
            <br />
          </>
        )}
        {error && (
          <>
            <span>{error}</span>
            <br />
          </>
        )}
      </form>
      <br />
      <br />
      <button onClick={signOut}>Exit</button>
    </>
  )
}

export default Dashboard
