import { describe, expect, it } from "vitest";
import { formatTime, nextStory, pickSpellingRound, starsFor, wordsPerMinute } from "../lib/scoring";
import { cleanToken, countWords, type SpellingItem, type Story } from "../lib/schema";

const story = (id: string, level: 1 | 2 = 1) => ({ id, level }) as Story;

describe("wordsPerMinute", () => {
  it("computes words per minute", () => {
    expect(wordsPerMinute(120, 60_000)).toBe(120);
    expect(wordsPerMinute(100, 120_000)).toBe(50);
    expect(wordsPerMinute(100, 0)).toBe(0);
  });
});

describe("formatTime", () => {
  it("formats seconds and minutes", () => {
    expect(formatTime(42_300)).toBe("42 s");
    expect(formatTime(75_000)).toBe("1:15");
  });
});

describe("nextStory", () => {
  it("returns the first story not done", () => {
    const list = [story("es-001"), story("es-002"), story("es-003")];
    expect(nextStory(list, new Set(["es-001"]))?.id).toBe("es-002");
    expect(nextStory(list, new Set(["es-001", "es-002", "es-003"]))).toBeUndefined();
  });
});

describe("starsFor", () => {
  it("maps scores to 0-3 stars", () => {
    expect([0, 1, 2, 3, 4, 5].map((s) => starsFor(s))).toEqual([0, 0, 1, 2, 2, 3]);
  });
});

describe("countWords / cleanToken", () => {
  it("ignores punctuation-only tokens", () => {
    expect(countWords("Hola, ¿qué tal? — muy bien.")).toBe(5);
    expect(cleanToken("«plalla,»")).toBe("plalla");
    expect(cleanToken("cel·la.")).toBe("cel·la");
  });
});

describe("pickSpellingRound", () => {
  const items: SpellingItem[] = Array.from({ length: 40 }, (_, i) => ({
    id: `es-s-${String(i).padStart(3, "0")}`,
    type: "choose",
    category: ["b-v", "g-j", "h", "ll-y"][i % 4],
    level: 1,
    sentence: "___",
    options: ["a", "b"],
    answer: 0,
  }));

  it("returns 10 unique items spread across categories", () => {
    const round = pickSpellingRound(items, {}, 10);
    expect(round).toHaveLength(10);
    expect(new Set(round.map((r) => r.id)).size).toBe(10);
    const perCat = round.reduce<Record<string, number>>((a, r) => ((a[r.category] = (a[r.category] ?? 0) + 1), a), {});
    expect(Math.max(...Object.values(perCat))).toBeLessThanOrEqual(3);
  });

  it("prioritises the category with more mistakes", () => {
    const stats = Object.fromEntries(
      items.map((it) => [it.id, it.category === "h" ? { ok: 0, fail: 2 } : { ok: 2, fail: 0 }]),
    );
    const round = pickSpellingRound(items, stats, 10, () => 0.5);
    expect(round.filter((r) => r.category === "h")).toHaveLength(3);
    expect(round[0].category).toBe("h");
  });
});
