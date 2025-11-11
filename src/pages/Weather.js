import React, { useState } from 'react';
import { FaSearch, FaMapMarkerAlt, FaTemperatureHigh, FaTint, FaWind, FaCloud, FaSun, FaMoon, FaCloudSun } from 'react-icons/fa';
import { getCoordinates, getWeatherData } from '../services/weatherService';
import '../styles/Weather.css';

function Weather() {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!city.trim()) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError('');
    setWeatherData(null);

    try {
      // Get coordinates for the city
      const coordinates = await getCoordinates(city);
      
      if (!coordinates) {
        setError('City not found. Please try again.');
        setLoading(false);
        return;
      }

      setLocationInfo(coordinates);

      // Get weather data using coordinates
      const weather = await getWeatherData(coordinates.lat, coordinates.lon);
      setWeatherData(weather);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <div className="weather">
      <div className="container">
        <div className="page-header">
          <h1>Weather Forecast</h1>
          <p>Check real-time weather conditions for any destination worldwide</p>
        </div>

        <form onSubmit={handleSearch} className="search-form">
          <div className="search-container">
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name (e.g., London, Tokyo, New York)"
              className="search-input"
            />
            <button type="submit" className="btn-search" disabled={loading}>
              <FaSearch /> {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {weatherData && locationInfo && (
          <div className="weather-content">
            {/* Current Weather */}
            <div className="current-weather">
              <div className="location-info">
                <FaMapMarkerAlt />
                <h2>{locationInfo.name}, {locationInfo.country}</h2>
              </div>
              
              <div className="current-temp-section">
                <img 
                  src={getWeatherIcon(weatherData.current.weather[0].icon)} 
                  alt={weatherData.current.weather[0].description}
                  className="weather-icon-large"
                />
                <div className="temp-info">
                  <h1>{Math.round(weatherData.current.temp)}°C</h1>
                  <p className="weather-description">
                    {weatherData.current.weather[0].description}
                  </p>
                </div>
              </div>

              <div className="current-details">
                <div className="detail-item">
                  <FaTemperatureHigh className="detail-icon" />
                  <div>
                    <label>Feels Like</label>
                    <p>{Math.round(weatherData.current.feels_like)}°C</p>
                  </div>
                </div>

                <div className="detail-item">
                  <FaTint className="detail-icon" />
                  <div>
                    <label>Humidity</label>
                    <p>{weatherData.current.humidity}%</p>
                  </div>
                </div>

                <div className="detail-item">
                  <FaWind className="detail-icon" />
                  <div>
                    <label>Wind Speed</label>
                    <p>{Math.round(weatherData.current.wind_speed)} m/s</p>
                  </div>
                </div>

                <div className="detail-item">
                  <FaCloud className="detail-icon" />
                  <div>
                    <label>Cloudiness</label>
                    <p>{weatherData.current.clouds}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hourly Forecast */}
            <div className="forecast-section">
              <h3><FaSun /> Hourly Forecast (Next 24 Hours)</h3>
              <div className="hourly-forecast">
                {weatherData.hourly.slice(0, 24).map((hour, index) => (
                  <div key={index} className="hourly-item">
                    <p className="hour-time">
                      {new Date(hour.dt * 1000).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        hour12: true
                      })}
                    </p>
                    <img 
                      src={getWeatherIcon(hour.weather[0].icon)} 
                      alt={hour.weather[0].description}
                      className="weather-icon-small"
                    />
                    <p className="hour-temp">{Math.round(hour.temp)}°C</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Forecast */}
            <div className="forecast-section">
              <h3><FaMoon /> 7-Day Forecast</h3>
              <div className="daily-forecast">
                {weatherData.daily.slice(0, 7).map((day, index) => (
                  <div key={index} className="daily-item">
                    <p className="day-name">{formatDate(day.dt)}</p>
                    <img 
                      src={getWeatherIcon(day.weather[0].icon)} 
                      alt={day.weather[0].description}
                      className="weather-icon-medium"
                    />
                    <p className="day-description">{day.weather[0].main}</p>
                    <div className="day-temp">
                      <span className="temp-max">{Math.round(day.temp.max)}°</span>
                      <span className="temp-min">{Math.round(day.temp.min)}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!weatherData && !loading && !error && (
          <div className="no-data">
            <FaCloudSun className="no-data-icon" />
            <h3>Search for a City</h3>
            <p>Enter a city name above to view weather forecasts</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Weather;