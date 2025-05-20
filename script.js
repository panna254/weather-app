document.getElementById('getWeather').addEventListener('click', () => {
  const city = document.getElementById('city').value.trim();
  if (!city) return;
  fetchWeather(city);
});

// Dark mode toggle
const toggleDarkModeBtn = document.getElementById('toggleDarkMode');
toggleDarkModeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  document.querySelector('.container').classList.toggle('dark-mode');
  toggleDarkModeBtn.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Load dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
  document.querySelector('.container').classList.add('dark-mode');
  toggleDarkModeBtn.classList.add('dark-mode');
}

// Recent searches
function saveRecentSearch(city) {
  let searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
  searches = searches.filter(item => item.toLowerCase() !== city.toLowerCase());
  searches.unshift(city);
  if (searches.length > 5) searches = searches.slice(0, 5);
  localStorage.setItem('recentSearches', JSON.stringify(searches));
  renderRecentSearches();
}

function renderRecentSearches() {
  const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
  const container = document.getElementById('recentSearches');
  if (searches.length === 0) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = '<strong>Recent Searches:</strong> ' + searches.map(city => `<button class="recent-btn">${city}</button>`).join(' ');
  document.querySelectorAll('.recent-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('city').value = btn.textContent;
      document.getElementById('getWeather').click();
    });
  });
}
renderRecentSearches();

// Weather fetch and display
function displayWeather(data) {
  const result = `
    <h2>${data.location.name}, ${data.location.country}</h2>
    <img class="weather-icon" src="https:${data.current.condition.icon}" alt="Weather icon">
    <p>Temperature: ${data.current.temp_c}°C</p>
    <p>Weather: ${data.current.condition.text}</p>
    <p>Humidity: ${data.current.humidity}%</p>
  `;
  document.getElementById('weatherResult').innerHTML = result;
}

function displayForecast(forecast) {
  const days = forecast.forecastday;
  const html = days.map(day => `
    <div class="forecast-day">
      <div>${day.date}</div>
      <img class="weather-icon" src="https:${day.day.condition.icon}" alt="Weather icon">
      <div>${day.day.avgtemp_c}°C</div>
      <div>${day.day.condition.text}</div>
    </div>
  `).join('');
  document.getElementById('forecast').innerHTML = html;
}

function fetchWeather(city) {
  const apiKey = 'f4686cae423943bbac4195200252005'; // Replace with your WeatherAPI key
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then(data => {
      displayWeather(data);
      saveRecentSearch(city);
      fetchForecast(city);
    })
    .catch(error => {
      document.getElementById('weatherResult').innerHTML = `<p>${error.message}</p>`;
      document.getElementById('forecast').innerHTML = '';
    });
}

function fetchForecast(city) {
  const apiKey = 'f4686cae423943bbac4195200252005'; // Replace with your WeatherAPI key
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=5&aqi=no&alerts=no`;
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Forecast not found");
      }
      return response.json();
    })
    .then(data => {
      displayForecast(data.forecast);
    })
    .catch(error => {
      document.getElementById('forecast').innerHTML = `<p>${error.message}</p>`;
    });
}