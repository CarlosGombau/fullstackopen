import { useState, useEffect } from 'react'
import axios from 'axios'

// The API key comes from the .env.local file (it is NOT written in the code)
const apiKey = import.meta.env.VITE_WEATHER_KEY

// Shows the data of ONE country and the weather in its capital
const Country = ({ country }) => {
  const [weather, setWeather] = useState(null)

  // Some countries have no capital, so we check before using it
  const capital = country.capital && country.capital[0]

  // 2.20: fetch the weather of the capital after the first render
  useEffect(() => {
    if (!capital) {
      return
    }

    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?q=${capital}&units=metric&appid=${apiKey}`
      )
      .then((response) => {
        setWeather(response.data)
      })
      .catch(() => {
        // The key may not be active yet: we simply don't show the weather
        setWeather(null)
      })
  }, [capital])

  return (
    <div>
      <h1>{country.name.common}</h1>
      <p>Capital: {capital}</p>
      <p>Area: {country.area}</p>

      <h3>Languages</h3>
      <ul>
        {country.languages &&
          Object.values(country.languages).map((language) => (
            <li key={language}>{language}</li>
          ))}
      </ul>

      <img src={country.flags.png} alt={country.flags.alt} width="150" />

      {weather && (
        <div>
          <h3>Weather in {capital}</h3>
          <p>Temperature: {weather.main.temp} °C</p>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
          />
          <p>Wind: {weather.wind.speed} m/s</p>
        </div>
      )}
    </div>
  )
}

export default Country