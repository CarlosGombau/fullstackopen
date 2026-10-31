const express = require('express')
const morgan = require('morgan')

const app = express()

// Middleware: it turns the JSON sent in a request into a JavaScript object (request.body)
app.use(express.json())

// 3.8: a custom token that shows the data sent in POST requests
morgan.token('body', (request) => {
  return request.method === 'POST' ? JSON.stringify(request.body) : ''
})

// 3.7: the "tiny" format, plus our custom token at the end
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :body'
  )
)

// 3.11: serve the frontend build (the dist folder) as static files
app.use(express.static('dist'))

// The data lives in memory: it is reset every time the server restarts
let persons = [
  {
    id: '1',
    name: 'Arto Hellas',
    number: '040-123456'
  },
  {
    id: '2',
    name: 'Ada Lovelace',
    number: '39-44-5323523'
  },
  {
    id: '3',
    name: 'Dan Abramov',
    number: '12-43-234345'
  },
  {
    id: '4',
    name: 'Mary Poppendieck',
    number: '39-23-6423122'
  }
]

// 3.1: return the whole list
app.get('/api/persons', (request, response) => {
  response.json(persons)
})

// 3.2: info page with the number of entries and the time of the request
app.get('/info', (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people</p>
     <p>${new Date()}</p>`
  )
})

// 3.3: return ONE person (the id comes from the URL)
app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const person = persons.find((person) => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end() // 404 = not found
  }
})

// 3.4: delete ONE person
app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter((person) => person.id !== id)

  response.status(204).end() // 204 = done, no content to send back
})

// 3.5 and 3.6: add a new person
app.post('/api/persons', (request, response) => {
  const body = request.body

  // 3.6: the name or the number is missing
  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' })
  }

  // 3.6: the name already exists
  const nameExists = persons.some((person) => person.name === body.name)
  if (nameExists) {
    return response.status(400).json({ error: 'name must be unique' })
  }

  const person = {
    id: String(Math.floor(Math.random() * 1000000)), // a big random number
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)

  response.json(person)
})

// Middleware for routes that do not exist (it must go AFTER all the routes)
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})