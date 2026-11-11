import axios from 'axios'

const baseUrl = '/api/blogs'

// The token of the logged-in user, in the form "Bearer xxxxx"
let token = null

const setToken = (newToken) => {
  token = newToken ? `Bearer ${newToken}` : null
}

const getAll = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

// Creating a blog needs the token in the Authorization header
const create = async (newBlog) => {
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.post(baseUrl, newBlog, config)
  return response.data
}

export default { getAll, create, setToken }