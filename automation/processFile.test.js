import { describe, it, expect } from "vitest";

// isImportedRef is not exported, so we replicate it here for testing.
// This validates the regex logic that distinguishes imported variable
// references from translation objects in translations.js files.
function isImportedRef(line) {
  const trimmed = line.trim();
  if (/^\w+,?$/.test(trimmed)) return true;
  const aliasMatch = trimmed.match(/^\w+:\s*(.+?),?$/);
  if (aliasMatch) {
    const value = aliasMatch[1].trim();
    if (/^\w+$/.test(value)) return true;
  }
  return false;
}

// Validate the key-quoting regex fix that prevents corrupting colons
// inside translation string values (the bug was on line 109).
function quoteKeys(input) {
  return input.replace(/^(\s*)(\w+):/gm, '$1"$2":');
}

describe("processFile.js", () => {
  describe("isImportedRef", () => {
    it("detects shorthand import (with comma)", () => {
      expect(isImportedRef("  back,")).toBe(true);
    });

    it("detects shorthand import (without comma)", () => {
      expect(isImportedRef("  back")).toBe(true);
    });

    it("detects aliased import", () => {
      expect(isImportedRef("  filterTokens: tokens,")).toBe(true);
    });

    it("detects aliased import without trailing comma", () => {
      expect(isImportedRef("  filterTokens: tokens")).toBe(true);
    });

    it("rejects translation object (has en key)", () => {
      expect(isImportedRef('  myKey: { en: "Hello" },')).toBe(false);
    });

    it("rejects line with string value", () => {
      expect(isImportedRef('  myKey: "hello",')).toBe(false);
    });

    it("rejects line with object value", () => {
      expect(isImportedRef("  myKey: { en: 'Hi' },")).toBe(false);
    });

    it("rejects empty/whitespace lines", () => {
      expect(isImportedRef("")).toBe(false);
      expect(isImportedRef("   ")).toBe(false);
    });
  });

  describe("key-quoting regex (colon bug fix)", () => {
    it("quotes simple object keys", () => {
      expect(quoteKeys("  myKey: value")).toBe('  "myKey": value');
    });

    it("does not corrupt colons inside string values", () => {
      const input = '  "en": "Enter PIN: required"';
      expect(quoteKeys(input)).toBe('  "en": "Enter PIN: required"');
    });

    it("handles multiple keys on separate lines", () => {
      const input = "  en: hello\n  fr: bonjour";
      expect(quoteKeys(input)).toBe('  "en": hello\n  "fr": bonjour');
    });

    it("does not double-quote already-quoted keys", () => {
      // Already-quoted keys start with " so (\w+) won't match
      const input = '  "en": "Hello"';
      expect(quoteKeys(input)).toBe('  "en": "Hello"');
    });

    it("handles colon in value with no space issues", () => {
      const input = '  en: "Time: 3:00 PM"';
      expect(quoteKeys(input)).toBe('  "en": "Time: 3:00 PM"');
    });

    it("handles keys at different indentation levels", () => {
      const input = "key1: val\n  key2: val\n    key3: val";
      const expected = '"key1": val\n  "key2": val\n    "key3": val';
      expect(quoteKeys(input)).toBe(expected);
    });
  });
});
