import { describe, expect, test } from "bun:test";
import { getDevServerUrl } from "./dev-server-url.mjs";

describe("getDevServerUrl", () => {
  test("shows localhost when the server binds to all interfaces", () => {
    expect(getDevServerUrl("0.0.0.0", 3000)).toBe("http://localhost:3000");
  });

  test("shows the configured hostname for concrete host bindings", () => {
    expect(getDevServerUrl("127.0.0.1", 3000)).toBe("http://127.0.0.1:3000");
    expect(getDevServerUrl("dinodex.local", 3000)).toBe("http://dinodex.local:3000");
  });
});
