export const countDecimalPlaces = (input: string): number =>
  input?.split(".")?.[1]?.length || 0;
