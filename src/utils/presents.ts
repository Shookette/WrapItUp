import type { Present } from "#/interfaces/Present.ts";

export type PresentDraft = Pick<Present, "title" | "description" | "url">;

const clean = ({ title, description, url }: PresentDraft): PresentDraft => ({
  title: title.trim(),
  description: description?.trim() ?? "",
  url: url?.trim() ?? "",
});

export const addPresent = (
  presents: Present[],
  draft: PresentDraft,
  { id, listUID }: { id: string; listUID: string },
): Present[] => [
  ...presents,
  { ...clean(draft), id, listUID, status: "available" },
];

export const updatePresent = (
  presents: Present[],
  id: string,
  draft: PresentDraft,
): Present[] =>
  presents.map((present) =>
    present.id === id ? { ...present, ...clean(draft) } : present,
  );

export const removePresent = (presents: Present[], id: string): Present[] =>
  presents.filter((present) => present.id !== id);

export const urlHost = (url?: string): string | undefined => {
  if (!url) {
    return undefined;
  }
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return undefined;
  }
};
