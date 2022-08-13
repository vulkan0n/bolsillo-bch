export const validateWalletName = (
  name: string,
  existingNames: string[]
): string => {
  if (name?.length === 0) {
    return "Can't be empty.";
  }

  if (name?.length > 30) {
    return "Can't be more than 30 characters.";
  }

  if (existingNames?.includes(name)) {
    return "Name already in use.";
  }

  return null;
};

export const validateWalletDescription = (description: string): string => {
  if (description?.length > 100) {
    return "Can't be more than 100 characters.";
  }

  return null;
};

export const validateWalletMnemonic = (menemonic: string): string => {
  if (menemonic?.split(" ").length !== 12) {
    return "Must be exactly 12 words long.";
  }

  return null;
};
