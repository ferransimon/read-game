"use client";

import { useState } from "react";
import { ComprehensionGame } from "@/components/ComprehensionGame";
import { BigButton, Screen, SoftButton } from "@/components/ui";
import { getStories } from "@/lib/content";
import { useCurrent, useT } from "@/lib/progress";
import { nextStory } from "@/lib/scoring";

export default function ComprehensionPage() {
  const { t } = useT();
  return (
    <Screen title={t("comprehension")} tone="peach">
      <NextComprehension />
    </Screen>
  );
}

function NextComprehension() {
  const { t } = useT();
  const { data, lang } = useCurrent();
  // The story is fixed when the game starts so saving the result doesn't swap it mid-screen.
  const [storyId, setStoryId] = useState<string | null>(null);
  const [round, setRound] = useState(0);
  const stories = getStories(lang);
  const done = new Set(Object.keys(data.comp));
  const upcoming = nextStory(stories, done);
  const story = stories.find((s) => s.id === storyId) ?? upcoming;

  if (story && storyId !== story.id) setStoryId(story.id);

  if (!story)
    return (
      <div className="animate-pop flex flex-col items-center gap-5 pt-10 text-center">
        <div className="text-7xl">🏆</div>
        <h2 className="text-3xl font-bold">{t("allDone")}</h2>
        <p className="text-xl text-ink/80">{t("allDoneSub")}</p>
        <BigButton tone="peach" href="/comprension/lista/">
          📚 {t("myStories")}
        </BigButton>
        <SoftButton href="/" className="w-full">
          🏠 {t("home")}
        </SoftButton>
      </div>
    );

  return (
    <ComprehensionGame
      key={`${story.id}-${round}`}
      story={story}
      onNext={() => {
        setStoryId(upcoming?.id ?? null);
        setRound((r) => r + 1);
        window.scrollTo({ top: 0 });
      }}
    />
  );
}
