import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Link2,
  Lock,
  PauseCircle,
  PlayCircle,
  Plus,
  Radio,
  Search,
  Trash2,
  Unlock,
  Users,
} from 'lucide-react';
import {
  Language,
  ScreenId,
  TelegramPeerType,
  TelegramSource,
} from '../types/perso';
import { PEER_TYPE_LABELS } from '../localization/translations';
import { formatNumber, formatPercent } from '../utils/formatters';

interface TelegramSourcesPageProps {
  lang: Language;
  sources: TelegramSource[];
  onSelectSource: (sourceId: string) => void;
  onToggleSourceMonitoring: (sourceId: string) => void;
  onDeleteSource: (sourceId: string) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const TelegramSourcesPage: React.FC<TelegramSourcesPageProps> = ({
  lang,
  sources,
  onSelectSource,
  onToggleSourceMonitoring,
  onDeleteSource,
  onNavigate,
}) => {
  const isFa = lang === 'fa';
  const [peerFilter, setPeerFilter] = useState<TelegramPeerType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSources = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sources.filter((src) => {
      if (peerFilter !== 'all' && src.peerType !== peerFilter) return false;
      if (q) {
        const hay = `${src.titleFa} ${src.titleEn} ${src.usernameOrUrl} ${src.cityFocusFa}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [sources, peerFilter, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-3 pb-24 space-y-4">
      {/* Header Banner */}
      <section className="rounded-3xl bg-gradient-main-mint border border-[#A9D5C5] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#477D72]" />
            <h1 className="text-base sm:text-lg font-extrabold text-[#263D38]">
              {isFa
                ? 'مدیریت منابع تلگرام (کانال‌ها، سوپرگروه‌ها، فروم‌ها و گروه‌ها)'
                : 'Telegram Source Management (Channels, Supergroups, Forums & Groups)'}
            </h1>
          </div>
          <p className="text-xs text-[#263D38]/85 mt-1">
            {isFa
              ? 'پایش پیام‌های خرید و فروش تجهیزات پزشکی و دارویی. گروه‌های تبادل نظر متصل به کانال‌های انتشار به صورت یک رابطه (Relationship) مدل‌سازی شده‌اند.'
              : 'Monitor healthcare supply channels & groups. Linked discussion groups are represented as a relationship on broadcast channels.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('add_telegram_source')}
          className="min-h-[42px] px-4 rounded-xl bg-[#477D72] hover:bg-[#263D38] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{isFa ? 'افزودن منبع تلگرام جدید' : 'Add Telegram Source'}</span>
        </button>
      </section>

      {/* Search & Peer Type Filter Bar */}
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
                ? 'جستجوی نام کانال، گروه یا شناسه @username...'
                : 'Search channel title or @username...'
            }
            className={`w-full h-10 rounded-xl bg-white border border-[#E1EBE5] focus:border-[#5F978B] focus:outline-none text-xs text-[#263D38] ${
              isFa ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setPeerFilter('all')}
            className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
              peerFilter === 'all'
                ? 'bg-[#5F978B] text-white'
                : 'bg-white border border-[#E1EBE5] text-[#718780] hover:text-[#263D38]'
            }`}
          >
            {isFa ? 'همه منابع' : 'All'} ({formatNumber(sources.length, lang)})
          </button>
          {(['broadcast_channel', 'supergroup', 'forum', 'group'] as TelegramPeerType[]).map(
            (pt) => {
              const info = PEER_TYPE_LABELS[pt];
              return (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setPeerFilter(pt)}
                  className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    peerFilter === pt
                      ? 'bg-[#5F978B] text-white'
                      : 'bg-white border border-[#E1EBE5] text-[#718780] hover:text-[#263D38]'
                  }`}
                >
                  {isFa ? info.fa : info.en}
                </button>
              );
            }
          )}
        </div>
      </section>

      {/* Sources Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredSources.map((src) => {
          const peerInfo = PEER_TYPE_LABELS[src.peerType];
          const isActive = src.monitoringStatus === 'active';

          return (
            <div
              key={src.id}
              className="rounded-2xl bg-white border border-[#E1EBE5] p-4 flex flex-col justify-between gap-3 hover:border-[#5F978B] transition-colors shadow-2xs"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-extrabold text-[#263D38] ${peerInfo.badgeBg}`}
                      >
                        {isFa ? peerInfo.fa : peerInfo.en}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F7FAF8] border border-[#E1EBE5] text-[10.5px] font-semibold text-[#718780]">
                        {src.isPublic ? (
                          <>
                            <Unlock className="w-3 h-3 text-[#5F978B]" />
                            <span>{isFa ? 'عمومی' : 'Public'}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-[#477D72]" />
                            <span>{isFa ? 'خصوصی' : 'Private'}</span>
                          </>
                        )}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold ${
                          isActive
                            ? 'bg-[#D9EEE5] text-[#263D38]'
                            : 'bg-[#F5F0DE] text-[#718780]'
                        }`}
                      >
                        {isActive
                          ? isFa
                            ? 'در حال پایش زنده'
                            : 'Monitoring Active'
                          : isFa
                          ? 'پایش متوقف‌شده'
                          : 'Monitoring Paused'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectSource(src.id)}
                      className="text-start text-sm sm:text-base font-extrabold text-[#263D38] hover:text-[#477D72] mt-1.5 block cursor-pointer"
                    >
                      {isFa ? src.titleFa : src.titleEn}
                    </button>

                    <div className="flex items-center gap-2 text-xs text-[#718780] mt-0.5">
                      <span className="bidi-ltr font-mono text-[#477D72] font-semibold">
                        {src.usernameOrUrl}
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 tabular-nums-fa">
                        <Users className="w-3.5 h-3.5 text-[#5F978B]" />
                        <span>
                          {formatNumber(src.memberCount, lang)} {isFa ? 'عضو' : 'members'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Linked Discussion Relationship Box (Strictly a Relationship, not a peer type) */}
                {src.linkedDiscussion.hasLinkedDiscussion && (
                  <div className="p-2.5 rounded-xl bg-[#E8F0F8]/70 border border-[#E1EBE5] flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Link2 className="w-4 h-4 text-[#477D72] shrink-0" />
                      <div className="truncate">
                        <span className="font-bold text-[#263D38]">
                          {isFa ? 'رابطه گروه گفتگوی متصل:' : 'Linked Discussion Relationship:'}
                        </span>{' '}
                        <span className="text-[#718780]">
                          {isFa
                            ? src.linkedDiscussion.discussionTitleFa
                            : src.linkedDiscussion.discussionTitleEn}
                        </span>
                      </div>
                    </div>
                    <span className="bidi-ltr font-mono text-[11px] text-[#477D72] font-bold shrink-0">
                      {src.linkedDiscussion.discussionUsername}
                    </span>
                  </div>
                )}

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-[#F7FAF8] rounded-xl p-2 border border-[#E1EBE5]">
                    <div className="text-xs font-extrabold text-[#263D38] tabular-nums-fa">
                      {formatNumber(src.extractedOffersCount, lang)}
                    </div>
                    <div className="text-[10px] text-[#718780]">
                      {isFa ? 'پیشنهاد استخراج‌شده' : 'Extracted Offers'}
                    </div>
                  </div>
                  <div className="bg-[#F7FAF8] rounded-xl p-2 border border-[#E1EBE5]">
                    <div className="text-xs font-extrabold text-[#477D72] tabular-nums-fa">
                      {formatPercent(src.matchPrecisionPercent, lang)}
                    </div>
                    <div className="text-[10px] text-[#718780]">
                      {isFa ? 'دقت استخراج' : 'Parser Precision'}
                    </div>
                  </div>
                  <div className="bg-[#F7FAF8] rounded-xl p-2 border border-[#E1EBE5]">
                    <div className="text-xs font-bold text-[#263D38] truncate">
                      {isFa ? src.lastSyncedFa : src.lastSyncedEn}
                    </div>
                    <div className="text-[10px] text-[#718780]">
                      {isFa ? 'آخرین همگام‌سازی' : 'Last Synced'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-2.5 border-t border-[#E1EBE5] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-[11px] text-[#718780]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5F978B]" />
                  <span>
                    {src.resolutionOrigin === 'backend_mtproto'
                      ? isFa
                        ? 'تاییدشده (نمونه بک‌اند)'
                        : 'Verified (Sample Backend)'
                      : isFa
                      ? 'شبیه‌سازی فرانت‌اند'
                      : 'Simulated Frontend'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onToggleSourceMonitoring(src.id)}
                    className="min-h-[34px] px-2.5 rounded-xl bg-[#F7FAF8] hover:bg-[#D9EEE5] border border-[#E1EBE5] text-xs font-bold text-[#263D38] flex items-center gap-1 cursor-pointer"
                  >
                    {isActive ? (
                      <>
                        <PauseCircle className="w-3.5 h-3.5 text-[#477D72]" />
                        <span>{isFa ? 'توقف' : 'Pause'}</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-3.5 h-3.5 text-[#5F978B]" />
                        <span>{isFa ? 'فعال‌سازی' : 'Resume'}</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteSource(src.id)}
                    className="min-h-[34px] min-w-[34px] rounded-xl bg-[#F7FAF8] hover:bg-[#F7EAE2] border border-[#E1EBE5] flex items-center justify-center text-[#718780] hover:text-[#263D38] cursor-pointer"
                    title={isFa ? 'حذف منبع' : 'Remove Source'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectSource(src.id)}
                    className="min-h-[34px] px-3 rounded-xl bg-[#5F978B] hover:bg-[#477D72] text-xs font-bold text-white cursor-pointer"
                  >
                    {isFa ? 'جزئیات منبع' : 'Details'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
