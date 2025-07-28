// --- STATE & CONFIG ---
const API_KEY = "906c227b096da6e517408c19f0507b82"; // Your API key
let hourlyChart = null;

const state = {
  units: "metric",
  currentCity: "",
  favorites: JSON.parse(localStorage.getItem("weatherFavorites")) || [],
  theme: localStorage.getItem("weatherTheme") || "dark",
};

const backgroundImages = {
  Clear: 'url("https://images.unsplash.com/photo-1590074899538-462615456f39")',
  Clouds: 'url("https://images.unsplash.com/photo-1534088568595-a066f410bcda")',
  Rain: 'url("https://images.unsplash.com/photo-1515694346937-94d85e41e622")',
  Drizzle:
    'url("https://images.unsplash.com/photo-1515694346937-94d85e41e622")',
  Snow: 'url("https://images.unsplash.com/photo-1547754980-3df97fed72a8")',
  Mist: 'url("https://images.unsplash.com/photo-1487621167305-5d248087c82a")',
  Haze: 'url("https://images.unsplash.com/photo-1487621167305-5d248087c82a")',
  Fog: 'url("https://images.unsplash.com/photo-1487621167305-5d248087c82a")',
  Thunderstorm:
    'url("https://images.unsplash.com/photo-1585521748114-c873431d1021")',
  Default: "linear-gradient(to top, #30cfd0 0%, #330867 100%)", // Fallback background
};

// --- DOM ELEMENTS ---
const dom = {
  body: document.body,
  searchInput: document.querySelector(".search input"),
  searchButton: document.querySelector(".search button"),
  addFavoriteBtn: document.querySelector(".add-favorite-btn"),
  themeToggleBtn: document.querySelector(".theme-toggle-btn"),
  unitSwitch: document.querySelector("#unit-switch"),
  weatherInfo: document.querySelector(".weather-info"),
  highlights: document.querySelector(".highlights"),
  forecastSection: document.querySelector(".forecast-section"),
  locationsContainer: document.querySelector(".locations-container"),
  loader: document.querySelector(".loader"),
  error: document.querySelector(".error"),
  temp: document.querySelector(".temp"),
  city: document.querySelector(".city"),
  date: document.querySelector(".date"),
  weatherIcon: document.querySelector(".weather-icon"),
  weatherDesc: document.querySelector(".weather-desc"),
  feelsLike: document.querySelector(".feels-like .card-value"),
  humidity: document.querySelector(".humidity .card-value"),
  windSpeed: document.querySelector(".wind-speed .card-value"),
  sunrise: document.querySelector(".sunrise .card-value"),
  sunset: document.querySelector(".sunset .card-value"),
  aqiValue: document.querySelector(".aqi .card-value"),
  lastUpdated: document.querySelector(".last-updated"),
  chartCanvas: document.getElementById("hourly-chart"),
};

// --- API & DATA HANDLING ---
async function fetchAllData(city, units) {
  setLoadingState(true);
  try {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${units}`;
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error("City not found. Please try again.");
    const weatherData = await weatherRes.json();

    state.currentCity = weatherData.name;
    const { lat, lon } = weatherData.coord;

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${units}`;
    const airPollutionUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    const [forecastRes, airPollutionRes] = await Promise.all([
      fetch(forecastUrl),
      fetch(airPollutionUrl),
    ]);
    const forecastData = await forecastRes.json();
    const airPollutionData = await airPollutionRes.json();

    updateUI(weatherData, forecastData, airPollutionData);
  } catch (error) {
    console.error(error);
    showError(error.message);
  } finally {
    setLoadingState(false);
  }
}

