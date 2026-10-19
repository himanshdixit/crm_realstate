import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const directory = path.resolve(".next/static/chunks");
const totalBudget = 1_750_000;
const chunkBudget = 350_000;

async function javascriptFiles(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? javascriptFiles(path.join(folder, entry.name)) : Promise.resolve(entry.name.endsWith(".js") ? [path.join(folder, entry.name)] : [])));
  return nested.flat();
}

const files = await javascriptFiles(directory);
const sizes = await Promise.all(files.map(async (file) => ({ file: path.relative(directory, file), bytes: (await stat(file)).size })));
const total = sizes.reduce((sum, item) => sum + item.bytes, 0);
const largest = sizes.reduce((current, item) => item.bytes > current.bytes ? item : current, { file: "none", bytes: 0 });

process.stdout.write(`JavaScript chunks: ${files.length}; total: ${total} bytes; largest: ${largest.file} (${largest.bytes} bytes)\n`);
if (total > totalBudget) throw new Error(`JavaScript total exceeds ${totalBudget} byte budget`);
if (largest.bytes > chunkBudget) throw new Error(`Chunk ${largest.file} exceeds ${chunkBudget} byte budget`);
