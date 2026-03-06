import translateJSONKeys from "./translateJSONkeys.js";
import isValidJSON from "./isValidJson.js";
import fs from "fs";
import { ISO_639_1_LANGUAGES } from "./addLanguages.js";

async function processObject(obj) {
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const item = obj[key];
      if (typeof item === "object" && item !== null && !item.en) {
        // Recursively process nested objects
        // Unless the object has an "en" key, ie. is the base object
        // for translation strings
        result[key] = await processObject(item);
      } else {
        // Translate string values
        result[key] = await translateJSONKeys(item, ISO_639_1_LANGUAGES);
      }
    }
  }
  return result;
}

// Check if a line in the translation object is a reference to an imported
// variable (shorthand `back,` or aliased `filterTokens: tokens,`) rather
// than a translation object with `{ en: "..." }`.
function isImportedRef(line) {
  const trimmed = line.trim();
  // Shorthand: `  back,` or `  back`  (identifier only, no colon)
  if (/^\w+,?$/.test(trimmed)) return true;
  // Aliased: `  filterTokens: tokens,` (value side is a bare identifier)
  const aliasMatch = trimmed.match(/^\w+:\s*(.+?),?$/);
  if (aliasMatch) {
    const value = aliasMatch[1].trim();
    // If the value doesn't start with { or " it's a variable reference
    if (/^\w+$/.test(value)) return true;
  }
  return false;
}

async function processFile(filePath) {
  try {
    // Read the original file content
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Extract prefix (imports before const translations =)
    const constIdx = fileContent.indexOf("const translations =");
    const prefix = constIdx > 0 ? fileContent.substring(0, constIdx) : "";
    const afterConst =
      constIdx > 0 ? fileContent.substring(constIdx) : fileContent;

    // Extract suffix (anything after `export default translations;\n`)
    const exportStr = "export default translations;\n";
    const exportIdx = afterConst.indexOf(exportStr);
    const suffix =
      exportIdx >= 0 ? afterConst.substring(exportIdx + exportStr.length) : "";

    // Get just the object body between { and the closing };
    const bodyStart = afterConst.indexOf("{");
    const bodyEnd = afterConst.lastIndexOf("}");
    if (bodyStart < 0 || bodyEnd < 0) {
      console.error(`Error: could not find object body in ${filePath}`);
      return;
    }
    const objectBody = afterConst.substring(bodyStart + 1, bodyEnd);

    // Split into lines and separate imported refs from translation objects
    const lines = objectBody.split("\n");
    const refLines = []; // { index, line } for imported references
    const translationLines = []; // lines that are part of translation objects

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith("//")) {
        translationLines.push(line);
        i++;
        continue;
      }

      // Check if this is a top-level imported reference
      if (isImportedRef(trimmed)) {
        refLines.push({ index: translationLines.length, line });
        translationLines.push(""); // placeholder
        i++;
        continue;
      }

      translationLines.push(line);
      i++;
    }

    // Reconstruct only the translation objects for JSON parsing
    const cleanBody = translationLines.join("\n");

    const objectStr = "{" + cleanBody + "}";

    // Process into valid JSON
    const originalJSON = objectStr
      // Remove excess end semicolons
      .replace(/;\s*$/, "")
      // Add double quotes around keys
      .replace(/^(\s*)(\w+):/gm, '$1"$2":')
      // Remove trailing commas
      .replace(/,\s+}/g, "}");

    const inputJSON = JSON.parse(originalJSON);
    const result = await processObject(inputJSON);

    // Format the result
    const formattedJson = JSON.stringify(result, null, 2).replace(
      /"([^"]+)"(?=:)/g,
      "$1"
    ); // Strip doublequotes from key values for prettier

    // Re-insert imported reference lines into the formatted output
    let finalJson;
    if (refLines.length > 0) {
      const resultLines = formattedJson.split("\n");
      // Insert refs at the beginning of the object (after opening brace)
      const refInserts = refLines.map((r) => r.line);
      resultLines.splice(1, 0, ...refInserts);
      finalJson = resultLines.join("\n");
    } else {
      finalJson = formattedJson;
    }

    const startFile = "const translations = ";
    const endFile = ";\n\nexport default translations;\n";
    const fullFile = prefix + startFile + finalJson + endFile + suffix;

    // Write the processed content back to the same file path
    fs.writeFileSync(filePath, fullFile, "utf8");

    console.log(`File processed successfully and saved: ${filePath}`);
  } catch (err) {
    console.error(`Error processing file: ${filePath}`);
    console.error(err.message);
  }
}

export default processFile;
