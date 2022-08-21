import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

// Allow navigation access outside Navigator tree
// https://reactnavigation.org/docs/navigating-without-navigation-prop/
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function reset(options) {
  if (navigationRef.isReady()) {
    navigationRef.reset(options);
  }
}
