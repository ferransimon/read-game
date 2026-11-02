"use client";

import { useState } from "react";
import { AVATARS, useProgress } from "@/lib/progress";
import { dicts } from "@/lib/i18n";
import type { Lang } from "@/lib/schema";
import { BigButton } from "./ui";

export function LangToggle({ value, onChange }: { value: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="inline-flex rounded-2xl bg-paper p-1 ring-1 ring-line" role="radiogroup">
      {(
        [
          ["es", "Castellano"],
          ["ca", "Català"],
        ] as const
      ).map(([l, label]) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={value === l}
          onClick={() => onChange(l)}
          className={`min-h-11 rounded-xl px-4 text-base font-semibold transition ${
            value === l ? "bg-sky-strong text-white" : "text-muted"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/** Create a new player: name + animal + language, then start. */
export function Onboarding({ onCancel }: { onCancel?: () => void }) {
  const addProfile = useProgress((s) => s.addProfile);
  const [lang, setLang] = useState<Lang>("es");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const t = dicts[lang];
  const canStart = name.trim().length > 0;

  return (
    <div className="animate-rise flex flex-col gap-7">
      <div className="flex justify-end">
        <LangToggle value={lang} onChange={setLang} />
      </div>
      <div className="text-center">
        <div className="mb-2 text-7xl">{avatar}</div>
        <h1 className="text-3xl font-bold">{t.welcome}</h1>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-xl font-semibold">{t.yourName}</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 20))}
          placeholder={t.namePlaceholder}
          autoComplete="off"
          enterKeyHint="done"
          className="min-h-16 rounded-2xl bg-paper px-5 text-2xl ring-2 ring-line outline-none focus:ring-sky-strong"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-xl font-semibold">{t.pickAnimal}</span>
        <div className="grid grid-cols-6 gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={a === avatar}
              onClick={() => setAvatar(a)}
              className={`grid aspect-square place-items-center rounded-2xl text-3xl transition active:scale-90 ${
                a === avatar ? "bg-butter ring-2 ring-butter-strong" : "bg-paper ring-1 ring-line"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <BigButton
        tone="mint"
        disabled={!canStart}
        onClick={() => canStart && addProfile({ name: name.trim(), avatar, lang })}
      >
        {t.letsPlay} 🚀
      </BigButton>
      {onCancel && (
        <button type="button" onClick={onCancel} className="text-lg font-semibold text-muted">
          ← {t.back}
        </button>
      )}
    </div>
  );
}
