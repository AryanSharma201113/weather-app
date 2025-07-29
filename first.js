// Aura Weather - Enhanced JavaScript
const apiKey = "906c227b096da6e517408c19f0507b82";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?&units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const weatherDesc = document.querySelector(".weather-desc");
const cityElem = document.querySelector(".city");
const tempElem = document.querySelector(".temp");
const humidityElem = document.querySelector(".humidity .card-value");
const windElem = document.querySelector(".wind-speed .card-value");
const feelsLikeElem = document.querySelector(".feels-like .card-value");
const sunriseElem = document.querySelector(".sunrise .card-value");
const sunsetElem = document.querySelector(".sunset .card-value");
const errorBox = document.querySelector(".error");
const loader = document.querySelector(".loader");
const weatherInfo = document.querySelector(".weather-info");
const lastUpdatedElem = document.querySelector(".last-updated");

const iconMap = {
  Clouds: "https://www.freeiconspng.com/uploads/weather-icon-png-0.png",
  Clear: "https://www.freeiconspng.com/uploads/weather-icon-png-8.png",
  Rain: "https://www.freeiconspng.com/uploads/weather-icon-png-25.png",
  Drizzle: "https://www.freeiconspng.com/uploads/weather-icon-png-25.png",
  Mist: "https://www.freeiconspng.com/uploads/weather-icon-png-17.png",
  Snow: "https://www.freeiconspng.com/uploads/weather-icon-png-12.png",
  Thunderstorm: "https://www.freeiconspng.com/uploads/weather-icon-png-14.png"
};

async function checkWeather(city) {
  try {
    showLoader(true);

    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    const data = await response.json();

    if (!response.ok || data.cod !== 200) throw new Error(data.message);

    updateWeatherInfo(data);
    showError(false);
  } catch (error) {
    showError(true, error.message);
  } finally {
    showLoader(false);
  }
}

function updateWeatherInfo(data) {
  const weatherMain = data.weather[0].main;
  const iconURL = iconMap[weatherMain] || iconMap["Clouds"];

  cityElem.innerText = `${data.name}, ${data.sys.country}`;
  tempElem.innerText = `${Math.round(data.main.temp)}°C`;
  humidityElem.innerText = `${data.main.humidity}%`;
  windElem.innerText = `${data.wind.speed} km/h`;
  feelsLikeElem.innerText = `${Math.round(data.main.feels_like)}°C`;
  sunriseElem.innerText = formatTime(data.sys.sunrise);
  sunsetElem.innerText = formatTime(data.sys.sunset);
  weatherDesc.innerText = data.weather[0].description.toUpperCase();
  weatherIcon.src = iconURL;
  lastUpdatedElem.innerText = "Last updated: " + new Date().toLocaleTimeString();

  weatherInfo.style.display = "block";
}

function formatTime(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function showLoader(state) {
  loader.style.display = state ? "block" : "none";
  weatherInfo.style.display = state ? "none" : weatherInfo.style.display;
}

function showError(state, message = "City not found") {
  errorBox.style.display = state ? "block" : "none";
  errorBox.innerText = messa
