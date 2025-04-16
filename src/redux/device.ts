import {
  createAction,
  createReducer,
  createSelector,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { App } from "@capacitor/app";
import { Device, DeviceInfo as CapacitorDeviceInfo } from "@capacitor/device";
import { Keyboard } from "@capacitor/keyboard";
import { Network, ConnectionStatus } from "@capacitor/network";
import { NativeBiometric } from "@capgo/capacitor-native-biometric";
import { store, RootState } from "@/redux";
//import { syncReconnect } from "@/redux/sync";
import LogService from "@/services/LogService";
import { sha256 } from "@/util/hash";

const Log = LogService("Device");

type DeviceInfo = CapacitorDeviceInfo & {
  deviceId: string;
  deviceIdHash: string;
  languageCode: string;
  hasBiometric: boolean;
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

export const deviceInit = createAsyncThunk("device/init", async () => {
  const deviceState = await initializeDevice();
  return deviceState;
});

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

  const { identifier: deviceId } = await Device.getId();
  const deviceIdHash = sha256.text(deviceId);

  const deviceInfo = await Device.getInfo();
  const { value: languageCode } = await Device.getLanguageTag();
  const { value: locale } = await Device.getLanguageTag();
  const networkStatus = await Network.getStatus();

  const deviceState: DeviceState = {
    scanner: { isScanning: false },
    keyboard: { isOpen: false },
    deviceInfo: {
      ...deviceInfo,
      deviceId,
      deviceIdHash,
      languageCode,
      hasBiometric: false,
    },
    locale,
    network: networkStatus,
  };

  if (deviceState.deviceInfo.platform !== "web") {
    // report biometric authorization capability
    deviceState.deviceInfo.hasBiometric = (
      await NativeBiometric.isAvailable()
    ).isAvailable;

    // global back button behavior
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

    // attach keyboard state change listeners
    Keyboard.addListener("keyboardWillShow", () =>
      store.dispatch(setKeyboardIsOpen(true))
    );

    Keyboard.addListener("keyboardDidHide", () =>
      store.dispatch(setKeyboardIsOpen(false))
    );

    // attach network state change listener
    Network.addListener("networkStatusChange", (status) => {
      store.dispatch(setNetworkStatus(status));
    });
  }

  Log.debug(deviceState);
  Log.timeEnd("initDevice");
  return deviceState;
}

// top-level Device initialization
const initialState: DeviceState = {
  scanner: { isScanning: false },
  keyboard: { isOpen: false },
  deviceInfo: {
    model: "null",
    operatingSystem: "unknown",
    platform: "web",
    osVersion: "null",
    manufacturer: "null",
    isVirtual: true,
    webViewVersion: "null",

    deviceId: "",
    deviceIdHash: "",
    languageCode: "",
    hasBiometric: false,
  },
  locale: "",
  network: {
    connected: false,
    connectionType: "none",
  },
};

export const deviceReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(deviceInit.fulfilled, (state, action) => {
      return action.payload;
    })

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
