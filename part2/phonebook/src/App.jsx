import { useState, useEffect } from 'react'

import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Notification from './components/Notification'
import personService from './services/persons'

const App = () => {
  const [persons, setPersons] = useState([])

  // One state for each input field
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  // null = no message, otherwise { text: '...', type: 'success' or 'error' }
  const [notification, setNotification] = useState(null)

  // Fetch the initial data from the server (runs only once)
  useEffect(() => {
    personService.getAll().then((initialPersons) => {
      setPersons(initialPersons)
    })
  }, [])

  // Shows a message for 5 seconds and then hides it
  const showNotification = (text, type) => {
    setNotification({ text, type })
    setTimeout(() => {
      setNotification(null)
    }, 5000)
  }

  // Event handlers: they update the state when the user types
  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  // Runs when the form is submitted (the "add" button)
  const addPerson = (event) => {
    event.preventDefault() // stop the page from reloading

    const existingPerson = persons.find((person) => person.name === newName)

    // The name already exists: offer to replace the number
    if (existingPerson) {
      const confirmed = window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`
      )

      if (confirmed) {
        const updatedPerson = { ...existingPerson, number: newNumber }

        personService
          .update(existingPerson.id, updatedPerson)
          .then((returnedPerson) => {
            setPersons(
              persons.map((person) =>
                person.id !== existingPerson.id ? person : returnedPerson
              )
            )
            setNewName('')
            setNewNumber('')
            showNotification(`Changed the number of ${returnedPerson.name}`, 'success')
          })
          .catch(() => {
            // 2.17: the person was already deleted from the server
            showNotification(
              `Information of ${existingPerson.name} has already been removed from server`,
              'error'
            )
            setPersons(persons.filter((p) => p.id !== existingPerson.id))
          })
      }
      return
    }

    // New person: save it on the server
    const personObject = {
      name: newName,
      number: newNumber
    }

    personService.create(personObject).then((returnedPerson) => {
      setPersons(persons.concat(returnedPerson))
      setNewName('') // clear the input fields
      setNewNumber('')
      showNotification(`Added ${returnedPerson.name}`, 'success')
    })
  }

  // Delete a person after asking for confirmation
  const deletePerson = (person) => {
    if (window.confirm(`Delete ${person.name} ?`)) {
      personService
        .remove(person.id)
        .then(() => {
          setPersons(persons.filter((p) => p.id !== person.id))
          showNotification(`Deleted ${person.name}`, 'success')
        })
        .catch(() => {
          // The person was already deleted from the server
          showNotification(
            `Information of ${person.name} has already been removed from server`,
            'error'
          )
          setPersons(persons.filter((p) => p.id !== person.id))
        })
    }
  }

  // Keep only the people whose name contains the filter text
  const personsToShow = persons.filter((person) =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification notification={notification} />

      <Filter filter={filter} handleFilterChange={handleFilterChange} />

      <h3>Add a new</h3>

      <PersonForm
        addPerson={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />

      <h3>Numbers</h3>

      <Persons persons={personsToShow} handleDelete={deletePerson} />
    </div>
  )
}

export default App