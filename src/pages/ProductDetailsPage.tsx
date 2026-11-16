import React from 'react';
import {
  BadgeCheck,
  Bookmark,
  Building2,
  CheckCircle2,
  FileText,
  MapPin,
  MessageSquare,
  Radio,
  Scale,
  ShieldAlert,
  Sparkles,
  Tag,
} from 'lucide-react';
import { Language, Offer, Product, ScreenId } from '../types/perso';
import { CATEGORY_LABELS, STATUS_LABELS } from '../localization/translations';
import { formatNumber, formatPercent, formatPrice } from '../utils/formatters';

interface ProductDetailsPageProps {
  lang: Language;
  product: Product;
  productOffers: Offer[];
  selectedOfferId?: string;
  isInterested: boolean;
  onToggleInterest: (productId: string) => void;
  onComparePrices: (productId: string) => void;
  onStartChat: (offer: Offer) => void;
  onSelectSource: (sourceId: string) => void;
  onNavigate: (screen: ScreenId) => void;
  isLive?: boolean;
  canStartChat?: boolean;
}

export const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  lang,
  product,
  productOffers,
  selectedOfferId,
  isInterested,
  onToggleInterest,
  onComparePrices,
  onStartChat,
  onSelectSource,
  isLive = false,
  canStartChat = true,
}) => {
  const isFa = lang === 'fa';
  const catLabel = CATEGORY_LABELS[product.category] || CATEGORY_LABELS.other;

  const primaryOffer =
    productOffers.find((o) => o.id === selectedOfferId) || productOffers[0];

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-3 pb-24 space-y-4">
      {/* Sample Data Banner */}
      {!isLive && (
        <div className="rounded-xl bg-[#F5F0DE] border border-[#E1EBE5] px-3 py-2 flex items-center justify-between gap-2 text-xs text-[#263D38]">
          <div className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="w-4 h-4 text-[#477D72] shrink-0" />
            <span>
              {isFa
                ? '«داده نمونه آزمایشی» — مشخصات، قیمت‌ها و فروشندگان این محصول صرفاً جهت نمایش عملکرد پایشگر پرسو تولید شده‌اند.'
                : '«Sample Test Data» — Specifications, prices, and sellers are generated for prototype demonstration only.'}
            </span>
          </div>
          {product.ircCode && <span className="bidi-ltr text-[11px] font-mono text-[#718780] shrink-0">{product.ircCode}</span>}
        </div>
      )}

      {/* Main Product Identity & Market Price Overview Card */}
      <section className="rounded-3xl bg-white border border-[#E1EBE5] p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-[#D9EEE5] text-xs font-bold text-[#263D38]">
                {isFa ? catLabel.fa : catLabel.en}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#E8F0F8] text-xs font-bold text-[#263D38]">
                {product.isPrescriptionOnly
                  ? isFa
                    ? 'داروی نسخه‌ای محدود (نیازمند مجوز داروخانه)'
                    : 'Prescription Restricted (Pharmacy License Required)'
                  : isFa
                  ? 'عرضه مجاز (OTC / تجهیزات سلامت)'
                  : 'Authorized Supply (OTC / Medical)'}
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-extrabold text-[#263D38]">
              {isFa ? product.nameFa : product.nameEn}
            </h1>

            <div className="text-xs sm:text-sm text-[#718780] flex flex-wrap items-center gap-2">
              <span>
                <strong className="text-[#263D38]">{isFa ? 'برند:' : 'Brand:'}</strong>{' '}
                {isFa ? product.brandFa : product.brandEn}
              </span>
              <span>·</span>
              <span>
                <strong className="text-[#263D38]">{isFa ? 'مدل / مشخصات:' : 'Spec:'}</strong>{' '}
                {isFa ? product.modelOrSpecFa : product.modelOrSpecEn}
              </span>
              <span>·</span>
              <span>
                <strong className="text-[#263D38]">{isFa ? 'واحد:' : 'Unit:'}</strong>{' '}
                {isFa ? product.unitFa : product.unitEn}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#263D38]/90 leading-relaxed pt-1">
              {isFa ? product.descriptionFa : product.descriptionEn}
            </p>
          </div>

          {/* Best Price Highlight Box */}
          <div className="md:w-72 shrink-0 rounded-2xl bg-gradient-main-mint border border-[#A9D5C5] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-[#477D72] font-bold">
                <span>{isFa ? 'بهترین قیمت استخراج‌شده' : 'Best Extracted Price'}</span>
                {!isLive && <span>{isFa ? '«داده نمونه آزمایشی»' : '«Sample Data»'}</span>}
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#263D38] tabular-nums-fa mt-1">
                {product.minMarketPriceToman > 0 ? formatPrice(product.minMarketPriceToman, lang) : (isFa ? 'قیمت ثبت نشده' : 'No price data')}
              </div>
              <div className="text-xs text-[#477D72] mt-0.5">
                {isFa ? `به ازای هر ${product.unitFa}` : `per ${product.unitEn}`}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#A9D5C5]/60 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[#718780] block">
                  {isFa ? 'میانگین بازار نمونه:' : 'Sample Market Avg:'}
                </span>
                <span className="font-bold text-[#263D38] tabular-nums-fa">
                  {product.avgMarketPriceToman > 0 ? formatPrice(product.avgMarketPriceToman, lang) : '—'}
                </span>
              </div>
              <div>
                <span className="text-[#718780] block">
                  {isFa ? 'سقف قیمت ثبت‌شده:' : 'Max Observed:'}
                </span>
                <span className="font-bold text-[#263D38] tabular-nums-fa">
                  {product.maxMarketPriceToman > 0 ? formatPrice(product.maxMarketPriceToman, lang) : '—'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onComparePrices(product.id)}
                className="w-full min-h-[42px] rounded-xl bg-[#5F978B] hover:bg-[#477D72] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Scale className="w-4 h-4" />
                <span>
                  {isFa
                    ? `مقایسه قیمت‌ها (${formatNumber(productOffers.length, lang)} فروشنده)`
                    : `Compare Prices (${productOffers.length} Sellers)`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => onToggleInterest(product.id)}
                className={`w-full min-h-[40px] rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  isInterested
                    ? 'bg-[#EEE9F8] border-[#5F978B] text-[#263D38]'
                    : 'bg-white border-[#E1EBE5] text-[#263D38] hover:bg-[#F7FAF8]'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isInterested ? 'fill-[#5F978B] text-[#5F978B]' : ''}`} />
                <span>
                  {isInterested
                    ? isFa
                      ? 'ثبت‌شده در علاقه‌مندی‌ها (فعال)'
                      : 'Saved in Interests (Active)'
                    : isFa
                    ? 'افزودن به علاقه‌مندی‌ها و هشدار قیمت'
                    : 'Add to Interests & Price Alert'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Prescription Regulatory Notice if Rx */}
        {product.isPrescriptionOnly && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#F7EAE2] border border-[#E1EBE5] flex items-start gap-2.5 text-xs text-[#263D38]">
            <ShieldAlert className="w-5 h-5 text-[#477D72] shrink-0 mt-0.5" />
            <div>
              <div className="font-extrabold">
                {isFa
                  ? 'محدودیت نظارتی داروهای نسخه‌ای (Rx)'
                  : 'Prescription-Only Regulatory Restriction (Rx)'}
              </div>
              <p className="mt-0.5 leading-relaxed">
                {isFa ? product.regulatoryNoteFa : product.regulatoryNoteEn}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Extracted Telegram Message Intelligence Section */}
      {primaryOffer && (primaryOffer.sourceId || primaryOffer.rawTelegramExcerptFa || primaryOffer.rawTelegramExcerptEn) && (
        <section className="rounded-2xl bg-[#E8F0F8]/70 border border-[#E1EBE5] p-4 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#263D38]">
              <Radio className="w-4 h-4 text-[#477D72]" />
              <span>
                {isFa
                  ? 'متن پیام استخراج‌شده از منبع تلگرام (تحلیل هوشمند پرسو)'
                  : 'Extracted Telegram Post Excerpt (Perso AI Parser)'}
              </span>
            </div>
            {primaryOffer.sourceId && (
              <button type="button" onClick={() => onSelectSource(primaryOffer.sourceId!)} className="text-xs font-bold text-[#477D72] hover:underline cursor-pointer">
                {isFa ? primaryOffer.sourceTitleFa : primaryOffer.sourceTitleEn} ←
              </button>
            )}
          </div>
          {(primaryOffer.rawTelegramExcerptFa || primaryOffer.rawTelegramExcerptEn) && (
            <blockquote className="p-3 rounded-xl bg-white border border-[#E1EBE5] text-xs text-[#263D38] leading-relaxed">
              «{isFa ? primaryOffer.rawTelegramExcerptFa : primaryOffer.rawTelegramExcerptEn}»
            </blockquote>
          )}
        </section>
      )}

      {/* Active Offers List for this Product */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-extrabold text-[#263D38]">
            {isFa
              ? `فروشندگان و پیشنهادهای فعال این محصول (${formatNumber(productOffers.length, lang)} مورد)`
              : `Active Sellers & Offers for this Product (${productOffers.length})`}
          </h2>
          {!isLive && <span className="text-xs text-[#718780]">{isFa ? '«داده نمونه آزمایشی»' : '«Sample Test Data»'}</span>}
        </div>

        <div className="space-y-2.5">
          {productOffers.map((off) => {
            const st = STATUS_LABELS[off.status];
            return (
              <div
                key={off.id}
                className="rounded-2xl bg-white border border-[#E1EBE5] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#5F978B] transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-extrabold text-[#263D38] inline-flex items-center gap-1">
                      <Building2 className="w-4 h-4 text-[#5F978B]" />
                      <span>{isFa ? off.sellerNameFa : off.sellerNameEn}</span>
                      {off.sellerVerified && <BadgeCheck className="w-4 h-4 text-[#5F978B]" />}
                    </span>
                    {off.sellerTelegramHandle && <span className="bidi-ltr text-xs text-[#477D72] font-mono">{off.sellerTelegramHandle}</span>}
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${st.bg} ${st.text}`}>
                      {isFa ? st.fa : st.en}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#E8F0F8] text-[11px] font-bold text-[#263D38] tabular-nums-fa">
                      {formatPercent(off.matchScore, lang)} {isFa ? 'تطبیق' : 'Match'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#718780]">
                    <span className="inline-flex items-center gap-1 text-[#263D38] font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#5F978B]" />
                      <span>{isFa ? off.cityFa : off.cityEn}</span>
                      {off.tehranDistrictFa && (
                        <span>({isFa ? off.tehranDistrictFa : off.tehranDistrictEn})</span>
                      )}
                    </span>
                    <span>·</span>
                    <span>
                      {isFa ? 'حداقل سفارش:' : 'Min Order:'}{' '}
                      <strong className="text-[#263D38] tabular-nums-fa">
                        {off.minOrderQty != null ? `${formatNumber(off.minOrderQty, lang)} ${isFa ? off.unitFa : off.unitEn}` : (isFa ? 'اعلام نشده' : 'Not specified')}
                      </strong>
                    </span>
                    <span>·</span>
                    <span>
                      {isFa ? 'انقضا/گارانتی نمونه:' : 'Sample Expiry:'}{' '}
                      <strong className="text-[#263D38]">
                        {isFa ? off.expiryDateSampleFa : off.expiryDateSampleEn}
                      </strong>
                    </span>
                    <span>·</span>
                    <span>
                      {isFa ? 'شرایط پرداخت:' : 'Terms:'}{' '}
                      <strong className="text-[#263D38]">
                        {isFa ? off.paymentTermsFa : off.paymentTermsEn}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E1EBE5]">
                  <div className="text-end">
                    <div className="text-lg font-extrabold text-[#263D38] tabular-nums-fa">
                      {off.priceToman != null ? formatPrice(off.priceToman, lang) : (isFa ? 'قیمت اعلام نشده' : 'Price not listed')}
                    </div>
                    <div className="text-[10px] text-[#718780]">
                      {isFa ? off.postedAtFa : off.postedAtEn}
                    </div>
                  </div>

                  {!off.isPrescriptionOnly ? (
                    {canStartChat && <button
                      type="button"
                      onClick={() => onStartChat(off)}
                      className="min-h-[36px] px-3.5 rounded-xl bg-[#5F978B] hover:bg-[#477D72] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isFa ? 'گفتگو و استعلام خرید' : 'Message Seller'}</span>
                    </button>}
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-[#F7EAE2] text-[#263D38] text-[11px] font-bold">
                      {isFa ? 'نیازمند احراز مجوز داروخانه' : 'Pharmacy License Required'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
