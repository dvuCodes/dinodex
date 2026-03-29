import sharp from "sharp";
import { resolveSharpRawChannels, stripEdgeConnectedNearWhiteBackground } from "./edit-art-transparent";

function parseArgs(argv: string[]) {
  const inputIndex = argv.indexOf("--input");
  const outputIndex = argv.indexOf("--output");
  const inputPath = inputIndex >= 0 ? argv[inputIndex + 1] : null;
  const outputPath = outputIndex >= 0 ? argv[outputIndex + 1] : null;

  if (!inputPath || !outputPath) {
    console.log("Usage:");
    console.log("  bun run scripts/remove-near-white-background.ts --input in.jpg --output out.png");
    process.exit(1);
  }

  return { inputPath, outputPath };
}

async function main() {
  const { inputPath, outputPath } = parseArgs(process.argv.slice(2));
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const stripped = stripEdgeConnectedNearWhiteBackground(data, info.width, info.height, info.channels);

  await sharp(Buffer.from(stripped), {
    raw: {
      width: info.width,
      height: info.height,
      channels: resolveSharpRawChannels(info.channels),
    },
  })
    .png()
    .toFile(outputPath);

  console.log(`Wrote ${outputPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
