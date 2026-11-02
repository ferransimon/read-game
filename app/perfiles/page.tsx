"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Onboarding } from "@/components/Onboarding";
import { Screen, SoftButton } from "@/components/ui";
import { useProgress, useT } from "@/lib/progress";

export default function ProfilesPage() {
  const { t } = useT();
  return (
    <Screen title={t("profiles")} requireProfile={false}>
      <Profiles />
    </Screen>
  );
}

function Profiles() {
  const router = useRouter();
  const { t } = useT();
  const profiles = useProgress((s) => s.profiles);
  const currentId = useProgress((s) => s.currentId);
  const select = useProgress((s) => s.selectProfile);
  const remove = useProgress((s) => s.deleteProfile);
  const [creating, setCreating] = useState(false);

  if (creating || profiles.length === 0)
    return (
      <Onboarding
        onCancel={profiles.length ? () => setCreating(false) : undefined}
        key="new"
      />
    );

  return (
    <div className="flex flex-col gap-3">
      {profiles.map((p) => (
        <div
          key={p.id}
          className={`flex items-center gap-3 rounded-blob p-3 ${p.id === currentId ? "bg-butter ring-2 ring-butter-strong" : "bg-paper ring-1 ring-line"}`}
        >
          <button
            type="button"
            className="flex flex-1 items-center gap-4 text-left"
            onClick={() => {
              select(p.id);
              router.push("/");
            }}
          >
            <span className="grid size-16 place-items-center rounded-2xl bg-white text-5xl">{p.avatar}</span>
            <span className="text-2xl font-bold">{p.name}</span>
          </button>
          <button
            type="button"
            aria-label={t("deletePlayer")}
            className="grid size-12 place-items-center rounded-xl text-xl text-muted active:scale-90"
            onClick={() => {
              if (window.confirm(t("confirmDelete", { name: p.name }))) remove(p.id);
            }}
          >
            🗑️
          </button>
        </div>
      ))}
      <SoftButton tone="mint" className="mt-2 w-full" onClick={() => setCreating(true)}>
        ➕ {t("newPlayer")}
      </SoftButton>
    </div>
  );
}
