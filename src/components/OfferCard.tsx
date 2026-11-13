import React from 'react';
import {
  BadgeCheck,
  Bookmark,
  MapPin,
  MessageSquare,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import { Language, Offer } from '../types/perso';
import { CATEGORY_LABELS, STATUS_LABELS } from '../localization/translations';
import { formatNumber, formatPercent, formatPrice } from '../utils/formatters';

interface OfferCardProps {
  offer: Offer;
  lang: Language;
  isInterested: boolean;
  onSelectProduct: (productId: string, offerId: string) => void;
  onComparePrices: (productId: string) => void;
  onToggleInterest: (productId: string) => void;
  onStartChat: (offer: Offer) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  offer,
  lang,
  isInterested,
  onSelectProduct,
  onComparePrices,
  onToggleInterest,
  onStartChat,
}) => {
  const isFa = lang === 'fa';
  const statusInfo = STATUS_LABELS[offer.status];
  const categoryLabel = CATEGORY_LABELS[offer.category];

  return (
    <article
      className={`rounded-2xl bg-white border transition-all duration-150 p-2.5 sm:p-3.5 shadow-[0_1px_4px_rgba(38,61,56,0.04)] hover:border-[#5F978B] ${
        offer.isPrescriptionOnly
          ? 'border-[#F7EAE2] bg-[#F7EAE2]/20'
          : 'border-[#E1EBE5]'
      }`}
    >
      {/* Row 1: Product Name, Brand/Spec & Price (Price has the strongest visual hierarchy) */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => onSelectProduct(offer.productId, offer.id)}
              className="text-start text-[13px] sm:text-[15px] font-extrabold text-[#263D38] hover:text-[#477D72] transition-colors leading-snug cursor-pointer truncate max-w-full"
            >
              {isFa ? offer.productNameFa : offer.productNameEn}
            </button>
          </div>

          {/* Brand & Model / Spec */}
          <p className="text-[11px] sm:text-xs text-[#718780] mt-0.5 leading-snug truncate">
            <span className="font-bold text-[#263D38]">
              {isFa ? offer.brandFa : offer.brandEn}
            </span>
            <span className="mx-1 text-[#A9D5C5]">·</span>
            <span>{isFa ? offer.modelSpecFa : offer.modelSpecEn}</span>
          </p>
        </div>

        {/* PRICE — Strongest Visual Hierarchy */}
        <div className="shrink-0 text-end">
          <div className="px-2.5 py-1 rounded-xl bg-gradient-main-mint border border-[#A9D5C5]/70 shadow-2xs">
            <div className="text-[15px] sm:text-[17px] font-extrabold text-[#263D38] tabular-nums-fa leading-none">
              {formatNumber(offer.priceToman, lang)}
              <span className="text-[10px] sm:text-[11px] font-bold text-[#477D72] ms-1">
                {isFa ? 'تومان' : 'Toman'}
              </span>
            </div>
            <div className="text-[9.5px] text-[#477D72] font-medium mt-0.5 leading-none">
              {isFa ? `هر ${offer.unitFa}` : `per ${offer.unitEn}`}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Location (City + Tehran neighborhood), Status, Match Score & Sample Data tag */}
      <div className="mt-1.5 flex items-center justify-between gap-1.5 flex-wrap text-[10.5px] sm:text-[11px]">
        <div className="flex items-center gap-1.5 flex-wrap text-[#263D38]">
          <span className="inline-flex items-center gap-0.5 font-semibold text-[#263D38]">
            <MapPin className="w-3 h-3 text-[#5F978B] shrink-0" />
            <span>{isFa ? offer.cityFa : offer.cityEn}</span>
            {offer.tehranDistrictFa && (
              <span className="text-[#477D72] font-medium">
                ({isFa ? offer.tehranDistrictFa : offer.tehranDistrictEn})
              </span>
            )}
          </span>
          <span className="text-[#A9D5C5]">·</span>
          <span className={`px-1.5 py-0.5 rounded-md font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
            {isFa ? statusInfo.fa : statusInfo.en}
          </span>
          <span className="text-[#A9D5C5] hidden sm:inline">·</span>
          <span className="text-[#718780] hidden sm:inline">
            {isFa ? categoryLabel.fa : categoryLabel.en}
          </span>
        </div>

        {/* Match Score & Sample Data Label */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="px-1.5 py-0.5 rounded-md bg-[#E8F0F8] text-[#263D38] font-bold tabular-nums-fa">
            {formatPercent(offer.matchScore, lang)} {isFa ? 'تطبیق' : 'Match'}
          </span>
          <span className="text-[10px] font-semibold text-[#718780] bg-[#F5F0DE] px-1.5 py-0.5 rounded-md">
            {isFa ? '«داده نمونه آزمایشی»' : '«Sample Test Data»'}
          </span>
        </div>
      </div>

      {/* Prescription Regulatory Warning if applicable */}
      {offer.isPrescriptionOnly && (
        <div className="mt-1.5 px-2 py-1 rounded-lg bg-[#F7EAE2] border border-[#E1EBE5] flex items-center gap-1.5 text-[10.5px] text-[#263D38] font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-[#477D72] shrink-0" />
          <span>
            {isFa
              ? 'داروی نسخه‌ای: مستثنی از پیشنهاد خرید عادی (صرفاً قابل استعلام با مجوز رسمی داروخانه)'
              : 'Prescription-Only: Excluded from ordinary purchase (Requires verified pharmacy license)'}
          </span>
        </div>
      )}

      {/* Row 3: Seller Info, Posted Date & Quick Actions */}
      <div className="mt-2 pt-1.5 border-t border-[#E1EBE5]/80 flex items-center justify-between gap-2">
        <div className="min-w-0 flex items-center gap-1.5 text-[10.5px] sm:text-[11px] text-[#718780] truncate">
          <span className="font-semibold text-[#263D38] inline-flex items-center gap-0.5 truncate">
            {offer.sellerVerified && (
              <BadgeCheck className="w-3.5 h-3.5 text-[#5F978B] shrink-0" />
            )}
            <span className="truncate">{isFa ? offer.sellerNameFa : offer.sellerNameEn}</span>
          </span>
          <span className="bidi-ltr text-[10px] text-[#477D72] hidden md:inline">
            {offer.sellerTelegramHandle}
          </span>
          <span>·</span>
          <span className="tabular-nums-fa whitespace-nowrap">
            {isFa ? offer.postedAtFa : offer.postedAtEn}
          </span>
        </div>

        {/* Interactive Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onToggleInterest(offer.productId)}
            className={`min-h-[30px] min-w-[30px] px-1.5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
              isInterested
                ? 'bg-[#EEE9F8] border-[#5F978B] text-[#263D38]'
                : 'bg-[#F7FAF8] border-[#E1EBE5] text-[#718780] hover:text-[#263D38]'
            }`}
            title={isFa ? 'افزودن به علاقه‌مندی‌ها' : 'Save to Interests'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isInterested ? 'fill-[#5F978B] text-[#5F978B]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => onComparePrices(offer.productId)}
            className="min-h-[30px] px-2 rounded-lg bg-[#F7FAF8] hover:bg-[#D9EEE5] border border-[#E1EBE5] text-[10.5px] font-bold text-[#263D38] flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Scale className="w-3 h-3 text-[#5F978B]" />
            <span>{isFa ? 'مقایسه' : 'Compare'}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectProduct(offer.productId, offer.id)}
            className="min-h-[30px] px-2 rounded-lg bg-[#D9EEE5]/80 hover:bg-[#A9D5C5] text-[10.5px] font-bold text-[#263D38] transition-colors cursor-pointer whitespace-nowrap"
          >
            {isFa ? 'جزئیات' : 'Details'}
          </button>

          {!offer.isPrescriptionOnly && (
            <button
              type="button"
              onClick={() => onStartChat(offer)}
              className="min-h-[30px] px-2.5 rounded-lg bg-[#5F978B] hover:bg-[#477D72] text-[10.5px] font-bold text-white flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
            >
              <MessageSquare className="w-3 h-3" />
              <span>{isFa ? 'گفتگو' : 'Chat'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
