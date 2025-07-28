const apiKey = "906c227b096da6e517408c19f0507b82";
const apiUrl =
  "https://api.openweathermap.org/data/2.5/weather?&units=metric&q=";

const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
async function checkWeather(city) {
  const response = await fetch(apiUrl + city + `&appid=${apiKey}`);

  if (response.status == 404) {
    document.querySelector(".error").style.display = "block";
    document.querySelector(".weather").style.display = "none";
  } else {
    var data = await response.json();

    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temp").innerHTML =
      Math.round(data.main.temp) + "°c";
    document.querySelector(".humidity").innerHTML = data.main.humidity + " %";
    document.querySelector(".wind").innerHTML = data.wind.speed + " kmph";

    if (data.weather[0].main == "Clouds") {
      weatherIcon.src =
        "https://www.freeiconspng.com/uploads/weather-icon-png-0.png";
    } else if (data.weather[0].main == "Clear") {
      weatherIcon.src =
        "https://www.freeiconspng.com/uploads/weather-icon-png-8.png";
    } else if (data.weather[0].main == "Rain") {
      weatherIcon.src =
        "https://www.freeiconspng.com/uploads/weather-icon-png-25.png";
    } else if (data.weather[0].main == "Drizzle") {
      weatherIcon.src =
        "https://www.freeiconspng.com/uploads/weather-icon-png-25.png";
    } else if (data.weather[0].main == "Mist") {
      weatherIcon.src =
        "https://www.freeiconspng.com/uploads/weather-icon-png-17.png";
    }
    document.querySelector(".weather").style.display = "block";
    document.querySelector(".error").style.display = "none";
  }
}

searchBtn.addEventListener("click", () => {
  checkWeather(searchBox.value);
});
