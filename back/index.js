const express = require('express')
const cors = require('cors')

const { uuid } = require('uuidv4')

const app = express()

app.use(cors())

app.use(express.json())

const users = []
const messages = []

app.post('/users', (req, res) => {
  const { name } = req.body

  if (users.find(user => user.name === name)) {
    return res.status(400).json({ error: 'User already exists' })
  }

  const user = {
    id: uuid(),
    name,
    role: 'user',
    must_refresh: false
  }

  if (name === 'admin') {
    user.role = 'admin'
  }

  users.push(user)

  return res.status(201).json()
})

app.post('/sessions', (req, res) => {
  const { name } = req.body

  const user = users.find(user => user.name === name)

  if (!user) {
    return res.status(400).json({ error: 'Unknown user' })
  }

  user.must_refresh = false

  res.status(200).json(user)
})

app.put('/sessions', (req, res) => {
  const name = req.headers.authorization

  const user = users.find(user => user.name === name)

  if (!user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  user.must_refresh = false

  return res.json(user)
})

const authentication = (req, res, next) => {
  const name = req.headers.authorization

  const user = users.find(user => user.name === name)

  if (!user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  if (user.must_refresh) {
    return res.status(401).json({ error: 'Token expired' })
  }

  req.user = user

  next()
}

app.use(authentication)

app.get('/users', (req, res) => {
  const { user } = req

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Insufficient access rights' })
  }

  return res.json(users)
})

app.put('/users/:name', (req, res) => {
  const { user: admin } = req
  const { name } = req.params
  const { role } = req.body

  if (admin.role !== 'admin') {
    return res.status(403).json({ error: 'Insufficient access rights' })
  }

  const user = users.find(user => user.name === name)

  user.role = role
  user.must_refresh = true

  return res.json(user)
})

app.get('/welcome', (req, res) => {
  const { user } = req
  
  return res.json({ message: `Hello, ${user.name}` })
})

app.get('/messages', (req, res) => {
  const { user } = req
  
  if (user.role !== 'admin' && user.role !== 'superuser') {
    return res.status(403).json({ error: 'Insufficient access rights' })
  }

  return res.json(messages)
})

app.post('/messages', (req, res) => {
  const { user } = req
  const { message: content } = req.body
  
  const message = {
    id: uuid(),
    sender: user.name,
    content,
  }

  messages.push(message)

  return res.status(201).json(message)
})

app.listen(3333)
