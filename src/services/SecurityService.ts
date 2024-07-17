import { Dialog } from "@capacitor/dialog";
import { NativeBiometric } from "@capgo/capacitor-native-biometric";
import LogService from "@/services/LogService";
import { store } from "@/redux";
import { selectSecuritySettings } from "@/redux/preferences";
import { sha256 } from "@/util/hash";

const Log = LogService("SecurityService");

export default function SecurityService() {
  return {
    authorize,
  };

  // authorize user according to user preference
  async function authorize(): Promise<boolean> {
    const { authMode } = selectSecuritySettings(store.getState());

    let isAuthorized = false;
    switch (authMode) {
      case "fingerprint":
        isAuthorized = await authorizeBio();
        break;

      case "pin":
        isAuthorized = await authorizePin();
        break;

      case "none":
        isAuthorized = true;
        break;

      default:
        isAuthorized = false;
        break;
    }

    return isAuthorized;
  }

  async function authorizeBio(): Promise<boolean> {
    let isAuthorized = false;

    const { isAvailable } = await NativeBiometric.isAvailable();

    if (isAvailable) {
      try {
        await NativeBiometric.verifyIdentity({
          reason: "Authorize this action",
          title: "Selene Wallet",
          subtitle: "Authorization Required",
          description: "Please authorize this action.",
        });

        isAuthorized = true;
      } catch (e) {
        Log.warn(e);
      }
    }

    return isAuthorized;
  }

  async function authorizePin() {
    let isAuthorized = false;

    const { pinHash: storedPinHash } = selectSecuritySettings(store.getState());

    if (storedPinHash === "") {
      return true;
    }

    const { value: pin, cancelled: isCancelled } = await Dialog.prompt({
      title: "Enter PIN",
      message: "Please enter your PIN.",
      okButtonTitle: "Authorize",
    });

    if (isCancelled) {
      return false;
    }

    const inputPinHash = sha256.text(pin);

    if (inputPinHash === storedPinHash) {
      isAuthorized = true;
    }

    return isAuthorized;
  }
}
