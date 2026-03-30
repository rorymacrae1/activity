import { usePreferencesStore } from "@stores/preferences";
import { locales } from "@/content";
import type { Content } from "@/content";

export function useContent(): Content {
  const language = usePreferencesStore((s) => s.language);
  return locales[language];
}
