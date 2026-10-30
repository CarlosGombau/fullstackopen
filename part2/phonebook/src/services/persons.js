import axios from 'axios'

const baseUrl = 'http://localhost:3001/persons'

// Get all the people from the server
const getAll = () => {
  return axios.get(baseUrl).then((response) => response.data)
}

// Create a new person on the server
const create = (newPerson) => {
  return axios.post(baseUrl, newPerson).then((response) => response.data)
}

// Replace the data of an existing person (used to change a number)
const update = (id, updatedPerson) => {
  return axios
    .put(`${baseUrl}/${id}`, updatedPerson)
    .then((response) => response.data)
}

// Delete a person from the server
// (we can't call it "delete": that word is reserved in JavaScript)
const remove = (id) => {
  return axios.delete(`${baseUrl}/${id}`)
}

export default { getAll, create, update, remove }