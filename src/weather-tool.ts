import { z } from "zod";
import { geocodeLocation } from "./services/geocoding.js";
import { getWeatherData, formatWeatherResponse } from "./services/weather.js";

// Define input schema for the weather tool
export const weatherSchema = {
  location: z
    .string()
    .min(1)
    .describe("Location name in English (city, address, etc)."),
};

/**
 * Weather tool handler - converts location to coordinates and fetches weather data
 */
export async function weatherToolHandler(args: { location: string }) {
  console.error(
    `Executing weatherToolHandler with args: ${JSON.stringify(args)}`
  );
  try {
    // 1. Convert location name to coordinates
    console.error(`Geocoding location: ${args.location}`);
    const geoData = await geocodeLocation(args.location);

    // 2. Fetch weather data using the coordinates
    const weatherData = await getWeatherData(
      geoData.latitude,
      geoData.longitude
    );

    // 3. Format the response
    const formattedWeather = formatWeatherResponse(weatherData, geoData.name);

    console.error(`Successfully fetched weather for ${args.location}`);
    return {
      content: [
        {
          type: "text" as const,
          text: formattedWeather,
        },
      ],
    };
  } catch (error) {
    let errorMessage = "Failed to retrieve weather data";

    if (error instanceof Error) {
      errorMessage = `Error: ${error.message}`;
    }

    console.error(
      `Failed to fetch weather for ${args.location}: ${errorMessage}`
    );
    return {
      content: [
        {
          type: "text" as const,
          text: errorMessage,
        },
      ],
    };
  }
}
