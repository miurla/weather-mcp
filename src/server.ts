import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { weatherSchema, weatherToolHandler } from "./weather-tool.js";

// Create an MCP server instance
export const server = new McpServer({
  name: "Weather MCP",
  version: "1.0.0",
  description: "Weather information service using Open-Meteo API",
});

// Register the weather tool
server.tool(
  "get_weather",
  "Get weather information for a specific location",
  weatherSchema,
  weatherToolHandler
);

/**
 * Connect the server to a transport
 */
export async function startServer() {
  // Create a transport using stdio
  const transport = new StdioServerTransport();

  // Connect the server to the transport
  await server.connect(transport);

  // Return a promise that never resolves
  return new Promise<void>(() => {
    process.on("SIGINT", () => {
      console.error("Received SIGINT, shutting down...");
      process.exit(0);
    });
  });
}
