import { useState, useEffect } from 'react'
import axios from 'axios'

import Country from './components/Country'

const App = () => {
  const [countries, setCountries] = useState([]) // all the countries
  const [search, setSearch] = useState('') // text typed in the search field
  const [selected, setSelected] = useState(null) // country chosen with a "show" button

  // Fetch all the countries once, when the app starts
  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then((response) => {
        setCountries(response.data)
      })
  }, [])

  // When the user types, update the search and forget the selected country
  const handleSearchChange = (event) => {
    setSearch(event.target.value)
    setSelected(null)
  }

  // Keep only the countries whose name contains the search text
  const matches = countries.filter((country) =>
    country.name.common.toLowerCase().includes(search.toLowerCase())
  )

  // Decide what to show depending on the number of matches
  let content = null

  if (search === '') {
    content = null // nothing typed yet
  } else if (matches.length > 10) {
    // 2.18: too many results
    content = <p>Too many matches, specify another filter</p>
  } else if (matches.length === 0) {
    content = <p>No matches</p>
  } else if (matches.length === 1) {
    // Only one country: show all its data
    content = <Country key={matches[0].name.common} country={matches[0]} />
  } else {
    // 2.19: between 2 and 10 countries: list them, each with a "show" button
    content = (
      <div>
        {matches.map((country) => (
          <div key={country.name.common}>
            {country.name.common}{' '}
            <button onClick={() => setSelected(country)}>show</button>
          </div>
        ))}
        {selected && (
          <Country key={selected.name.common} country={selected} />
        )}
      </div>
    )
  }

  return (
    <div>
      find countries: <input value={search} onChange={handleSearchChange} />
      {content}
    </div>
  )
}

export default App