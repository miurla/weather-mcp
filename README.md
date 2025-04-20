# MCP Weather Server

A Model Context Protocol (MCP) server that provides weather information using the Open-Meteo API.

## Features

- Get current weather and forecasts for any location
- Location-to-coordinates conversion using Open-Meteo Geocoding API
- 7-day forecast with detailed weather information
- Formatted human-readable responses with emojis

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/miurla/mcp-weather.git
   cd mcp-weather
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Build the project:
   ```
   npm run build
   ```

## Usage

### Running the server

Start the MCP server:

```
npm start
```

The server runs on stdio and can be connected to MCP hosts like Claude for Desktop.

### Configuring Claude for Desktop

To use this MCP server with Claude for Desktop:

1. Open Claude for Desktop configuration file:

   - macOS/Linux: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the weather server to the configuration:

   ```json
   {
     "mcpServers": [
       {
         "name": "Weather",
         "command": "/path/to/your/project/mcp-weather/build/index.js"
       }
     ]
   }
   ```

3. Restart Claude for Desktop

### Using the weather tool

In Claude for Desktop, you can ask for weather information by saying:

- "What's the weather like in Tokyo?"
- "Show me the forecast for New York"
- "Tell me about the weather in Paris"

## API References

This project uses the following APIs:

- [Open-Meteo Weather API](https://open-meteo.com/) - Free, open-source weather API
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) - Location to coordinates conversion

## License

MIT
