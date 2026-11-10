const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

// Before EACH test there is only one user in the database: "root"
beforeEach(async () => {
  await User.deleteMany({})
  await helper.createUser('root')
})

describe('creating a user', () => {
  test('succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'carlos',
      name: 'Carlos Gombau',
      password: 'secreto123'
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    // The password (or its hash) is never sent back
    assert.strictEqual(response.body.passwordHash, undefined)
    assert.strictEqual(response.body.password, undefined)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map((user) => user.username)
    assert.ok(usernames.includes(newUser.username))
  })

  test('fails with status 400 if the username is already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const response = await api
      .post('/api/users')
      .send({ username: 'root', name: 'Another', password: 'secreto123' })
      .expect(400)

    assert.ok(response.body.error.includes('unique'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('fails with status 400 if the username is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const response = await api
      .post('/api/users')
      .send({ username: 'ab', name: 'Short', password: 'secreto123' })
      .expect(400)

    assert.ok(response.body.error.includes('at least 3 characters'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('fails with status 400 if the password is too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const response = await api
      .post('/api/users')
      .send({ username: 'validname', name: 'Short', password: 'ab' })
      .expect(400)

    assert.ok(response.body.error.includes('at least 3 characters'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('fails with status 400 if the username is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const response = await api
      .post('/api/users')
      .send({ name: 'No username', password: 'secreto123' })
      .expect(400)

    assert.ok(response.body.error.includes('must be given'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('fails with status 400 if the password is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const response = await api
      .post('/api/users')
      .send({ username: 'nopassword', name: 'No password' })
      .expect(400)

    assert.ok(response.body.error.includes('must be given'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

describe('logging in', () => {
  test('succeeds with the right credentials and returns a token', async () => {
    const response = await api
      .post('/api/login')
      .send({ username: 'root', password: 'sekret' })
      .expect(200)

    assert.ok(response.body.token)
    assert.strictEqual(response.body.username, 'root')
  })

  test('fails with status 401 if the password is wrong', async () => {
    const response = await api
      .post('/api/login')
      .send({ username: 'root', password: 'wrong' })
      .expect(401)

    assert.strictEqual(response.body.token, undefined)
  })
})

// Close the database connection when all the tests have finished
after(async () => {
  await mongoose.connection.close()
})