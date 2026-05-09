import en from "./en.json";
import fr from "./fr.json";
import de from "./de.json";

export type Language = "en" | "fr" | "de";
export type Content = typeof en;

export const locales: Record<Language, Content> = {
  en: en as Content,
  fr: fr as Content,
  de: de as Content,
};

/**
 * Get currency symbol for a given language.
 * en → £, fr/de → €
 */
export function getCurrencySymbol(lang: Language): string {
  return locales[lang].currencySymbol;
}

export { en, fr, de };
