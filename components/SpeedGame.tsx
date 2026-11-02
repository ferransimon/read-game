"use client";

import { useRef, useState } from "react";
import type { Story } from "@/lib/schema";
import { useCurrent, useProgress, useT } from "@/lib/progress";
import { formatTime, wordsPerMinute } from "@/lib/scoring";
import { QuestionCard } from "./QuestionCard";
import { BigButton, Confetti, ProgressDots, SoftButton, StatCard, StoryText } from "./ui";

type Phase = "ready" | "reading" | "quiz" | "result";

/** Above this, a primary-school child almost certainly skipped the text: the attempt doesn't count. */
export const MAX_WPM = 350;

/** Average wpm of valid attempts (both quick questions right). */
export function averageWpm(speed: Record<string, { wpm: number; ok: boolean }[]>): number | null {
  const valid = Object.values(speed).flat().filter((a) => a.ok);
  if (!valid.length) return null;
  return Math.round(valid.reduce((s, a) => s + a.wpm, 0) / valid.length);
}

export function SpeedGame({ story, onNext, onRepeat }: { story: Story; onNext?: () => void; onRepeat: () => void }) {
  const { t } = useT();
  const { data } = useCurrent();
  const saveSpeed = useProgress((s) => s.saveSpeed);
  const [phase, setPhase] = useState<Phase>("ready");
  const [ms, setMs] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const startRef = useRef(0);
  // Average before this attempt, frozen so the comparison is stable after saving.
  const [prevAvg] = useState(() =>
    averageWpm(Object.fromEntries(Object.entries(data.speed).filter(([id]) => id.startsWith(story.lang)))),
  );

  const questions = story.speedQuestions.map((i) => story.questions[i]);
  const wpm = wordsPerMinute(story.wordCount, ms);
  const tooFast = wpm > MAX_WPM;
  const ok = results.length === questions.length && results.every(Boolean) && !tooFast;

  function answer(correct: boolean) {
    const next = [...results, correct];
    setResults(next);
    if (next.length >= questions.length) {
      saveSpeed(story.id, { ms, wpm, ok: next.every(Boolean) && wpm <= MAX_WPM, date: Date.now() });
      setPhase("result");
      window.scrollTo({ top: 0 });
    }
  }

  if (phase === "ready")
    return (
      <div className="animate-rise flex flex-col items-center gap-6 pt-6 text-center">
        <div className="text-7xl">⏱️</div>
        <h2 className="text-3xl font-bold">{t("speedReady")}</h2>
        <p className="text-xl text-ink/80">{t("speedHowTo")}</p>
        <div className="flex items-center gap-3 rounded-2xl bg-paper px-5 py-3 ring-1 ring-line">
          <span className="text-3xl">{story.emoji}</span>
          <span className="text-left">
            <span className="block font-bold">{story.title}</span>
            <span className="text-sm text-muted">
              {story.wordCount} {t("words")}
            </span>
          </span>
        </div>
        <BigButton
          tone="sky"
          onClick={() => {
            startRef.current = performance.now();
            setPhase("reading");
            window.scrollTo({ top: 0 });
          }}
        >
          {t("start")} ▶
        </BigButton>
      </div>
    );

  if (phase === "reading")
    return (
      <div className="flex flex-col gap-6">
        <StoryText story={story} />
        <BigButton
          tone="mint"
          onClick={() => {
            setMs(performance.now() - startRef.current);
            setPhase("quiz");
            window.scrollTo({ top: 0 });
          }}
        >
          {t("finished")} 🏁
        </BigButton>
      </div>
    );

  if (phase === "quiz")
    return (
      <div className="flex flex-col gap-5">
        <h2 className="text-center text-2xl font-bold">{t("quickCheck")}</h2>
        <ProgressDots total={questions.length} current={results.length} results={results} />
        <QuestionCard key={results.length} question={questions[results.length]} onDone={answer} />
      </div>
    );

  const faster = prevAvg !== null && wpm > prevAvg;
  return (
    <div className="animate-pop flex flex-col items-center gap-5 pt-4 text-center">
      <Confetti run={ok && (prevAvg === null || faster)} />
      <div className="text-7xl">{ok ? "🚀" : "🐢"}</div>
      <div className="grid w-full grid-cols-2 gap-3">
        <StatCard label={t("yourTime")} value={formatTime(ms)} tone="sky" />
        <StatCard label={t("wpm")} value={wpm} tone="butter" />
      </div>
      {ok ? (
        <>
          <p className="text-2xl font-bold text-mint-strong">{t("understood")}</p>
          <p className="text-xl">
            {prevAvg === null ? t("firstRead") : faster ? `🎉 ${t("fasterThanAvg")}` : t("slowerThanAvg")}
            {prevAvg !== null && (
              <span className="block text-base text-muted">
                {t("avgSpeed")}: {prevAvg} {t("wpmShort")}
              </span>
            )}
          </p>
        </>
      ) : (
        <p className="text-xl text-ink/80">{tooFast ? t("tooFast") : t("notUnderstood")}</p>
      )}
      <div className="flex w-full flex-col gap-3">
        {onNext && (
          <BigButton tone="sky" onClick={onNext}>
            {t("nextStory")} ⚡
          </BigButton>
        )}
        <SoftButton tone="peach" className="w-full" onClick={onRepeat}>
          🔁 {t("repeat")}
        </SoftButton>
        <SoftButton tone="lavender" className="w-full" href="/velocidad/panel/">
          📊 {t("speedPanel")}
        </SoftButton>
      </div>
    </div>
  );
}
