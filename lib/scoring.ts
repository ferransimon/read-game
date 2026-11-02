import type { SpellingItem, Story } from "./schema";

/** Words per minute, rounded. */
export function wordsPerMinute(wordCount: number, ms: number): number {
  if (ms <= 0) return 0;
  return Math.round(wordCount / (ms / 60000));
}

export function formatTime(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s} s`;
}

/** First story (in the given play order) not present in `done`. */
export function nextStory(stories: Story[], done: Set<string>): Story | undefined {
  return stories.find((s) => !done.has(s.id));
}

/** Stars (0-3) for a comprehension score out of 5. */
export function starsFor(score: number, total = 5): number {
  const ratio = score / total;
  if (ratio === 1) return 3;
  if (ratio >= 0.6) return 2;
  if (ratio >= 0.4) return 1;
  return 0;
}

export type ItemStats = Record<string, { ok: number; fail: number }>;

/**
 * Picks a spelling round: favours unseen items and categories with more mistakes,
 * at most `perCategory` items per category so the round stays varied.
 */
export function pickSpellingRound(
  items: SpellingItem[],
  stats: ItemStats,
  size = 10,
  random: () => number = Math.random,
): SpellingItem[] {
  const catErr: Record<string, { ok: number; fail: number }> = {};
  for (const it of items) {
    const s = stats[it.id];
    if (!s) continue;
    const c = (catErr[it.category] ??= { ok: 0, fail: 0 });
    c.ok += s.ok;
    c.fail += s.fail;
  }
  const categories = new Set(items.map((i) => i.category)).size || 1;
  const perCategory = Math.max(1, Math.ceil(size / categories));

  const scored = items.map((it) => {
    const s = stats[it.id];
    const c = catErr[it.category];
    const catRate = c && c.ok + c.fail > 0 ? c.fail / (c.ok + c.fail) : 0;
    let score = random() * 2;
    if (!s) score += 2;
    else {
      score += s.fail > s.ok ? 1.5 : 0;
      score -= s.ok > 0 && s.fail === 0 ? 1.5 : 0;
    }
    score += catRate * 3;
    return { it, score };
  });
  scored.sort((a, b) => b.score - a.score);

  const picked: SpellingItem[] = [];
  const perCat: Record<string, number> = {};
  for (const { it } of scored) {
    if (picked.length >= size) break;
    if ((perCat[it.category] ?? 0) >= perCategory) continue;
    perCat[it.category] = (perCat[it.category] ?? 0) + 1;
    picked.push(it);
  }
  // Fill up if categories were too few
  for (const { it } of scored) {
    if (picked.length >= size) break;
    if (!picked.includes(it)) picked.push(it);
  }
  return picked;
}

export function shuffle<T>(arr: T[], random: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
