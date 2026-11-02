import { z } from "zod";

export const LANGS = ["es", "ca"] as const;
export type Lang = (typeof LANGS)[number];

export const GENRES = [
  "carta",
  "cuento",
  "fantasia",
  "noticia",
  "fabula",
  "diario",
  "receta",
  "instrucciones",
  "poema",
] as const;
export type Genre = (typeof GENRES)[number];

const ChoiceQuestion = z.object({
  type: z.literal("choice"),
  q: z.string().min(5),
  options: z.array(z.string().min(1)).length(3),
  answer: z.number().int().min(0).max(2),
});

const TfQuestion = z.object({
  type: z.literal("tf"),
  q: z.string().min(5),
  answer: z.boolean(),
});

export const QuestionSchema = z.discriminatedUnion("type", [ChoiceQuestion, TfQuestion]);
export type Question = z.infer<typeof QuestionSchema>;

export const StoryFileSchema = z
  .object({
    id: z.string().regex(/^(es|ca)-\d{3}$/),
    lang: z.enum(LANGS),
    title: z.string().min(2),
    genre: z.enum(GENRES),
    level: z.union([z.literal(1), z.literal(2)]),
    emoji: z.string().min(1),
    text: z.string().min(200),
    questions: z.array(QuestionSchema).length(5),
    speedQuestions: z.tuple([z.number().int().min(0).max(4), z.number().int().min(0).max(4)]),
  })
  .strict()
  .refine((s) => s.speedQuestions[0] !== s.speedQuestions[1], {
    message: "speedQuestions must be two different indexes",
  })
  .refine((s) => s.id.startsWith(s.lang + "-"), { message: "id prefix must match lang" });

export type StoryFile = z.infer<typeof StoryFileSchema>;
export type Story = StoryFile & { wordCount: number };

export const SPELLING_CATEGORIES = {
  es: ["b-v", "g-j", "h", "ll-y", "c-z-qu", "r-rr", "mp-mb", "mayusculas", "tildes"],
  ca: ["b-v", "g-j", "s-ss-c-z", "ll-l·l-ny", "h", "r-rr", "accents", "ig-tx"],
} as const;

const SpellingBase = {
  id: z.string().regex(/^(es|ca)-s-\d{3}$/),
  category: z.string(),
  level: z.union([z.literal(1), z.literal(2)]),
};

const ChooseItem = z
  .object({
    ...SpellingBase,
    type: z.literal("choose"),
    sentence: z.string().includes("___"),
    options: z.array(z.string().min(1)).min(2).max(3),
    answer: z.number().int().min(0),
  })
  .strict();

const FillItem = z
  .object({
    ...SpellingBase,
    type: z.literal("fill"),
    word: z.string().includes("_"),
    options: z.array(z.string().min(1)).min(2).max(4),
    answer: z.number().int().min(0),
    hint: z.string().min(3),
  })
  .strict();

const ErrorItem = z
  .object({
    ...SpellingBase,
    type: z.literal("error"),
    sentence: z.string().min(8),
    wrong: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(3),
    answer: z.number().int().min(0),
  })
  .strict();

export const SpellingItemSchema = z.discriminatedUnion("type", [ChooseItem, FillItem, ErrorItem]);
export type SpellingItem = z.infer<typeof SpellingItemSchema>;

/** Words in a text: split on whitespace, keep tokens containing a letter or digit. */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/** Normalize a token for comparison: strip surrounding punctuation. */
export function cleanToken(token: string): string {
  return token.replace(/^[^\p{L}\p{N}·]+|[^\p{L}\p{N}·]+$/gu, "");
}
