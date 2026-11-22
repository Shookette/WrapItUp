import "./Tile.css";

import { FC, PropsWithChildren } from "react";
import classNames from "classnames";
import { pickByHash } from "#/utils/tone.ts";
import { tileTones, TileTone } from "./tileTones.ts";

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
