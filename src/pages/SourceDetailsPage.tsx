import React from 'react';
import {
  CheckCircle2,
  Link2,
  Lock,
  PauseCircle,
  PlayCircle,
  Radio,
  Tag,
  Trash2,
  Unlock,
  Users,
} from 'lucide-react';
import { Language, Offer, ScreenId, TelegramSource } from '../types/perso';
import { PEER_TYPE_LABELS } from '../localization/translations';
import { formatNumber, formatPercent } from '../utils/formatters';
import { OfferCard } from '../components/OfferCard';

interface SourceDetailsPageProps {
  lang: Language;
  source: TelegramSource;
  sourceOffers: Offer[];
  interestedProductIds: string[];
  onToggleSourceMonitoring: (sourceId: string) => void;
  onDeleteSource: (sourceId: string) => void;
  onSelectProduct: (productId: string, offerId?: string) => void;
  onComparePrices: (productId: string) => void;
  onToggleInterest: (productId: string) => void;
  onStartChat: (offer: Offer) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const SourceDetailsPage: React.FC<SourceDetailsPageProps> = ({
  lang,
  source,
  sourceOffers,
  interestedProductIds,
  onToggleSourceMonitoring,
  onDeleteSource,
  onSelectProduct,
  onComparePrices,
  onToggleInterest,
  onStartChat,
  onNavigate,
}) => {
  const isFa = lang === 'fa';
  const peerInfo = PEER_TYPE_LABELS[source.peerType];
  const isActive = source.monitoringStatus === 'active';

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-3 pb-24 space-y-4">
      {/* Source Identity Card */}
      <section className="rounded-3xl bg-white border border-[#E1EBE5] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold text-[#263D38] ${peerInfo.badgeBg}`}
              >
                {isFa ? peerInfo.fa : peerInfo.en}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F7FAF8] border border-[#E1EBE5] text-xs font-bold text-[#263D38]">
                {source.isPublic ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-[#5F978B]" />
                    <span>{isFa ? 'منبع عمومی' : 'Public Source'}</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-[#477D72]" />
                    <span>{isFa ? 'منبع خصوصی' : 'Private Source'}</span>
                  </>
                )}
              </span>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                  isActive ? 'bg-[#D9EEE5] text-[#263D38]' : 'bg-[#F5F0DE] text-[#718780]'
                }`}
              >
                {isActive
                  ? isFa
                    ? 'پایش زنده فعال'
                    : 'Live Monitoring Active'
                  : isFa
                  ? 'پایش متوقف شده'
                  : 'Monitoring Paused'}
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-extrabold text-[#263D38]">
              {isFa ? source.titleFa : source.titleEn}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#718780]">
              <span className="bidi-ltr font-mono font-bold text-[#477D72]">
                {source.usernameOrUrl}
              </span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-[#263D38] font-semibold tabular-nums-fa">
                <Users className="w-4 h-4 text-[#5F978B]" />
                <span>
                  {formatNumber(source.memberCount, lang)} {isFa ? 'عضو' : 'members'}
                </span>
              </span>
              <span>·</span>
              <span>
                {isFa ? 'تمرکز شهری:' : 'City Focus:'}{' '}
                <strong className="text-[#263D38]">
                  {isFa ? source.cityFocusFa : source.cityFocusEn}
                </strong>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#263D38]/85 leading-relaxed pt-1">
              {isFa ? source.descriptionFa : source.descriptionEn}
            </p>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleSourceMonitoring(source.id)}
              className="min-h-[40px] px-4 rounded-xl bg-[#5F978B] hover:bg-[#477D72] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isActive ? (
                <>
                  <PauseCircle className="w-4 h-4" />
                  <span>{isFa ? 'توقف موقت پایش' : 'Pause Monitoring'}</span>
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4" />
                  <span>{isFa ? 'شروع مجدد پایش' : 'Resume Monitoring'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onDeleteSource(source.id);
                onNavigate('telegram_sources');
              }}
              className="min-h-[40px] px-4 rounded-xl bg-[#F7EAE2] hover:bg-[#F7EAE2]/80 text-[#263D38] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-[#477D72]" />
              <span>{isFa ? 'حذف منبع از پایشگر' : 'Delete Source'}</span>
            </button>
          </div>
        </div>

        {/* Linked Discussion Relationship Section */}
        <div className="p-4 rounded-2xl bg-[#E8F0F8]/70 border border-[#E1EBE5] space-y-1.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-extrabold text-[#263D38] flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-[#477D72]" />
              <span>
                {isFa
                  ? 'وضعیت رابطه گروه گفتگوی متصل (Linked Discussion Relationship)'
                  : 'Linked Discussion Relationship Status'}
              </span>
            </span>
            {source.linkedDiscussion.hasLinkedDiscussion ? (
              <span className="px-2.5 py-0.5 rounded-md bg-[#D9EEE5] text-xs font-bold text-[#263D38]">
                {isFa ? 'متصل به کانال انتشار' : 'Linked to Broadcast Channel'}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-md bg-white text-xs font-semibold text-[#718780]">
                {isFa ? 'بدون گروه گفتگوی متصل مجزا' : 'No Linked Discussion Group'}
              </span>
            )}
          </div>

          {source.linkedDiscussion.hasLinkedDiscussion ? (
            <div className="text-xs text-[#263D38] flex flex-wrap items-center gap-3 pt-1">
              <span>
                <strong>{isFa ? 'عنوان گروه متصل:' : 'Linked Group:'}</strong>{' '}
                {isFa
                  ? source.linkedDiscussion.discussionTitleFa
                  : source.linkedDiscussion.discussionTitleEn}
              </span>
              <span>·</span>
              <span className="bidi-ltr font-mono text-[#477D72] font-bold">
                {source.linkedDiscussion.discussionUsername}
              </span>
              {source.linkedDiscussion.memberCount && (
                <>
                  <span>·</span>
                  <span className="tabular-nums-fa">
                    {formatNumber(source.linkedDiscussion.memberCount, lang)}{' '}
                    {isFa ? 'عضو در گروه مباحثه' : 'discussion members'}
                  </span>
                </>
              )}
            </div>
          ) : (
            <p className="text-xs text-[#718780]">
              {isFa
                ? 'این منبع مستقیماً پیام‌های اعضا را دریافت می‌کند یا کانال فاقد گروه کامنت متصل است.'
                : 'This source receives direct messages or does not have an associated comment discussion group.'}
            </p>
          )}
        </div>

        {/* Keywords & Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-[#F7FAF8] border border-[#E1EBE5]">
            <div className="text-[11px] text-[#718780]">
              {isFa ? 'پیشنهادهای استخراج‌شده' : 'Extracted Offers'}
            </div>
            <div className="text-lg font-extrabold text-[#263D38] tabular-nums-fa mt-0.5">
              {formatNumber(source.extractedOffersCount, lang)}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#F7FAF8] border border-[#E1EBE5]">
            <div className="text-[11px] text-[#718780]">
              {isFa ? 'میانگین دقت تطبیق' : 'Match Precision'}
            </div>
            <div className="text-lg font-extrabold text-[#477D72] tabular-nums-fa mt-0.5">
              {formatPercent(source.matchPrecisionPercent, lang)}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#F7FAF8] border border-[#E1EBE5]">
            <div className="text-[11px] text-[#718780]">
              {isFa ? 'وضعیت دسترسی' : 'Access Status'}
            </div>
            <div className="text-xs font-extrabold text-[#263D38] mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#5F978B]" />
              <span>{isFa ? 'دسترسی تاییدشده' : 'Verified Access'}</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#F7FAF8] border border-[#E1EBE5]">
            <div className="text-[11px] text-[#718780]">
              {isFa ? 'مرجع تشخیص نوع منبع' : 'Resolution Source'}
            </div>
            <div className="text-xs font-extrabold text-[#263D38] mt-1">
              {source.resolutionOrigin === 'backend_mtproto'
                ? isFa
                  ? 'نمونه بک‌اند تلگرام'
                  : 'Sample Backend'
                : isFa
                ? 'شبیه‌سازی فرانت‌اند'
                : 'Simulated Frontend'}
            </div>
          </div>
        </div>

        {/* Monitored Keywords */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-xs font-bold text-[#718780] flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-[#5F978B]" />
            <span>{isFa ? 'کلیدواژه‌های پایش در این منبع:' : 'Tracked Keywords:'}</span>
          </span>
          {source.keywords.map((kw, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-lg bg-[#D9EEE5]/60 text-xs font-bold text-[#263D38]"
            >
              #{kw}
            </span>
          ))}
        </div>
      </section>

      {/* Extracted Offers from this Telegram Source */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-extrabold text-[#263D38] flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-[#5F978B]" />
            <span>
              {isFa
                ? `پیشنهادهای استخراج‌شده از این منبع (${formatNumber(sourceOffers.length, lang)} مورد نمونه)`
                : `Offers Extracted from this Source (${sourceOffers.length} sample items)`}
            </span>
          </h2>
          <span className="text-xs text-[#718780]">
            {isFa ? '«داده نمونه آزمایشی»' : '«Sample Test Data»'}
          </span>
        </div>

        {sourceOffers.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#E1EBE5] p-6 text-center text-xs text-[#718780]">
            {isFa
              ? 'هنوز پیشنهادی از این منبع در لیست فعلی ثبت نشده است.'
              : 'No offers currently listed for this source.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {sourceOffers.map((off) => (
              <OfferCard
                key={off.id}
                offer={off}
                lang={lang}
                isInterested={interestedProductIds.includes(off.productId)}
                onSelectProduct={onSelectProduct}
                onComparePrices={onComparePrices}
                onToggleInterest={onToggleInterest}
                onStartChat={onStartChat}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
