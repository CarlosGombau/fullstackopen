// The form to create a new blog: the values and handlers come from App
const BlogForm = ({
  addBlog,
  title,
  handleTitleChange,
  author,
  handleAuthorChange,
  url,
  handleUrlChange
}) => {
  return (
    <form onSubmit={addBlog}>
      <div>
        title{' '}
        <input type="text" value={title} onChange={handleTitleChange} />
      </div>
      <div>
        author{' '}
        <input type="text" value={author} onChange={handleAuthorChange} />
      </div>
      <div>
        url <input type="text" value={url} onChange={handleUrlChange} />
      </div>
      <button type="submit">create</button>
    </form>
  )
}

export default BlogForm