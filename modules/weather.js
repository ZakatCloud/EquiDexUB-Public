const https = require('https');

function WeatherModule(client, bot) {
    this.client = client;
    this.bot = bot;
    this.name = 'weather';
    this.cities = {
      'москва': { lat: 55.75, lon: 37.62, name: 'Москва' },
      'санкт-петербург': { lat: 59.93, lon: 30.31, name: 'Санкт-Петербург' },
      'екатеринбург': { lat: 56.83, lon: 60.58, name: 'Екатеринбург' },
      'новосибирск': { lat: 55.04, lon: 82.93, name: 'Новосибирск' },
      'казань': { lat: 55.78, lon: 49.12, name: 'Казань' },
      'нижний новгород': { lat: 56.30, lon: 43.94, name: 'Нижний Новгород' },
      'челябинск': { lat: 55.15, lon: 61.43, name: 'Челябинск' },
      'самара': { lat: 53.19, lon: 50.14, name: 'Самара' },
      'омск': { lat: 54.99, lon: 73.37, name: 'Омск' },
      'ростов-на-дону': { lat: 47.23, lon: 39.72, name: 'Ростов-на-Дону' },
      'уфа': { lat: 54.73, lon: 55.96, name: 'Уфа' },
      'краснодар': { lat: 45.04, lon: 38.98, name: 'Краснодар' },
      'воронеж': { lat: 51.67, lon: 39.19, name: 'Воронеж' },
      'пермь': { lat: 58.01, lon: 56.24, name: 'Пермь' },
      'волгоград': { lat: 48.72, lon: 44.50, name: 'Волгоград' },
      'алматы': { lat: 43.24, lon: 76.94, name: 'Алматы' },
      'ташкент': { lat: 41.29, lon: 69.24, name: 'Ташкент' },
      'киев': { lat: 50.45, lon: 30.52, name: 'Киев' },
      'минск': { lat: 53.90, lon: 27.56, name: 'Минск' },
      'лондон': { lat: 51.50, lon: -0.12, name: 'Лондон' },
      'париж': { lat: 48.85, lon: 2.35, name: 'Париж' },
      'берлин': { lat: 52.52, lon: 13.40, name: 'Берлин' },
      'нью-йорк': { lat: 40.71, lon: -74.01, name: 'Нью-Йорк' },
      'токио': { lat: 35.68, lon: 139.69, name: 'Токио' }
    };
}

WeatherModule.prototype.getCommands = function() {
    return ['погода', 'weather'];
};

WeatherModule.prototype.handleMessage = async function(msg, text) {
    if (text.startsWith('погода ') || text.startsWith('weather ')) {
        const city = text.replace(/^(погода |weather )/, '').trim();
        await this.getWeather(msg, city);
        return true;
    }
    if (text === 'погода' || text === 'weather') {
      await this.showHelp(msg);
      return true;
    }
    return false;
};

WeatherModule.prototype.showHelp = async function(msg) {
  const cityList = Object.keys(this.cities).slice(0, 10).join(', ');
  await this.client.sendMessage(msg.chatId, {
    message: `🌤 **Погода**\n\n` +
      `Использование: \`погода город\`\n\n` +
      `Города: ${cityList}...`,
    parseMode: 'markdown',
    replyTo: msg.id
  });
};

WeatherModule.prototype.getWeather = async function(msg, city) {
    try {
        const loading = await this.client.sendMessage(msg.chatId, {
            message: '🌤 Загружаю погоду...',
            replyTo: msg.id
        });

        const cityLower = city.toLowerCase();
        let coords = this.cities[cityLower];

        if (!coords) {
          coords = await this.geocodeCity(city);
        }

        if (!coords) {
            await loading.edit({ text: `❌ Город "${city}" не найден` });
            return;
        }

        const weatherData = await this.fetchWeather(coords.lat, coords.lon);
        
        await loading.edit({
            text: weatherData,
            parseMode: 'markdown'
        });

    } catch (error) {
        console.log('Weather error:', error.message);
        await this.client.sendMessage(msg.chatId, {
            message: '❌ Ошибка получения погоды',
            replyTo: msg.id
        });
    }
};

WeatherModule.prototype.geocodeCity = function(city) {
    return new Promise((resolve) => {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ru&format=json`;
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.results && result.results.length > 0) {
                        resolve({
                            lat: result.results[0].latitude,
                            lon: result.results[0].longitude,
                            name: result.results[0].name
                        });
                    } else {
                        resolve(null);
                    }
                } catch {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
};

WeatherModule.prototype.fetchWeather = function(lat, lon) {
    return new Promise((resolve) => {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m&timezone=auto`;
        
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.current) {
                        resolve(this.formatWeather(result.current));
                    } else {
                        resolve('❌ Данные о погоде не получены');
                    }
                } catch {
                    resolve('❌ Ошибка обработки данных');
                }
            });
        }).on('error', () => resolve('❌ Ошибка соединения'));
    });
};

WeatherModule.prototype.formatWeather = function(current) {
    const temp = Math.round(current.temperature_2m);
    const feelsLike = Math.round(current.apparent_temperature);
    const humidity = current.relative_humidity_2m;
    const pressure = Math.round(current.pressure_msl * 0.75);
    const windSpeed = current.wind_speed_10m;
    const windDir = this.getWindDirection(current.wind_direction_10m);
    const weatherDesc = this.getWeatherDescription(current.weather_code);

    let text = `🌤 **Погода**\n\n`;
    text += `• Температура: ${temp}°C\n`;
    text += `• Ощущается как: ${feelsLike}°C\n`;
    text += `• Влажность: ${humidity}%\n`;
    text += `• Давление: ${pressure} мм рт.ст.\n`;
    text += `• Ветер: ${windSpeed} м/с ${windDir}\n`;
    text += `• Состояние: ${weatherDesc}\n`;
    
    if (current.precipitation > 0) {
      text += `• Осадки: ${current.precipitation}mm\n`;
    }
    
    text += `\n📡 Источник: Open-Meteo.com`;

    return text;
};

WeatherModule.prototype.getWeatherDescription = function(code) {
    const weatherCodes = {
        0: '☀️ Ясно',
        1: '🌤 Преимущественно ясно',
        2: '⛅️ Переменная облачность',
        3: '☁️ Пасмурно',
        45: '🌫 Туман',
        48: '🌫 Инейный туман',
        51: '🌦 Легкая морось',
        53: '🌦 Умеренная морось',
        55: '🌦 Сильная морось',
        61: '🌧 Небольшой дождь',
        63: '🌧 Умеренный дождь',
        65: '🌧 Сильный дождь',
        71: '❄️ Небольшой снег',
        73: '❄️ Умеренный снег',
        75: '❄️ Сильный снег',
        77: '🌨 Снежные зерна',
        80: '🌦 Небольшой ливень',
        81: '🌦 Умеренный ливень',
        82: '🌦 Сильный ливень',
        95: '⛈ Гроза',
        96: '⛈ Гроза с градом',
        99: '⛈ Сильная гроза'
    };
    
    return weatherCodes[code] || `Код: ${code}`;
};

WeatherModule.prototype.getWindDirection = function(degrees) {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
};

module.exports = WeatherModule;