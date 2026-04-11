/**
 * Fuzzy matching utility.
 * Returns a relevance score (0 = no match, higher = better match).
 * Prioritises: exact IATA match → prefix → substring → word boundary → subsequence.
 */

/**
 * Normalise a string for comparison: lowercase, collapse whitespace.
 */
function normalise(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

/**
 * Score `query` against a single `target` string.
 * Returns 0 if no match, otherwise a positive integer (higher = better).
 */
export function fuzzyScore(query: string, target: string): number {
  if (!query || !target) return 0;

  const q = normalise(query);
  const t = normalise(target);

  if (t === q) return 1000; // exact
  if (t.startsWith(q)) return 900; // leading prefix
  if (t.includes(q)) return 800; // substring

  // Word-boundary prefix: any word in target starts with query
  const words = t.split(/[\s\-/]+/);
  if (words.some((w) => w.startsWith(q))) return 700;
  if (words.some((w) => w.includes(q))) return 600;

  // Subsequence: every char in query appears in order in target
  let qi = 0;
  let consecutive = 0;
  let score = 0;
  let lastMatch = -1;

  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      if (lastMatch === i - 1) consecutive++;
      score += 1 + consecutive;
      lastMatch = i;
      qi++;
    }
  }

  if (qi < q.length) return 0; // not all chars matched

  // Normalise subsequence score
  return Math.max(1, Math.round((score / q.length) * 10));
}

/**
 * Score `query` against multiple target strings.
 * Returns the best (highest) score across all targets.
 */
export function fuzzyScoreMulti(query: string, targets: string[]): number {
  let best = 0;
  for (const t of targets) {
    const s = fuzzyScore(query, t);
    if (s > best) best = s;
  }
  return best;
}
