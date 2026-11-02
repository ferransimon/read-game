/**
 * Validates all content in /content and writes the merged bundles to lib/generated/.
 * Usage: pnpm content            (validate + write)
 *        pnpm content --check    (validate only)
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  LANGS,
  SPELLING_CATEGORIES,
  SpellingItemSchema,
  StoryFileSchema,
  cleanToken,
  countWords,
  type SpellingItem,
  type Story,
} from "../lib/schema";

const root = join(import.meta.dirname, "..");
const checkOnly = process.argv.includes("--check");
const errors: string[] = [];
const warnings: string[] = [];

const LEVEL_WORDS = { 1: [70, 170], 2: [130, 290] } as const;

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    errors.push(`${path}: invalid JSON (${(e as Error).message})`);
    return null;
  }
}

const out: Record<string, { stories: Story[]; spelling: SpellingItem[] }> = {};

for (const lang of LANGS) {
  const dir = join(root, "content/stories", lang);
  const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  const stories: Story[] = [];
  const ids = new Set<string>();
  const titles = new Set<string>();

  for (const f of files) {
    const path = join(dir, f);
    const raw = readJson(path);
    if (raw === null) continue;
    const parsed = StoryFileSchema.safeParse(raw);
    if (!parsed.success) {
      errors.push(`${path}: ${parsed.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
      continue;
    }
    const s = parsed.data;
    if (s.lang !== lang) errors.push(`${path}: lang ${s.lang} in ${lang} folder`);
    if (`${s.id}.json` !== f) errors.push(`${path}: filename must be ${s.id}.json`);
    if (ids.has(s.id)) errors.push(`${path}: duplicate id ${s.id}`);
    if (titles.has(s.title.toLowerCase())) errors.push(`${path}: duplicate title "${s.title}"`);
    ids.add(s.id);
    titles.add(s.title.toLowerCase());
    const wordCount = countWords(s.text);
    const [min, max] = LEVEL_WORDS[s.level];
    if (wordCount < min || wordCount > max)
      warnings.push(`${path}: level ${s.level} has ${wordCount} words (expected ${min}-${max})`);
    const tf = s.questions.filter((q) => q.type === "tf");
    if (tf.length === 0 || tf.length === 5) warnings.push(`${path}: questions should mix choice and true/false`);
    for (const q of s.questions) {
      if (q.type === "choice" && new Set(q.options.map((o) => o.toLowerCase())).size !== 3)
        errors.push(`${path}: repeated options in "${q.q}"`);
    }
    stories.push({ ...s, wordCount });
  }

  const spellPath = join(root, "content/spelling", `${lang}.json`);
  const spelling: SpellingItem[] = [];
  const rawSpell = readJson(spellPath);
  if (Array.isArray(rawSpell)) {
    const sIds = new Set<string>();
    const cats = SPELLING_CATEGORIES[lang] as readonly string[];
    rawSpell.forEach((item, i) => {
      const parsed = SpellingItemSchema.safeParse(item);
      if (!parsed.success) {
        errors.push(`${spellPath}[${i}]: ${parsed.error.issues.map((x) => `${x.path.join(".")} ${x.message}`).join("; ")}`);
        return;
      }
      const it = parsed.data;
      const where = `${spellPath} ${it.id}`;
      if (!it.id.startsWith(lang)) errors.push(`${where}: id prefix must be ${lang}`);
      if (sIds.has(it.id)) errors.push(`${where}: duplicate id`);
      sIds.add(it.id);
      if (!cats.includes(it.category)) errors.push(`${where}: unknown category ${it.category}`);
      if (it.answer >= it.options.length) errors.push(`${where}: answer out of range`);
      if (new Set(it.options).size !== it.options.length) errors.push(`${where}: repeated options`);
      if (it.type === "fill" && (it.word.match(/_/g) ?? []).length !== 1)
        errors.push(`${where}: word must contain exactly one _`);
      if (it.type === "choose" && (it.sentence.match(/___/g) ?? []).length !== 1)
        errors.push(`${where}: sentence must contain exactly one ___`);
      if (it.type === "error") {
        const tokens = it.sentence.split(/\s+/).map(cleanToken);
        const hits = tokens.filter((t) => t === it.wrong).length;
        if (hits !== 1) errors.push(`${where}: wrong word "${it.wrong}" must appear exactly once in sentence`);
        if (it.options.includes(it.wrong)) errors.push(`${where}: options must not include the wrong word`);
      }
      spelling.push(it);
    });
    for (const c of cats) {
      const n = spelling.filter((s) => s.category === c).length;
      if (n < 8) warnings.push(`${spellPath}: category ${c} only has ${n} items`);
    }
  } else if (rawSpell !== null) {
    errors.push(`${spellPath}: must be a JSON array`);
  }

  out[lang] = { stories, spelling };
  const byGenre = Object.entries(
    stories.reduce<Record<string, number>>((a, s) => ((a[s.genre] = (a[s.genre] ?? 0) + 1), a), {}),
  )
    .map(([g, n]) => `${g}:${n}`)
    .join(" ");
  console.log(
    `[${lang}] stories=${stories.length} (L1=${stories.filter((s) => s.level === 1).length} L2=${stories.filter((s) => s.level === 2).length}) ${byGenre}  spelling=${spelling.length}`,
  );
}

for (const w of warnings) console.warn("WARN ", w);
for (const e of errors) console.error("ERROR", e);

if (errors.length) {
  console.error(`\n${errors.length} error(s).`);
  process.exit(1);
}

if (!checkOnly) {
  const genDir = join(root, "lib/generated");
  mkdirSync(genDir, { recursive: true });
  for (const lang of LANGS) {
    writeFileSync(join(genDir, `stories-${lang}.json`), JSON.stringify(out[lang].stories));
    writeFileSync(join(genDir, `spelling-${lang}.json`), JSON.stringify(out[lang].spelling));
  }
  console.log("Content bundles written to lib/generated/");
}
