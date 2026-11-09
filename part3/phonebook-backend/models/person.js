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

// The structure of one phonebook entry
const personSchema = new mongoose.Schema({
  name: String,
  number: String
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