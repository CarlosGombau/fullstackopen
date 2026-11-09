const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

// The address of the database comes from the .env file
const url = process.env.MONGODB_URI

console.log('connecting to MongoDB...')

mongoose
  .connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  // 3.19: the name must exist and have at least 3 characters
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  // 3.20: the number must have at least 8 characters and the form 12-3456... or 123-4567...
  number: {
    type: String,
    minLength: 8,
    required: true,
    validate: {
      // 2 or 3 digits, a dash, and then only digits
      validator: (value) => /^\d{2,3}-\d+$/.test(value),
      message: (props) => `${props.value} is not a valid phone number!`
    }
  }
})

// Change how a person is converted to JSON:
// MongoDB uses "_id" (an object), but the frontend expects "id" (a string)
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)