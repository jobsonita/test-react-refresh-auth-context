import React, { useCallback, useEffect, useState } from 'react'

import { AsyncOptions, useAsync } from 'react-async'
import { Link, useHistory } from 'react-router-dom'

import { ApiError, cancelToken, useApi } from '../context/api'

const Register: React.FC = () => {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const history = useHistory()

  const { api } = useApi()

  const request = useCallback(async (
    [name]: string[],
    props: any,
    options: AsyncOptions<{}>
  ) => {
    return api.post('users', { name }, {
      cancelToken: cancelToken(options.signal)
    })
  }, [api])

  const { data: success, error: failure, run: registerUser } = useAsync({
    deferFn: request
  })

  const handleSubmit = useCallback(e => {
    e.preventDefault()
    registerUser(name)
  }, [name, registerUser])

  useEffect(() => {
    if (success) {
      history.push('/')
    }
  }, [history, success])

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
