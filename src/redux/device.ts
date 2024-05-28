import { createAction, createReducer, createSelector } from "@reduxjs/toolkit";
import { App } from "@capacitor/app";
import { Device, DeviceInfo as CapacitorDeviceInfo } from "@capacitor/device";
import { Keyboard } from "@capacitor/keyboard";
import { Network, ConnectionStatus } from "@capacitor/network";
import { store, RootState } from "@/redux";
import { syncReconnect } from "@/redux/sync";
import LogService from "@/services/LogService";

const Log = LogService("Device");

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
  network: ConnectionStatus;
}

export const setScannerIsScanning = createAction<boolean>(
  "device/setScannerIsScanning"
);
export const setKeyboardIsOpen = createAction<boolean>(
  "device/setKeyboardIsOpen"
);
export const setNetworkStatus = createAction<ConnectionStatus>(
  "device/setNetworkStatus"
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

export const selectNetworkStatus = createSelector(
  (state: RootState) => state.device,
  (device) => ({
    isConnected: device.network.connected,
    connectionType: device.network.connectionType,
  })
);

async function initializeDevice(): Promise<DeviceState> {
  Log.log("* Initializing Device *");
  Log.time("initDevice");

  const deviceState: DeviceState = {
    scanner: { isScanning: false },
    keyboard: { isOpen: false },
    deviceInfo: {
      ...(await Device.getInfo()),
      deviceId: (await Device.getId()).identifier,
      languageCode: (await Device.getLanguageCode()).value,
    },
    locale: (await Device.getLanguageTag()).value,
    network: await Network.getStatus(),
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

    Keyboard.addListener("keyboardDidHide", () =>
      store.dispatch(setKeyboardIsOpen(false))
    );

    Network.addListener("networkStatusChange", (status) => {
      store.dispatch(setNetworkStatus(status));
      if (status.connected) {
        store.dispatch(syncReconnect());
      }
    });
  }

  Log.timeEnd("initDevice");
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
    })
    .addCase(setNetworkStatus, (state, action) => {
      state.network = action.payload;
    });
});
