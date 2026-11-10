// 4.3: it always returns 1 (it only checks that the tests work)
const dummy = () => {
  return 1
}

// 4.4: the sum of the likes of all the blogs
const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

// 4.5: the blog with the most likes (null if the list is empty)
const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  return blogs.reduce((best, blog) => (blog.likes > best.likes ? blog : best))
}

// 4.6: the author with the most blogs, and how many blogs they have
const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  // counts = { 'Robert C. Martin': 3, 'Edsger W. Dijkstra': 2, ... }
  const counts = {}
  blogs.forEach((blog) => {
    counts[blog.author] = (counts[blog.author] || 0) + 1
  })

  // Look for the author with the highest count
  const [author, count] = Object.entries(counts).reduce((top, entry) =>
    entry[1] > top[1] ? entry : top
  )

  return { author, blogs: count }
}

// 4.7: the author whose blogs have the most likes in total, and that total
const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  // likesByAuthor = { 'Edsger W. Dijkstra': 17, ... }
  const likesByAuthor = {}
  blogs.forEach((blog) => {
    likesByAuthor[blog.author] = (likesByAuthor[blog.author] || 0) + blog.likes
  })

  const [author, likes] = Object.entries(likesByAuthor).reduce((top, entry) =>
    entry[1] > top[1] ? entry : top
  )

  return { author, likes }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}