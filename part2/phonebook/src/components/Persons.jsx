// Shows the name and number of ONE person
const Person = ({ person }) => {
  return (
    <p>
      {person.name} {person.number}
    </p>
  )
}

// Shows the whole list, one Person per item
const Persons = ({ persons }) => {
  return (
    <div>
      {persons.map((person) => (
        <Person key={person.id} person={person} />
      ))}
    </div>
  )
}

export default Persons