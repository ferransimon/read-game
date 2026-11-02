"use client";

import { useState, type ReactNode } from "react";
import { cleanToken, type SpellingItem } from "@/lib/schema";
import { CATEGORY_LABELS, pick } from "@/lib/i18n";
import { useT } from "@/lib/progress";
import { shuffle } from "@/lib/scoring";
import { BigButton } from "./ui";

type Opt = { label: string; correct: boolean };

function useOptions(item: SpellingItem): Opt[] {
  const [opts] = useState(() => shuffle(item.options.map((o, i) => ({ label: o, correct: i === item.answer }))));
  return opts;
}

/** One spelling exercise of any type. Calls onDone(correct) after feedback. */
export function SpellingExercise({ item, onDone }: { item: SpellingItem; onDone: (ok: boolean) => void }) {
  const { t, d } = useT();
  const [result, setResult] = useState<boolean | null>(null);
  const [msg] = useState(() => ({ ok: pick(d.correct), ko: pick(d.wrong) }));
  const correctWord = item.options[item.answer];

  const title = item.type === "choose" ? t("chooseRight") : item.type === "fill" ? t("fillLetter") : t("findError");

  return (
    <div className="animate-rise flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-bold">{title}</h2>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-lavender px-3 py-1 text-sm font-semibold">{CATEGORY_LABELS[item.category] ?? item.category}</span>
      </div>

      {item.type === "choose" && <Choose item={item} result={result} onAnswer={setResult} />}
      {item.type === "fill" && <Fill item={item} result={result} onAnswer={setResult} />}
      {item.type === "error" && <FindError item={item} result={result} onAnswer={setResult} />}

      {result !== null && (
        <div className="animate-pop flex flex-col gap-4">
          <p className={`text-center text-2xl font-bold ${result ? "text-mint-strong" : "text-rose-strong"}`}>
            {result ? `🎉 ${msg.ok}` : `💪 ${msg.ko}`}
          </p>
          {!result && (
            <p className="text-center text-lg">
              {t("correctWas")}{" "}
              <strong className="rounded-lg bg-mint px-2 py-0.5 text-2xl">
                {item.type === "fill" ? item.word.replace("_", correctWord) : correctWord}
              </strong>
            </p>
          )}
          <BigButton tone={result ? "mint" : "lavender"} onClick={() => onDone(result)}>
            {t("next")} →
          </BigButton>
        </div>
      )}
    </div>
  );
}

type Props<T extends SpellingItem["type"]> = {
  item: Extract<SpellingItem, { type: T }>;
  result: boolean | null;
  onAnswer: (ok: boolean) => void;
};

function OptionButtons({
  opts,
  chosen,
  onPick,
  big,
}: {
  opts: Opt[];
  chosen: number | null;
  onPick: (i: number) => void;
  big?: boolean;
}) {
  return (
    <div className={`grid gap-3 ${opts.length === 2 ? "grid-cols-2" : opts.length === 4 ? "grid-cols-2" : "grid-cols-3"}`}>
      {opts.map((o, i) => {
        let state = "bg-paper ring-2 ring-line";
        if (chosen !== null) {
          if (o.correct) state = "bg-mint ring-2 ring-mint-strong";
          else if (i === chosen) state = "bg-rose ring-2 ring-rose-strong animate-shake";
          else state = "bg-paper ring-2 ring-line opacity-50";
        }
        return (
          <button
            key={i}
            type="button"
            data-testid="opt"
            disabled={chosen !== null}
            onClick={() => onPick(i)}
            className={`min-h-16 rounded-2xl px-3 py-3 font-bold transition active:scale-95 ${big ? "text-4xl" : "text-2xl"} ${state}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-blob bg-paper p-6 text-center ring-1 ring-line">{children}</div>;
}

function Choose({ item, result, onAnswer }: Props<"choose">) {
  const opts = useOptions(item);
  const [chosen, setChosen] = useState<number | null>(null);
  const [before, after] = item.sentence.split("___");
  return (
    <>
      <Card>
        <p className="reading text-2xl!">
          {before}
          <span
            className={`inline-block min-w-24 rounded-lg border-b-4 px-2 font-bold ${
              result === null ? "border-lavender-strong text-transparent" : "border-mint-strong bg-mint"
            }`}
          >
            {result === null ? "____" : item.options[item.answer]}
          </span>
          {after}
        </p>
      </Card>
      <OptionButtons
        opts={opts}
        chosen={chosen}
        onPick={(i) => {
          setChosen(i);
          onAnswer(opts[i].correct);
        }}
      />
    </>
  );
}

function Fill({ item, result, onAnswer }: Props<"fill">) {
  const { t } = useT();
  const opts = useOptions(item);
  const [chosen, setChosen] = useState<number | null>(null);
  const [before, after] = item.word.split("_");
  return (
    <>
      <Card>
        <p className="font-read text-5xl font-bold tracking-wide">
          {before}
          <span
            className={`mx-0.5 inline-block min-w-12 rounded-lg border-b-4 ${
              result === null ? "border-lavender-strong" : result ? "border-mint-strong bg-mint" : "border-rose-strong bg-rose"
            }`}
          >
            {chosen === null ? " " : opts[chosen].label}
          </span>
          {after}
        </p>
        <p className="mt-4 text-lg text-ink/80">
          💡 {t("hint")}: {item.hint}
        </p>
      </Card>
      <OptionButtons
        big
        opts={opts}
        chosen={chosen}
        onPick={(i) => {
          setChosen(i);
          onAnswer(opts[i].correct);
        }}
      />
    </>
  );
}

function FindError({ item, result, onAnswer }: Props<"error">) {
  const { t } = useT();
  const opts = useOptions(item);
  const tokens = item.sentence.split(/\s+/);
  const wrongIdx = tokens.findIndex((tk) => cleanToken(tk) === item.wrong);
  const [missed, setMissed] = useState<number | null>(null); // token tapped by mistake
  const [found, setFound] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);

  function tap(i: number) {
    if (found) return;
    if (i === wrongIdx) setFound(true);
    else {
      setMissed(i);
      setFound(true); // reveal the wrong word and continue to the fix step
    }
  }

  return (
    <>
      <Card>
        <div className="reading flex flex-wrap justify-center gap-x-1.5 gap-y-2 text-2xl!">
          {tokens.map((tk, i) => {
            let cls = "bg-transparent";
            if (found && i === wrongIdx) cls = result ? "bg-mint ring-2 ring-mint-strong" : "bg-rose ring-2 ring-rose-strong";
            else if (i === missed) cls = "bg-line animate-shake";
            const shown = result !== null && i === wrongIdx ? tk.replace(item.wrong, item.options[item.answer]) : tk;
            return (
              <button
                key={i}
                type="button"
                data-testid="token"
                disabled={found}
                onClick={() => tap(i)}
                className={`min-h-12 rounded-xl px-2 transition active:scale-95 ${cls} ${!found ? "hover:bg-sky" : ""}`}
              >
                {shown}
              </button>
            );
          })}
        </div>
      </Card>
      {found && (
        <div className="animate-rise flex flex-col gap-3">
          <p className="text-center text-xl font-semibold">
            {missed !== null && <span className="block text-base text-rose-strong">👀 «{item.wrong}»</span>}
            {t("howWritten")}
          </p>
          <OptionButtons
            opts={opts}
            chosen={chosen}
            onPick={(i) => {
              setChosen(i);
              onAnswer(missed === null && opts[i].correct);
            }}
          />
        </div>
      )}
    </>
  );
}
