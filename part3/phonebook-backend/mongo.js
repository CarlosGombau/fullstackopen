const mongoose = require('mongoose')

// We need 3 arguments (node, file, password) to list the entries,
// or 5 (node, file, password, name, number) to add one
if (process.argv.length !== 3 && process.argv.length !== 5) {
  console.log('Usage:')
  console.log('  node mongo.js <password>                 (list all entries)')
  console.log('  node mongo.js <password> <name> <number> (add an entry)')
  process.exit(1)
}

// The password comes from the command line: it is NOT written in this file
const password = process.argv[2]


const url = `mongodb+srv://fullstack:${password}@cluster0.kn66mtd.mongodb.net/phoneBookApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

// The structure of one phonebook entry
const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

// The model: mongoose will store these in a collection called "people"
const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  // Only the password was given: list all the entries
  Person.find({}).then((result) => {
    console.log('phonebook:')
    result.forEach((person) => {
      console.log(person.name, person.number)
    })
    // Close the connection INSIDE the callback, when the search is finished
    mongoose.connection.close()
  })
} else {
  // Name and number were given: add a new entry
  const name = process.argv[3]
  const number = process.argv[4]

  const person = new Person({ name, number })

  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    // Close the connection only after the entry has been saved
    mongoose.connection.close()
  })
}