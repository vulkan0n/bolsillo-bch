import { useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";

function usePreferences() {
  const [preferences, setPreferences] = useState({});

  const defaultPreferences = {
    localCurrency: "USD",
    preferLocalCurrency: false,
    hideAvailableBalance: false,
    denominateSats: false,
    allowInstantPay: false,
    instaPayThreshold: "25000000",
    qrCodeLogo: "Selene",
    qrCodeBackground: "#ffffff",
    qrCodeForeground: "#000000",
  };

  useEffect(() => {
    retreivePreferences();
  }, []);

  async function retreivePreferences() {
    let keys = (await Preferences.keys()).keys;

    if (keys.length < Object.keys(defaultPreferences).length) {
      console.log("resetting preferences...");
      keys = Object.keys(defaultPreferences);
      await Preferences.clear();
    }

    const preferences = (
      await Promise.all(
        await keys.map(async (key) => {
          const current = (await Preferences.get({ key })).value;

          if (current === null) {
            await Preferences.set({ key, value: defaultPreferences[key] });
            const newest = (await Preferences.get({ key })).value;
            return { [key]: newest };
          }

          return { [key]: current };
        })
      )
    ).reduce((acc, cur) => {
      return { ...acc, ...cur };
    }, {});

    setPreferences({ ...preferences });
  }

  async function updatePreferences(key, value) {
    await Preferences.set({ key, value });
    retreivePreferences();
  }

  return [preferences, updatePreferences];
}

export default usePreferences;
