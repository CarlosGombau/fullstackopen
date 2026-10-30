// Shows the name and number of ONE person, with a delete button
const Person = ({ person, handleDelete }) => {
  return (
    <p>
      {person.name} {person.number}{' '}
      <button onClick={() => handleDelete(person)}>delete</button>
    </p>
  )
}

// Shows the whole list, one Person per item
const Persons = ({ persons, handleDelete }) => {
  return (
    <div>
      {persons.map((person) => (
        <Person key={person.id} person={person} handleDelete={handleDelete} />
      ))}
    </div>
  )
}

export default Persons