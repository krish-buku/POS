import { create } from 'zustand';
import { translations, type Locale, type TranslationKey } from './translations';

interface LocaleState {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggle: () => void;
}

export const useLocaleStore = create<LocaleState>((set, get) => ({
  locale: 'id',
  setLocale: (l) => set({ locale: l }),
  toggle: () => set({ locale: get().locale === 'id' ? 'en' : 'id' }),
}));

export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  return (key: TranslationKey): string => translations[locale][key] ?? key;
}

export function useLocale() {
  return useLocaleStore((s) => s.locale);
}
