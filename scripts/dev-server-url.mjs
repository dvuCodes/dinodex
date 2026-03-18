const WILDCARD_HOSTNAMES = new Set(["0.0.0.0", "::"]);

export function getDevServerUrl(hostname, port) {
  const displayHostname = WILDCARD_HOSTNAMES.has(hostname) ? "localhost" : hostname;

  return `http://${displayHostname}:${port}`;
}
