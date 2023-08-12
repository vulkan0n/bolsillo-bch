import translateJSONKeys from "./translateJSONkeys.js";
import isValidJSON from "./isValidJson.js";
import fs from "fs";
import { ISO_639_1_LANGUAGES } from "./addLanguages.js";

async function processFile(filePath) {
  try {
    // Read the original file content
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Process the file into valid JSON
    const originalJSON = fileContent
      // Remove "const translations = " from the start
      .replace(/^const translations = /, "")
      // Remove "; export default translations;" from the end
      .replace(/export default translations;/, "")
      // Remove excess end keys
      .replace(/;\n\n\n/, "")
      // Add double quotes around keys
      .replace(/(\w+):/g, '"$1":')
      // Remove trailing commas
      .replace(/,\s+}/g, "}");

    const inputJSON = JSON.parse(originalJSON);
    const result = {};

    // Iterate over the JSON object and run each item through the function
    for (const key in inputJSON) {
      if (Object.prototype.hasOwnProperty.call(inputJSON, key)) {
        const item = inputJSON[key];
        const processedContent = await translateJSONKeys(
          item,
          ISO_639_1_LANGUAGES
        );
        result[key] = processedContent;
      }
    }

    const startFile = "const translations = ";
    const endFile = ";\n\nexport default translations;\n";
    const formattedJson = JSON.stringify(result, null, 2).replace(
      /"([^"]+)"(?=:)/g,
      "$1"
    ); // Strip doublequotes from key values for prettier
    const fullFile = startFile + formattedJson + endFile;

    // Write the processed content back to the same file path
    fs.writeFileSync(filePath, fullFile, "utf8");

    console.log(`File processed successfully and saved: ${filePath}`);
  } catch (err) {
    console.error(`Error processing file: ${filePath}`);
    console.error(err.message);
  }
}

export default processFile;
