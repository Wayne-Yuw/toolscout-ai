'use client';

import {useLocale} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/routing';
import {locales, localeNames, localeFlags, type Locale} from '@/i18n/config';
import {useEffect, useMemo, useState} from 'react';

export default function LanguageSwitcher({compact = false}: {compact?: boolean}) {
  const router = useRouter();
  const localeFromHook = useLocale();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Use URL to infer locale; fall back to hook value
  const rawPath = typeof window !== 'undefined' ? window.location.pathname : pathname;
  const currentLocale = useMemo(() => {
    const m = rawPath.match(/^\/(en|zh)(?=\/|$)/);
    return (m?.[1] as Locale) || (localeFromHook as Locale);
  }, [rawPath, localeFromHook]) as Locale;

  // What to display: avoid SSR mismatch by using hook until mounted
  const displayLocale = mounted ? currentLocale : (localeFromHook as Locale);

  // Close dropdown on navigation or locale change
  useEffect(() => { setIsOpen(false); }, [rawPath, currentLocale]);

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) { setIsOpen(false); return; }
    const base = rawPath.replace(/^\/(en|zh)(?=\/|$)/, '') || '/';
    router.replace(base, {locale: newLocale});
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 h-10 bg-white border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
        aria-label="Change language"
      >
        <span className="text-base leading-none">{localeFlags[displayLocale]}</span>
        <span className="font-medium text-sm">{localeNames[displayLocale]}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLanguageChange(loc)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors ${currentLocale === loc ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
              >
                <span className="text-base leading-none">{localeFlags[loc]}</span>
                <span className="font-medium text-sm">{localeNames[loc]}</span>
                {currentLocale === loc && (
                  <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
