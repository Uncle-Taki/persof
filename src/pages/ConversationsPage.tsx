import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  Search,
} from 'lucide-react';
import { ConversationThread, Language } from '../types/perso';
import { formatNumber, formatPrice } from '../utils/formatters';

interface ConversationsPageProps {
  lang: Language;
  conversations: ConversationThread[];
  onSelectConversation: (convId: string) => void;
}

export const ConversationsPage: React.FC<ConversationsPageProps> = ({
  lang,
  conversations,
  onSelectConversation,
}) => {
  const isFa = lang === 'fa';
  const [statusFilter, setStatusFilter] = useState<'all' | ConversationThread['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const statusLabels: Record<
    ConversationThread['status'],
    { fa: string; en: string; bg: string }
  > = {
    price_quoted: {
      fa: 'پیشنهاد قیمت دریافت شد',
      en: 'Price Quoted',
      bg: 'bg-[#D9EEE5]',
    },
    confirmed: {
      fa: 'تایید موجودی و پیش‌فاکتور',
      en: 'Confirmed & Reserved',
      bg: 'bg-[#E8F0F8]',
    },
    awaiting_reply: {
      fa: 'در انتظار پاسخ فروشنده',
      en: 'Awaiting Seller Reply',
      bg: 'bg-[#F5F0DE]',
    },
    archived: {
      fa: 'بایگانی‌شده',
      en: 'Archived',
      bg: 'bg-[#F7FAF8]',
    },
  };

  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return conversations.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (q) {
        const hay = `${c.productNameFa} ${c.productNameEn} ${c.sellerNameFa} ${c.sellerHandle}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [conversations, statusFilter, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-3 pb-24 space-y-4">
      {/* Header Banner */}
      <section className="rounded-3xl bg-gradient-main-mint border border-[#A9D5C5] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#477D72]" />
            <h1 className="text-base sm:text-lg font-extrabold text-[#263D38]">
              {isFa
                ? 'گفتگوها و استعلام‌های خرید از فروشندگان تلگرام'
                : 'Seller Conversations & Purchase Inquiries'}
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-white/80 text-[10px] font-bold text-[#477D72]">
              {isFa ? '«داده نمونه آزمایشی»' : '«Sample Test Data»'}
            </span>
          </div>
          <p className="text-xs text-[#263D38]/85 mt-1">
            {isFa
              ? 'مدیریت متمرکز مذاکرات خرید، استعلام تاریخ انقضا، بچ‌نامبر و دریافت پیش‌فاکتور از فروشندگان شناسایی‌شده در تلگرام'
              : 'Centralized buyer threads for batch verification, expiry checks, and proforma requests from Telegram sellers'}
          </p>
        </div>
      </section>

      {/* Search & Status Filter */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search
            className={`w-4 h-4 text-[#718780] absolute top-1/2 -translate-y-1/2 ${
              isFa ? 'right-3' : 'left-3'
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isFa
                ? 'جستجو در نام محصول یا فروشنده...'
                : 'Search product or seller name...'
            }
            className={`w-full h-10 rounded-xl bg-white border border-[#E1EBE5] focus:border-[#5F978B] focus:outline-none text-xs text-[#263D38] ${
              isFa ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#5F978B] text-white'
                : 'bg-white border border-[#E1EBE5] text-[#718780] hover:text-[#263D38]'
            }`}
          >
            {isFa ? 'همه گفتگوها' : 'All'} ({formatNumber(conversations.length, lang)})
          </button>
          {(['price_quoted', 'confirmed', 'awaiting_reply'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                statusFilter === st
                  ? 'bg-[#5F978B] text-white'
                  : 'bg-white border border-[#E1EBE5] text-[#718780] hover:text-[#263D38]'
              }`}
            >
              {isFa ? statusLabels[st].fa : statusLabels[st].en}
            </button>
          ))}
        </div>
      </section>

      {/* Threads List */}
      <section className="space-y-2.5">
        {filteredList.map((conv) => {
          const stInfo = statusLabels[conv.status];
          const lastMsg = conv.messages[conv.messages.length - 1];

          return (
            <button
              key={conv.id}
              type="button"
              onClick={() => onSelectConversation(conv.id)}
              className="w-full text-start rounded-2xl bg-white border border-[#E1EBE5] hover:border-[#5F978B] p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer shadow-2xs"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm sm:text-base font-extrabold text-[#263D38]">
                    {isFa ? conv.productNameFa : conv.productNameEn}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold text-[#263D38] ${stInfo.bg}`}
                  >
                    {isFa ? stInfo.fa : stInfo.en}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#477D72] text-white text-[10px] font-bold tabular-nums-fa">
                      {formatNumber(conv.unreadCount, lang)}{' '}
                      {isFa ? 'پیام جدید' : 'new'}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-[#718780]">
                  <span className="font-bold text-[#263D38]">
                    {isFa ? conv.sellerNameFa : conv.sellerNameEn}
                  </span>
                  <span className="bidi-ltr font-mono text-[#477D72]">
                    {conv.sellerHandle}
                  </span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-0.5 text-[#263D38]">
                    <MapPin className="w-3.5 h-3.5 text-[#5F978B]" />
                    <span>
                      {isFa ? conv.sellerCityFa : conv.sellerCityEn}
                      {conv.tehranDistrictFa
                        ? ` (${isFa ? conv.tehranDistrictFa : conv.tehranDistrictEn})`
                        : ''}
                    </span>
                  </span>
                </div>

                {lastMsg && (
                  <p className="text-xs text-[#718780] truncate bg-[#F7FAF8] px-3 py-1.5 rounded-xl border border-[#E1EBE5]/70">
                    <strong className="text-[#263D38]">
                      {lastMsg.sender === 'seller'
                        ? isFa
                          ? 'فروشنده: '
                          : 'Seller: '
                        : isFa
                        ? 'شما: '
                        : 'You: '}
                    </strong>
                    {isFa ? lastMsg.textFa : lastMsg.textEn}
                  </p>
                )}
              </div>

              <div className="sm:w-44 shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E1EBE5]">
                <div className="text-end">
                  <div className="text-base font-extrabold text-[#263D38] tabular-nums-fa">
                    {formatPrice(conv.offeredPriceToman, lang)}
                  </div>
                  <div className="text-[10px] text-[#718780]">
                    {isFa ? `هر ${conv.unitFa}` : `per ${conv.unitEn}`}
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 text-[11px] text-[#477D72] font-bold">
                  <Clock className="w-3 h-3" />
                  <span>{isFa ? conv.updatedAtFa : conv.updatedAtEn}</span>
                </div>
              </div>
            </button>
          );
        })}
      </section>
    </div>
  );
};
