export const countDecimalPlaces = (input: string): number => {
  // Input can only contain 0123456789.
  const characterCheckRegex = /^[0123456789.]*$/;
  const isValidCharacters = characterCheckRegex.test(input);

  if (!isValidCharacters) {
    throw "Invalid input characters detected. Only 1-9 numerals and . permitted.";
  }

  const numDecimalPoints = (input.match(/\./g) || []).length;

  if (numDecimalPoints > 1) {
    throw "Multiple decimal places in input. Only 1 '.' permitted.";
  }

  return input?.split(".")?.[1]?.length || 0;
};