// --- UI UPDATES ---
function updateUI(weather, forecast, air) {
  const unitSymbols = {
    metric: { temp: "°C", speed: "km/h" },
    imperial: { temp: "°F", speed: "mph" },
  };
  const units = unitSymbols[state.units];
  const weatherCondition = weather.weather[0].main;

  // Set dynamic background
  dom.body.style.backgroundImage =
    backgroundImages[weatherCondition] || backgroundImages.Default;

  // Main weather info
  dom.temp.textContent = `${Math.round(weather.main.temp)}${units.temp}`;
  dom.city.textContent = weather.name;
  dom.weatherDesc.textContent = weather.weather[0].description;
  dom.date.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  dom.weatherIcon.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;
  dom.lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString(
    [],
    { hour: "2-digit", minute: "2-digit" }
  )}`;

  // Highlights
  dom.feelsLike.textContent = `${Math.round(weather.main.feels_like)}${
    units.temp
  }`;
  dom.humidity.textContent = `${weather.main.humidity}%`;
  dom.windSpeed.textContent = `${weather.wind.speed.toFixed(1)} ${units.speed}`;
  dom.sunrise.textContent = new Date(
    weather.sys.sunrise * 1000
  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  dom.sunset.textContent = new Date(
    weather.sys.sunset * 1000
  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Air Quality
  const aqi = air.list[0].main.aqi;
  const { text, className } = getAqiInfo(aqi);
  dom.aqiValue.textContent = text;
  dom.aqiValue.className = `card-value ${className}`;

  // Hourly Chart
  renderHourlyChart(forecast.list, units.temp);

  // Update favorite button status
  updateFavoriteButton();
}

function getAqiInfo(aqi) {
  switch (aqi) {
    case 1:
      return { text: "Good", className: "aqi-1" };
    case 2:
      return { text: "Fair", className: "aqi-2" };
    case 3:
      return { text: "Moderate", className: "aqi-3" };
    case 4:
      return { text: "Poor", className: "aqi-4" };
    case 5:
      return { text: "Very Poor", className: "aqi-5" };
    default:
      return { text: "N/A", className: "" };
  }
}

function renderHourlyChart(hourlyData, tempUnit) {
  if (hourlyChart) {
    hourlyChart.destroy();
  }
  const next24Hours = hourlyData.slice(0, 8); // API gives 3-hour intervals, so 8 points = 24 hours
  const labels = next24Hours.map((item) =>
    new Date(item.dt * 1000).toLocaleTimeString([], {
      hour: "numeric",
      hour12: true,
    })
  );
  const temps = next24Hours.map((item) => Math.round(item.main.temp));

  const ctx = dom.chartCanvas.getContext("2d");
  hourlyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: `Temperature (${tempUnit})`,
          data: temps,
          borderColor: state.theme === "dark" ? "#00feba" : "#007aff",
          backgroundColor:
            state.theme === "dark"
              ? "rgba(0, 254, 186, 0.1)"
              : "rgba(0, 122, 255, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          ticks: { color: state.theme === "dark" ? "#fff" : "#333" },
          grid: { color: "rgba(128,128,128,0.2)" },
        },
        x: {
          ticks: { color: state.theme === "dark" ? "#fff" : "#333" },
          grid: { display: false },
        },
      },
      plugins: { legend: { display: false } },
    },
  });
}

// --- STATE & UI MANAGEMENT ---
function setLoadingState(isLoading) {
  dom.loader.style.display = isLoading ? "block" : "none";
  const elementsToToggle = [
    dom.weatherInfo,
    dom.highlights,
    dom.forecastSection,
  ];
  elementsToToggle.forEach((el) => {
    el.style.visibility = isLoading ? "hidden" : "visible";
    if (!isLoading) {
      el.classList.remove("visible"); // Remove first to reset animation
      void el.offsetWidth; // Trigger reflow to restart animation
      el.classList.add("visible");
    }
  });
  if (isLoading) {
    dom.error.style.display = "none";
  }
}

function showError(message) {
  dom.error.querySelector("p").textContent = message;
  dom.error.style.display = "block";
  const elementsToHide = [dom.weatherInfo, dom.highlights, dom.forecastSection];
  elementsToHide.forEach((el) => (el.style.visibility = "hidden"));
}

// --- FAVORITES MANAGEMENT ---
function renderFavorites() {
  dom.locationsContainer.innerHTML = "";
  state.favorites.forEach((city) => {
    const btn = document.createElement("button");
    btn.className = "location-btn";
    btn.textContent = city;
    btn.addEventListener("click", () => fetchAllData(city, state.units));
    dom.locationsContainer.appendChild(btn);
  });
}

function updateFavoriteButton() {
  if (!state.currentCity) return;
  const isFavorite = state.favorites.includes(state.currentCity);
  dom.addFavoriteBtn.innerHTML = `<i class="fa-${
    isFavorite ? "solid" : "regular"
  } fa-heart"></i>`;
}

function toggleFavorite() {
  if (!state.currentCity) return;
  const cityIndex = state.favorites.indexOf(state.currentCity);
  if (cityIndex > -1) {
    state.favorites.splice(cityIndex, 1);
  } else {
    if (state.favorites.length < 5) {
      // Optional: limit number of favorites
      state.favorites.push(state.currentCity);
    } else {
      alert("You can only save up to 5 favorite locations.");
    }
  }
  localStorage.setItem("weatherFavorites", JSON.stringify(state.favorites));
  renderFavorites();
  updateFavoriteButton();
}

// --- THEME MANAGEMENT ---
function applyTheme() {
  dom.body.className = state.theme === "dark" ? "dark-theme" : "";
  localStorage.setItem("weatherTheme", state.theme);
  // If a chart exists, re-render it to apply new theme colors
  if (state.currentCity) {
    fetchAllData(state.currentCity, state.units);
  }
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme();
}

// --- EVENT LISTENERS & INITIALIZATION ---
function handleSearch() {
  const city = dom.searchInput.value.trim();
  if (city) {
    fetchAllData(city, state.units);
  }
  dom.searchInput.value = "";
}

dom.searchButton.addEventListener("click", handleSearch);
dom.searchInput.addEventListener(
  "keyup",
  (e) => e.key === "Enter" && handleSearch()
);
dom.unitSwitch.addEventListener("change", () => {
  state.units = dom.unitSwitch.checked ? "imperial" : "metric";
  if (state.currentCity) {
    fetchAllData(state.currentCity, state.units);
  }
});
dom.addFavoriteBtn.addEventListener("click", toggleFavorite);
dom.themeToggleBtn.addEventListener("click", toggleTheme);

// --- APP INITIALIZATION ---
function init() {
  applyTheme();
  renderFavorites();
  // Load the user's last favorite city, or their current location, or a default
  if (state.favorites.length > 0) {
    fetchAllData(state.favorites[state.favorites.length - 1], state.units);
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        const city = data[0]?.name || "Meerut";
        fetchAllData(city, state.units);
      },
      () => {
        fetchAllData("Meerut", state.units); // Geolocation failed
      }
    );
  } else {
    fetchAllData("Meerut", state.units); // Geolocation not supported
  }
}

init();
