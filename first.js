// Aura Weather - Enhanced JavaScript
const apiKey = "906c227b096da6e517408c19f0507b82";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?&units=metric&q=";
const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const weatherDesc = document.querySelector(".weather-desc");
const cityElem = document.querySelector(".city");
const tempElem = document.querySelector(".temp");
const humidityElem = document.querySelector(".humidity p.card-value");
const windElem = document.querySelector(".wind-speed p.card-value");
const feelsLikeElem = document.querySelector(".feels-like p.card-value");
const sunriseElem = document.querySelector(".sunrise p.card-value");
const sunsetElem = document.querySelector(".sunset p.card-value");
const errorBox = document.querySelector(".error");
const loader = document.querySelector(".loader");
const weatherInfo = document.querySelector(".weather-info");

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
    loader.style.display = "block";
    weatherInfo.style.display = "none";
    errorBox.style.display = "none";

    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);
    const data = await response.json();

    if (response.status !== 200) throw new Error("City not found");

    const weatherMain = data.weather[0].main;
    const iconURL = iconMap[weatherMain] || iconMap["Clouds"];

    cityElem.innerText = `${data.name}, ${data.sys.country}`;
    tempElem.innerText = `${Math.round(data.main.temp)}°C`;
    humidityElem.innerText = `${data.main.humidity} %`;
    windElem.innerText = `${data.wind.speed} km/h`;
    feelsLikeElem.innerText = `${Math.round(data.main.feels_like)}°C`;
    sunriseElem.innerText = formatTime(data.sys.sunrise);
    sunsetElem.innerText = formatTime(data.sys.sunset);
    weatherDesc.innerText = data.weather[0].description.toUpperCase();
    weatherIcon.src = iconURL;

    document.querySelector(".last-updated").innerText =
      "Last updated: " + new Date().toLocaleTimeString();

    weatherInfo.style.display = "block";
    loader.style.display = "none";
  } catch (error) {
    loader.style.display = "none";
    weatherInfo.style.display = "none";
    errorBox.style.display = "block";
  }
}

function formatTime(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

searchBtn.addEventListener("click", () => {
  const city = searchBox.value.trim();
  if (city) checkWeather(city);
});

searchBox.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});
