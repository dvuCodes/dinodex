import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { join } from "node:path";
import next from "next";

const port = parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOSTNAME || "0.0.0.0";
const dev = process.env.NODE_ENV !== "production";
const dir = process.cwd();

const app = next({
  dev,
  dir,
  hostname,
  port,
  webpack: true,
});

const handle = app.getRequestHandler();

const PUBLIC_RASTER_ROUTE = /^\/dinos\/\d{3}\/(?:adult|juvenile|hatchling)(?:-thumb)?\.(?:webp|png)$/;

function getContentType(pathname) {
  return pathname.endsWith(".png") ? "image/png" : "image/webp";
}

async function serveRasterAsset(pathname, req, res) {
  const filePath = join(dir, "public", ...pathname.split("/").filter(Boolean));

  try {
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      res.writeHead(404).end();
      return true;
    }

    res.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Length": fileStat.size,
      "Content-Type": getContentType(pathname),
    });

    if (req.method === "HEAD") {
      res.end();
      return true;
    }

    createReadStream(filePath).pipe(res);
    return true;
  } catch {
    res.writeHead(404).end();
    return true;
  }
}

app.prepare().then(() => {
  createServer(async (req, res) => {
    const requestUrl = req.url || "/";
    const pathname = new URL(requestUrl, `http://${req.headers.host || "localhost"}`).pathname;

    if ((req.method === "GET" || req.method === "HEAD") && PUBLIC_RASTER_ROUTE.test(pathname)) {
      const handled = await serveRasterAsset(pathname, req, res);

      if (handled) {
        return;
      }
    }

    handle(req, res);
  }).listen(port, hostname, () => {
    console.log(`> Dev server listening at http://${hostname}:${port}`);
  });
});
