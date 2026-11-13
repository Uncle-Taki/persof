import React, { useState } from 'react';
import {
  CheckCircle2,
  Cpu,
  Info,
  Link2,
  Radio,
  Sparkles,
} from 'lucide-react';
import {
  Language,
  ScreenId,
  TelegramPeerType,
  TelegramSource,
} from '../types/perso';
import { PEER_TYPE_LABELS } from '../localization/translations';

interface AddTelegramSourcePageProps {
  lang: Language;
  onAddSource: (newSource: TelegramSource) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const AddTelegramSourcePage: React.FC<AddTelegramSourcePageProps> = ({
  lang,
  onAddSource,
  onNavigate,
}) => {
  const isFa = lang === 'fa';

  const [usernameOrUrl, setUsernameOrUrl] = useState('@tehran_pharmacy_exchange');
  const [titleFa, setTitleFa] = useState('کانال تبادل داروخانه‌ها و تجهیزات پزشکی تهران');
  const [peerType, setPeerType] = useState<TelegramPeerType>('broadcast_channel');
  const [isPublic, setIsPublic] = useState(true);
  const [accessStatus, setAccessStatus] = useState<'verified' | 'pending_join'>('verified');
  const [monitoringStatus, setMonitoringStatus] = useState<'active' | 'paused'>('active');
  const [hasLinkedDiscussion, setHasLinkedDiscussion] = useState(true);
  const [discussionUsername, setDiscussionUsername] = useState('@tehran_pharmacy_chat');
  const [discussionTitleFa, setDiscussionTitleFa] = useState(
    'گروه گفتگوی متصل تبادل داروخانه‌های تهران'
  );
  const [cityFocusFa, setCityFocusFa] = useState('تهران');
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedBanner, setResolvedBanner] = useState<string | null>(null);

