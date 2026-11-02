"use client";

import Link from "next/link";
import { averageWpm } from "@/components/SpeedGame";
import { BigButton, Screen, StatCard } from "@/components/ui";
import { WpmChart } from "@/components/WpmChart";
import { getStories } from "@/lib/content";
import { useCurrent, useT } from "@/lib/progress";
import { formatTime } from "@/lib/scoring";

export default function SpeedPanelPage() {
  const { t } = useT();
  return (
    <Screen title={t("speedPanel")} tone="sky">
      <Panel />
    </Screen>
  );
}

function Panel() {
  const { t } = useT();
  const { data, lang } = useCurrent();
  const stories = getStories(lang);
  const ids = new Set(stories.map((s) => s.id));
  const speed = Object.fromEntries(Object.entries(data.speed).filter(([id]) => ids.has(id)));
  const all = Object.values(speed)
    .flat()
    .sort((a, b) => a.date - b.date);
  const valid = all.filter((a) => a.ok);
  const best = valid.length ? Math.max(...valid.map((a) => a.wpm)) : null;
  const avg = averageWpm(speed);
  const done = stories
    .filter((s) => speed[s.id]?.length)
    .sort((a, b) => (speed[b.id].at(-1)?.date ?? 0) - (speed[a.id].at(-1)?.date ?? 0));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label={t("bestSpeed")} value={best ?? "–"} tone="butter" />
        <StatCard label={t("avgSpeed")} value={avg ?? "–"} tone="sky" />
        <StatCard label={t("readings")} value={all.length} tone="mint" />
      </div>
      <p className="-mt-2 text-center text-sm text-muted">{t("wpm")}</p>

      {all.length ? (
        <WpmChart points={all} label={t("wpm")} />
      ) : (
        <p className="rounded-blob bg-paper p-6 text-center text-lg text-muted ring-1 ring-line">{t("chartEmpty")}</p>
      )}

      <BigButton tone="sky" href="/velocidad/">
        ⚡ {done.length < stories.length ? t("nextStory") : t("speed")}
      </BigButton>

      {done.length > 0 && <h2 className="mt-2 text-xl font-bold">{t("myStories")}</h2>}
      <ul className="flex flex-col gap-3">
        {done.map((s) => {
          const attempts = speed[s.id];
          const okOnes = attempts.filter((a) => a.ok);
          const bestA = (okOnes.length ? okOnes : attempts).reduce((b, a) => (a.wpm > b.wpm ? a : b));
          return (
            <li key={s.id}>
              <Link
                href={`/velocidad/${s.id}/`}
                className="flex items-center gap-4 rounded-blob bg-paper p-4 ring-1 ring-line transition active:scale-[0.98]"
              >
                <span className="text-4xl">{s.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-lg font-bold">{s.title}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                    <span className="text-lg font-bold text-ink">
                      {bestA.wpm} <span className="text-sm font-semibold text-muted">{t("wpmShort")}</span>
                    </span>
                    <span>⏱️ {formatTime(bestA.ms)}</span>
                    <span>
                      {attempts.length} {t("attempts")}
                    </span>
                    {!bestA.ok && <span className="text-rose-strong">{t("invalid")}</span>}
                  </span>
                </span>
                <span className="grid size-11 place-items-center rounded-full bg-sky text-lg" aria-label={t("repeat")}>
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
