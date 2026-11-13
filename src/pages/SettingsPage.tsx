import React, { useState } from 'react';
import {
  CheckCircle2,
  Globe,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Language } from '../types/perso';
import { formatPercent } from '../utils/formatters';

interface SettingsPageProps {
  lang: Language;
  onSetLang: (lang: Language) => void;
  showRxRestricted: boolean;
  onToggleShowRx: (val: boolean) => void;
  onResetDemoData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  lang,
  onSetLang,
  showRxRestricted,
  onToggleShowRx,
  onResetDemoData,
}) => {
  const isFa = lang === 'fa';
  const [matchThreshold, setMatchThreshold] = useState(85);
  const [autoTehranDetect, setAutoTehranDetect] = useState(true);
  const [deduplicateOffers, setDeduplicateOffers] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    onResetDemoData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-3 pb-24 space-y-4">
      {/* Header Banner */}
      <section className="rounded-3xl bg-gradient-main-mint border border-[#A9D5C5] p-4 sm:p-5 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#477D72]" />
            <h1 className="text-base sm:text-lg font-extrabold text-[#263D38]">
              {isFa
                ? 'تنظیمات سامانه هوشمند پرسو (Perso)'
                : 'Perso Platform Configuration & Settings'}
            </h1>
          </div>
          <p className="text-xs text-[#263D38]/85 mt-1">
            {isFa
              ? 'مدیریت زبان و جهت نمایش (RTL/LTR)، قوانین پایشگر تلگرام، ضوابط نظارتی داروخانه و داده‌های نمونه آزمایشی'
              : 'Manage language & layout direction (RTL/LTR), Telegram parser rules, regulatory compliance, and sample test data'}
          </p>
        </div>
      </section>

      {/* 1. Language & RTL/LTR Layout Direction */}
      <section className="rounded-2xl bg-white border border-[#E1EBE5] p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#5F978B]" />
          <h2 className="text-sm sm:text-base font-extrabold text-[#263D38]">
            {isFa
              ? 'زبان رابط کاربری و جهت چیدمان (RTL / LTR)'
              : 'Interface Language & Layout Direction (RTL / LTR)'}
          </h2>
        </div>
        <p className="text-xs text-[#718780]">
          {isFa
            ? 'زبان پیش‌فرض برنامه فارسی (راست‌به‌چپ با تایپوگرافی وزیرمتن) است. همچنین حالت انگلیسی با چیدمان کامل چپ‌به‌راست در دسترس است.'
            : 'Default language is Persian (fa-IR, RTL with Vazirmatn typography). Optional English mode with complete LTR layout is also supported.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => onSetLang('fa')}
            className={`min-h-[48px] p-3 rounded-xl border text-start flex items-center justify-between cursor-pointer transition-all ${
              lang === 'fa'
                ? 'bg-[#D9EEE5] border-[#5F978B] text-[#263D38] font-extrabold'
                : 'bg-[#F7FAF8] border-[#E1EBE5] text-[#718780]'
            }`}
          >
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-[#263D38]">
                فارسی (fa-IR) — پیش‌فرض
              </div>
              <div className="text-[11px] text-[#718780]">
                چیدمان راست‌به‌چپ (RTL) · اعداد فارسی · فونت وزیرمتن
              </div>
            </div>
            {lang === 'fa' && <CheckCircle2 className="w-5 h-5 text-[#477D72]" />}
          </button>

          <button
            type="button"
            onClick={() => onSetLang('en')}
            className={`min-h-[48px] p-3 rounded-xl border text-start flex items-center justify-between cursor-pointer transition-all ${
              lang === 'en'
                ? 'bg-[#D9EEE5] border-[#5F978B] text-[#263D38] font-extrabold'
                : 'bg-[#F7FAF8] border-[#E1EBE5] text-[#718780]'
            }`}
          >
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-[#263D38]">
                English (en-US) — Optional Mode
              </div>
              <div className="text-[11px] text-[#718780]">
                Complete Left-to-Right (LTR) Layout · Vazirmatn
              </div>
            </div>
            {lang === 'en' && <CheckCircle2 className="w-5 h-5 text-[#477D72]" />}
          </button>
        </div>
      </section>

      {/* 2. Workflow Mode: BUY Active / SELL Inactive */}
      <section className="rounded-2xl bg-white border border-[#E1EBE5] p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#5F978B]" />
          <h2 className="text-sm sm:text-base font-extrabold text-[#263D38]">
            {isFa
              ? 'وضعیت جریان‌های کاری بازارچه (تمرکز نسخه اول بر خرید)'
              : 'Marketplace Workflow Status (v1 BUY-Only Focus)'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[#D9EEE5]/60 border border-[#5F978B] flex items-center justify-between">
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-[#263D38]">
                {isFa ? 'جریان خرید (BUY Workflows)' : 'BUY Workflows'}
              </div>
              <div className="text-[11px] text-[#477D72] mt-0.5">
                {isFa
                  ? 'فعال — پایش پیشنهادها، مقایسه قیمت و مذاکره با فروشنده'
                  : 'Active — Offer discovery, price comparison & seller chat'}
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#5F978B] text-white text-xs font-bold">
              {isFa ? 'فعال' : 'Active'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#E1EBE5] opacity-75 flex items-center justify-between">
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#718780]">
                {isFa ? 'جریان فروش و ثبت آگهی عرضه (SELL Workflows)' : 'SELL Workflows'}
              </div>
              <div className="text-[11px] text-[#718780] mt-0.5">
                {isFa
                  ? 'در نسخه اول غیرفعال است و در نسخه‌های آتی فعال خواهد شد'
                  : 'Inactive in first release as required by product scope'}
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-[#E1EBE5] text-[#718780] text-xs font-bold">
              {isFa ? 'غیرفعال' : 'Inactive'}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Telegram Parser & Regulatory Settings */}
      <section className="rounded-2xl bg-white border border-[#E1EBE5] p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#5F978B]" />
          <h2 className="text-sm sm:text-base font-extrabold text-[#263D38]">
            {isFa
              ? 'تنظیمات هوش مصنوعی استخراج پیام و ضوابط داروخانه‌ای'
              : 'Telegram Parser & Pharmacy Regulatory Controls'}
          </h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#E1EBE5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-bold text-[#263D38] block">
                {isFa
                  ? 'حداقل امتیاز تطبیق جهت نمایش در پیشنهادهای برتر'
                  : 'Minimum Match Score Threshold'}
              </span>
              <span className="text-[#718780]">
                {isFa
                  ? 'پیام‌های تلگرامی با دقت کمتر از این آستانه به صورت خودکار فیلتر می‌شوند.'
                  : 'Telegram messages below this confidence score are filtered out.'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="range"
                min={70}
                max={98}
                value={matchThreshold}
                onChange={(e) => setMatchThreshold(Number(e.target.value))}
                className="accent-[#5F978B] cursor-pointer"
              />
              <span className="font-extrabold text-[#477D72] tabular-nums-fa w-10 text-end">
                {formatPercent(matchThreshold, lang)}
              </span>
            </div>
          </div>

          <label className="p-3 rounded-xl bg-[#F7FAF8] border border-[#E1EBE5] flex items-center justify-between gap-3 cursor-pointer">
            <div>
              <span className="font-bold text-[#263D38] block">
                {isFa
                  ? 'تشخیص خودکار محله‌ها و مناطق تهران در متن پیام'
                  : 'Automatic Tehran Neighborhood Extraction'}
              </span>
              <span className="text-[#718780]">
                {isFa
                  ? 'استخراج محدوده‌های ولیعصر، کارگر شمالی، ناصرخسرو، سعادت‌آباد، سیدخندان و ونک از متن آگهی'
                  : 'Extract Tehran districts (Valiasr, North Kargar, Naser Khosrow, etc.) from posts'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoTehranDetect}
              onChange={(e) => setAutoTehranDetect(e.target.checked)}
              className="rounded accent-[#5F978B] w-4 h-4 shrink-0"
            />
          </label>

          <label className="p-3 rounded-xl bg-[#F7FAF8] border border-[#E1EBE5] flex items-center justify-between gap-3 cursor-pointer">
            <div>
              <span className="font-bold text-[#263D38] block">
                {isFa
                  ? 'حذف پیشنهادهای تکراری در کانال‌ها و سوپرگروه‌های هم‌پوشان'
                  : 'Cross-Channel Offer Deduplication'}
              </span>
              <span className="text-[#718780]">
                {isFa
                  ? 'ادغام پیام‌های مشابه یک فروشنده که هم‌زمان در چند سوپرگروه منتشر شده‌اند'
                  : 'Merge identical seller offers posted across multiple monitored groups'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={deduplicateOffers}
              onChange={(e) => setDeduplicateOffers(e.target.checked)}
              className="rounded accent-[#5F978B] w-4 h-4 shrink-0"
            />
          </label>

          <label className="p-3 rounded-xl bg-[#F7EAE2]/60 border border-[#E1EBE5] flex items-center justify-between gap-3 cursor-pointer">
            <div>
              <span className="font-bold text-[#263D38] block">
                {isFa
                  ? 'نمایش اقلام نسخه‌ای نیازمند احراز مجوز رسمی داروخانه (Rx)'
                  : 'Show Prescription-Only (Rx) Items Requiring Pharmacy Authorization'}
              </span>
              <span className="text-[#718780]">
                {isFa
                  ? 'به صورت پیش‌فرض، داروهای نسخه‌ای از پیشنهادهای خرید عادی مستثنی هستند.'
                  : 'By default, prescription medicines are excluded from ordinary purchase recommendations.'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={showRxRestricted}
              onChange={(e) => onToggleShowRx(e.target.checked)}
              className="rounded accent-[#5F978B] w-4 h-4 shrink-0"
            />
          </label>
        </div>
      </section>

      {/* 4. Sample Data Disclaimer & Reset */}
      <section className="rounded-2xl bg-[#F5F0DE] border border-[#E1EBE5] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1 text-xs text-[#263D38]">
          <div className="font-extrabold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#477D72]" />
            <span>
              {isFa
                ? 'مدیریت «داده نمونه آزمایشی» در پیش‌نمایش'
                : 'Prototype «Sample Test Data» Management'}
            </span>
          </div>
          <p className="text-[#718780]">
            {isFa
              ? 'می‌توانید تمامی تغییرات اعمال‌شده در منابع تلگرام، علاقه‌مندی‌ها و گفتگوها را به حالت اولیه بازگردانید.'
              : 'Reset all modified Telegram sources, watchlist interests, and conversation threads to initial sample state.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="min-h-[40px] px-4 rounded-xl bg-white hover:bg-[#D9EEE5] border border-[#A9D5C5] text-xs font-extrabold text-[#263D38] flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <RotateCcw className="w-4 h-4 text-[#477D72]" />
          <span>
            {resetSuccess
              ? isFa
                ? 'داده‌های نمونه بازنشانی شدند!'
                : 'Sample Data Reset Complete!'
              : isFa
              ? 'بازنشانی داده‌های نمونه آزمایشی'
              : 'Reset Sample Test Data'}
          </span>
        </button>
      </section>
    </div>
  );
};
