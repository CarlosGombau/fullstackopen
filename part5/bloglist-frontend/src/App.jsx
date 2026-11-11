import { useState, useEffect, useRef } from 'react'

import Blog from './components/Blog'
import BlogForm from './components/BlogForm'
import LoginForm from './components/LoginForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])

  // The user starts as the one saved in the local storage (or null)
  const [user, setUser] = useState(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    return loggedUserJSON ? JSON.parse(loggedUserJSON) : null
  })

  // The fields of the login form
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // null = no message, otherwise { text: '...', type: 'success' or 'error' }
  const [notification, setNotification] = useState(null)

  // A reference to the Togglable that contains the form to create blogs
  const blogFormRef = useRef()

  // Fetch the blogs once, when the app starts
  useEffect(() => {
    const fetchBlogs = async () => {
      const initialBlogs = await blogService.getAll()
      setBlogs(initialBlogs)
    }

    fetchBlogs()
  }, [])

  // Keep the token of the blog service in sync with the logged-in user
  useEffect(() => {
    blogService.setToken(user ? user.token : null)
  }, [user])

  // Shows a message for 5 seconds
  const showNotification = (text, type) => {
    setNotification({ text, type })
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  const handleLogin = async (event) => {
    event.preventDefault() // stop the page from reloading

    try {
      const loggedUser = await loginService.login({ username, password })

      // Save the user in the browser so the login is "permanent"
      window.localStorage.setItem(
        'loggedBlogappUser',
        JSON.stringify(loggedUser)
      )

      setUser(loggedUser)
      setUsername('')
      setPassword('')
    } catch {
      showNotification('wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    // Remove the saved user so the browser does not remember it
    window.localStorage.removeItem('loggedBlogappUser')
    setUser(null)
  }

  // Create a new blog. It returns true if it worked and false if it did not
  const addBlog = async (blogObject) => {
    try {
      const createdBlog = await blogService.create(blogObject)

      // Close the form
      blogFormRef.current.toggleVisibility()

      setBlogs((current) => current.concat(createdBlog))
      showNotification(
        `a new blog ${createdBlog.title} by ${createdBlog.author} added`,
        'success'
      )
      return true
    } catch (error) {
      showNotification(
        error.response?.data?.error || 'could not create the blog',
        'error'
      )
      return false
    }
  }

  // 5.8: add one like to a blog
  const handleLike = async (blog) => {
    try {
      // The backend replaces the blog, so we send all its fields
      const updatedBlog = await blogService.update(blog.id, {
        user: blog.user ? blog.user.id : undefined,
        likes: blog.likes + 1,
        author: blog.author,
        title: blog.title,
        url: blog.url
      })

      setBlogs((current) =>
        current.map((b) => (b.id === blog.id ? updatedBlog : b))
      )
    } catch {
      showNotification('could not update the likes', 'error')
    }
  }

  // 5.11: delete a blog after asking for confirmation
  const handleDelete = async (blog) => {
    if (!window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      return
    }

    try {
      await blogService.remove(blog.id)

      setBlogs((current) => current.filter((b) => b.id !== blog.id))
      showNotification(`blog ${blog.title} removed`, 'success')
    } catch (error) {
      showNotification(
        error.response?.data?.error || 'could not remove the blog',
        'error'
      )
    }
  }

  // Nobody is logged in: only the login form is shown
  if (user === null) {
    return (
      <div>
        <h2>Log in to application</h2>
        <Notification notification={notification} />
        <LoginForm
          handleLogin={handleLogin}
          username={username}
          handleUsernameChange={(event) => setUsername(event.target.value)}
          password={password}
          handlePasswordChange={(event) => setPassword(event.target.value)}
        />
      </div>
    )
  }

  // 5.10: sort the blogs by likes, from the most to the least liked
  const sortedBlogs = [...blogs].sort((a, b) => b.likes - a.likes)

  return (
    <div>
      <h2>blogs</h2>

      <Notification notification={notification} />

      <p>
        {user.name} logged in <button onClick={handleLogout}>logout</button>
      </p>

      {/* 5.5: the form is only shown when the button is clicked */}
      <Togglable buttonLabel="create new blog" ref={blogFormRef}>
        <BlogForm createBlog={addBlog} />
      </Togglable>

      {sortedBlogs.map((blog) => (
        <Blog
          key={blog.id}
          blog={blog}
          handleLike={handleLike}
          handleDelete={handleDelete}
          showDelete={Boolean(blog.user) && blog.user.username === user.username}
        />
      ))}
    </div>
  )
}

export default App