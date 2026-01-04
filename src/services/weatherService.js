const API_KEY = 'aa46c24e1a38136c2e1e64c298decc3a';

/* CURRENT WEATHER */
export async function getWeather(lat, lon) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );

  const data = await response.json();
  return data;
}

/* NEXT 3 DAYS FORECAST */
export async function getThreeDayForecast(lat, lon) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );

  const data = await response.json();

  if (!data.list) return [];

  // pick one forecast per day (12 PM)
  const daily = data.list.filter(item =>
    item.dt_txt.includes('12:00:00')
  );

  return daily.slice(0, 3).map(item => ({
    date: item.dt_txt.split(' ')[0],
    temp: item.main.temp,
    condition: item.weather[0].main,
  }));
}
