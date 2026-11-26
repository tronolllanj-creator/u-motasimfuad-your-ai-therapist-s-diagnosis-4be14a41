// Writes a funny single-line AI therapist diagnosis to entry.txt
// Output must be 1-200 characters exactly
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

interface Candidate {
  text: string;
  score: number;
}

// Exact candidates as provided — do not modify
const CANDIDATES: Candidate[] = [
  { text: "Patient presents with chronic smart-speaker apologetics — diagnosed: Alexa Judgment Projection Disorder, and how does that make you feel about the toaster?", score: 42 },
  { text: "Shower-argument rehearsal frequency correlates with zero actual confrontations; prognosis: Hydro-Debate Champion, undefeated in imaginary court.", score: 45 },
  { text: "Read-later archive exceeds 3,000 unread articles; assessment: Digital Squirrel Syndrome — hoarding nuts you'll never crack.", score: 44 },
  { text: "Houseplant nomenclature includes 'Steve,' 'Dr. Photosynthesis,' and 'The CEO'; finding: Anthropomorphic Chlorophyll Dependency, mild.", score: 44 },
  { text: "Refrigerator opened 14 times hourly during boredom spikes; diagnosis: Cold-Light Oracle Consultation, answers remain absent.", score: 44 },
  { text: "Narrates daily logistics to canine audience; observation: Canine Executive Board established, approval ratings pending tail data.", score: 45 },
  { text: "Annual planner acquisition ritual: 12 purchased, 0.3 utilized; classification: Stationery Optimism Disorder, recurring January flare.", score: 43 },
  { text: "GPS queried 'are we there yet' 47 times per trip; conclusion: Satellite Reassurance Seeking, recalculating maternal tone.", score: 45 },
  { text: "Browser tabs stabilized at 47 — identity anchored to unread potential; verdict: Tab Hoarding as Personality Architecture, structural.", score: 44 },
  { text: "'Just one more episode' uttered at 2 AM, 312 nights running; diagnosis: Autoplay Enablement Syndrome, season finale denial.", score: 43 }
];

/**
 * Select the best candidate.
 * Sort by score descending; ties broken by longer text first (so candidate #2 wins at 144 chars vs #6 129, #8 121).
 */
function pickBest(candidates: Candidate[]): Candidate {
  return [...candidates].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Tiebreaker: longer text first — ensures candidate #2 (144 chars) beats #6 (129) and #8 (121)
    return b.text.length - a.text.length;
  })[0];
}

function validateLine(line: string): void {
  const len = line.length;
  if (len < 1 || len > 200) {
    throw new Error(`Line length ${len} out of range 1-200`);
  }
  if (line.trim().length === 0) {
    throw new Error('Line is only whitespace');
  }
}

async function main(): Promise<void> {
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? './output';
  await mkdir(outputDir, { recursive: true });

  const winner = pickBest(CANDIDATES);
  validateLine(winner.text);

  const outPath = join(outputDir, 'entry.txt');
  // Write with NO trailing newline
  await writeFile(outPath, winner.text, 'utf8');

  console.log(winner.text);
  console.log(`Characters: ${winner.text.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
