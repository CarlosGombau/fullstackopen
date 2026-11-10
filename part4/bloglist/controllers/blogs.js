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

// 4.13: delete ONE blog (RESTful: DELETE /api/blogs/:id)
blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end() // 204 = done, nothing to send back
})

// 4.14: update ONE blog, mostly to change its likes (PUT /api/blogs/:id)
blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body

  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).end() // there is no blog with that id
  }

  // Only change the fields that were sent in the request
  if (title !== undefined) blog.title = title
  if (author !== undefined) blog.author = author
  if (url !== undefined) blog.url = url
  if (likes !== undefined) blog.likes = likes

  const updatedBlog = await blog.save() // save() also runs the validation
  response.json(updatedBlog)
})

module.exports = blogsRouter