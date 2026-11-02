"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getStory } from "@/lib/content";
import { useT } from "@/lib/progress";
import { ComprehensionGame } from "./ComprehensionGame";
import { SpeedGame } from "./SpeedGame";
import { Screen } from "./ui";

/** Replays a specific story (from the lists / panels). */
export function StoryRoute({ id, mode }: { id: string; mode: "comprension" | "velocidad" }) {
  const { t } = useT();
  const router = useRouter();
  const [round, setRound] = useState(0);
  const story = getStory(id);
  const isComp = mode === "comprension";
  const back = isComp ? "/comprension/lista/" : "/velocidad/panel/";

  return (
    <Screen title={isComp ? t("comprehension") : t("speed")} tone={isComp ? "peach" : "sky"} back={back}>
      {story &&
        (isComp ? (
          <ComprehensionGame key={round} story={story} onNext={() => router.push("/comprension/")} />
        ) : (
          <SpeedGame key={round} story={story} onNext={() => router.push("/velocidad/")} onRepeat={() => setRound((r) => r + 1)} />
        ))}
    </Screen>
  );
}
