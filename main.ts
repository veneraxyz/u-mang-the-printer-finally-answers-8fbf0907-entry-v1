import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// The printer finally answers: one line, in its own voice.
const LINE =
  "Error E-47 is me choking on your paper, the thump was me kicking the tray, and yes, I printed it twice — nobody ever reads the first copy.";

function validate(line: string): void {
  if (line.length === 0 || line.trim().length === 0) {
    throw new Error("line must be non-blank");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("line must be exactly one line");
  }
  if (line.length < 1 || line.length > 240) {
    throw new Error(`line must be 1-240 chars, got ${line.length}`);
  }
  for (const ch of line) {
    const code = ch.codePointAt(0) as number;
    if (code < 0x20 || code === 0x7f) {
      throw new Error(`control character U+${code.toString(16)} not allowed`);
    }
  }
}

function main(): void {
  validate(LINE);
  const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "entry.txt");
  const payload = LINE + "\n";
  writeFileSync(outPath, payload, "utf8");
  // Read-back guard: what landed on disk must be byte-identical to what
  // was written, so a truncated or mangled entry can never pass silently.
  const onDisk = readFileSync(outPath, "utf8");
  if (onDisk !== payload) {
    throw new Error("read-back mismatch: entry.txt differs from written line");
  }
}

main();
