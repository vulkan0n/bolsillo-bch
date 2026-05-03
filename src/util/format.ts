export function formatBch(sats: bigint): string {
  const abs = sats < 0n ? -sats : sats;
  const fixed = (Number(abs) / 1e8).toFixed(8);
  const [intPart, decPart] = fixed.split(".");
  const trimmed = (decPart.replace(/0+$/, "") || "0").padEnd(2, "0");
  return `${intPart}.${trimmed}`;
}
