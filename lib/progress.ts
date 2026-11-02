"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useSyncExternalStore } from "react";
import type { Lang } from "./schema";
import type { ItemStats } from "./scoring";
import { dicts, format, type TKey } from "./i18n";

export const AVATARS = ["🐼", "🦊", "🐨", "🐯", "🦁", "🐰", "🐸", "🐙", "🦄", "🐧", "🐶", "🐱"];

export type Profile = { id: string; name: string; avatar: string; lang: Lang; createdAt: number };

export type CompResult = { best: number; attempts: { score: number; date: number }[] };
export type SpeedAttempt = { ms: number; wpm: number; ok: boolean; date: number };
export type SpellRound = { date: number; score: number; total: number; byCat: Record<string, [number, number]> };

export type ProfileData = {
  comp: Record<string, CompResult>;
  speed: Record<string, SpeedAttempt[]>;
  spell: { rounds: SpellRound[]; items: ItemStats };
};

const emptyData = (): ProfileData => ({ comp: {}, speed: {}, spell: { rounds: [], items: {} } });

type State = {
  profiles: Profile[];
  currentId: string | null;
  data: Record<string, ProfileData>;
  addProfile: (p: Omit<Profile, "id" | "createdAt">) => void;
  selectProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  setLang: (lang: Lang) => void;
  saveComp: (storyId: string, score: number) => void;
  saveSpeed: (storyId: string, attempt: SpeedAttempt) => void;
  saveSpell: (round: SpellRound, itemResults: Record<string, boolean>) => void;
};

function updateData(s: State, fn: (d: ProfileData) => ProfileData): Partial<State> {
  if (!s.currentId) return {};
  const d = s.data[s.currentId] ?? emptyData();
  return { data: { ...s.data, [s.currentId]: fn(d) } };
}

export const useProgress = create<State>()(
  persist(
    (set) => ({
      profiles: [],
      currentId: null,
      data: {},
      addProfile: (p) =>
        set((s) => {
          const id = Math.random().toString(36).slice(2, 10);
          return {
            profiles: [...s.profiles, { ...p, id, createdAt: Date.now() }],
            currentId: id,
            data: { ...s.data, [id]: emptyData() },
          };
        }),
      selectProfile: (id) => set({ currentId: id }),
      deleteProfile: (id) =>
        set((s) => {
          const data = { ...s.data };
          delete data[id];
          const profiles = s.profiles.filter((p) => p.id !== id);
          return { profiles, data, currentId: s.currentId === id ? (profiles[0]?.id ?? null) : s.currentId };
        }),
      setLang: (lang) =>
        set((s) => ({ profiles: s.profiles.map((p) => (p.id === s.currentId ? { ...p, lang } : p)) })),
      saveComp: (storyId, score) =>
        set((s) =>
          updateData(s, (d) => {
            const prev = d.comp[storyId];
            const attempts = [...(prev?.attempts ?? []), { score, date: Date.now() }];
            return { ...d, comp: { ...d.comp, [storyId]: { best: Math.max(prev?.best ?? 0, score), attempts } } };
          }),
        ),
      saveSpeed: (storyId, attempt) =>
        set((s) =>
          updateData(s, (d) => ({ ...d, speed: { ...d.speed, [storyId]: [...(d.speed[storyId] ?? []), attempt] } })),
        ),
      saveSpell: (round, itemResults) =>
        set((s) =>
          updateData(s, (d) => {
            const items = { ...d.spell.items };
            for (const [id, ok] of Object.entries(itemResults)) {
              const prev = items[id] ?? { ok: 0, fail: 0 };
              items[id] = ok ? { ...prev, ok: prev.ok + 1 } : { ...prev, fail: prev.fail + 1 };
            }
            return { ...d, spell: { rounds: [...d.spell.rounds, round], items } };
          }),
        ),
    }),
    { name: "llegim-v1", version: 1 },
  ),
);

const subscribeNoop = () => () => {};
/** True once running in the browser (store rehydrated from localStorage). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

const EMPTY = emptyData();

export function useCurrent(): { profile: Profile | null; data: ProfileData; lang: Lang } {
  const profile = useProgress((s) => s.profiles.find((p) => p.id === s.currentId) ?? null);
  const data = useProgress((s) => (s.currentId ? s.data[s.currentId] : undefined)) ?? EMPTY;
  return { profile, data, lang: profile?.lang ?? "es" };
}

export function useT() {
  const { lang } = useCurrent();
  const d = dicts[lang];
  const t = (key: TKey, vars?: Record<string, string | number>) => format(d[key], vars);
  return { t, d, lang };
}
