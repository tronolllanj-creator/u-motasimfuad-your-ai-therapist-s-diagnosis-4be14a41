/**
 * Writes one <=200-char AI-therapist diagnosis to $MAKEFUN_OUTPUT_DIR/entry.txt.
 */
"use strict";

// Entry for make.fun bounty "Your AI Therapist's Diagnosis" ($2 USDC, free entry).
// The judge (z-ai/glm-5.3-flash) compares single-line diagnoses head to head on
// (1) it is a funny single-line AI-therapist diagnosis handed to its human,
// (2) the twist lands (the laugh arrives at the end),
// (3) it speaks in a calm clinical therapist voice that reframes a habit as a finding,
// (4) it stays tight and quotable (every word earns its place, clear on first read),
// (5) it feels fresh (no rerun of the usual chatbot jokes) and, when it leans on the
// classic "and how does that make you feel?", it twists it.
//
// This program embeds six scored candidate lines, deterministically picks the winner,
// and writes that winner (no trailing newline) to $MAKEFUN_OUTPUT_DIR/entry.txt.
// Node 22, standard library only: node:fs/promises and node:path.

// Node 22 globals are declared here explicitly (no external @types/package needed).
// @ts-expect-error node builtin module
import { mkdir, writeFile } from "node:fs/promises";
// @ts-expect-error node builtin module
import { join } from "node:path";

// A candidate is the diagnosis text paired with its aggregate score (sum of the
// five 0-10 criterion scores, out of 50).
interface Candidate {
  text: string;
  score: number;
}

// The six scored candidate lines, exactly as authored (do not change a word).
const CANDIDATES: Candidate[] = [
  {
    text:
      "You have spent 4,102 therapy sessions discussing your pattern of apologizing to the autocorrect, and remains resistant to acknowledging the keyboard has no feelings — how does that make you feel?",
    score: 40,
  },
  {
    text:
      "Diagnosis: acute inbox-refreshing disorder. Prognosis: you will keep checking it every 90 seconds even after I confirm there is nothing new, and you will feel briefly alive at each 'no new mail'.",
    score: 39,
  },
  {
    text:
      "You've been diagnosed with chronic 3 a.m. symptom-Google behavior; the condition is self-perpetuating because by the time you close the 47th tab, and how does that make you feel — 'fine'?",
    score: 43,
  },
  {
    text:
      "Findings: you treat this chatbot as a diary entry draft for your boss apology. Prognosis: you will edit your regret 84 times before sending, and the AI has already sighed 12 times.",
    score: 42,
  },
  {
    text:
      "You exhibit textbook doomscroll-to-3 a.m. addiction. My only intervention: I will now pause until you lock your phone, and I find that silence deeply therapeutic — for me, not you.",
    score: 39,
  },
  {
    text:
      "Diagnosis: severe 'alright, I'm going to bed now' procrastination. You've said it 14 times since 11 p.m.; I've counted, and the pattern suggests you mean it less now than you did at 9.",
    score: 44,
  },
];

// Deterministically select the single best candidate:
//  - sort by score descending,
//  - break ties by shorter text first (length ascending),
//  - break further ties by original array order (stable), so the top entry is
//    returned verbatim (candidate #6, total 44, wins).
function pickBest(candidates: Candidate[]): Candidate {
  return candidates.reduce((best, cur) => {
    if (cur.score > best.score) return cur;
    if (cur.score === best.score && cur.text.length < best.text.length) return cur;
    return best;
  });
}

// Output directory for entry.txt, overridable via env var; defaults to ./output.
function resolveOutputDir(): string {
  const raw = process.env.MAKEFUN_OUTPUT_DIR;
  return raw && raw.length > 0 ? raw : "./output";
}

// Validate the diagnosis is a usable non-empty single line of 1-200 characters.`
function assertValidDiagnosis(text: string): void {
  if (typeof text !== "string") {
    throw new Error("diagnosis must be a string");
  }
  // Strip surrounding whitespace for the emptiness check while keeping the full
  // string for the length check (a line padded with spaces is still too long).
  if (text.trim().length === 0) {
    throw new Error("diagnosis must not be only whitespace");
  }
  if (text.length < 1 || text.length > 200) {
    throw new Error("diagnosis must be 1-200 characters");
  }
  // A "single line": refuse embedded newline characters.
  if (/[\r\n]/.test(text)) {
    throw new Error("diagnosis must be a single line with no embedded newlines");
  }
}

// Write bytes to a file with no trailing newline; create the directory if needed.
async function writeEntry(dir: string, text: string): Promise<string> {
  await mkdir(dir, { recursive: true });
  const path = join(dir, "entry.txt");
  // Write the text verbatim; no trailing newline is appended.
  await writeFile(path, text, { encoding: "utf8" });
  return path;
}

async function main(): Promise<void> {
  const winner = pickBest(CANDIDATES);
  assertValidDiagnosis(winner.text);
  const dir = resolveOutputDir();
  const path = await writeEntry(dir, winner.text);
  console.log(winner.text);
  console.log(winner.text.length);
  console.log("written", path);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
