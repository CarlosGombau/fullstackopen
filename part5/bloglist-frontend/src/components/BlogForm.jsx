import { useState } from 'react'

// The form to create a blog. It keeps its own state;
// when it is submitted, it gives the data to App with createBlog
const BlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    const created = await createBlog({ title, author, url })

    // Clear the fields only if the blog was really created
    if (created !== false) {
      setTitle('')
      setAuthor('')
      setUrl('')
    }
  }

  return (
    <div>
      <h2>create new</h2>

      <form onSubmit={handleSubmit}>
        <div>
          title{' '}
          <input
            type="text"
            value={title}
            placeholder="title"
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div>
          author{' '}
          <input
            type="text"
            value={author}
            placeholder="author"
            onChange={(event) => setAuthor(event.target.value)}
          />
        </div>
        <div>
          url{' '}
          <input
            type="text"
            value={url}
            placeholder="url"
            onChange={(event) => setUrl(event.target.value)}
          />
        </div>
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default BlogForm