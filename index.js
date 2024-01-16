const apiKey = '19489d2909dbb2f5c069fecee4cbb60c';

document.getElementById('search-button').addEventListener('click', function() {
    const city = document.getElementById('city-input').value;
    if (city) {
        getCoordinates(city);
    }
});

function getCoordinates(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`City not found: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            getWeather(data.coord.lat, data.coord.lon, city);
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message);
        });
}

function getWeather(lat, lon, city) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateUI(data, city);
            updateHistory(city);
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error fetching weather data.');
        });
}

function updateUI(weatherData, city) {
    document.getElementById('city-name').textContent = city;
    document.getElementById('current-date').textContent = new Date().toLocaleDateString();
    document.getElementById('temperature').textContent = `${weatherData.list[0].main.temp} °C`;
    document.getElementById('humidity').textContent = `${weatherData.list[0].main.humidity}%`;
    document.getElementById('wind').textContent = `${weatherData.list[0].wind.speed} KPH`;

    const forecastContainer = document.getElementById('forecast-weather');
    forecastContainer.innerHTML = ''; // Clear previous forecasts

    for (let i = 0; i < weatherData.list.length; i += 8) {
        const dayData = weatherData.list[i];
        const date = new Date(dayData.dt_txt).toLocaleDateString();
        const temp = dayData.main.temp;
        const humidity = dayData.main.humidity;
        const wind = dayData.wind.speed;
        const iconUrl = `http://openweathermap.org/img/w/${dayData.weather[0].icon}.png`;

        const forecastDiv = document.createElement('div');
        forecastDiv.classList.add('forecast-day');
        forecastDiv.innerHTML = `
            <p><strong>${date}</strong></p>
            <img src="${iconUrl}" alt="${dayData.weather[0].description}" class="weather-icon">
            <p>Temp: <span class="forecast-temp">${temp} °C</span></p>
            <p>Wind: <span class="forecast-wind">${wind} KPH</span></p>
            <p>Humidity: <span class="forecast-humidity">${humidity} %</</span></p>`;
            forecastContainer.appendChild(forecastDiv);
        }
    }
    
    function updateHistory(city) {
        let history = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
        if (!history.includes(city)) {
            history.push(city);
            localStorage.setItem('weatherSearchHistory', JSON.stringify(history));
        }
    
        const historyContainer = document.getElementById('search-history');
        historyContainer.innerHTML = ''; // Clear previous history
    
        history.forEach(savedCity => {
            const historyDiv = document.createElement('div');
            historyDiv.textContent = savedCity;
            historyDiv.addEventListener('click', () => getCoordinates(savedCity));
            historyContainer.appendChild(historyDiv);
        });
    }
    
    // Load any saved history from localStorage on page load
    window.onload = function() {
        const savedHistory = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];
        savedHistory.forEach(city => {
            updateHistory(city);
        });
    }