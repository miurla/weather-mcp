import fetch from "node-fetch";

interface GeocodingResult {
  latitude: number;
  longitude: number;
  name: string;
}

interface OpenMeteoGeocodingResponse {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
  }>;
}

/**
 * Convert a location name to coordinates using Open-Meteo Geocoding API
 */
export async function geocodeLocation(
  location: string
): Promise<GeocodingResult> {
  const encodedLocation = encodeURIComponent(location);
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodedLocation}&count=1&language=en&format=json`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Geocoding API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as OpenMeteoGeocodingResponse;

    if (!data.results || data.results.length === 0) {
      throw new Error(`No results found for location: ${location}`);
    }

    const result = data.results[0];
    const locationName = [result.name, result.admin1, result.country]
      .filter(Boolean)
      .join(", ");

    return {
      latitude: result.latitude,
      longitude: result.longitude,
      name: locationName,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Geocoding failed: ${error.message}`);
    }
    throw new Error("Geocoding failed with an unknown error");
  }
}
