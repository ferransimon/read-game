import { getAllStoryIds } from "@/lib/content";
import { StoryRoute } from "@/components/StoryRoute";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllStoryIds().map((id) => ({ id }));
}

export default async function Page({ params }: PageProps<"/comprension/[id]">) {
  const { id } = await params;
  return <StoryRoute id={id} mode="comprension" />;
}
