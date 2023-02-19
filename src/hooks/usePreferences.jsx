import { useState, useEffect, useRef } from "react";
import { Preferences } from "@capacitor/preferences";

function usePreferences() {
  const defaultPreferences = {
    localCurrency: "USD",
    preferLocalCurrency: "false",
    hideAvailableBalance: "false",
    denominateSats: "false",
    allowInstantPay: "false",
    instantPayThreshold: "25000000",
    qrCodeLogo: "Selene",
    qrCodeBackground: "#ffffff",
    qrCodeForeground: "#000000",
  };

  const [preferences, setPreferences] = useState({});

  useEffect(() => {
    retreivePreferences();
  }, []);

  useEffect(() => {
    commitPreferences();
  }, [preferences]);

  async function retreivePreferences() {
    //Preferences.clear();
    let keys = (await Preferences.keys()).keys;

    if (keys.length !== Object.keys(defaultPreferences).length) {
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

  function commitPreferences() {
    Object.keys(preferences).forEach(
      async (key) => await Preferences.set({ key, value: preferences[key] })
    );
  }

  function setPreference(key, value) {
    setPreferences({ ...preferences, [key]: value.toString() });
  }

  return [{ ...preferences }, setPreference];
}

export default usePreferences;
