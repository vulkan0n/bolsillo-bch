import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(__dirname, "manual.html");
const output = path.join(__dirname, "Bolsillo-BCH-Manual.pdf");

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
const page = await browser.newPage();
await page.goto(`file://${source}`, { waitUntil: "load" });
await page.emulateMedia({ media: "print" });
await page.pdf({
  path: output,
  format: "A4",
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: "<div></div>",
  footerTemplate:
    '<div style="width:100%;font-size:8px;color:#8a94a6;text-align:center;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">Bolsillo BCH · <span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  margin: { top: "14mm", bottom: "16mm", left: "16mm", right: "16mm" },
});
await browser.close();
console.log(`PDF generado: ${output}`);
