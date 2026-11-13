import React from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Globe,
  Plus,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { Language, ScreenId } from '../types/perso';
import { getUI } from '../localization/translations';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onBack?: () => void;
}

const SUB_SCREENS: Record<ScreenId, { fa: string; en: string } | null> = {
  best_offers: null,
  interests: null,
  telegram_sources: null,
  conversations: null,
  settings: null,
  product_details: { fa: 'جزئیات محصول و مشخصات فنی', en: 'Product Details & Specs' },
  price_comparison: { fa: 'مقایسه قیمت‌های بازار تلگرام', en: 'Telegram Price Comparison' },
  add_product: { fa: 'افزودن محصول به پایشگر', en: 'Add Product to Monitor' },
  add_telegram_source: { fa: 'افزودن منبع تلگرام جدید', en: 'Add Telegram Source' },
  source_details: { fa: 'جزئیات منبع تلگرام', en: 'Telegram Source Details' },
  conversation_details: { fa: 'جزئیات گفتگو با فروشنده', en: 'Seller Conversation Thread' },
};

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  currentScreen,
  onNavigate,
  onBack,
}) => {
  const ui = getUI(lang);
  const isFa = lang === 'fa';
  const subTitle = SUB_SCREENS[currentScreen];

  return (
    <header className="sticky top-0 z-30 h-12 bg-white/95 backdrop-blur-md border-b border-[#E1EBE5] px-3 sm:px-6 flex items-center justify-between gap-2">
      {/* Zone 1: Brand or Back Button */}
      <div className="flex items-center gap-2 min-w-0">
        {subTitle && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="min-h-[38px] min-w-[38px] rounded-xl bg-[#F7FAF8] hover:bg-[#D9EEE5] border border-[#E1EBE5] flex items-center justify-center text-[#263D38] transition-colors cursor-pointer shrink-0"
            aria-label={isFa ? 'بازگشت' : 'Back'}
          >
            {isFa ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onNavigate('best_offers')}
            className="flex items-center gap-2 text-start cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-muted-teal flex items-center justify-center text-white shadow-xs shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-[#263D38]">
                  {ui.appName}
                </span>
                <span className="text-[10px] font-semibold text-[#477D72] bidi-ltr">
                  Perso
                </span>
              </div>
            </div>
          </button>
        )}

        {subTitle ? (
          <h1 className="text-xs sm:text-sm font-bold text-[#263D38] truncate">
            {isFa ? subTitle.fa : subTitle.en}
          </h1>
        ) : (
          <span className="hidden md:inline-block text-xs text-[#718780] truncate">
            · {ui.appSubtitle}
          </span>
        )}
      </div>

      {/* Zone 2: Desktop Quick Screen Links */}
      <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-[#718780]">
        <button
          type="button"
          onClick={() => onNavigate('best_offers')}
          className={`hover:text-[#263D38] transition-colors whitespace-nowrap cursor-pointer ${
            currentScreen === 'best_offers' ? 'text-[#477D72] font-bold underline underline-offset-4' : ''
          }`}
        >
          {ui.nav.bestOffers}
        </button>
        <button
          type="button"
          onClick={() => onNavigate('price_comparison')}
          className={`hover:text-[#263D38] transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            currentScreen === 'price_comparison' ? 'text-[#477D72] font-bold underline underline-offset-4' : ''
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{isFa ? 'مقایسه قیمت‌ها' : 'Price Comparison'}</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('add_product')}
          className={`hover:text-[#263D38] transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            currentScreen === 'add_product' ? 'text-[#477D72] font-bold underline underline-offset-4' : ''
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isFa ? 'افزودن محصول' : 'Add Product'}</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('add_telegram_source')}
          className={`hover:text-[#263D38] transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ${
            currentScreen === 'add_telegram_source' ? 'text-[#477D72] font-bold underline underline-offset-4' : ''
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isFa ? 'افزودن منبع تلگرام' : 'Add Telegram Source'}</span>
        </button>
      </nav>

      {/* Zone 3: Mode Status & Language Switcher */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* BUY-Only Indicator & Compare Prices Shortcut on Mobile */}
        <button
          type="button"
          onClick={() => onNavigate('price_comparison')}
          className="lg:hidden min-h-[34px] px-2.5 py-1 rounded-lg bg-[#D9EEE5]/70 hover:bg-[#D9EEE5] text-[#263D38] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
          title={isFa ? 'مقایسه قیمت‌ها' : 'Compare Prices'}
        >
          <Scale className="w-3.5 h-3.5 text-[#477D72]" />
          <span>{isFa ? 'مقایسه قیمت' : 'Compare'}</span>
        </button>

        <div
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F7FAF8] border border-[#E1EBE5] text-[11px] text-[#263D38]"
          title={isFa ? 'در نسخه اول فقط جریان خرید فعال است و بخش فروش غیرفعال می‌باشد' : 'First release focuses on BUY workflows only; SELL is inactive'}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#5F978B]" />
          <span className="font-bold text-[#477D72]">{ui.buyModeActive}</span>
          <span className="text-[#718780]">·</span>
          <span className="text-[#718780] line-through opacity-75">{isFa ? 'فروش' : 'SELL'}</span>
        </div>

        <button
          type="button"
          onClick={onToggleLang}
          className="min-h-[34px] px-2.5 py-1 rounded-lg bg-[#F7FAF8] hover:bg-[#D9EEE5] border border-[#E1EBE5] text-[11px] font-bold text-[#263D38] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          aria-label={isFa ? 'تغییر زبان به انگلیسی' : 'Switch language to Persian'}
        >
          <Globe className="w-3.5 h-3.5 text-[#5F978B]" />
          <span>{isFa ? 'EN' : 'فارسی'}</span>
        </button>
      </div>
    </header>
  );
};
