// Shows the name of one course
const Header = ({ name }) => {
  return <h2>{name}</h2>
}

// Shows the name and number of exercises of ONE part
const Part = ({ part }) => {
  return (
    <p>
      {part.name} {part.exercises}
    </p>
  )
}

// Shows ALL the parts, however many there are
const Content = ({ parts }) => {
  return (
    <div>
      {parts.map((part) => (
        <Part key={part.id} part={part} />
      ))}
    </div>
  )
}

// Adds up the exercises of all the parts using reduce
const Total = ({ parts }) => {
  const total = parts.reduce((sum, part) => sum + part.exercises, 0)

  return (
    <p>
      <strong>total of {total} exercises</strong>
    </p>
  )
}

// Shows one complete course: header, parts and total
const Course = ({ course }) => {
  return (
    <div>
      <Header name={course.name} />
      <Content parts={course.parts} />
      <Total parts={course.parts} />
    </div>
  )
}

export default Course