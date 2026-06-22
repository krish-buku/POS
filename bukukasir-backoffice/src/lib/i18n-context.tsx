import * as React from 'react'
import id from '@/locales/id'
import en from '@/locales/en'

export type Locale = 'id' | 'en'
type TranslationKey = keyof typeof id
type Translations = Record<TranslationKey, string>

const translations: Record<Locale, Translations> = { id, en }

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const I18N_STORAGE_KEY = 'bukukasir_locale'

const I18nContext = React.createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(I18N_STORAGE_KEY)
      if (stored === 'en' || stored === 'id') return stored
    }
    return 'id'
  })

  const setLocale = React.useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(I18N_STORAGE_KEY, newLocale)
  }, [])

  const t = React.useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      let text = translations[locale][key] ?? translations.id[key] ?? key
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replace(`{${k}}`, String(v))
        }
      }
      return text
    },
    [locale],
  )

  const value = React.useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext value={value}>{children}</I18nContext>
}

export function useI18n() {
  const ctx = React.useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

export function useTranslate() {
  return useI18n().t
}
