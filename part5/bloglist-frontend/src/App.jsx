import { useState, useEffect } from 'react'

import Blog from './components/Blog'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])

  // null = nobody is logged in, otherwise { token, username, name }
  const [user, setUser] = useState(null)

  // The fields of the login form
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // The fields of the new blog form
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  // null = no message, otherwise { text: '...', type: 'success' or 'error' }
  const [notification, setNotification] = useState(null)

  // Fetch the blogs once, when the app starts
  useEffect(() => {
    const fetchBlogs = async () => {
      const initialBlogs = await blogService.getAll()
      setBlogs(initialBlogs)
    }

    fetchBlogs()
  }, [])

  // 5.2: when the app starts, check if a user was saved in the local storage
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')

    if (loggedUserJSON) {
      const savedUser = JSON.parse(loggedUserJSON)
      setUser(savedUser)
      blogService.setToken(savedUser.token)
    }
  }, [])

  // 5.4: shows a message for 5 seconds
  const showNotification = (text, type) => {
    setNotification({ text, type })
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  // 5.1: runs when the login form is submitted
  const handleLogin = async (event) => {
    event.preventDefault() // stop the page from reloading

    try {
      const loggedUser = await loginService.login({ username, password })

      // 5.2: save the user in the browser so the login is "permanent"
      window.localStorage.setItem(
        'loggedBlogappUser',
        JSON.stringify(loggedUser)
      )

      blogService.setToken(loggedUser.token)
      setUser(loggedUser)
      setUsername('')
      setPassword('')
    } catch {
      showNotification('wrong username or password', 'error')
    }
  }

  // 5.2: log out
  const handleLogout = () => {
    // Remove the saved user so the browser does not remember it
    window.localStorage.removeItem('loggedBlogappUser')
    blogService.setToken(null)
    setUser(null)
  }

  // 5.3: create a new blog
  const addBlog = async (event) => {
    event.preventDefault()

    try {
      const createdBlog = await blogService.create({ title, author, url })

      setBlogs(blogs.concat(createdBlog))
      setTitle('')
      setAuthor('')
      setUrl('')
      showNotification(
        `a new blog ${createdBlog.title} by ${createdBlog.author} added`,
        'success'
      )
    } catch (error) {
      // Show the message sent by the backend (for example, title missing)
      showNotification(
        error.response?.data?.error || 'could not create the blog',
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

  // A user is logged in: show the name, the form and the list of blogs
  return (
    <div>
      <h2>blogs</h2>

      <Notification notification={notification} />

      <p>
        {user.name} logged in <button onClick={handleLogout}>logout</button>
      </p>

      <h2>create new</h2>
      <BlogForm
        addBlog={addBlog}
        title={title}
        handleTitleChange={(event) => setTitle(event.target.value)}
        author={author}
        handleAuthorChange={(event) => setAuthor(event.target.value)}
        url={url}
        handleUrlChange={(event) => setUrl(event.target.value)}
      />

      {blogs.map((blog) => (
        <Blog key={blog.id} blog={blog} />
      ))}
    </div>
  )
}

export default App