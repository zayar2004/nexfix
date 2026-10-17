import my from "@/locales/my.json";
import en from "@/locales/en.json";

export type Locale = "my" | "en";

const dictionaries: Record<Locale, Record<string, string>> = {
  my: my as Record<string, string>,
  en: en as Record<string, string>,
};

export function getDictionary(locale: Locale): Record<string, string> {
  return dictionaries[locale] ?? dictionaries.my;
}

export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>
): string {
  const dict = getDictionary(locale);
  let result = dict[key] ?? dictionaries.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      result = result.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return result;
}
