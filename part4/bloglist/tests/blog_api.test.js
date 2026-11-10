const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

let user // the user who owns the initial blogs
let token // a valid token of that user
let otherToken // a valid token of ANOTHER user

// Before EACH test: empty the database, create two users and the initial blogs
beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  user = await helper.createUser('root')
  const otherUser = await helper.createUser('other')

  token = helper.tokenFor(user)
  otherToken = helper.tokenFor(otherUser)

  // The initial blogs belong to "root"
  const blogs = helper.initialBlogs.map((blog) => ({ ...blog, user: user._id }))
  const savedBlogs = await Blog.insertMany(blogs)

  user.blogs = savedBlogs.map((blog) => blog._id)
  await user.save()
})

describe('when there are some blogs saved', () => {
  test('blogs are returned as json (no token needed)', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all the blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('the unique identifier of the blogs is named id', async () => {
    const response = await api.get('/api/blogs')

    response.body.forEach((blog) => {
      assert.ok(blog.id)
      assert.strictEqual(blog._id, undefined)
    })
  })
})

describe('adding a new blog', () => {
  const newBlog = {
    title: 'Async/await simplifies making async calls',
    author: 'Test Author',
    url: 'https://example.com/async-await',
    likes: 3
  }

  test('a valid blog can be added with a valid token', async () => {
    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map((blog) => blog.title)
    assert.ok(titles.includes(newBlog.title))
  })

  test('the user of the token is saved as the creator', async () => {
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)

    assert.strictEqual(response.body.user, user._id.toString())

    // The blog also appears in the list of blogs of the user
    const userAtEnd = await User.findById(user._id)
    const blogIds = userAtEnd.blogs.map((id) => id.toString())
    assert.ok(blogIds.includes(response.body.id))
  })

  // 4.23
  test('fails with status 401 if the token is not provided', async () => {
    await api.post('/api/blogs').send(newBlog).expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('fails with status 401 if the token is invalid', async () => {
    await api
      .post('/api/blogs')
      .set('Authorization', 'Bearer thisIsNotAValidToken')
      .send(newBlog)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('if likes is missing, it defaults to 0', async () => {
    const blogWithoutLikes = {
      title: 'A blog without likes',
      author: 'Test Author',
      url: 'https://example.com/no-likes'
    }

    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blogWithoutLikes)
      .expect(201)

    assert.strictEqual(response.body.likes, 0)
  })

  test('a blog without title is not added', async () => {
    const blogWithoutTitle = {
      author: 'Test Author',
      url: 'https://example.com/no-title',
      likes: 1
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blogWithoutTitle)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('a blog without url is not added', async () => {
    const blogWithoutUrl = {
      title: 'A blog without url',
      author: 'Test Author',
      likes: 1
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blogWithoutUrl)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe('deleting a blog', () => {
  test('succeeds with status 204 if the user is the creator', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map((blog) => blog.title)
    assert.ok(!titles.includes(blogToDelete.title))
  })

  test('fails with status 401 if there is no token', async () => {
    const blogsAtStart = await helper.blogsInDb()

    await api.delete(`/api/blogs/${blogsAtStart[0].id}`).expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('fails with status 403 if the user is not the creator', async () => {
    const blogsAtStart = await helper.blogsInDb()

    await api
      .delete(`/api/blogs/${blogsAtStart[0].id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(403)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('also answers 204 if the blog does not exist anymore', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .delete(`/api/blogs/${validNonexistingId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('fails with status 400 if the id is malformatted', async () => {
    await api
      .delete('/api/blogs/123')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})

describe('updating a blog', () => {
  test('the likes of a blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: blogToUpdate.likes + 10 })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 10)
    assert.strictEqual(response.body.title, blogToUpdate.title)

    const blogsAtEnd = await helper.blogsInDb()
    const updatedBlog = blogsAtEnd.find((blog) => blog.id === blogToUpdate.id)
    assert.strictEqual(updatedBlog.likes, blogToUpdate.likes + 10)
  })

  test('fails with status 404 if the blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .put(`/api/blogs/${validNonexistingId}`)
      .send({ likes: 99 })
      .expect(404)
  })

  test('fails with status 400 if the id is malformatted', async () => {
    await api.put('/api/blogs/123').send({ likes: 99 }).expect(400)
  })
})

// Close the database connection when all the tests have finished
after(async () => {
  await mongoose.connection.close()
})