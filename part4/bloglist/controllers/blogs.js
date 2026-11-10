const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

// The paths are relative to /api/blogs (set in app.js)
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  // If title or url are missing, save() throws a ValidationError
  // and the error handler middleware answers with 400
  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

module.exports = blogsRouter