// Pre-compiled regex patterns (compiled once, reused)
const SIZE_PATTERN = /(\d+(?:[.,]\d+)?)\s*(L|l|g|kg|dl|ml|G|KG|DL|ML)?\b/i;
const ATTRIBUTE_SPLIT_PATTERN = /[\s,]+/;
const WORD_SPLIT_PATTERN = /\s+/;

// Set for O(1) acronym lookup instead of O(n) array.includes()
const ACRONYMS = new Set(["UHT", "ESL", "AI", "API", "SKU", "EAN", "VAT"]);

/**
 * Formats product names for better readability
 * 
 * Transforms:
 * - "Valio kevytmaito 1 | ESL" → "Valio Kevytmaito 1L (ESL)"
 * - "Valio suurtalous kuohukerma 1,75 | laktoositon" → "Valio Suurtalous Kuohukerma 1,75L (Laktoositon)"
 * - "Valio vispikerma 1 | UHT laktoositon" → "Valio Vispikerma 1L (UHT, Laktoositon)"
 */
export function formatProductName(productName: string): string {
  if (!productName || typeof productName !== "string") {
    return productName;
  }

  // Find pipe separator index (single pass)
  const pipeIndex = productName.indexOf("|");
  const mainPart = pipeIndex === -1 
    ? productName.trim() 
    : productName.slice(0, pipeIndex).trim();
  const attributesPart = pipeIndex === -1 
    ? "" 
    : productName.slice(pipeIndex + 1).trim();

  // Process main part: format size and apply title case in one pass
  let formattedMain = formatMainPart(mainPart);

  // Process attributes: single pass with filtering and formatting
  const formattedAttributes = formatAttributes(attributesPart);

  // Combine results
  return formattedAttributes 
    ? `${formattedMain} ${formattedAttributes}` 
    : formattedMain;
}

/**
 * Formats the main product name part (size formatting + title case)
 */
function formatMainPart(mainPart: string): string {
  if (!mainPart) return "";

  // Try to find and replace size pattern
  const sizeMatch = mainPart.match(SIZE_PATTERN);
  if (sizeMatch) {
    const sizeValue = sizeMatch[1].replace(",", ".");
    const existingUnit = sizeMatch[2]?.toLowerCase() || "";
    
    // Determine unit - default to "L" for liter-like sizes
    let unit = existingUnit;
    if (!existingUnit) {
      const numValue = parseFloat(sizeValue);
      if (numValue > 0 && numValue < 100) {
        unit = "L";
      }
    }

    // Build formatted size
    const formattedSize = sizeValue.replace(".", ",") + (unit ? unit.toUpperCase() : "");
    
    // Replace size in main part
    mainPart = mainPart.replace(SIZE_PATTERN, formattedSize);
  }

  // Apply title case
  return toTitleCase(mainPart);
}

/**
 * Formats attributes part into parentheses format
 */
function formatAttributes(attributesPart: string): string {
  if (!attributesPart) return "";

  // Single pass: split, filter empty, and format
  const attributes: string[] = [];
  const parts = attributesPart.split(ATTRIBUTE_SPLIT_PATTERN);
  
  for (let i = 0; i < parts.length; i++) {
    const attr = parts[i].trim();
    if (attr) {
      attributes.push(toTitleCase(attr));
    }
  }

  return attributes.length > 0 ? `(${attributes.join(", ")})` : "";
}

/**
 * Converts a string to title case with O(1) acronym lookup
 */
function toTitleCase(str: string): string {
  if (!str) return str;

  const words = str.split(WORD_SPLIT_PATTERN);
  const result: string[] = new Array(words.length);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word) {
      result[i] = word;
      continue;
    }

    const upperWord = word.toUpperCase();
    // O(1) lookup instead of O(n)
    result[i] = ACRONYMS.has(upperWord)
      ? upperWord
      : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  return result.join(" ");
}

