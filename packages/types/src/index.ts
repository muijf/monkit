const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { SourceMapConsumer } = require("source-map");

async function fetchSourceMap(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch source map:", error.message);
    return null;
  }
}

async function downloadSources(sourceMapUrl, outputDir = "./sources") {
  const sourceMapData = await fetchSourceMap(sourceMapUrl);
  if (!sourceMapData) return;

  const consumer = await new SourceMapConsumer(sourceMapData);
  fs.mkdirSync(outputDir, { recursive: true });

  for (const source of consumer.sources) {
    const sourceContent = consumer.sourceContentFor(source, true);
    if (sourceContent) {
      const filePath = path.join(
        outputDir,
        source.replace(/^webpack:\/\//, "")
      );
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, sourceContent);
      console.log(`Saved: ${filePath}`);
    } else {
      console.warn(`No content found for: ${source}`);
    }
  }

  consumer.destroy();
}

const sourceMapUrl = process.argv[2];
if (!sourceMapUrl) {
  console.error("Usage: node script.js <source-map-url>");
  process.exit(1);
}

downloadSources(sourceMapUrl);
