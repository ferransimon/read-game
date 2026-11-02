"use client";

import { useState } from "react";
import { SpellingExercise } from "@/components/SpellingExercise";
import { BigButton, Confetti, ProgressDots, Screen, SoftButton, Stars } from "@/components/ui";
import { getSpelling } from "@/lib/content";
import { useCurrent, useProgress, useT } from "@/lib/progress";
import { pickSpellingRound } from "@/lib/scoring";

export default function SpellingPage() {
  const { t } = useT();
  const [round, setRound] = useState(0);
  return (
    <Screen title={t("spelling")} tone="lavender">
      <SpellingRound key={round} onAgain={() => setRound((r) => r + 1)} />
    </Screen>
  );
}

function SpellingRound({ onAgain }: { onAgain: () => void }) {
  const { t, d } = useT();
  const { data, lang } = useCurrent();
  const saveSpell = useProgress((s) => s.saveSpell);
  const [items] = useState(() => pickSpellingRound(getSpelling(lang), data.spell.items, 10));
  const [results, setResults] = useState<boolean[]>([]);
  const index = results.length;
  const finished = index >= items.length;

  function done(ok: boolean) {
    const next = [...results, ok];
    setResults(next);
    window.scrollTo({ top: 0 });
    if (next.length >= items.length) {
      const byCat: Record<string, [number, number]> = {};
      const itemResults: Record<string, boolean> = {};
      items.forEach((it, i) => {
        const c = (byCat[it.category] ??= [0, 0]);
        if (next[i]) c[0]++;
        c[1]++;
        itemResults[it.id] = next[i];
      });
      saveSpell({ date: Date.now(), score: next.filter(Boolean).length, total: items.length, byCat }, itemResults);
    }
  }

  if (!items.length) return null;

  if (!finished)
    return (
      <div className="flex flex-col gap-5">
        <ProgressDots total={items.length} current={index} results={results} />
        <SpellingExercise key={items[index].id} item={items[index]} onDone={done} />
      </div>
    );

  const score = results.filter(Boolean).length;
  const stars = score === items.length ? 3 : score >= 7 ? 2 : score >= 4 ? 1 : 0;
  const msgIdx = Math.round((score / items.length) * 5);
  return (
    <div className="animate-pop flex flex-col items-center gap-6 pt-4 text-center">
      <Confetti run={score >= 8} />
      <div className="text-7xl">✏️</div>
      <h2 className="text-3xl font-bold">{t("spellResult")}</h2>
      <Stars count={stars} size="text-5xl" />
      <p className="text-2xl font-semibold">{t("yourScore", { score, total: items.length })}</p>
      <ProgressDots total={items.length} current={-1} results={results} />
      <p className="text-xl text-ink/80">{d.scoreMsg[msgIdx]}</p>
      <div className="flex w-full flex-col gap-3">
        <BigButton tone="lavender" onClick={onAgain}>
          {t("playAgain")} ✏️
        </BigButton>
        <SoftButton tone="sky" className="w-full" href="/ortografia/panel/">
          📊 {t("spellPanel")}
        </SoftButton>
        <SoftButton tone="peach" className="w-full" href="/">
          🏠 {t("home")}
        </SoftButton>
      </div>
    </div>
  );
}
