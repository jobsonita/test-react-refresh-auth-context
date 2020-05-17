import React, { FormEvent, useCallback, useState } from 'react'

import { useHistory, Link } from 'react-router-dom'

import api, { ApiError } from '../services/api'

const Register: React.FC = () => {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const history = useHistory()

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault()
      setError('')

      try {
        await api.post('users', { name })

        history.push('/')
      } catch (err) {
        if (err.message === 'Network Error') {
          setError('Network Error')
        } else {
          const { response } = err as ApiError

          setError(response?.data.error || 'Registration error')
        }
      }
    },
    [history, name]
  )

  return (
    <>
      <h1>Register</h1>
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
        <button type="submit">Register</button>
      </form>
      <br />
      <Link to="/">Login</Link>
    </>
  )
}

export default Register
