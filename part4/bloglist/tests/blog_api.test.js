const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

// Before EACH test: empty the test database and save the initial blogs
beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('when there are some blogs saved', () => {
  // 4.8
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  // 4.8
  test('all the blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  // 4.9
  test('the unique identifier of the blogs is named id', async () => {
    const response = await api.get('/api/blogs')

    response.body.forEach((blog) => {
      assert.ok(blog.id)
      assert.strictEqual(blog._id, undefined)
    })
  })
})

describe('adding a new blog', () => {
  // 4.10
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Async/await simplifies making async calls',
      author: 'Test Author',
      url: 'https://example.com/async-await',
      likes: 3
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map((blog) => blog.title)
    assert.ok(titles.includes(newBlog.title))
  })

  // 4.11
  test('if likes is missing, it defaults to 0', async () => {
    const newBlog = {
      title: 'A blog without likes',
      author: 'Test Author',
      url: 'https://example.com/no-likes'
    }

    const response = await api.post('/api/blogs').send(newBlog).expect(201)

    assert.strictEqual(response.body.likes, 0)
  })

  // 4.12
  test('a blog without title is not added', async () => {
    const newBlog = {
      author: 'Test Author',
      url: 'https://example.com/no-title',
      likes: 1
    }

    await api.post('/api/blogs').send(newBlog).expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  // 4.12
  test('a blog without url is not added', async () => {
    const newBlog = {
      title: 'A blog without url',
      author: 'Test Author',
      likes: 1
    }

    await api.post('/api/blogs').send(newBlog).expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })
})

describe('deleting a blog', () => {
  // 4.13
  test('succeeds with status 204 if the id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

    const titles = blogsAtEnd.map((blog) => blog.title)
    assert.ok(!titles.includes(blogToDelete.title))
  })

  // 4.13
  test('also answers 204 if the blog does not exist anymore', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api.delete(`/api/blogs/${validNonexistingId}`).expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  // 4.13
  test('fails with status 400 if the id is malformatted', async () => {
    await api.delete('/api/blogs/123').expect(400)
  })
})

describe('updating a blog', () => {
  // 4.14
  test('the likes of a blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: blogToUpdate.likes + 10 })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    // The answer has the new value and the rest of the blog is intact
    assert.strictEqual(response.body.likes, blogToUpdate.likes + 10)
    assert.strictEqual(response.body.title, blogToUpdate.title)

    // The change was really saved in the database
    const blogsAtEnd = await helper.blogsInDb()
    const updatedBlog = blogsAtEnd.find((blog) => blog.id === blogToUpdate.id)
    assert.strictEqual(updatedBlog.likes, blogToUpdate.likes + 10)
  })

  // 4.14
  test('fails with status 404 if the blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .put(`/api/blogs/${validNonexistingId}`)
      .send({ likes: 99 })
      .expect(404)
  })

  // 4.14
  test('fails with status 400 if the id is malformatted', async () => {
    await api.put('/api/blogs/123').send({ likes: 99 }).expect(400)
  })
})

// Close the database connection when all the tests have finished
after(async () => {
  await mongoose.connection.close()
})