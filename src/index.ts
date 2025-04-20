#!/usr/bin/env node
import { startServer } from "./server.js";

/**
 * Start the MCP weather server
 */
async function main() {
  try {
    await startServer();
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

// Run the main function
main();
