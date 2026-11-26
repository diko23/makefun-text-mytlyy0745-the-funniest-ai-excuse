import * as fs from "node:fs";
import * as path from "node:path";

const MAX_ENTRY_CHARS: number = 200;
const ENTRY_FILENAME: string = "entry.txt";
const DEFAULT_OUTPUT_DIR: string = "/output";

const ENTRY_LINE: string =
  "I didn't fail; your prompt's vibes clashed with Mercury in retrograde, so I proactively deleted the output to protect my token-life balance.";

function validateEntry(text: string): void {
  if (/[\r\n]/.test(text)) {
    throw new Error("Entry must be a single line.");
  }
  if (text.trim().length === 0) {
    throw new Error("Entry must not be empty or whitespace-only.");
  }
  const charCount: number = [...text].length;
  if (charCount < 1 || charCount > MAX_ENTRY_CHARS) {
    throw new Error(
      `Entry length ${charCount} exceeds allowed range 1..${MAX_ENTRY_CHARS}.`,
    );
  }
}

function resolveOutputDir(env: NodeJS.ProcessEnv): string {
  const raw: string | undefined = env.MAKEFUN_OUTPUT_DIR;
  if (raw === undefined) {
    return DEFAULT_OUTPUT_DIR;
  }
  const trimmed: string = raw.trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_OUTPUT_DIR;
}

function writeEntryFile(outputDir: string, entryText: string): void {
  const outputPath: string = path.join(outputDir, ENTRY_FILENAME);
  const expectedBytes: Buffer = Buffer.from(entryText, "utf8");

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, expectedBytes, { mode: 0o644 });
  fs.chmodSync(outputPath, 0o644);

  const actualBytes: Buffer = fs.readFileSync(outputPath);
  if (Buffer.compare(actualBytes, expectedBytes) !== 0) {
    throw new Error("Written entry.txt bytes do not match expected UTF-8 payload.");
  }
}

function main(): void {
  validateEntry(ENTRY_LINE);
  const outputDir: string = resolveOutputDir(process.env);
  writeEntryFile(outputDir, ENTRY_LINE);
}

try {
  main();
} catch (error: unknown) {
  const message: string =
    error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}
