import fetch from "node-fetch";

export interface WeatherData {
  current: {
    temperature: number;
    windSpeed: number;
    windDirection: number;
    weatherCode: number;
    isDay: number;
    time: string;
    relativeHumidity: number;
  };
  daily: {
    time: string[];
    weatherCode: number[];
    temperatureMax: number[];
    temperatureMin: number[];
    sunrise: string[];
    sunset: string[];
    precipitation: number[];
  };
  latitude: number;
  longitude: number;
}

interface OpenMeteoWeatherResponse {
  latitude: number;
  longitude: number;
  current: {
    temperature_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    weather_code: number;
    is_day: number;
    time: string;
    relative_humidity_2m: number;
  };
  daily: {
    time: string[];
    weather_code: string[] | number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    precipitation_sum: number[];
  };
}

// Map weather codes to human-readable descriptions
const weatherCodeMap: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

/**
 * Get weather data for specific coordinates
 */
export async function getWeatherData(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");

  url.searchParams.append("latitude", latitude.toString());
  url.searchParams.append("longitude", longitude.toString());
  url.searchParams.append(
    "current",
    "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day"
  );
  url.searchParams.append(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum"
  );
  url.searchParams.append("timezone", "auto");

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        `Weather API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as OpenMeteoWeatherResponse;

    // Transform API response to our internal format
    return {
      current: {
        temperature: data.current.temperature_2m,
        windSpeed: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,
        weatherCode: data.current.weather_code,
        isDay: data.current.is_day,
        time: data.current.time,
        relativeHumidity: data.current.relative_humidity_2m,
      },
      daily: {
        time: data.daily.time,
        weatherCode: data.daily.weather_code.map((code) => Number(code)),
        temperatureMax: data.daily.temperature_2m_max,
        temperatureMin: data.daily.temperature_2m_min,
        sunrise: data.daily.sunrise,
        sunset: data.daily.sunset,
        precipitation: data.daily.precipitation_sum,
      },
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Weather data fetch failed: ${error.message}`);
    }
    throw new Error("Weather data fetch failed with an unknown error");
  }
}

/**
 * Format weather data into a readable text format
 */
export function formatWeatherResponse(
  weatherData: WeatherData,
  locationName: string
): string {
  const current = weatherData.current;
  const daily = weatherData.daily;

  // Get weather description from code
  const currentWeatherDesc = weatherCodeMap[current.weatherCode] || "Unknown";

  // Format wind direction as compass direction
  const windDirectionText = getWindDirection(current.windDirection);

  // Format current weather
  const currentWeather = [
    `Weather for ${locationName}`,
    "",
    `🌡️ Current Temperature: ${current.temperature}°C`,
    `💧 Humidity: ${current.relativeHumidity}%`,
    `🌤️ Conditions: ${currentWeatherDesc}`,
    `💨 Wind: ${current.windSpeed} km/h from ${windDirectionText}`,
    `⏰ Local time: ${formatDateTime(current.time)}`,
    "",
  ].join("\n");

  // Format 7-day forecast
  const forecastLines = daily.time
    .map((time, index) => {
      const date = new Date(time);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const weatherDesc = weatherCodeMap[daily.weatherCode[index]] || "Unknown";

      return [
        `${dayName} (${time.split("T")[0]}):`,
        `  🌡️ Temperature: ${daily.temperatureMin[index]}°C to ${daily.temperatureMax[index]}°C`,
        `  🌤️ Conditions: ${weatherDesc}`,
        `  ☔ Precipitation: ${daily.precipitation[index]} mm`,
        `  🌅 Sunrise: ${formatTime(daily.sunrise[index])}`,
        `  🌆 Sunset: ${formatTime(daily.sunset[index])}`,
      ].join("\n");
    })
    .join("\n\n");

  return `${currentWeather}Forecast:\n\n${forecastLines}`;
}

/**
 * Convert wind direction in degrees to compass direction
 */
function getWindDirection(degrees: number): string {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Format ISO datetime string to readable format
 */
function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format ISO time string to readable format
 */
function formatTime(isoString: string): string {
  const time = isoString.split("T")[1];
  return time.substring(0, 5);
}
