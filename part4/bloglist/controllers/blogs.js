const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

// Listing the blogs does NOT need a token. Show the creator of each blog
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

// Only with a valid token. The user of the token is the creator
blogsRouter.post('/', userExtractor, async (request, response) => {
  const { title, author, url, likes } = request.body
  const user = request.user

  const blog = new Blog({ title, author, url, likes, user: user._id })

  // If title or url are missing, save() throws a ValidationError (400)
  const savedBlog = await blog.save()

  // Add the blog to the list of blogs of the user
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  // 5.9: send the data of the creator (username and name), not only its id
  await savedBlog.populate('user', { username: 1, name: 1 })

  response.status(201).json(savedBlog)
})

// Only the creator of the blog can delete it
blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  const user = request.user
  const blog = await Blog.findById(request.params.id)

  // The blog does not exist (anymore): the result is the same, 204
  if (!blog) {
    return response.status(204).end()
  }

  // blog.user is an object, so we convert both ids to strings to compare them
  if (!blog.user || blog.user.toString() !== user._id.toString()) {
    return response
      .status(403)
      .json({ error: 'only the creator can delete a blog' })
  }

  await blog.deleteOne()

  user.blogs = user.blogs.filter((id) => id.toString() !== blog._id.toString())
  await user.save()

  response.status(204).end()
})

// Update a blog (mostly its likes).
// The "user" field of the request is ignored: the creator of a blog never changes
blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body

  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).end()
  }

  if (title !== undefined) blog.title = title
  if (author !== undefined) blog.author = author
  if (url !== undefined) blog.url = url
  if (likes !== undefined) blog.likes = likes

  const updatedBlog = await blog.save()

  // 5.9: send the data of the creator, not only its id
  await updatedBlog.populate('user', { username: 1, name: 1 })

  response.json(updatedBlog)
})

module.exports = blogsRouter