import 'server-only';

const dictionaries = {
  pt: () => import('../locales/pt.json').then((module) => module.default),
  en: () => import('../locales/en.json').then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export const getDictionary = async (locale: Locale) => {
  if (dictionaries[locale]) {
    return dictionaries[locale]();
  }
  return dictionaries.pt();
};
