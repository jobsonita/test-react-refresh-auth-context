import React, { useCallback, useEffect, useState } from 'react'

import { AsyncOptions, useAsync } from 'react-async'
import { Link, useHistory } from 'react-router-dom'

import { ApiError } from '../context/api'
import { useAuth } from '../context/auth'

const Home: React.FC = () => {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const { signIn } = useAuth()

  const history = useHistory()

  const request = useCallback(
    async ([name]: string[], props: any, options: AsyncOptions<{}>) => {
      return signIn(name, options.signal)
    },
    [signIn]
  )

  const { data: success, error: failure, run: attemptLogin } = useAsync({
    deferFn: request
  })

  const handleSubmit = useCallback(e => {
    e.preventDefault()
    attemptLogin(name)
  }, [attemptLogin, name])

  useEffect(() => {
    if (success) {
      history.push('/dashboard')
    }
  }, [history, success])

  useEffect(() => {
    if (failure) {
      if (failure.message === 'Network Error') {
        setError('Network Error')
      } else {
        const { response } = failure as ApiError

        setError(response?.data.error || 'Login error')
      }
    }
  }, [failure])

  return (
    <>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <br />
        {error && (
          <>
            <span>{error}</span>
            <br />
          </>
        )}
        <br />
        <button type="submit">Login</button>
      </form>
      <br />
      <Link to="/register">Register</Link>
    </>
  )
}

export default Home
