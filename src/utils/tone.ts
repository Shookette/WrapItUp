export const pickByHash = <T>(id: string, values: readonly T[]): T =>
  values[
    [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % values.length
  ];
