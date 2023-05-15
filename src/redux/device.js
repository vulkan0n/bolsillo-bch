import { createAction, createReducer, createSelector } from "@reduxjs/toolkit";
import { App } from "@capacitor/app";
import { Device } from "@capacitor/device";
import { Keyboard } from "@capacitor/keyboard";
import { store } from "@/redux";

export const setScannerIsScanning = createAction(
  "scanner/setScannerIsScanning"
);
export const setKeyboardIsOpen = createAction("scanner/setKeyboardIsOpen");

async function initializeDevice() {
  const deviceState = {
    scanner: { isScanning: false },
    keyboard: { isOpen: false },
  };

  deviceState.deviceInfo = await Device.getInfo();
  deviceState.deviceInfo.deviceId = await Device.getId();
  deviceState.locale = (await Device.getLanguageTag()).value;

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

    Keyboard.addListener("keyboardDidHide", () =>
      store.dispatch(setKeyboardIsOpen(false))
    );
  }

  return deviceState;
}

const initialState = await initializeDevice();

export const deviceReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setScannerIsScanning, (state, action) => {
      state.scanner.isScanning = action.payload;
    })
    .addCase(setKeyboardIsOpen, (state, action) => {
      state.keyboard.isOpen = action.payload;
    });
});

export const selectScannerIsScanning = createSelector(
  (state) => state.device.scanner,
  (scanner) => scanner.isScanning
);

export const selectKeyboardIsOpen = createSelector(
  (state) => state.device.keyboard,
  (keyboard) => keyboard.isOpen
);

export const selectDeviceInfo = createSelector(
  (state) => state.device.deviceInfo,
  (deviceInfo) => deviceInfo
);

export const selectLocale = createSelector(
  (state) => state.device.locale,
  (locale) => locale
);
