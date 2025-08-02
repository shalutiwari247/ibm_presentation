import React, { useState, useEffect } from "react";
import "./App.css";

const API_KEY = "9fd3e42f107014b62cb7b2bbfcbea1bd";

const App = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [humidity, setHumidity] = useState(null);
  const [wind, setWind] = useState(null);

  const [aqi, setAqi] = useState(null);
  const [bgClass, setBgClass] = useState("default");

  const fetchWeather = async () => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();

      if (data.cod !== 200) throw new Error(data.message);

      setWeather(data);
      updateBackground(data.weather[0].main);

      setHumidity(data.main.humidity);
      setWind(data.wind.speed);

      const { lat, lon } = data.coord;
      await Promise.all([fetchForecast(lat, lon), fetchAQI(lat, lon)]);
    } catch (error) {
      setWeather({ error: error.message });
    }
  };

  const fetchForecast = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();

      // Get one forecast per day (e.g., 12:00 PM entries)
      const daily = data.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );
      setForecast(daily);
    } catch (error) {
      console.error("Forecast fetch failed:", error);
    }
  };

  const fetchAQI = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
      );
      const data = await res.json();

      if (data?.list?.length > 0) {
        setAqi(data.list[0].main.aqi);
      } else {
        setAqi(null);
      }
    } catch (error) {
      console.error("AQI fetch failed:", error);
      setAqi(null);
    }
  };

  const getAQIBadge = (aqi) => {
    if (aqi <= 50)
      return {
        label: "Good",
        color: "green",
        description: "Air quality is satisfactory",
      };
    if (aqi <= 100)
      return {
        label: "Moderate",
        color: "yellow",
        description: "Acceptable for most",
      };
    if (aqi <= 150)
      return {
        label: "Unhealthy for Sensitive Groups",
        color: "orange",
        description: "Sensitive individuals may experience effects",
      };
    if (aqi <= 200)
      return {
        label: "Unhealthy",
        color: "red",
        description: "Everyone may begin to feel effects",
      };
    if (aqi <= 300)
      return {
        label: "Very Unhealthy",
        color: "purple",
        description: "Health warnings of emergency conditions",
      };
    return {
      label: "Hazardous",
      color: "maroon",
      description: "Serious health effects for everyone",
    };
  };

  const updateBackground = (main) => {
    const mapping = {
      Clear: "sunny",
      Clouds: "cloudy",
      Rain: "rainy",
      Snow: "snowy",
      Thunderstorm: "stormy",
    };
    setBgClass(mapping[main] || "default");
  };

  return (
    <div className={`app ${bgClass}`}>
      <div className="glass-card">
        <h1 className="heading">Weather Dashboard</h1>
        <h3 className="heading">(Only for cities)</h3>
        <div className="search">
          <input
            type="text"
            placeholder="Enter city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button onClick={fetchWeather}>Search</button>
        </div>

        {weather?.error && <p className="error">{weather.error}</p>}

        {weather && !weather.error && (
          <>
            <h2>
              {weather.name}, {weather.sys.country}
            </h2>
            <h1>{Math.round(weather.main.temp)}°C</h1>
            <p>{weather.weather[0].description}</p>
            <div className="details mb-3">
              <div className="col">
                <i className="fa-solid fa-water fa-2x"></i>
                <div>
                  <p className="humidity">
                    {humidity !== null ? `${humidity}%` : "..."}
                  </p>
                  <p>Humidity</p>
                </div>
              </div>
              <div className="col">
                <i className="fa-solid fa-wind fa-2x"></i>
                <div>
                  <p className="wind">
                    {wind !== null ? `${wind} km/h` : "..."}
                  </p>
                  <p>Wind Speed</p>
                </div>
              </div>
            </div>

            {aqi && (
              <div className="aqi-section">
                <p className="aqi-title">Air Quality Index</p>
                <div className="aqi-info">
                  <span className="aqi-value">AQI: {aqi}</span>
                  <span className={`badge ${getAQIBadge(aqi).color}`}>
                    {getAQIBadge(aqi).label}
                  </span>
                  <span className="aqi-description">
                    ({getAQIBadge(aqi).description})
                  </span>
                </div>
              </div>
            )}

            <h3>5-Day Forecast</h3>
            <div className="forecast-scroll">
              {forecast.map((day, idx) => (
                <div className="forecast-card" key={idx}>
                  <p>
                    {new Date(day.dt_txt).toLocaleDateString("en-IN", {
                      weekday: "short",
                    })}
                  </p>
                  <img
                    src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                    alt=""
                  />
                  <p>{Math.round(day.main.temp_max)}°C</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
