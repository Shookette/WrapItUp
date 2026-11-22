export const tileTones = ["primary", "success", "info", "warning"] as const;

export type TileTone = (typeof tileTones)[number];
