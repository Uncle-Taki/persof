import React, { useMemo, useState } from 'react';
import {
  Award,
  BadgeCheck,
  MapPin,
  MessageSquare,
  Scale,
  TrendingDown,
} from 'lucide-react';
import { Language, Offer, Product } from '../types/perso';
import { STATUS_LABELS } from '../localization/translations';
import { formatNumber, formatPercent, formatPrice } from '../utils/formatters';

interface PriceComparisonPageProps {
  lang: Language;
  products: Product[];
  offers: Offer[];
  selectedProductId: string;
  onSelectProductId: (id: string) => void;
  onStartChat: (offer: Offer) => void;
  onViewProductDetails: (productId: string, offerId?: string) => void;
}

export const PriceComparisonPage: React.FC<PriceComparisonPageProps> = ({
  lang,
  products,
  offers,
  selectedProductId,
  onSelectProductId,
  onStartChat,
  onViewProductDetails,
}) => {
  const isFa = lang === 'fa';
  const [cityFilter, setCityFilter] = useState<'all' | 'tehran'>('all');

  const currentProduct =
    products.find((p) => p.id === selectedProductId) || products[0];

  const matchingOffers = useMemo(() => {
    const list = offers.filter((o) => {
      if (o.productId !== currentProduct.id) return false;
      if (cityFilter === 'tehran' && o.cityFa !== 'تهران') return false;
      return true;
    });
    return [...list].sort((a, b) => a.priceToman - b.priceToman);
  }, [offers, currentProduct.id, cityFilter]);

  const lowestOffer = matchingOffers[0];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-3 pb-24 space-y-4">
      {/* Header & Product Selector Card */}
      <section className="rounded-3xl bg-gradient-main-mint border border-[#A9D5C5] p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-[#477D72]" />
              <h1 className="text-base sm:text-lg font-extrabold text-[#263D38]">
                {isFa
                  ? 'مقایسه هوشمند قیمت فروشندگان تلگرام'
                  : 'Intelligent Telegram Seller Price Comparison'}
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-white/80 text-[10px] font-bold text-[#477D72]">
                {isFa ? '«داده نمونه آزمایشی»' : '«Sample Test Data»'}
              </span>
            </div>
            <p className="text-xs text-[#263D38]/80 mt-0.5">
              {isFa
                ? 'مقایسه لحظه‌ای پیشنهادهای استخراج‌شده بر اساس قیمت واحد، حداقل سفارش، موقعیت در تهران و شرایط تسویه'
                : 'Compare extracted offers by unit price, minimum order quantity, Tehran location, and payment terms'}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setCityFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                cityFilter === 'all'
                  ? 'bg-[#477D72] text-white'
                  : 'bg-white/80 text-[#263D38] hover:bg-white'
              }`}
            >
              {isFa ? 'همه شهرها' : 'All Cities'}
            </button>
            <button
              type="button"
              onClick={() => setCityFilter('tehran')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                cityFilter === 'tehran'
                  ? 'bg-[#477D72] text-white'
                  : 'bg-white/80 text-[#263D38] hover:bg-white'
              }`}
            >
              {isFa ? 'فقط تهران' : 'Tehran Only'}
            </button>
          </div>
        </div>

        {/* Product Dropdown & Quick Multi-Offer Pills */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 pt-1">
          <label className="text-xs font-bold text-[#263D38] shrink-0">
            {isFa ? 'انتخاب محصول جهت مقایسه:' : 'Select Product to Compare:'}
          </label>
          <select
            value={currentProduct.id}
            onChange={(e) => onSelectProductId(e.target.value)}
            className="flex-1 h-10 px-3 rounded-xl bg-white border border-[#E1EBE5] text-xs sm:text-sm font-bold text-[#263D38] focus:border-[#5F978B] focus:outline-none cursor-pointer"
          >
            {products.map((p) => {
              const count = offers.filter((o) => o.productId === p.id).length;
              return (
                <option key={p.id} value={p.id}>
                  {isFa ? p.nameFa : p.nameEn} — ({isFa ? p.brandFa : p.brandEn}) [
                  {formatNumber(count, lang)} {isFa ? 'پیشنهاد' : 'offers'}]
                </option>
              );
            })}
          </select>
        </div>

        {/* Quick Chips for multi-seller products */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['prod-4', 'prod-6', 'prod-1', 'prod-10', 'prod-9', 'prod-7'].map((pid) => {
            const prod = products.find((p) => p.id === pid);
            if (!prod) return null;
            const active = prod.id === currentProduct.id;
            return (
              <button
                key={pid}
                type="button"
                onClick={() => onSelectProductId(pid)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                  active
                    ? 'bg-[#263D38] text-white'
                    : 'bg-white/85 text-[#263D38] hover:bg-white border border-[#E1EBE5]'
                }`}
              >
                {isFa ? prod.nameFa : prod.nameEn}
              </button>
            );
          })}
        </div>
      </section>

      {/* Price Benchmark Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white border border-[#E1EBE5] p-4">
          <div className="text-xs text-[#718780] font-semibold">
            {isFa ? 'کمترین قیمت شناسایی‌شده (بهترین پیشنهاد)' : 'Lowest Identified Price'}
          </div>
          <div className="text-xl font-extrabold text-[#477D72] tabular-nums-fa mt-1">
            {formatPrice(
              lowestOffer ? lowestOffer.priceToman : currentProduct.minMarketPriceToman,
              lang
            )}
          </div>
          <div className="text-[11px] text-[#718780] mt-1">
            {lowestOffer
              ? isFa
                ? `فروشنده: ${lowestOffer.sellerNameFa}`
                : `Seller: ${lowestOffer.sellerNameEn}`
              : ''}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#E1EBE5] p-4">
          <div className="text-xs text-[#718780] font-semibold">
            {isFa ? 'میانگین قیمت در کانال‌های تلگرام' : 'Average Price Across Channels'}
          </div>
          <div className="text-xl font-extrabold text-[#263D38] tabular-nums-fa mt-1">
            {formatPrice(currentProduct.avgMarketPriceToman, lang)}
          </div>
          <div className="text-[11px] text-[#718780] mt-1">
            {isFa
              ? `واحد سنجش: هر ${currentProduct.unitFa}`
              : `Unit: per ${currentProduct.unitEn}`}
          </div>
        </div>

        <div className="rounded-2xl bg-[#EEE9F8]/65 border border-[#E1EBE5] p-4">
          <div className="text-xs text-[#263D38] font-semibold flex items-center gap-1">
            <TrendingDown className="w-4 h-4 text-[#477D72]" />
            <span>{isFa ? 'صرفه‌جویی خرید از بهترین پیشنهاد' : 'Savings with Best Offer'}</span>
          </div>
          <div className="text-xl font-extrabold text-[#263D38] tabular-nums-fa mt-1">
            {formatPrice(
              Math.max(
                0,
                currentProduct.maxMarketPriceToman -
                  (lowestOffer ? lowestOffer.priceToman : currentProduct.minMarketPriceToman)
              ),
              lang
            )}
          </div>
          <div className="text-[11px] text-[#477D72] font-bold mt-1">
            {isFa ? 'در هر واحد نسبت به سقف بازار نمونه' : 'Per unit vs max sample price'}
          </div>
        </div>
      </section>

      {/* Ranked Sellers Comparison Cards / Table */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-extrabold text-[#263D38]">
            {isFa
              ? `جدول رتبه‌بندی پیشنهادها برای «${currentProduct.nameFa}»`
              : `Ranked Offers for "${currentProduct.nameEn}"`}
          </h2>
          <button
            type="button"
            onClick={() => onViewProductDetails(currentProduct.id)}
            className="text-xs font-bold text-[#477D72] hover:underline cursor-pointer"
          >
            {isFa ? 'مشاهده پرونده کامل محصول ←' : 'View Full Product Profile →'}
          </button>
        </div>

        {matchingOffers.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#E1EBE5] p-6 text-center text-xs text-[#718780]">
            {isFa
              ? 'پیشنهادی در این شهر برای محصول انتخاب‌شده ثبت نشده است.'
              : 'No offers found in the selected city filter for this product.'}
          </div>
        ) : (
          <div className="space-y-2.5">
            {matchingOffers.map((off, idx) => {
              const isBest = idx === 0;
              const diffPercent = Math.round(
                ((currentProduct.avgMarketPriceToman - off.priceToman) /
                  currentProduct.avgMarketPriceToman) *
                  100
              );
              const statusInfo = STATUS_LABELS[off.status];

              return (
                <div
                  key={off.id}
                  className={`rounded-2xl bg-white border p-4 transition-all ${
                    isBest
                      ? 'border-[#5F978B] ring-1 ring-[#A9D5C5] bg-gradient-to-l from-[#D9EEE5]/30 to-white'
                      : 'border-[#E1EBE5]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-xs font-extrabold tabular-nums-fa ${
                            isBest
                              ? 'bg-[#5F978B] text-white'
                              : 'bg-[#F7FAF8] text-[#718780] border border-[#E1EBE5]'
                          }`}
                        >
                          #{formatNumber(idx + 1, lang)}
                        </span>
                        {isBest && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#D9EEE5] text-[#263D38] text-xs font-extrabold">
                            <Award className="w-3.5 h-3.5 text-[#477D72]" />
                            <span>{isFa ? 'ارزان‌ترین پیشنهاد تاییدشده' : 'Best Price Offer'}</span>
                          </span>
                        )}
                        <span className="text-sm font-extrabold text-[#263D38] inline-flex items-center gap-1">
                          <span>{isFa ? off.sellerNameFa : off.sellerNameEn}</span>
                          {off.sellerVerified && (
                            <BadgeCheck className="w-4 h-4 text-[#5F978B]" />
                          )}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-[#F5F0DE] text-[10px] font-bold text-[#718780]">
                          {isFa ? '«داده نمونه آزمایشی»' : '«Sample Test Data»'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                        <div className="bg-[#F7FAF8] rounded-xl p-2 border border-[#E1EBE5]">
                          <span className="text-[10px] text-[#718780] block">
                            {isFa ? 'شهر و موقعیت:' : 'Location:'}
                          </span>
                          <span className="font-bold text-[#263D38] inline-flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#5F978B]" />
                            <span>
                              {isFa ? off.cityFa : off.cityEn}
                              {off.tehranDistrictFa
                                ? ` — ${isFa ? off.tehranDistrictFa : off.tehranDistrictEn}`
                                : ''}
                            </span>
                          </span>
                        </div>

                        <div className="bg-[#F7FAF8] rounded-xl p-2 border border-[#E1EBE5]">
                          <span className="text-[10px] text-[#718780] block">
                            {isFa ? 'حداقل سفارش و وضعیت:' : 'Min Order & Status:'}
                          </span>
                          <span className="font-bold text-[#263D38] block mt-0.5 tabular-nums-fa">
                            {formatNumber(off.minOrderQty, lang)} {isFa ? off.unitFa : off.unitEn} ·{' '}
                            <span className="text-[#477D72]">
                              {isFa ? statusInfo.fa : statusInfo.en}
                            </span>
                          </span>
                        </div>

                        <div className="bg-[#F7FAF8] rounded-xl p-2 border border-[#E1EBE5]">
                          <span className="text-[10px] text-[#718780] block">
                            {isFa ? 'شرایط تسویه و انقضا:' : 'Terms & Sample Expiry:'}
                          </span>
                          <span className="font-bold text-[#263D38] block mt-0.5">
                            {isFa ? off.paymentTermsFa : off.paymentTermsEn} (
                            {isFa ? off.expiryDateSampleFa : off.expiryDateSampleEn})
                          </span>
                        </div>

                        <div className="bg-[#F7FAF8] rounded-xl p-2 border border-[#E1EBE5]">
                          <span className="text-[10px] text-[#718780] block">
                            {isFa ? 'منبع تلگرام و تطبیق:' : 'Telegram Source:'}
                          </span>
                          <span className="font-bold text-[#263D38] block mt-0.5 truncate">
                            {formatPercent(off.matchScore, lang)} ·{' '}
                            {isFa ? off.sourceTitleFa : off.sourceTitleEn}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Price & Action Column */}
                    <div className="md:w-52 shrink-0 flex md:flex-col items-center md:items-end justify-between gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#E1EBE5]">
                      <div className="text-end">
                        <div className="text-xl font-extrabold text-[#263D38] tabular-nums-fa">
                          {formatPrice(off.priceToman, lang)}
                        </div>
                        {diffPercent > 0 ? (
                          <span className="inline-block text-[11px] font-bold text-[#477D72] bg-[#D9EEE5] px-2 py-0.5 rounded-md mt-0.5 tabular-nums-fa">
                            {formatPercent(diffPercent, lang)}{' '}
                            {isFa ? 'پایین‌تر از میانگین بازار' : 'below market avg'}
                          </span>
                        ) : (
                          <span className="inline-block text-[11px] text-[#718780] mt-0.5">
                            {isFa ? 'نزدیک به میانگین بازار' : 'Near market avg'}
                          </span>
                        )}
                      </div>

                      {!off.isPrescriptionOnly && (
                        <button
                          type="button"
                          onClick={() => onStartChat(off)}
                          className="min-h-[38px] px-4 rounded-xl bg-[#5F978B] hover:bg-[#477D72] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{isFa ? 'شروع گفتگو با فروشنده' : 'Chat with Seller'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
