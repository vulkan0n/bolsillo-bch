import { createAction, createReducer, createSelector } from "@reduxjs/toolkit";
import { App } from "@capacitor/app";
import { Device, DeviceInfo as CapacitorDeviceInfo } from "@capacitor/device";
import { Keyboard } from "@capacitor/keyboard";
import { store, RootState } from "@/redux";

type DeviceInfo = CapacitorDeviceInfo & {
  deviceId: string;
  languageCode: string;
};

interface DeviceState {
  scanner: {
    isScanning: boolean;
  };
  keyboard: {
    isOpen: boolean;
  };
  deviceInfo: DeviceInfo;
  locale: string;
}

export const setScannerIsScanning = createAction<boolean>(
  "scanner/setScannerIsScanning"
);
export const setKeyboardIsOpen = createAction<boolean>(
  "scanner/setKeyboardIsOpen"
);

export const selectScannerIsScanning = createSelector(
  (state: RootState) => state.device,
  (device): boolean => device.scanner.isScanning
);

export const selectKeyboardIsOpen = createSelector(
  (state: RootState) => state.device,
  (device): boolean => device.keyboard.isOpen
);

export const selectDeviceInfo = createSelector(
  (state: RootState) => state.device,
  (device): DeviceInfo => device.deviceInfo
);

export const selectLocale = createSelector(
  (state: RootState) => state.device,
  (device): string => device.locale
);

async function initializeDevice(): Promise<DeviceState> {
  const deviceState: DeviceState = {
    scanner: { isScanning: false },
    keyboard: { isOpen: false },
    deviceInfo: {
      ...(await Device.getInfo()),
      deviceId: (await Device.getId()).identifier,
      languageCode: (await Device.getLanguageCode()).value,
    },
    locale: (await Device.getLanguageTag()).value,
  };

  if (deviceState.deviceInfo.platform !== "web") {
    App.addListener("backButton", (canGoBack) => {
      if (selectKeyboardIsOpen(store.getState())) {
        Keyboard.hide();
        return;
      }

      if (!canGoBack) {
        App.exitApp();
        return;
      }

      if (selectScannerIsScanning(store.getState())) {
        store.dispatch(setScannerIsScanning(false));
        return;
      }

      const { location, history } = window;
      if (location.pathname === "/wallet") {
        App.exitApp();
        return;
      }

      history.back();
    });

    Keyboard.addListener("keyboardWillShow", () =>
      store.dispatch(setKeyboardIsOpen(true))
    );

    Keyboard.addListener("keyboardWillHide", () =>
      store.dispatch(setKeyboardIsOpen(false))
    );
  }

  return deviceState;
}

const initialState: DeviceState = await initializeDevice();

export const deviceReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setScannerIsScanning, (state, action) => {
      state.scanner.isScanning = action.payload;
    })
    .addCase(setKeyboardIsOpen, (state, action) => {
      state.keyboard.isOpen = action.payload;
    });
});
