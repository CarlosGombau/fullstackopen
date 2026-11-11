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

// Creating a blog needs the token
const create = async (newBlog) => {
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.post(baseUrl, newBlog, config)
  return response.data
}

// 5.8: replace the data of a blog (used to add a like)
const update = async (id, updatedBlog) => {
  const response = await axios.put(`${baseUrl}/${id}`, updatedBlog)
  return response.data
}

// 5.11: delete a blog (it needs the token: only the creator can do it)
const remove = async (id) => {
  const config = {
    headers: { Authorization: token }
  }

  await axios.delete(`${baseUrl}/${id}`, config)
}

export default { getAll, create, update, remove, setToken }