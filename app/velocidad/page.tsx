"use client";

import { useState } from "react";
import { SpeedGame } from "@/components/SpeedGame";
import { BigButton, Screen, SoftButton } from "@/components/ui";
import { getStories } from "@/lib/content";
import { useCurrent, useT } from "@/lib/progress";
import { nextStory } from "@/lib/scoring";

export default function SpeedPage() {
  const { t } = useT();
  return (
    <Screen title={t("speed")} tone="sky">
      <NextSpeed />
    </Screen>
  );
}

function NextSpeed() {
  const { t } = useT();
  const { data, lang } = useCurrent();
  const [storyId, setStoryId] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const stories = getStories(lang);
  const done = new Set(Object.keys(data.speed));
  const upcoming = nextStory(stories, done);
  const story = stories.find((s) => s.id === storyId) ?? upcoming;

  if (story && storyId !== story.id) setStoryId(story.id);

  if (!story)
    return (
      <div className="animate-pop flex flex-col items-center gap-5 pt-10 text-center">
        <div className="text-7xl">🏆</div>
        <h2 className="text-3xl font-bold">{t("allDone")}</h2>
        <p className="text-xl text-ink/80">{t("allDoneSub")}</p>
        <BigButton tone="sky" href="/velocidad/panel/">
          📊 {t("speedPanel")}
        </BigButton>
        <SoftButton href="/" className="w-full">
          🏠 {t("home")}
        </SoftButton>
      </div>
    );

  return (
    <SpeedGame
      key={`${story.id}-${round}`}
      story={story}
      onNext={() => {
        setStoryId(upcoming?.id ?? null);
        setRound((r) => r + 1);
        window.scrollTo({ top: 0 });
      }}
      onRepeat={() => setRound((r) => r + 1)}
    />
  );
}
