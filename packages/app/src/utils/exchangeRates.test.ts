import { convertRawBitsToRawSats } from "./exchangeRates";

test("Convert 0 raw bits to 0 raw sats", () => {
  expect(convertRawBitsToRawSats("0")).toBe("0");
});

test("Convert 1 raw bit to 100 raw sats", () => {
  expect(convertRawBitsToRawSats("10")).toBe("1000");
});

test("Convert 10 raw bits to 1 000 raw sats", () => {
  expect(convertRawBitsToRawSats("10")).toBe("1000");
});