  // Simulated frontend auto-detection based on username/URL patterns
  const handleSimulatedAutoDetect = () => {
    if (!usernameOrUrl.trim()) return;
    setIsResolving(true);
    setTimeout(() => {
      const lower = usernameOrUrl.toLowerCase();
      if (lower.includes('forum') || lower.includes('topic')) {
        setPeerType('forum');
        setHasLinkedDiscussion(false);
        setTitleFa('فروم موضوعی تجهیزات و ملزومات پزشکی (شبیه‌سازی‌شده)');
      } else if (lower.includes('super') || lower.includes('bazaar') || lower.includes('hub')) {
        setPeerType('supergroup');
        setHasLinkedDiscussion(false);
        setTitleFa('سوپرگروه تامین‌کنندگان تجهیزات سلامت (شبیه‌سازی‌شده)');
      } else if (lower.includes('group') || lower.includes('joinchat') || lower.includes('+')) {
        setPeerType('group');
        setIsPublic(false);
        setHasLinkedDiscussion(false);
        setTitleFa('گروه همکاران پخش تجهیزات پزشکی (شبیه‌سازی‌شده)');
      } else {
        setPeerType('broadcast_channel');
        setHasLinkedDiscussion(true);
        setDiscussionUsername(`${usernameOrUrl.replace(/\/$/, '')}_discuss`);
      }
      setIsResolving(false);
      setResolvedBanner(
        isFa
          ? 'تحلیل شبیه‌سازی‌شده فرانت‌اند انجام شد. توجه: در محیط عملیاتی، نوع نهایی همتای تلگرام (Peer Type) و رابطه گروه گفتگوی متصل منحصراً توسط بک‌اند تلگرام (MTProto) تعیین می‌گردد.'
          : 'Simulated frontend resolution complete. Note: In production, the authoritative peer type and linked discussion relationship are determined by the Telegram backend.'
      );
    }, 450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrUrl.trim() || !titleFa.trim()) return;

    const newSrc: TelegramSource = {
      id: `src-${Date.now()}`,
      usernameOrUrl: usernameOrUrl.trim(),
      titleFa: titleFa.trim(),
      titleEn: titleFa.trim(),
      peerType,
      isPublic,
      accessStatus,
      monitoringStatus,
      memberCount: 3450,
      extractedOffersCount: 12,
      matchPrecisionPercent: 94,
      lastSyncedFa: 'هم‌اکنون (شبیه‌سازی فرانت‌اند)',
      lastSyncedEn: 'Just now (Simulated Frontend)',
      cityFocusFa: cityFocusFa || 'تهران',
      cityFocusEn: cityFocusFa || 'Tehran',
      descriptionFa:
        'منبع تلگرام اضافه‌شده در نسخه پیش‌نمایش پرسو جهت پایش پیام‌های خرید تجهیزات پزشکی و داروخانه‌ای.',
      descriptionEn: 'User-added Telegram source in Perso prototype.',
      keywords: ['تجهیزات پزشکی', 'فشارسنج', 'نوار تست', 'داروخانه'],
      linkedDiscussion:
        peerType === 'broadcast_channel' && hasLinkedDiscussion
          ? {
              hasLinkedDiscussion: true,
              discussionUsername: discussionUsername.trim() || '@linked_discussion_sample',
              discussionTitleFa:
                discussionTitleFa.trim() || 'گروه گفتگوی متصل (رابطه کانال)',
              discussionTitleEn: 'Linked Discussion Group Relationship',
              memberCount: 820,
              autoSyncReplies: true,
            }
          : {
              hasLinkedDiscussion: false,
            },
      resolutionOrigin: 'simulated_frontend',
    };

    onAddSource(newSrc);
    onNavigate('telegram_sources');
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 pt-3 pb-24 space-y-4">
      {/* Architecture & Backend Distinction Notice */}
      <div className="rounded-2xl bg-[#E8F0F8] border border-[#E1EBE5] p-3.5 flex items-start gap-2.5 text-xs text-[#263D38]">
        <Info className="w-5 h-5 text-[#477D72] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-extrabold block">
            {isFa
              ? 'تفکیک شبیه‌سازی فرانت‌اند از دسترسی واقعی تلگرام (Backend Resolution)'
              : 'Distinction Between Simulated Resolution & Real Telegram Backend Access'}
          </strong>
          <span>
            {isFa
              ? 'در این پیش‌نمایش فرانت‌اند، تشخیص نوع منبع به صورت شبیه‌سازی‌شده انجام می‌شود. در معماری نهایی پرسو، بک‌اند تلگرام مسئول تشخیص قطعی نوع همتا (گروه، سوپرگروه، فروم یا کانال انتشار) و استخراج رابطه گروه تبادل نظر متصل (Linked Discussion Relationship) است.'
              : 'This frontend prototype simulates peer resolution. The backend ultimately determines the actual Telegram peer type and linked discussion relationship.'}
          </span>
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-[#E1EBE5] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-[#E1EBE5] pb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-main-mint flex items-center justify-center text-[#263D72]">
            <Radio className="w-5 h-5 text-[#477D72]" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-[#263D38]">
              {isFa ? 'افزودن منبع تلگرام جدید به پایشگر' : 'Add New Telegram Source'}
            </h1>
            <p className="text-xs text-[#718780]">
              {isFa
                ? 'پشتیبانی از گروه، سوپرگروه، فروم و کانال انتشار به همراه رابطه گروه گفتگوی متصل'
                : 'Supports Group, Supergroup, Forum, and Broadcast Channel with Linked Discussion relationship'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Telegram Username or URL + Auto Detection */}
          <div>
            <label className="block text-xs font-bold text-[#263D38] mb-1">
              {isFa
                ? 'شناسه کاربری (@username) یا لینک دعوت تلگرام (t.me/...) *'
                : 'Telegram Username (@username) or URL (t.me/...) *'}
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                dir="ltr"
                value={usernameOrUrl}
                onChange={(e) => setUsernameOrUrl(e.target.value)}
                placeholder="@channel_username or https://t.me/..."
                className="flex-1 h-10 px-3 rounded-xl bg-[#F7FAF8] border border-[#E1EBE5] focus:border-[#5F978B] focus:bg-white focus:outline-none text-xs font-mono text-[#263D38]"
              />
              <button
                type="button"
                onClick={handleSimulatedAutoDetect}
                className="h-10 px-4 rounded-xl bg-[#D9EEE5] hover:bg-[#A9D5C5] text-[#263D38] text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Cpu className="w-4 h-4 text-[#477D72]" />
                <span>
                  {isResolving
                    ? isFa
                      ? 'در حال تشخیص شبیه‌سازی‌شده...'
                      : 'Simulating Detection...'
                    : isFa
                    ? 'تشخیص خودکار نوع منبع (شبیه‌سازی)'
                    : 'Auto-Detect Type (Simulated)'}
                </span>
              </button>
            </div>
          </div>

          {resolvedBanner && (
            <div className="p-3 rounded-xl bg-[#D9EEE5]/65 border border-[#5F978B] flex items-center gap-2 text-xs text-[#263D38]">
              <Sparkles className="w-4 h-4 text-[#477D72] shrink-0" />
              <span>{resolvedBanner}</span>
            </div>
          )}

          {/* 2. Source Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#263D38] mb-1">
                {isFa ? 'عنوان منبع تلگرام *' : 'Source Title *'}
              </label>
              <input
                type="text"
                value={titleFa}
                onChange={(e) => setTitleFa(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#F7FAF8] border border-[#E1EBE5] focus:border-[#5F978B] focus:bg-white focus:outline-none text-xs text-[#263D38]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#263D38] mb-1">
                {isFa ? 'تمرکز جغرافیایی (شهر / منطقه تهران)' : 'Geographic Focus (City / Tehran)'}
              </label>
              <input
                type="text"
                value={cityFocusFa}
                onChange={(e) => setCityFocusFa(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#F7FAF8] border border-[#E1EBE5] focus:border-[#5F978B] focus:bg-white focus:outline-none text-xs text-[#263D38]"
              />
            </div>
          </div>

          {/* 3. Detected Source Type (4 Supported Peer Types) */}
          <div>
            <label className="block text-xs font-bold text-[#263D38] mb-1.5">
              {isFa
                ? 'نوع منبع تشخیص‌داده‌شده (۴ نوع همتای استاندارد تلگرام):'
                : 'Detected Telegram Peer Type (4 Standard Peer Types):'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['broadcast_channel', 'supergroup', 'forum', 'group'] as TelegramPeerType[]).map(
                (pt) => {
                  const info = PEER_TYPE_LABELS[pt];
                  const active = peerType === pt;
                  return (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setPeerType(pt)}
                      className={`min-h-[42px] px-3 py-2 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                        active
                          ? 'bg-[#5F978B] text-white border-[#477D72] shadow-2xs'
                          : 'bg-[#F7FAF8] text-[#263D38] border-[#E1EBE5] hover:bg-[#D9EEE5]/40'
                      }`}
                    >
                      {isFa ? info.fa : info.en}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* 4. Public/Private Status, Access Status, Monitoring Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-[#F7FAF8] border border-[#E1EBE5]">
              <label className="block text-[11px] font-bold text-[#718780] mb-1">
                {isFa ? 'وضعیت عمومی / خصوصی:' : 'Public / Private Status:'}
              </label>
              <select
                value={isPublic ? 'public' : 'private'}
                onChange={(e) => setIsPublic(e.target.value === 'public')}
                className="w-full h-8 px-2 rounded-lg bg-white border border-[#E1EBE5] text-xs font-bold text-[#263D38]"
              >
                <option value="public">{isFa ? 'عمومی (Public)' : 'Public'}</option>
                <option value="private">{isFa ? 'خصوصی (Private Invite)' : 'Private'}</option>
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7FAF8] border border-[#E1EBE5]">
              <label className="block text-[11px] font-bold text-[#718780] mb-1">
                {isFa ? 'وضعیت دسترسی:' : 'Access Status:'}
              </label>
              <select
                value={accessStatus}
                onChange={(e) => setAccessStatus(e.target.value as any)}
                className="w-full h-8 px-2 rounded-lg bg-white border border-[#E1EBE5] text-xs font-bold text-[#263D38]"
              >
                <option value="verified">
                  {isFa ? 'دسترسی تاییدشده (شبیه‌سازی)' : 'Verified Access (Simulated)'}
                </option>
                <option value="pending_join">
                  {isFa ? 'نیازمند تایید عضویت' : 'Pending Join Approval'}
                </option>
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7FAF8] border border-[#E1EBE5]">
              <label className="block text-[11px] font-bold text-[#718780] mb-1">
                {isFa ? 'وضعیت پایش:' : 'Monitoring Status:'}
              </label>
              <select
                value={monitoringStatus}
                onChange={(e) => setMonitoringStatus(e.target.value as any)}
                className="w-full h-8 px-2 rounded-lg bg-white border border-[#E1EBE5] text-xs font-bold text-[#263D38]"
              >
                <option value="active">
                  {isFa ? 'فعال — پایش خودکار پیام‌ها' : 'Active — Live Parsing'}
                </option>
                <option value="paused">
                  {isFa ? 'متوقف — ذخیره بدون پایش' : 'Paused'}
                </option>
              </select>
            </div>
          </div>

          {/* 5. Linked Discussion Information (Represented strictly as a Relationship on Broadcast Channels) */}
          {peerType === 'broadcast_channel' && (
            <div className="p-4 rounded-2xl bg-[#EEE9F8]/60 border border-[#E1EBE5] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-[#477D72]" />
                  <span className="text-xs font-extrabold text-[#263D38]">
                    {isFa
                      ? 'رابطه گروه گفتگوی متصل به کانال انتشار (Linked Discussion Relationship)'
                      : 'Linked Discussion Group Relationship'}
                  </span>
                </div>
                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-[#263D38] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasLinkedDiscussion}
                    onChange={(e) => setHasLinkedDiscussion(e.target.checked)}
                    className="rounded accent-[#5F978B] w-4 h-4"
                  />
                  <span>{isFa ? 'دارای گروه تبادل نظر متصل' : 'Has Linked Discussion'}</span>
                </label>
              </div>

              <p className="text-[11px] text-[#718780]">
                {isFa
                  ? 'گروه گفتگوی متصل یک نوع همتای مجزا نیست، بلکه به عنوان یک رابطه (Relationship) متصل به کانال انتشار جهت پایش کامنت‌ها و پاسخ‌های فروشندگان ثبت می‌شود.'
                  : 'A linked discussion group is represented as a relationship attached to this broadcast channel rather than a separate peer type.'}
              </p>

              {hasLinkedDiscussion && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-[#263D38] mb-1">
                      {isFa ? 'شناسه گروه گفتگوی متصل:' : 'Linked Discussion Username:'}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={discussionUsername}
                      onChange={(e) => setDiscussionUsername(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-white border border-[#E1EBE5] text-xs font-mono text-[#263D38]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#263D38] mb-1">
                      {isFa ? 'عنوان گروه گفتگوی متصل:' : 'Linked Discussion Title:'}
                    </label>
                    <input
                      type="text"
                      value={discussionTitleFa}
                      onChange={(e) => setDiscussionTitleFa(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-white border border-[#E1EBE5] text-xs text-[#263D38]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onNavigate('telegram_sources')}
              className="min-h-[42px] px-4 rounded-xl bg-[#F7FAF8] hover:bg-[#E1EBE5] text-xs font-bold text-[#263D38] cursor-pointer"
            >
              {isFa ? 'بازگشت به منابع' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="min-h-[42px] px-6 rounded-xl bg-[#5F978B] hover:bg-[#477D72] text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isFa ? 'ثبت منبع تلگرام (شبیه‌سازی)' : 'Add Telegram Source'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
