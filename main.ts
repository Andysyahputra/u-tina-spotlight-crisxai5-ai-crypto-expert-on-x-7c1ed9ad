import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUTPUT_DIR = "/output";
const POST_FILENAME = "POST.json";

function resolvePaths(): { source: string; destination: string } {
  const repoRoot = dirname(fileURLToPath(import.meta.url));
  return {
    source: join(repoRoot, POST_FILENAME),
    destination: join(OUTPUT_DIR, POST_FILENAME),
  };
}

async function loadPost(source: string): Promise<Buffer> {
  const raw = await readFile(source);
  // Validate that the file is a JSON object with a url string, without
  // altering its bytes: the copy written to /output is the raw input.
  const parsed: unknown = JSON.parse(raw.toString("utf-8"));
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed) ||
    typeof (parsed as { url?: unknown }).url !== "string"
  ) {
    throw new Error("POST.json must be a JSON object with a string url field");
  }
  return raw;
}

async function copyPost(): Promise<void> {
  const { source, destination } = resolvePaths();
  await mkdir(OUTPUT_DIR, { recursive: true });
  const raw = await loadPost(source);
  await writeFile(destination, raw);
  console.log(`Copied ${source} to ${destination}`);
}

await copyPost();
