import type { Lang, SpellingItem, Story } from "./schema";
import storiesEs from "./generated/stories-es.json";
import storiesCa from "./generated/stories-ca.json";
import spellingEs from "./generated/spelling-es.json";
import spellingCa from "./generated/spelling-ca.json";

const STORIES: Record<Lang, Story[]> = {
  es: storiesEs as Story[],
  ca: storiesCa as Story[],
};

const SPELLING: Record<Lang, SpellingItem[]> = {
  es: spellingEs as SpellingItem[],
  ca: spellingCa as SpellingItem[],
};

/** Stories in play order: easier level first, then by id. */
export function getStories(lang: Lang): Story[] {
  return [...STORIES[lang]].sort((a, b) => a.level - b.level || a.id.localeCompare(b.id));
}

export function getStory(id: string): Story | undefined {
  const lang = id.slice(0, 2) as Lang;
  return STORIES[lang]?.find((s) => s.id === id);
}

export function getAllStoryIds(): string[] {
  return [...STORIES.es, ...STORIES.ca].map((s) => s.id);
}

export function getSpelling(lang: Lang): SpellingItem[] {
  return SPELLING[lang];
}
