import "./Tile.css";

import { FC, PropsWithChildren } from "react";
import classNames from "classnames";
import { pickByHash } from "#/utils/tone.ts";

export const tileTones = ["primary", "success", "info", "warning"] as const;

export type TileTone = (typeof tileTones)[number];

type TileProps = PropsWithChildren<{
  shape?: "round" | "square";
  size?: "small" | "medium" | "large";
  tone?: TileTone;
  toneFrom?: string;
}>;

const Tile: FC<TileProps> = ({
  children,
  shape = "round",
  size = "medium",
  tone = "primary",
  toneFrom,
}) => (
  <span
    aria-hidden
    className={classNames(
      "tile",
      `tile--${shape}`,
      `tile--${size}`,
      `tile--${toneFrom ? pickByHash(toneFrom, tileTones) : tone}`,
    )}
  >
    {children}
  </span>
);

export default Tile;
