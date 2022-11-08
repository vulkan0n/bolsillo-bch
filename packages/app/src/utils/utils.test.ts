import { countDecimalPlaces } from "./utils";

test("Throw error if strong contains characters besides 1-9 or '.'", () => {
  const invalidCharacters = "5.abc";
  expect(() => countDecimalPlaces(invalidCharacters)).toThrow(
    "Invalid input characters detected. Only 1-9 numerals and . permitted."
  );
});

test("Throw error if strong contains multiple decimal points", () => {
  const multipleDecimals = "4.0.0";
  expect(() => countDecimalPlaces(multipleDecimals)).toThrow(
    "Multiple decimal places in input. Only 1 '.' permitted."
  );
});

test("Count 0 decimal places in empty string", () => {
  const empty = "";
  expect(countDecimalPlaces(empty)).toBe(0);
});

test("Count 0 decimal places in non decimal string", () => {
  const noDecimals = "1";
  expect(countDecimalPlaces(noDecimals)).toBe(0);
});

test("Count 1 decimal place in 1 decimal string", () => {
  const oneDecimalPlace = "4.0";
  expect(countDecimalPlaces(oneDecimalPlace)).toBe(1);
});
