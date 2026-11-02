"use client";

import Link from "next/link";
import { BigButton, GenreChip, Screen, Stars } from "@/components/ui";
import { getStories } from "@/lib/content";
import { useCurrent, useT } from "@/lib/progress";
import { starsFor } from "@/lib/scoring";

export default function ComprehensionListPage() {
  const { t } = useT();
  return (
    <Screen title={t("myStories")} tone="peach">
      <List />
    </Screen>
  );
}

function List() {
  const { t } = useT();
  const { data, lang } = useCurrent();
  const stories = getStories(lang);
  const done = stories
    .filter((s) => data.comp[s.id])
    .sort((a, b) => (data.comp[b.id].attempts.at(-1)?.date ?? 0) - (data.comp[a.id].attempts.at(-1)?.date ?? 0));
  const pending = stories.length - done.length;

  return (
    <div className="flex flex-col gap-4">
      {pending > 0 && (
        <BigButton tone="peach" href="/comprension/">
          📖 {t("pending", { n: pending })}
        </BigButton>
      )}
      <h2 className="mt-2 text-xl font-bold">
        {t("completedList")} ({done.length}/{stories.length})
      </h2>
      {done.length === 0 && <p className="rounded-blob bg-paper p-6 text-center text-lg text-muted ring-1 ring-line">{t("noneYet")}</p>}
      <ul className="flex flex-col gap-3">
        {done.map((s) => {
          const r = data.comp[s.id];
          return (
            <li key={s.id}>
              <Link
                href={`/comprension/${s.id}/`}
                className="flex items-center gap-4 rounded-blob bg-paper p-4 ring-1 ring-line transition active:scale-[0.98]"
              >
                <span className="text-4xl">{s.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-lg font-bold">{s.title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                    <GenreChip story={s} />
                    <span>
                      {r.attempts.length} {t("attempts")}
                    </span>
                  </span>
                </span>
                <span className="flex flex-col items-center">
                  <span className="text-2xl font-bold">{r.best}/5</span>
                  <Stars count={starsFor(r.best)} size="text-sm" />
                </span>
                <span className="grid size-11 place-items-center rounded-full bg-peach text-lg" aria-label={t("repeat")}>
                  🔁
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
