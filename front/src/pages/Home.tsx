import React, { FormEvent, useCallback, useState } from 'react'

import { useHistory, Link } from 'react-router-dom'

import { useAuth } from '../context/auth'
import { ApiError } from '../services/api'

const Home: React.FC = () => {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const { signIn } = useAuth()

  const history = useHistory()

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault()
      setError('')

      try {
        await signIn(name)

        history.push('/dashboard')
      } catch(err) {
        if (err.message === 'Network Error') {
          setError('Network Error')
        } else {
          const { response } = err as ApiError

          setError(response?.data.error || 'Login error')
        }
      }
    },
    [history, name, signIn]
  )

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
