import { Language } from '../types/perso';

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * Converts standard ASCII digits (0-9) into Persian digits (۰-۹)
 */
export function toPersianDigits(value: string | number): string {
  const str = String(value);
  return str.replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)] ?? d);
}

/**
 * Formats numbers according to the active language (Persian digits in 'fa', ASCII in 'en')
 */
export function formatNumber(value: number, lang: Language = 'fa'): string {
  const formatted = new Intl.NumberFormat('en-US').format(value);
  return lang === 'fa' ? toPersianDigits(formatted) : formatted;
}

/**
 * Formats a Toman price with proper separators and localized numerals
 */
export function formatPrice(priceToman: number, lang: Language = 'fa', includeCurrency = true): string {
  const numStr = formatNumber(priceToman, lang);
  if (!includeCurrency) return numStr;
  return lang === 'fa' ? `${numStr} تومان` : `${numStr} Toman`;
}

/**
 * Formats percentage with localized numerals
 */
export function formatPercent(percent: number, lang: Language = 'fa'): string {
  const numStr = lang === 'fa' ? toPersianDigits(percent) : String(percent);
  return lang === 'fa' ? `${numStr}٪` : `${numStr}%`;
}

/**
 * Helper to pick localized text cleanly
 */
export function tText(lang: Language, fa: string, en: string): string {
  return lang === 'fa' ? fa : en;
}
