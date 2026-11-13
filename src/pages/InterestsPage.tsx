import React, { useState } from 'react';
import {
  Bell,
  BellOff,
  CheckCircle2,
  Edit3,
  Heart,
  MapPin,
  PackagePlus,
  Scale,
  Trash2,
} from 'lucide-react';
import { Language, ScreenId, WatchlistInterest } from '../types/perso';
import { CATEGORY_LABELS } from '../localization/translations';
import { formatNumber, formatPrice } from '../utils/formatters';

interface InterestsPageProps {
  lang: Language;
  interests: WatchlistInterest[];
  onToggleNotify: (interestId: string) => void;
  onUpdateTargetPrice: (interestId: string, newTargetToman: number) => void;
  onRemoveInterest: (interestId: string) => void;
  onSelectProduct: (productId: string) => void;
  onComparePrices: (productId: string) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const InterestsPage: React.FC<InterestsPageProps> = ({
  lang,
  interests,
  onToggleNotify,
  onUpdateTargetPrice,
  onRemoveInterest,
  onSelectProduct,
  onComparePrices,
  onNavigate,
}) => {
  const isFa = lang === 'fa';
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  const startEdit = (item: WatchlistInterest) => {
    setEditingId(item.id);
    setTempPrice(String(item.targetMaxPriceToman));
  };

  const saveEdit = (interestId: string) => {
    const parsed = parseInt(tempPrice.replace(/[^\d]/g, ''), 10);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateTargetPrice(interestId, parsed);
    }
    setEditingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-3 pb-24 space-y-4">
      {/* Header Banner */}
      <section className="rounded-3xl bg-gradient-lavender border border-[#E1EBE5] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#477D72] fill-[#A9D5C5]" />
            <h1 className="text-base sm:text-lg font-extrabold text-[#263D38]">
              {isFa
                ? 'علاقه‌مندی‌ها و پایش سقف قیمت خرید'
                : 'Watchlist Interests & Target Price Alerts'}
            </h1>
          </div>
          <p className="text-xs text-[#718780] mt-1">
            {isFa
              ? 'کالاهای منتخب شما به صورت خودکار در کانال‌ها و گروه‌های تلگرامی رصد می‌شوند و در صورت ثبت قیمت زیر سقف هدف اطلاع‌رسانی می‌گردد.'
              : 'Your tracked healthcare products are monitored across Telegram sources for offers below your target price.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('add_product')}
          className="min-h-[42px] px-4 rounded-xl bg-[#5F978B] hover:bg-[#477D72] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <PackagePlus className="w-4 h-4" />
          <span>{isFa ? 'افزودن محصول جدید به پایشگر' : 'Add New Product to Monitor'}</span>
        </button>
      </section>

      {/* Interests List */}
      {interests.length === 0 ? (
        <div className="rounded-3xl bg-white border border-[#E1EBE5] p-8 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#EEE9F8] text-[#477D72] flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6" />
          </div>
          <h2 className="text-base font-extrabold text-[#263D38]">
            {isFa ? 'لیست علاقه‌مندی‌های شما خالی است' : 'Your Interests Watchlist is Empty'}
          </h2>
          <p className="text-xs text-[#718780] mt-1">
            {isFa
              ? 'محصولات مورد نیاز داروخانه یا مرکز درمانی خود را به همراه سقف قیمت هدف اضافه کنید تا پیشنهادهای تلگرام برای شما فیلتر شوند.'
              : 'Add healthcare products with your target price threshold to automatically match Telegram offers.'}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('add_product')}
            className="mt-4 px-5 py-2.5 rounded-xl bg-[#5F978B] hover:bg-[#477D72] text-white text-xs font-bold cursor-pointer"
          >
            {isFa ? 'افزودن اولین محصول' : 'Add First Product'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {interests.map((item) => {
            const cat = CATEGORY_LABELS[item.category];
            const isBelowTarget = item.currentBestPriceToman <= item.targetMaxPriceToman;

            return (
              <div
                key={item.id}
                className="rounded-2xl bg-white border border-[#E1EBE5] p-4 flex flex-col justify-between gap-3 hover:border-[#5F978B] transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-md bg-[#D9EEE5] text-[10px] font-bold text-[#263D38]">
                        {isFa ? cat.fa : cat.en}
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold text-[#263D38] mt-1">
                        {isFa ? item.productNameFa : item.productNameEn}
                      </h3>
                      <p className="text-xs text-[#718780]">
                        {isFa ? item.brandModelFa : item.brandModelEn}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onToggleNotify(item.id)}
                        className={`min-h-[34px] min-w-[34px] rounded-xl border flex items-center justify-center cursor-pointer transition-colors ${
                          item.notifyOnDrop
                            ? 'bg-[#D9EEE5] border-[#5F978B] text-[#263D38]'
                            : 'bg-[#F7FAF8] border-[#E1EBE5] text-[#718780]'
                        }`}
                        title={
                          item.notifyOnDrop
                            ? isFa
                              ? 'هشدار کاهش قیمت فعال است'
                              : 'Price alert enabled'
                            : isFa
                            ? 'هشدار غیرفعال است'
                            : 'Price alert muted'
                        }
                      >
                        {item.notifyOnDrop ? (
                          <Bell className="w-4 h-4 text-[#477D72]" />
                        ) : (
                          <BellOff className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveInterest(item.id)}
                        className="min-h-[34px] min-w-[34px] rounded-xl bg-[#F7FAF8] hover:bg-[#F7EAE2] border border-[#E1EBE5] flex items-center justify-center text-[#718780] hover:text-[#263D38] cursor-pointer transition-colors"
                        title={isFa ? 'حذف از علاقه‌مندی‌ها' : 'Remove from watchlist'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Target Price vs Best Market Offer */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="rounded-xl bg-[#F7FAF8] border border-[#E1EBE5] p-2.5">
                      <div className="flex items-center justify-between text-[11px] text-[#718780]">
                        <span>{isFa ? 'سقف قیمت هدف شما:' : 'Your Target Max:'}</span>
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="text-[#477D72] hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{isFa ? 'ویرایش' : 'Edit'}</span>
                        </button>
                      </div>

                      {editingId === item.id ? (
                        <div className="mt-1 flex items-center gap-1">
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            className="w-full h-7 px-2 rounded-lg bg-white border border-[#5F978B] text-xs font-bold text-[#263D38] tabular-nums-fa"
                          />
                          <button
                            type="button"
                            onClick={() => saveEdit(item.id)}
                            className="px-2 h-7 rounded-lg bg-[#5F978B] text-white text-[11px] font-bold cursor-pointer"
                          >
                            {isFa ? 'ثبت' : 'Save'}
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm font-extrabold text-[#263D38] tabular-nums-fa mt-0.5">
                          {formatPrice(item.targetMaxPriceToman, lang)}
                        </div>
                      )}
                    </div>

                    <div
                      className={`rounded-xl border p-2.5 ${
                        isBelowTarget
                          ? 'bg-[#D9EEE5]/60 border-[#A9D5C5]'
                          : 'bg-[#F5F0DE]/60 border-[#E1EBE5]'
                      }`}
                    >
                      <span className="text-[11px] text-[#718780] block">
                        {isFa ? 'بهترین قیمت فعلی تلگرام:' : 'Current Best Offer:'}
                      </span>
                      <div className="text-sm font-extrabold text-[#263D38] tabular-nums-fa mt-0.5">
                        {formatPrice(item.currentBestPriceToman, lang)}
                      </div>
                    </div>
                  </div>

                  {/* Status Pill & Metadata */}
                  <div className="flex items-center justify-between text-xs pt-1 text-[#718780]">
                    <span className="inline-flex items-center gap-1 text-[#263D38] font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#5F978B]" />
                      <span>{isFa ? item.preferredCityFa : item.preferredCityEn}</span>
                    </span>
                    <span>
                      {isFa ? 'تعداد مورد نیاز:' : 'Req Qty:'}{' '}
                      <strong className="text-[#263D38] tabular-nums-fa">
                        {formatNumber(item.requiredQty, lang)}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2.5 border-t border-[#E1EBE5] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-xs font-bold text-[#477D72]">
                    <CheckCircle2 className="w-4 h-4 text-[#5F978B]" />
                    <span>
                      {isBelowTarget
                        ? isFa
                          ? 'پیشنهاد زیر قیمت هدف یافت شد!'
                          : 'Offer below target price found!'
                        : isFa
                        ? 'در انتظار پیشنهاد ارزان‌تر'
                        : 'Monitoring for lower price'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onComparePrices(item.productId)}
                      className="min-h-[34px] px-2.5 rounded-xl bg-[#F7FAF8] hover:bg-[#D9EEE5] border border-[#E1EBE5] text-xs font-bold text-[#263D38] flex items-center gap-1 cursor-pointer"
                    >
                      <Scale className="w-3.5 h-3.5 text-[#5F978B]" />
                      <span>{isFa ? 'مقایسه' : 'Compare'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectProduct(item.productId)}
                      className="min-h-[34px] px-3 rounded-xl bg-[#5F978B] hover:bg-[#477D72] text-xs font-bold text-white cursor-pointer"
                    >
                      {isFa
                        ? `مشاهده (${formatNumber(item.matchedOffersCount, lang)})`
                        : `View (${item.matchedOffersCount})`}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
