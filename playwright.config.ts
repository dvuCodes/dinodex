import { defineConfig } from "@playwright/test";

const port = process.env.PLAYWRIGHT_PORT ?? "3002";
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  use: {
    baseURL,
  },
  webServer: {
    command: "bun run dev",
    url: baseURL,
    env: {
      ...process.env,
      PORT: port,
      HOSTNAME: "127.0.0.1",
    },
    reuseExistingServer: true,
  },
});
