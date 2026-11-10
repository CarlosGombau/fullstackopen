const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10
  },
  {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0
  },
  {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2
  }
]

// All the blogs that are in the database right now
const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

// All the users that are in the database right now
const usersInDb = async () => {
  const users = await User.find({})
  return users.map((user) => user.toJSON())
}

// An id that has a valid format but does not belong to any blog
const nonExistingId = async () => {
  const blog = new Blog({
    title: 'will remove soon',
    url: 'https://example.com/remove'
  })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

// Creates a user in the test database (a cheap hash is enough for the tests)
const createUser = async (username, password = 'sekret') => {
  const passwordHash = await bcrypt.hash(password, 4)
  const user = new User({ username, name: `${username} name`, passwordHash })
  return user.save()
}

// A valid token for a user
const tokenFor = (user) => {
  return jwt.sign({ username: user.username, id: user._id }, config.SECRET)
}

module.exports = {
  initialBlogs,
  blogsInDb,
  usersInDb,
  nonExistingId,
  createUser,
  tokenFor
}