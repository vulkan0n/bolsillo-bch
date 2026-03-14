import fetch from "node-fetch"; // For making HTTP requests in Node.js

async function translateJSONKeys(jsonObject, targetLanguages) {
  const translations = {};

  for (const lang of targetLanguages) {
    // Skip translations that are already present
    if (jsonObject[lang]) {
      continue;
    }

    const translation = await translateText(
      jsonObject.en,
      lang,
      process.env.GOOGLE_TRANSLATE_API_KEY
    );

    console.log(
      "New translation: ",
      jsonObject.en,
      " // ",
      lang,
      " // ",
      translation
    );

    translations[lang] = translation;
  }

  const aggregatedTranslations = {
    ...jsonObject,
    ...translations,
  };

  // Sort the keys alphabetically
  const sortedKeys = Object.keys(aggregatedTranslations).sort();

  // Create a new object with sorted keys
  const sortedTranslations = {};
  sortedKeys.forEach((key) => {
    sortedTranslations[key] = aggregatedTranslations[key];
  });

  return sortedTranslations;
}

async function translateText(text, targetLang, GOOGLE_TRANSLATE_API_KEY) {
  try {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;
    const requestBody = {
      q: text,
      source: "en",
      target: targetLang,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.error(await response.json());
      console.log(GOOGLE_TRANSLATE_API_KEY);
      throw new Error("Translation request failed");
    }

    const data = await response.json();
    const translated = data.data.translations[0].translatedText;
    // Google Translate returns HTML entities — decode them
    return translated
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  } catch (error) {
    console.error(`Translation error for ${targetLang}: ${error.message}`);
    return text;
  }
}

export default translateJSONKeys;
