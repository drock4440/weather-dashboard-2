var cities = [];

var cityEl = document.querySelector("#city-input");
var cityBtn = document.querySelector("#searchBtn");
var cityNameEl = document.querySelector("#cityName");
var apiKey = "1f7d20397ca25f0036bf118fe0d5a789";

// Listens for the value entered by the user

var formHandler = function(event) {

    var city = cityEl.value.trim()
    .toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase()+ s.substring(1))
    .join(' ');

    if (city) {
        coordinates(city)
        cityEl.value = ' ';
    } else {
        alert('Please select a city.')
    };
};

// takes user input and searches for the value inputed

var coordinates = function(chosenCity) {
    var weatherApi = `https://api.openweathermap.org/data/2.5/weather?q=${chosenCity}&units=imperial&appid=${apiKey}`

    fetch(weatherApi).then(function(res) {
        if(res.ok) {
            res.json().then(function(data) {
                var longitude = data.coord['lon'];
                var latitude = data.coord['lat'];
                cityForecast(chosenCity, longitude, latitude);

                if (document.querySelector('.cityList')) {
                    document.querySelector('.cityList').remove();
                }
                saveCity(chosenCity);
                loadCity();
            });
        } else {
            alert(`${res.json}`)
        }
    })
    .catch(function(err) {
        alert('Cannot obtain weather.')
    })
}

// Gives the current city's daily forecast

var cityForecast = function(chosenCity, longitude, latitude) {
    var singleCall = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=imperial&exclude=minutely,hourly,alerts&appid=${apiKey}`;
    fetch(singleCall).then(function(res) {
        if (res.ok) {
            res.json().then(function(data) {

                cityNameEl.textContent = `${chosenCity} (${moment().format("M/D/YYYY")})`; 

                console.log(data)

                currentForecast(data);
                fiveDayForecast(data);
            });
        }
    })
}

var tempDisplay = function(element, temperature){
    var tempEl = document.querySelector(element);
    var text = Math.round(temperature);
    tempEl.textContent = text;
}

var currentForecast = function(forecast) {
    var forecastEl = document.querySelector('.cityForecast');
    forecastEl.classList.remove('hide');

    var weatherIcon = document.querySelector('.weatherIcon');
    var currIcon = forecast.current.weather[0].icon;
    weatherIcon.setAttribute('src', `http://openweathermap.org/img/wn/${currIcon}.png`)

    tempDisplay('#currTemp', forecast.current['temp']);
    tempDisplay('#feelsLike', forecast.current['feels_like']);
    tempDisplay('#currHigh', forecast.daily[0].temp.max);
    tempDisplay('#currLow', forecast.daily[0].temp.min);

var currentCondition = document.querySelector('#currCondition');
currentCondition.textContent = forecast.current.weather[0].description.split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');

var currHumidity = document.querySelector('#currHumidity');
currHumidity.textContent = forecast.current['humidity'];

var currWind = document.querySelector('#currWind');
currWind.textContent = forecast.current['wind_speed'];

var uvi = document.querySelector('#currUvi');
uvi.textContent = forecast.current['uvi'];

}

// Gives chosen city's five day forecast

var fiveDayForecast = function(forecast) {
    for (var i = 1; i < 6; i++) {
        var date = document.querySelector('#date-' +i);
        date.textContent = moment().add(i, 'days').format('MM/DD/YYYY');

        var icon = document.querySelector('#icon-' + i);
        var fDIcon = forecast.daily[i].weather[0].icon;
        icon.setAttribute('src', `http://openweathermap.org/img/wn/${fDIcon}.png`);

        tempDisplay('#temp-' +i, forecast.daily[i].temp.day);
        tempDisplay('#high-' +i, forecast.daily[i].temp.max);
        tempDisplay('#low-' +i, forecast.daily[i].temp.min);

        var span = document.querySelector('#humidity-' + i);
        span.textContent = forecast.daily[i].humidity;
        
    }
}

// creates recent and common searched city buttons for quick access

var saveCity = function(chosenCity) {
    for(var i = 0; i <cities.length; i++) {
        if (chosenCity === cities[i]) {
            cities.splice(i, 1);
        }
    }
    cities.push(chosenCity);
    localStorage.setItem('cities', JSON.stringify(cities));
}
var loadCity = function() {
    cities = JSON.parse(localStorage.getItem('cities'));
        if (!cities) {
            cities = [];
            return false;
        } else if (cities.length > 5) {
            cities.shift();
        }
var history = document.querySelector('#historySearches');
var citiesUl = document.createElement('ul');
citiesUl.className = 'list-group list-group-flush city-list';
history.appendChild(citiesUl)

        for(var i = 0; i < cities.length; i++) {
            var cityItem = document.createElement('btn');
            cityItem.setAttribute('type', 'button');
            cityItem.className = 'list-group-item';
            cityItem.setAttribute('value', cities[i]);
            cityItem.textContent = cities[i];
            citiesUl.prepend(cityItem);
        }
        var cityList = document.querySelector('#historySearches');
        cityList.addEventListener('click', selectRecent)

        var common = document.querySelector('#commonSearches');
        common.addEventListener('click', selectRecent)

    }

    var selectRecent = function(event) {
        var clicked = event.target.getAttribute('value');
        coordinates(clicked);
    }

    loadCity();
    cityBtn.addEventListener('click', formHandler)

    cityEl.addEventListener('keyup', function(event){
        if(event.keyCode === 13) {
            cityBtn.click();
        }
    })