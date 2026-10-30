import { useState } from 'react'

// A reusable button: receives the function to run on click and the text to show
const Button = ({ onClick, text }) => {
  return <button onClick={onClick}>{text}</button>
}

// Shows ONE statistic as a row of the table
const StatisticLine = ({ text, value }) => {
  return (
    <tr>
      <td>{text}</td>
      <td>{value}</td>
    </tr>
  )
}

// Shows all the statistics (or a message if there is no feedback yet)
const Statistics = ({ good, neutral, bad }) => {
  const all = good + neutral + bad

  // If nothing has been clicked yet, show a message and stop here
  if (all === 0) {
    return <p>No feedback given</p>
  }

  // good = 1, neutral = 0, bad = -1
  const average = (good - bad) / all
  const positive = (good / all) * 100

  return (
    <table>
      <tbody>
        <StatisticLine text="good" value={good} />
        <StatisticLine text="neutral" value={neutral} />
        <StatisticLine text="bad" value={bad} />
        <StatisticLine text="all" value={all} />
        <StatisticLine text="average" value={average} />
        <StatisticLine text="positive" value={positive + ' %'} />
      </tbody>
    </table>
  )
}

const App = () => {
  // The state lives here, in the root component
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)

  return (
    <div>
      <h1>give feedback</h1>
      <Button onClick={() => setGood(good + 1)} text="good" />
      <Button onClick={() => setNeutral(neutral + 1)} text="neutral" />
      <Button onClick={() => setBad(bad + 1)} text="bad" />

      <h1>statistics</h1>
      <Statistics good={good} neutral={neutral} bad={bad} />
    </div>
  )
}

export default App