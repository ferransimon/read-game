"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useCurrent, useHydrated, useT } from "@/lib/progress";
import { GENRE_COLORS, GENRE_LABELS } from "@/lib/i18n";
import type { Story } from "@/lib/schema";

export const TONES = {
  peach: { soft: "bg-peach", strong: "bg-peach-strong", text: "text-peach-strong", border: "border-peach-strong" },
  mint: { soft: "bg-mint", strong: "bg-mint-strong", text: "text-mint-strong", border: "border-mint-strong" },
  lavender: { soft: "bg-lavender", strong: "bg-lavender-strong", text: "text-lavender-strong", border: "border-lavender-strong" },
  sky: { soft: "bg-sky", strong: "bg-sky-strong", text: "text-sky-strong", border: "border-sky-strong" },
  butter: { soft: "bg-butter", strong: "bg-butter-strong", text: "text-butter-strong", border: "border-butter-strong" },
  rose: { soft: "bg-rose", strong: "bg-rose-strong", text: "text-rose-strong", border: "border-rose-strong" },
} as const;
export type Tone = keyof typeof TONES;

/** Page container with a top bar. Renders a loader until the local store is ready. */
export function Screen({
  title,
  back = "/",
  tone = "peach",
  right,
  children,
  requireProfile = true,
}: {
  title?: string;
  back?: string | null;
  tone?: Tone;
  right?: ReactNode;
  children: ReactNode;
  requireProfile?: boolean;
}) {
  const hydrated = useHydrated();
  const { profile } = useCurrent();
  const { t } = useT();

  useEffect(() => {
    if (hydrated && requireProfile && !profile) window.location.replace("/");
  }, [hydrated, requireProfile, profile]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-10 pt-[max(env(safe-area-inset-top),1rem)]">
      {(title || back) && (
        <header className="mb-5 flex min-h-14 items-center gap-3">
          {back && (
            <Link
              href={back}
              aria-label={t("back")}
              className={`grid size-12 shrink-0 place-items-center rounded-2xl ${TONES[tone].soft} text-2xl transition active:scale-95`}
            >
              ←
            </Link>
          )}
          {title && <h1 className="flex-1 truncate text-2xl font-bold">{title}</h1>}
          {right}
        </header>
      )}
      {!hydrated || (requireProfile && !profile) ? <Loader /> : children}
    </div>
  );
}

export function Loader() {
  return (
    <div className="grid flex-1 place-items-center py-20">
      <div className="size-12 animate-spin rounded-full border-4 border-lavender border-t-lavender-strong" />
    </div>
  );
}

export function BigButton({
  children,
  onClick,
  href,
  tone = "mint",
  className = "",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  tone?: Tone;
  className?: string;
  disabled?: boolean;
}) {
  const cls = `inline-flex min-h-16 w-full items-center justify-center gap-2 rounded-blob px-6 py-4 text-xl font-bold text-white shadow-[0_6px_0_rgba(61,74,102,0.15)] transition active:translate-y-1 active:shadow-none disabled:opacity-50 ${TONES[tone].strong} ${className}`;
  if (href)
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  return (
    <button type="button" onClick={onClick} className={cls} disabled={disabled}>
      {children}
    </button>
  );
}

export function SoftButton({
  children,
  onClick,
  href,
  tone = "lavender",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  tone?: Tone;
  className?: string;
}) {
  const cls = `inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-lg font-semibold text-ink transition active:scale-[0.97] ${TONES[tone].soft} ${className}`;
  if (href)
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function Stars({ count, max = 3, size = "text-4xl" }: { count: number; max?: number; size?: string }) {
  return (
    <div className={`flex justify-center gap-1 ${size}`} aria-label={`${count}/${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < count ? "animate-pop" : "opacity-25 grayscale"} style={{ animationDelay: `${i * 120}ms` }}>
          ⭐
        </span>
      ))}
    </div>
  );
}

export function ProgressDots({ total, current, results }: { total: number; current: number; results: (boolean | undefined)[] }) {
  return (
    <div className="flex justify-center gap-2" aria-hidden>
      {Array.from({ length: total }, (_, i) => {
        const r = results[i];
        const color = r === true ? "bg-mint-strong" : r === false ? "bg-rose-strong" : i === current ? "bg-lavender-strong" : "bg-line";
        return <span key={i} className={`h-3 rounded-full transition-all ${color} ${i === current ? "w-8" : "w-3"}`} />;
      })}
    </div>
  );
}

export function GenreChip({ story }: { story: Story }) {
  const { lang } = useT();
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${GENRE_COLORS[story.genre]}`}>
      {GENRE_LABELS[lang][story.genre]}
    </span>
  );
}

/** Renders the story title + body with comfortable reading typography. */
export function StoryText({ story }: { story: Story }) {
  const { t } = useT();
  return (
    <article className="rounded-blob bg-paper p-6 shadow-[0_2px_0_var(--color-line)] ring-1 ring-line sm:p-8">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-5xl" aria-hidden>
          {story.emoji}
        </span>
        <div>
          <h2 className="text-2xl font-bold leading-tight">{story.title}</h2>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted">
            <GenreChip story={story} />
            <span>
              {story.wordCount} {t("words")}
            </span>
          </div>
        </div>
      </div>
      <div className="reading">
        {story.text.split(/\n\n+/).map((para, i) => (
          <p key={i}>
            {para.split("\n").map((line, j, arr) => (
              <span key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </span>
            ))}
          </p>
        ))}
      </div>
    </article>
  );
}

export function Confetti({ run }: { run: boolean }) {
  const [pieces, setPieces] = useState<{ left: number; delay: number; dur: number; color: string }[]>([]);
  useEffect(() => {
    if (!run) return;
    const colors = ["#f4a37e", "#5fbf98", "#9d82dc", "#5eaae3", "#e9bf3a", "#e8849c"];
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot animation trigger
    setPieces(
      Array.from({ length: 40 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        dur: 1.8 + Math.random() * 1.4,
        color: colors[Math.floor(Math.random() * colors.length)],
      })),
    );
    const id = setTimeout(() => setPieces([]), 3800);
    return () => clearTimeout(id);
  }, [run]);
  return (
    <>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{ left: `${p.left}vw`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s` }}
        />
      ))}
    </>
  );
}

export function StatCard({ label, value, tone = "sky" }: { label: string; value: ReactNode; tone?: Tone }) {
  return (
    <div className={`rounded-2xl p-4 text-center ${TONES[tone].soft}`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm font-semibold text-ink/70">{label}</div>
    </div>
  );
}
