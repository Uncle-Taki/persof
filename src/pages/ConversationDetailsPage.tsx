import React, { useState } from 'react';
import {
  MapPin,
  Radio,
  Scale,
  Send,
  Sparkles,
} from 'lucide-react';
import { ConversationThread, Language } from '../types/perso';
import { formatPrice } from '../utils/formatters';

interface ConversationDetailsPageProps {
  lang: Language;
  conversation: ConversationThread;
  onSendMessage: (convId: string, text: string) => void;
  onViewProduct: (productId: string) => void;
  onComparePrices: (productId: string) => void;
}

export const ConversationDetailsPage: React.FC<ConversationDetailsPageProps> = ({
  lang,
  conversation,
  onSendMessage,
  onViewProduct,
  onComparePrices,
}) => {
  const isFa = lang === 'fa';
  const [inputText, setInputText] = useState('');

  const quickTemplates = isFa
    ? [
        'سلام، لطفاً تاریخ انقضا و شماره بچ (Batch Number) را تایید بفرمایید.',
        'آیا امکان ارسال فوری با پیک به داروخانه در تهران امروز وجود دارد؟',
        'لطفاً پیش‌فاکتور رسمی نمونه برای ۱۰ واحد صادر فرمایید.',
      ]
    : [
        'Hello, please confirm the expiry date and batch number.',
        'Is immediate courier dispatch in Tehran available today?',
        'Please share a sample proforma invoice for 10 units.',
      ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(conversation.id, inputText.trim());
    setInputText('');
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-3 pb-24 flex flex-col gap-3">
      {/* Pinned Offer Context Card */}
      <section className="rounded-2xl bg-gradient-main-mint border border-[#A9D5C5] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-sm sm:text-base font-extrabold text-[#263D38]">
              {isFa ? conversation.productNameFa : conversation.productNameEn}
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-white/80 text-[10px] font-bold text-[#477D72]">
              {isFa ? '«داده نمونه آزمایشی»' : '«Sample Test Data»'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#263D38]/85">
            <span className="font-bold">
              {isFa ? conversation.sellerNameFa : conversation.sellerNameEn}
            </span>
            <span className="bidi-ltr font-mono text-[#477D72]">
              {conversation.sellerHandle}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#477D72]" />
              <span>
                {isFa ? conversation.sellerCityFa : conversation.sellerCityEn}
                {conversation.tehranDistrictFa
                  ? ` (${
                      isFa ? conversation.tehranDistrictFa : conversation.tehranDistrictEn
                    })`
                  : ''}
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-white/90 border border-[#E1EBE5] text-end">
            <div className="text-sm sm:text-base font-extrabold text-[#263D38] tabular-nums-fa">
              {formatPrice(conversation.offeredPriceToman, lang)}
            </div>
            <div className="text-[10px] text-[#718780]">
              {isFa ? `هر ${conversation.unitFa}` : `per ${conversation.unitEn}`}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => onViewProduct(conversation.productId)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#F7FAF8] border border-[#E1EBE5] text-[11px] font-bold text-[#263D38] cursor-pointer"
            >
              {isFa ? 'جزئیات محصول' : 'Product Info'}
            </button>
            <button
              type="button"
              onClick={() => onComparePrices(conversation.productId)}
              className="px-2.5 py-1 rounded-lg bg-[#477D72] hover:bg-[#263D38] text-[11px] font-bold text-white flex items-center justify-center gap-1 cursor-pointer"
            >
              <Scale className="w-3 h-3" />
              <span>{isFa ? 'مقایسه قیمت' : 'Compare'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Extracted Telegram Message Box */}
      <section className="rounded-2xl bg-[#E8F0F8]/70 border border-[#E1EBE5] p-3 text-xs text-[#263D38]">
        <div className="flex items-center gap-1.5 font-extrabold text-[#477D72] mb-1">
          <Radio className="w-3.5 h-3.5" />
          <span>
            {isFa
              ? `پیام استخراج‌شده از منبع: ${conversation.sourceTitleFa}`
              : `Extracted from Telegram Source: ${conversation.sourceTitleEn}`}
          </span>
        </div>
        <p className="leading-relaxed">
          «{isFa ? conversation.rawTelegramPostFa : conversation.rawTelegramPostEn}»
        </p>
      </section>

      {/* Chat Messages Container */}
      <section className="rounded-3xl bg-white border border-[#E1EBE5] p-4 space-y-3 min-h-[290px] flex flex-col justify-between">
        <div className="space-y-3">
          {conversation.messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div
                  key={msg.id}
                  className="mx-auto max-w-lg rounded-xl bg-[#F5F0DE]/80 border border-[#E1EBE5] px-3 py-1.5 text-center text-[11px] text-[#263D38] flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#477D72] shrink-0" />
                  <span>{isFa ? msg.textFa : msg.textEn}</span>
                </div>
              );
            }

            const isBuyer = msg.sender === 'buyer';
            return (
              <div
                key={msg.id}
                className={`flex ${isBuyer ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed ${
                    isBuyer
                      ? 'bg-[#D9EEE5] text-[#263D38] border border-[#A9D5C5]'
                      : 'bg-[#F7FAF8] text-[#263D38] border border-[#E1EBE5]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1 text-[10.5px] font-bold text-[#477D72]">
                    <span>
                      {isBuyer
                        ? isFa
                          ? 'شما (خریدار)'
                          : 'You (Buyer)'
                        : isFa
                        ? conversation.sellerNameFa
                        : conversation.sellerNameEn}
                    </span>
                    <span className="tabular-nums-fa text-[#718780]">
                      {isFa ? msg.timestampFa : msg.timestampEn}
                    </span>
                  </div>
                  <p>{isFa ? msg.textFa : msg.textEn}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Clinical Buyer Templates */}
        <div className="pt-3 border-t border-[#E1EBE5] space-y-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {quickTemplates.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputText(tpl)}
                className="px-2.5 py-1 rounded-lg bg-[#F7FAF8] hover:bg-[#D9EEE5] border border-[#E1EBE5] text-[11px] text-[#263D38] whitespace-nowrap cursor-pointer transition-colors"
              >
                {tpl}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isFa
                  ? 'پیام یا استعلام خرید خود را بنویسید (پیش‌نمایش نمونه آزمایشی)...'
                  : 'Write your purchase inquiry (Sample prototype chat)...'
              }
              className="flex-1 h-10 px-3.5 rounded-xl bg-[#F7FAF8] border border-[#E1EBE5] focus:border-[#5F978B] focus:bg-white focus:outline-none text-xs text-[#263D38]"
            />
            <button
              type="submit"
              className="h-10 px-4 rounded-xl bg-[#5F978B] hover:bg-[#477D72] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isFa ? 'ارسال پیام' : 'Send'}</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
