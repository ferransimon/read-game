"use client";

import { BigButton, Screen, StatCard } from "@/components/ui";
import { getSpelling } from "@/lib/content";
import { CATEGORY_LABELS } from "@/lib/i18n";
import { useCurrent, useT } from "@/lib/progress";
import { SPELLING_CATEGORIES } from "@/lib/schema";

export default function SpellingPanelPage() {
  const { t } = useT();
  return (
    <Screen title={t("spellPanel")} tone="lavender">
      <Panel />
    </Screen>
  );
}

function Panel() {
  const { t } = useT();
  const { data, lang } = useCurrent();
  const items = getSpelling(lang);
  const ids = new Set(items.map((i) => i.id));
  const rounds = data.spell.rounds.filter((r) => Object.keys(r.byCat).every((c) => (SPELLING_CATEGORIES[lang] as readonly string[]).includes(c)));

  const perCat = (SPELLING_CATEGORIES[lang] as readonly string[]).map((cat) => {
    let ok = 0;
    let total = 0;
    for (const it of items) {
      if (it.category !== cat || !ids.has(it.id)) continue;
      const s = data.spell.items[it.id];
      if (s) {
        ok += s.ok;
        total += s.ok + s.fail;
      }
    }
    return { cat, ok, total, pct: total ? Math.round((ok / total) * 100) : null };
  });
  const totalOk = perCat.reduce((s, c) => s + c.ok, 0);
  const totalAll = perCat.reduce((s, c) => s + c.total, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label={t("rounds")} value={rounds.length} tone="lavender" />
        <StatCard label="%" value={totalAll ? `${Math.round((totalOk / totalAll) * 100)}%` : "–"} tone="mint" />
      </div>

      <BigButton tone="lavender" href="/ortografia/">
        ✏️ {rounds.length ? t("practiceMore") : t("spellRound")}
      </BigButton>

      <section className="rounded-blob bg-paper p-5 ring-1 ring-line">
        <h2 className="mb-4 text-xl font-bold">{t("byCategory")}</h2>
        <ul className="flex flex-col gap-3">
          {perCat.map((c) => (
            <li key={c.cat} className="grid grid-cols-[7.5rem_1fr_3rem] items-center gap-3">
              <span className="truncate font-semibold">{CATEGORY_LABELS[c.cat] ?? c.cat}</span>
              <span className="h-4 overflow-hidden rounded-full bg-line">
                <span
                  className={`block h-full rounded-full ${c.pct === null ? "" : c.pct >= 80 ? "bg-mint-strong" : c.pct >= 50 ? "bg-butter-strong" : "bg-rose-strong"}`}
                  style={{ width: `${c.pct ?? 0}%` }}
                />
              </span>
              <span className="text-right text-sm font-semibold text-muted">{c.pct === null ? "–" : `${c.pct}%`}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-bold">{t("lastRounds")}</h2>
        {rounds.length === 0 ? (
          <p className="rounded-blob bg-paper p-6 text-center text-lg text-muted ring-1 ring-line">{t("noRounds")}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rounds
              .slice(-10)
              .reverse()
              .map((r) => (
                <li key={r.date} className="flex items-center justify-between rounded-2xl bg-paper px-4 py-3 ring-1 ring-line">
                  <span className="text-muted">{new Date(r.date).toLocaleDateString(lang === "ca" ? "ca-ES" : "es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="text-lg font-bold">
                    {r.score}/{r.total} {r.score === r.total ? "🌟" : r.score >= 7 ? "⭐" : ""}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
