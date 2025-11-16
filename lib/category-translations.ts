// Translation mapping for Finnish category names to English
const categoryTranslations: Record<string, string> = {
  "Maustekastikkeet": "Sauces",
  "Maustetahnat": "Spice Pastes",
  "Maidot ja piimät": "Milks and Buttermilks",
  "Voirasiat ja -paketit": "Butter Dishes and Packages",
  "Kermat": "Creams",
  "Kasvipohjaiset maidonkaltaiset": "Plant-based Milk Alternatives",
  "Juustoraasteet, -murut ja -lastut": "Cheese Shreds, Crumbs and Sticks",
  "Mehukeitot": "Fruit Soups",
  "Viipalejuustot": "Sliced Cheeses",
  "Jogurtit": "Yogurts",
  "Sini- ja punahomejuustot": "Blue and Red Mold Cheeses",
  "Viilit": "Viili",
  "Rahkat": "Quarks",
  "Muut hapanmaitotuotteet": "Other Fermented Dairy Products",
  "Fetat ja salaattijuustot": "Feta and Salad Cheeses",
  "Jälkiruokakastikkeet": "Dessert Sauces",
  "Tuorejuustot": "Fresh Cheeses",
  "Margariinirasiat ja -paketit": "Margarine Dishes and Packages",
  "Tuore- ja täysmehut": "Fresh and Full Juices",
  "Mehut": "Juices",
  "Vanukkaat ja välipalat": "Desserts and Snacks",
};

export function translateCategoryName(finnishName: string, language: "fi" | "en"): string {
  if (language === "fi") {
    return finnishName;
  }
  
  // Return English translation if available, otherwise return Finnish name
  return categoryTranslations[finnishName] || finnishName;
}

