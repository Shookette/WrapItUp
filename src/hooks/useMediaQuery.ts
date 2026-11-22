import { useCallback, useSyncExternalStore } from "react";

export const DESKTOP_QUERY = "(min-width: 768px)";

export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
};

export const useIsDesktop = () => useMediaQuery(DESKTOP_QUERY);
