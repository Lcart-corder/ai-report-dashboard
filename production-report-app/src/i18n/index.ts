import type { Language } from "@/lib/types";
import ja from "./ja";
import vi from "./vi";

const dictionaries = { ja, vi } as const;

export type TranslationKey = keyof typeof ja;

export function t(
  lang: Language,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  let text: string = dictionaries[lang][key] ?? dictionaries.ja[key] ?? key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
}

export { ja, vi };
