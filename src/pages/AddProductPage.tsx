import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  PackagePlus,
  ShieldAlert,
} from 'lucide-react';
import { Language, ProductCategory, ScreenId } from '../types/perso';
import { CATEGORY_LABELS } from '../localization/translations';

interface AddProductPageProps {
  lang: Language;
  onAddProductAndInterest: (data: {
    nameFa: string;
    nameEn: string;
    brandFa: string;
    modelSpecFa: string;
    category: ProductCategory;
    unitFa: string;
    targetMaxPriceToman: number;
    preferredCityFa: string;
    requiredQty: number;
    isPrescriptionOnly: boolean;
  }) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const AddProductPage: React.FC<AddProductPageProps> = ({
  lang,
  onAddProductAndInterest,
  onNavigate,
}) => {
  const isFa = lang === 'fa';

  const [nameFa, setNameFa] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [brandFa, setBrandFa] = useState('');
  const [modelSpecFa, setModelSpecFa] = useState('');
  const [category, setCategory] = useState<ProductCategory>('medical_devices');
  const [unitFa, setUnitFa] = useState('دستگاه');
  const [targetPrice, setTargetPrice] = useState('1500000');
  const [preferredCityFa, setPreferredCityFa] = useState('تهران (ولیعصر / کارگر شمالی)');
  const [requiredQty, setRequiredQty] = useState('5');
  const [isPrescriptionOnly, setIsPrescriptionOnly] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFa.trim()) {
      setErrorMsg(
        isFa
          ? 'لطفاً نام فارسی محصول را وارد نمایید.'
          : 'Please enter the product name.'
      );
      return;
    }
    if (!brandFa.trim()) {
      setErrorMsg(
        isFa
          ? 'لطفاً نام برند یا شرکت سازنده را وارد نمایید.'
          : 'Please enter the brand or manufacturer.'
      );
      return;
    }
    const parsedPrice = parseInt(targetPrice.replace(/[^\d]/g, ''), 10);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMsg(
        isFa
          ? 'لطفاً سقف قیمت هدف معتبر به تومان وارد کنید.'
          : 'Please enter a valid target price in Toman.'
      );
      return;
    }

    setErrorMsg(null);
    onAddProductAndInterest({
      nameFa: nameFa.trim(),
      nameEn: nameEn.trim() || nameFa.trim(),
      brandFa: brandFa.trim(),
      modelSpecFa: modelSpecFa.trim() || (isFa ? 'مشخصات استاندارد کلینیکی' : 'Standard Clinical Spec'),
      category,
      unitFa: unitFa.trim() || (isFa ? 'واحد' : 'Unit'),
      targetMaxPriceToman: parsedPrice,
      preferredCityFa,
      requiredQty: Math.max(1, parseInt(requiredQty, 10) || 1),
      isPrescriptionOnly,
    });

    setSuccessMsg(true);
    setTimeout(() => {
      onNavigate('interests');
    }, 900);
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 pt-3 pb-24">
      <div className="rounded-3xl bg-white border border-[#E1EBE5] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-start justify-between gap-3 border-b border-[#E1EBE5] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#D9EEE5] text-[#477D72] flex items-center justify-center">
                <PackagePlus className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-extrabold text-[#263D38]">
                  {isFa
                    ? 'افزودن محصول جدید به کاتالوگ و پایشگر تلگرام'
                    : 'Add New Product to Catalog & Telegram Monitor'}
                </h1>
                <p className="text-xs text-[#718780]">
                  {isFa
                    ? 'تعریف کالای جدید جهت پایش خودکار قیمت در کانال‌ها و سوپرگروه‌های تلگرام («داده نمونه آزمایشی»)'
                    : 'Define a healthcare product to track across monitored Telegram channels («Sample Test Data»)'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#F7EAE2] border border-[#E1EBE5] flex items-center gap-2 text-xs font-bold text-[#263D38]">
            <AlertCircle className="w-4 h-4 text-[#477D72] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-[#D9EEE5] border border-[#5F978B] flex items-center gap-2 text-xs font-bold text-[#263D38]">
            <CheckCircle2 className="w-4 h-4 text-[#477D72] shrink-0" />
            <span>
              {isFa
                ? 'محصول با موفقیت به کاتالوگ نمونه و لیست علاقه‌مندی‌ها اضافه شد!'
                : 'Product added to sample catalog and watchlist interests!'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263D38] mb-1">
                {isFa ? 'نام محصول (فارسی) *' : 'Product Name (Persian) *'}
              </label>
              <input
                type="text"
                value={nameFa}
                onChange={(e) => setNameFa(e.target.value)}
                placeholder={isFa ? 'مثلاً: دستگاه فشارسنج بازویی دیجیتال' : 'e.g. فشارسنج دیجیتال'}
                className="w-full h-10 px-3 rounded-xl bg-[#F7FAF8] border border-[#E1EBE5] focus:border-[#5F978B] focus:bg-white focus:outline-none text-xs text-[#263D38]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263D38] mb-1">
                {isFa ? 'نام یا کد انگلیسی (اختیاری - BiDi)' : 'English Name / Model Code'}
              </label>
              <input
                type="text"
                dir="ltr"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Microlife BP B3 AFIB"
                className="w-full h-10 px-3 rounded-xl bg-[#F7FAF8] border border-[#E1EBE5] focus:border-[#5F978B] focus:bg-white focus:outline-none text-xs text-[#263D38]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263D38] mb-1">
                {isFa ? 'دسته‌بندی محصول سلامت *' : 'Healthcare Category *'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full h-10 px-3 rounded-xl bg-[#F7FAF8] border border-[#E1EBE5] focus:border-[#5F978B] focus:outline-none text-xs font-bold text-[#263D38]"
              >
                {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((k) => (
                  <option key={k} value={k}>
                    {isFa ? CATEGORY_LABELS[k].fa : CATEGORY_LABELS[k].en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263D38] mb-1">
                {isFa ? 'برند / کارخانه سازنده *' : 'Brand / Manufacturer *'}
              </label>
              <input
                type="text"
                value={brandFa}
                onChange={(e) => setBrandFa(e.target.value)}
                placeholder={isFa ? 'مثلاً: میکرولایف (Microlife)' : 'e.g. Microlife'}
                className="w-full h-10 px-3 rounded-xl bg-[#F7FAF8] border border-[#E1EBE5] focus:border-[#5F978B] focus:bg-white focus:outline-none text-xs text-[#263D38]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263D38] mb-1">
                {isFa ? 'مدل یا مشخصات فنی' : 'Model or Technical Specification'}
              </label>
              <input
                type="text"
                value={modelSpecFa}
                onChange={(e) => setModelSpecFa(e.target.value)}
                placeholder={isFa ? 'مثلاً: دارای فناوری تشخیص آریتمی PAD' : 'e.g. With AFIB detection'}
                className="w-full h-10 px-3 rounded-xl bg-[#F7FAF8] border border-[#E1EBE5] focus:border-[#5F978B] focus:bg-white focus:outline-none text-xs text-[#263D38]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263D38] mb-1">
                {isFa ? 'واحد شمارش و بسته‌بندی' : 'Packaging Unit'}
              </label>
              <input
                type="text"
                value={unitFa}
                onChange={(e) => setUnitFa(e.target.value)}
                placeholder={isFa ? 'مثلاً: جعبه ۱۰۰ عددی / دستگاه کامل' : 'e.g. Box of 100 / Unit'}
                className="w-full h-10 px-3 rounded-xl bg-[#F7FAF8] border border-[#E1EBE5] focus:border-[#5F978B] focus:bg-white focus:outline-none text-xs text-[#263D38]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263D38] mb-1">
                {isFa ? 'سقف قیمت هدف (تومان) *' : 'Target Max Price (Toman) *'}
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#F7FAF8] border border-[#E1EBE5] focus:border-[#5F978B] focus:bg-white focus:outline-none text-xs font-bold text-[#263D38] tabular-nums-fa"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263D38] mb-1">
                {isFa ? 'تعداد مورد نیاز خرید' : 'Required Quantity'}
              </label>
              <input
                type="number"
                value={requiredQty}
                onChange={(e) => setRequiredQty(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#F7FAF8] border border-[#E1EBE5] focus:border-[#5F978B] focus:bg-white focus:outline-none text-xs font-bold text-[#263D38] tabular-nums-fa"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263D38] mb-1">
                {isFa ? 'شهر و محدوده ترجیحی تحویل' : 'Preferred City / Tehran Area'}
              </label>
              <input
                type="text"
                value={preferredCityFa}
                onChange={(e) => setPreferredCityFa(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#F7FAF8] border border-[#E1EBE5] focus:border-[#5F978B] focus:bg-white focus:outline-none text-xs text-[#263D38]"
              />
            </div>
          </div>

          {/* Regulatory Compliance Check */}
          <div className="p-3.5 rounded-2xl bg-[#F5F0DE]/70 border border-[#E1EBE5] space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrescriptionOnly}
                onChange={(e) => setIsPrescriptionOnly(e.target.checked)}
                className="mt-0.5 rounded accent-[#5F978B] w-4 h-4"
              />
              <div className="text-xs">
                <span className="font-extrabold text-[#263D38] block">
                  {isFa
                    ? 'این کالا جزو داروهای نسخه‌ای (Rx) نیازمند مجوز رسمی داروخانه است'
                    : 'This item is a Prescription-Only (Rx) medicine requiring verified pharmacy authorization'}
                </span>
                <span className="text-[#718780] mt-0.5 block">
                  {isFa
                    ? 'فرآورده‌های نسخه‌ای از پیشنهادهای خرید عادی مستثنی می‌شوند و صرفاً پس از احراز پروانه بهره‌برداری داروخانه قابل نمایش خواهند بود.'
                    : 'Prescription-only items are excluded from ordinary purchase recommendations unless pharmacy authorization is verified.'}
                </span>
              </div>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onNavigate('interests')}
              className="min-h-[42px] px-4 rounded-xl bg-[#F7FAF8] hover:bg-[#E1EBE5] text-xs font-bold text-[#263D38] cursor-pointer"
            >
              {isFa ? 'انصراف' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="min-h-[42px] px-6 rounded-xl bg-[#5F978B] hover:bg-[#477D72] text-xs font-bold text-white cursor-pointer shadow-xs"
            >
              {isFa ? 'ثبت محصول و شروع پایش نمونه' : 'Save Product & Start Monitoring'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
