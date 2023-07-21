import { store } from "@/redux";
import { selectDeviceInfo } from "@/redux/device";
import { selectPreferences } from "@/redux/preferences";

export const translate = (translationObject) => {
  // If language set in Selene Settings,
  // try to use that language
  const preferences = selectPreferences(store.getState());
  const preferencesLanguageCode = preferences.languageCode;

  if (preferencesLanguageCode && translationObject[preferencesLanguageCode]) {
    return translationObject[preferencesLanguageCode];
  }

  // If language unset, try to use device language
  const deviceInfo = selectDeviceInfo(store.getState());
  const deviceLanguageCode = deviceInfo.languageCode;

  if (translationObject[deviceLanguageCode]) {
    return translationObject[deviceLanguageCode];
  }

  // Default to English if no translation in those languages
  return translationObject.en;
};

export const languageList = [
  {
    code: "",
    name: "Same as device",
    flag: "",
  },
  {
    code: "bn",
    name: "বাংলা",
    flag: "🇧🇩",
  },
  {
    code: "da",
    name: "Dansk",
    flag: "🇩🇰️",
  },
  {
    code: "de",
    name: "Deutsch",
    flag: "🇩🇪",
  },
  {
    code: "el",
    name: "Ελληνικά",
    flag: "🇬🇷",
  },
  {
    code: "en",
    name: "English (US)",
    flag: "🇺🇸",
  },
  {
    code: "es",
    name: "Español",
    flag: "🇪🇸",
  },
  {
    code: "fr",
    name: "Français",
    flag: "🇫🇷",
  },
  {
    code: "hi",
    name: "हिन्दी",
    flag: "🇮🇳",
  },
  {
    code: "it",
    name: "Italiano",
    flag: "🇮🇹",
  },
  {
    code: "ja",
    name: "日本語",
    flag: "🇯🇵",
  },
  {
    code: "jv",
    name: "Basa Jawa",
    flag: "🇮🇩",
  },
  {
    code: "ko",
    name: "한국어",
    flag: "🇰🇷",
  },
  {
    code: "mr",
    name: "मराठी",
    flag: "🇮🇳",
  },
  {
    code: "ms",
    name: "Bahasa Melayu",
    flag: "🇲🇾",
  },
  {
    code: "nb",
    name: "Norsk Bokmål",
    flag: "🇳🇴️",
  },
  {
    code: "pa",
    name: "ਪੰਜਾਬੀ",
    flag: "🇮🇳",
  },
  {
    code: "pt",
    name: "Português",
    flag: "🇵🇹",
  },
  {
    code: "ru",
    name: "Русский",
    flag: "🇷🇺",
  },
  {
    code: "sv",
    name: "Svenska",
    flag: "🇸🇪️",
  },
  {
    code: "ta",
    name: "தமிழ்",
    flag: "🇮🇳",
  },
  {
    code: "te",
    name: "తెలుగు",
    flag: "🇮🇳",
  },
  {
    code: "tr",
    name: "Türkçe",
    flag: "🇹🇷",
  },
  {
    code: "ur",
    name: "اردو",
    flag: "🇵🇰",
  },
  {
    code: "vi",
    name: "Tiếng Việt",
    flag: "🇻🇳",
  },
  {
    code: "zh",
    name: "中文",
    flag: "🇨🇳",
  },
];
