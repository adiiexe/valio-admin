// Utility to parse products.csv and find products by SKU (Tuotekoodi)

export type ProductCSVData = {
  tuotekoodi: string; // Product code (SKU)
  tuote: string; // Product name
  eanKoodi: string; // EAN code
  eranKoko: string; // Batch size
  sisaltaa: string; // Contains
  tilausyksikko: string; // Order unit
  yksikkohinta: string; // Unit price
  vertailuhinta: string; // Comparison price
  vertailuhinnanYksikko: string; // Comparison price unit
  yhteensa: string; // Total (including VAT)
  nettohinta: string; // Net price
  muuAlennus: string; // Other discount
  yksikkohintaIlmanAlennusta: string; // Unit price without discount
  veroEUR: string; // Tax EUR
  veroProsentti: string; // Tax %
  valmistaja: string; // Manufacturer code
  valmistajanNimi: string; // Manufacturer name
  kategorianNimi: string; // Category name
};

let productsCache: Map<string, ProductCSVData> | null = null;

async function loadProductsCSV(): Promise<Map<string, ProductCSVData>> {
  if (productsCache) {
    return productsCache;
  }

  try {
    const response = await fetch("/products.csv");
    const text = await response.text();
    const lines = text.split("\n").filter((line) => line.trim());

    // Skip the first line (Table 1) and second line (header)
    const dataLines = lines.slice(2);
    const products = new Map<string, ProductCSVData>();

    for (const line of dataLines) {
      // CSV uses semicolon as delimiter
      const parts = line.split(";");
      if (parts.length >= 18) {
        const product: ProductCSVData = {
          tuotekoodi: parts[0]?.trim() || "",
          tuote: parts[1]?.trim() || "",
          eanKoodi: parts[2]?.trim() || "",
          eranKoko: parts[3]?.trim() || "",
          sisaltaa: parts[4]?.trim() || "",
          tilausyksikko: parts[5]?.trim() || "",
          yksikkohinta: parts[6]?.trim() || "",
          vertailuhinta: parts[7]?.trim() || "",
          vertailuhinnanYksikko: parts[8]?.trim() || "",
          yhteensa: parts[9]?.trim() || "",
          nettohinta: parts[10]?.trim() || "",
          muuAlennus: parts[11]?.trim() || "",
          yksikkohintaIlmanAlennusta: parts[12]?.trim() || "",
          veroEUR: parts[13]?.trim() || "",
          veroProsentti: parts[14]?.trim() || "",
          valmistaja: parts[15]?.trim() || "",
          valmistajanNimi: parts[16]?.trim() || "",
          kategorianNimi: parts[17]?.trim() || "",
        };

        if (product.tuotekoodi) {
          products.set(product.tuotekoodi, product);
        }
      }
    }

    productsCache = products;
    return products;
  } catch (error) {
    console.error("Error loading products.csv:", error);
    return new Map();
  }
}

export async function getProductBySKU(sku: string): Promise<ProductCSVData | null> {
  const products = await loadProductsCSV();
  return products.get(sku) || null;
}

