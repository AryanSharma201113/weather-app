const apiKey = "YOUR_API_KEY_HERE"; // Replace with your OpenWeatherMap API key
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const weatherInfo = document.querySelector(".weather-info");
const errorBox = document.querySelector(".error");
const loader = document.querySelector(".loader");
const lastUpdatedSpan = document.querySelector(".last-updated-time");

// Add event listeners
searchBtn.addEventListener("click", () => {
  if (cityInput.value.trim()) fetchWeather(cityInput.value.trim());
});
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && cityInput.value.trim()) fetchWeather(cityInput.value.trim());
});

async function fetchWeather(city) {
  try {
    showLoader(true);
    hideError();

    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    const data = await response.json();

    if (response.ok) {
      populateWeatherUI(data);
    } else {
      throw new Error(data.message || "City not found");
    }
  } catch (err) {
    showError(err.message || "Error loading weather");
  } finally {
    showLoader(false);
  }
}

function populateWeatherUI(data) {
  document.querySelector(".weather-icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
  document.querySelector(".weather-desc").innerText = data.weather[0].description.toUpperCase();
  document.querySelector(".temp").innerText = `${Math.round(data.main.temp)}°C`;
  document.querySelector(".city").innerText = `${data.name}, ${data.sys.country}`;
  document.querySelector(".date").innerText = new Date().toLocaleString();
  document.querySelector(".feels-like .card-value").innerText = `${Math.round(data.main.feels_like)}°C`;
  document.querySelector(".humidity .card-value").innerText = `${data.main.humidity}%`;
  document.querySelector(".wind-speed .card-value").innerText = `${data.wind.speed} m/s`;
  document.querySelector(".sunrise .card-value").innerText = formatTime(data.sys.sunrise);
  document.querySelector(".sunset .card-value").innerText = formatTime(data.sys.sunset);
  document.querySelector(".aqi .card-value").innerText = "Good (placeholder)";

  weatherInfo.style.display = "block";
  lastUpdatedSpan.innerText = new Date().toLocaleTimeString();
}

function showLoader(on) {
  loader.style.display = on ? "block" : "none";
  if (on) weatherInfo.style.display = "none";
}

function showError(msg) {
  errorBox.style.display = "block";
  errorBox.querySelector("p").innerText = msg;
  weatherInfo.style.display = "none";
}

function hideError() {
  errorBox.style.display = "none";
}

function formatTime(ts) {
  return new Date(ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
