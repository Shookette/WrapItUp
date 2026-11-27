import type { AllowedUser } from "#/interfaces/List.ts";
import type { Present } from "#/interfaces/Present.ts";

export type PresentDraft = Pick<
  Present,
  "title" | "description" | "url" | "favorite"
>;

const clean = ({
  title,
  description,
  url,
  favorite,
}: PresentDraft): PresentDraft => ({
  title: title.trim(),
  description: description?.trim() ?? "",
  url: url?.trim() ?? "",
  favorite: favorite ?? false,
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

export const toggleFavorite = (presents: Present[], id: string): Present[] =>
  presents.map((present) =>
    present.id === id ? { ...present, favorite: !present.favorite } : present,
  );

export const favoritesFirst = (presents: Present[]): Present[] => [
  ...presents.filter((present) => present.favorite),
  ...presents.filter((present) => !present.favorite),
];

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

export type PresentState = "available" | "mine" | "taken";

export const presentState = (present: Present, uid?: string): PresentState => {
  if (present.status !== "reserved") {
    return "available";
  }
  return uid && present.reservedBy === uid ? "mine" : "taken";
};

export const highlightFavorites = (
  presents: Present[],
  uid?: string,
): { highlighted: Present[]; others: Present[] } => {
  const isHighlighted = (present: Present) =>
    !!present.favorite && presentState(present, uid) === "available";
  return {
    highlighted: presents.filter(isHighlighted),
    others: favoritesFirst(
      presents.filter((present) => !isHighlighted(present)),
    ),
  };
};

export const reserverName = (
  present: Present,
  allowedUsers: AllowedUser[],
): string | undefined => {
  if (present.status !== "reserved" || !present.reservedBy) {
    return undefined;
  }
  const username = allowedUsers
    .find(({ userUID }) => userUID === present.reservedBy)
    ?.username?.trim();
  return username || undefined;
};

export const countByState = (
  presents: Present[],
  uid?: string,
): Record<PresentState, number> => {
  const counts = { available: 0, mine: 0, taken: 0 };
  for (const present of presents) {
    counts[presentState(present, uid)] += 1;
  }
  return counts;
};

export class ReservationError extends Error {
  readonly reason: "missing" | "taken" | "not-mine";

  constructor(reason: "missing" | "taken" | "not-mine") {
    super(`réservation impossible : ${reason}`);
    this.reason = reason;
  }
}

const changeReservation = (
  presents: Present[],
  id: string,
  uid: string,
  expected: PresentState,
  change: Pick<Present, "status" | "reservedBy">,
): Present[] => {
  const present = presents.find((present) => present.id === id);
  if (!present) {
    throw new ReservationError("missing");
  }
  if (presentState(present, uid) !== expected) {
    throw new ReservationError(expected === "available" ? "taken" : "not-mine");
  }
  return presents.map((present) =>
    present.id === id ? { ...present, ...change } : present,
  );
};

export const reservePresent = (
  presents: Present[],
  id: string,
  uid: string,
): Present[] =>
  changeReservation(presents, id, uid, "available", {
    status: "reserved",
    reservedBy: uid,
  });

export const cancelReservation = (
  presents: Present[],
  id: string,
  uid: string,
): Present[] =>
  changeReservation(presents, id, uid, "mine", {
    status: "available",
    reservedBy: "",
  });
