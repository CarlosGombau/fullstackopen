import axios from 'axios'

const baseUrl = '/api/login'

// Sends the username and password. If they are right, the backend
// answers with { token, username, name }
const login = async (credentials) => {
  const response = await axios.post(baseUrl, credentials)
  return response.data
}

export default { login }