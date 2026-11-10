const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

// 4.15 / 4.17: list all the users, with the blogs each one created
usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    url: 1,
    title: 1,
    author: 1
  })
  response.json(users)
})

// 4.15 / 4.16: create a new user
usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  // 4.16: both must be given...
  if (typeof username !== 'string' || typeof password !== 'string') {
    return response
      .status(400)
      .json({ error: 'username and password must be given' })
  }

  // ...and have at least 3 characters.
  // The password is checked HERE, not in the model: the model only sees the hash.
  if (username.length < 3 || password.length < 3) {
    return response.status(400).json({
      error: 'username and password must be at least 3 characters long'
    })
  }

  // 4.16: the username must be unique
  const existingUser = await User.findOne({ username })
  if (existingUser) {
    return response.status(400).json({ error: 'username must be unique' })
  }

  // The password is never saved: only its hash
  const passwordHash = await bcrypt.hash(password, 10)

  const user = new User({ username, name, passwordHash })
  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter