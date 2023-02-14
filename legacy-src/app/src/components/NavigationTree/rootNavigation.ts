import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

// Allow navigation access outside Navigator tree
// https://reactnavigation.org/docs/navigating-without-navigation-prop/
// For some reason TypeScript wants these functions to be "never"
export function navigate(name: string, params = {}) {
  if (navigationRef.isReady()) {
    // For some weird reason navigationRef wants to be a "never" type
    // @ts-ignore
    navigationRef.navigate(name, params);
  }
}

export function reset(options) {
  if (navigationRef.isReady()) {
    navigationRef.reset(options);
  }
}
