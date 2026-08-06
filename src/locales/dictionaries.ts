import 'server-only';

const dictionaries = {
  pt: () => import('./pt.json').then((module) => module.default),
  en: () => import('./en.json').then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export const getDictionary = async (locale: Locale) => {
  if (dictionaries[locale]) {
    return dictionaries[locale]();
  }
  return dictionaries.pt();
};
