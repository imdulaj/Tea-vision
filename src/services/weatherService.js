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

/* 🕒 HOURLY FORECAST (Next 24 Hours) */
export async function getHourlyForecast(lat, lon) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );

  const data = await response.json();

  if (!data.list) return [];

  // Return next 8 intervals (3 hours * 8 = 24 hours)
  return data.list.slice(0, 8).map(item => {
    const date = new Date(item.dt * 1000);
    // Format: "12 PM"
    const hours = date.getHours();
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = hours % 12 || 12; // '0' becomes '12'

    return {
      time: `${formattedHour} ${period}`,
      temp: Math.round(item.main.temp),
      icon: item.weather[0].main, // Maps to WeatherIcon condition
    };
  });
}
