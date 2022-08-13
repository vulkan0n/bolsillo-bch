export const validateWalletName = (name: string): string => {
  if (name.length === 0) {
    return "Can't be empty.";
  }

  if (name.length > 30) {
    return "Can't be more than 30 characters.";
  }

  return null;
};

export const validateWalletDescription = (description: string): string => {
  if (description.length > 100) {
    return "Can't be more than 100 characters.";
  }

  return null;
};
