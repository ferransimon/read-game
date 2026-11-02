"use client";

import Link from "next/link";
import { Onboarding, LangToggle } from "@/components/Onboarding";
import { Screen, TONES, type Tone } from "@/components/ui";
import { getStories } from "@/lib/content";
import { useCurrent, useProgress, useT } from "@/lib/progress";

export default function HomePage() {
  return (
    <Screen back={null} requireProfile={false}>
      <Home />
    </Screen>
  );
}

function Home() {
  const { profile, data } = useCurrent();
  const setLang = useProgress((s) => s.setLang);
  const { t, lang } = useT();

  if (!profile) return <Onboarding />;

  const stories = getStories(lang);
  const compDone = stories.filter((s) => data.comp[s.id]).length;
  const speedDone = stories.filter((s) => data.speed[s.id]?.length).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/perfiles/" className="flex items-center gap-3 rounded-2xl pr-3 transition active:scale-95">
          <span className="grid size-14 place-items-center rounded-2xl bg-butter text-4xl">{profile.avatar}</span>
          <span className="text-left">
            <span className="block text-2xl font-bold leading-tight">{t("hello", { name: profile.name })}</span>
            <span className="block text-base text-muted">{t("whatToPlay")}</span>
          </span>
        </Link>
      </div>
      <div className="flex justify-center">
        <LangToggle value={lang} onChange={setLang} />
      </div>

      <ModeCard
        href="/comprension/"
        tone="peach"
        icon="📖"
        title={t("comprehension")}
        sub={t("comprehensionSub")}
        progress={`${compDone}/${stories.length}`}
        linkHref="/comprension/lista/"
        linkLabel={t("myStories")}
      />
      <ModeCard
        href="/velocidad/"
        tone="sky"
        icon="⚡"
        title={t("speed")}
        sub={t("speedSub")}
        progress={`${speedDone}/${stories.length}`}
        linkHref="/velocidad/panel/"
        linkLabel={t("myProgress")}
      />
      <ModeCard
        href="/ortografia/"
        tone="lavender"
        icon="✏️"
        title={t("spelling")}
        sub={t("spellingSub")}
        progress={data.spell.rounds.length ? `${data.spell.rounds.length} ${t("rounds").toLowerCase()}` : undefined}
        linkHref="/ortografia/panel/"
        linkLabel={t("myProgress")}
      />
    </div>
  );
}

function ModeCard(props: {
  href: string;
  tone: Tone;
  icon: string;
  title: string;
  sub: string;
  progress?: string;
  linkHref: string;
  linkLabel: string;
}) {
  const tone = TONES[props.tone];
  return (
    <div className={`animate-rise overflow-hidden rounded-blob ${tone.soft}`}>
      <Link href={props.href} className="flex items-center gap-3 p-4 transition sm:gap-4 sm:p-5 active:scale-[0.98]">
        <span className="grid size-16 shrink-0 place-items-center rounded-3xl bg-white/70 text-4xl sm:size-20 sm:text-5xl">{props.icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[1.7rem] leading-tight font-bold sm:text-3xl">{props.title}</span>
          <span className="block text-lg text-ink/75">{props.sub}</span>
        </span>
        <span className={`grid size-12 shrink-0 place-items-center rounded-full text-xl text-white ${tone.strong}`} aria-hidden>
          ▶
        </span>
      </Link>
      <Link
        href={props.linkHref}
        className="flex items-center justify-between border-t border-white/70 px-5 py-3 text-base font-semibold text-ink/80"
      >
        <span>📊 {props.linkLabel}</span>
        {props.progress && <span className="rounded-full bg-white/70 px-3 py-0.5 text-sm">{props.progress}</span>}
      </Link>
    </div>
  );
}
