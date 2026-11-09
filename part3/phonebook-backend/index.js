// Load the variables of the .env file (it must be the FIRST line)
require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.json())

// A custom token that shows the data sent in POST requests
morgan.token('body', (request) => {
  return request.method === 'POST' ? JSON.stringify(request.body) : ''
})

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :body'
  )
)

// Serve the frontend build (the dist folder) as static files
app.use(express.static('dist'))

// Get ALL the people from the database
app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((people) => {
      response.json(people)
    })
    .catch((error) => next(error))
})

// 3.18: info page, now using the database to count the entries
app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then((count) => {
      response.send(
        `<p>Phonebook has info for ${count} people</p>
         <p>${new Date()}</p>`
      )
    })
    .catch((error) => next(error))
})

// 3.18: get ONE person from the database
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end() // no person with that id
      }
    })
    .catch((error) => next(error))
})

// 3.15: delete ONE person from the database
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

// Save a NEW person in the database
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson)
    })
    .catch((error) => next(error))
})

// 3.17: change the number of an existing person
app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findById(request.params.id)
    .then((person) => {
      if (!person) {
        return response.status(404).end() // the person does not exist (anymore)
      }

      person.name = name
      person.number = number

      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch((error) => next(error))
})

// Middleware for routes that do not exist
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

// 3.16: the error handler middleware (it must be the LAST middleware)
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  // CastError means that the id has an invalid format
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  // Any other error goes to Express' default handler
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})