// Shows ONE blog: its title and author
const Blog = ({ blog }) => {
  return (
    <div>
      {blog.title} {blog.author}
    </div>
  )
}

export default Blog