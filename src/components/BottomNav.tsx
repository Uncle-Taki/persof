import React from 'react';
import {
  Heart,
  MessageSquare,
  Radio,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Language, ScreenId } from '../types/perso';
import { getUI } from '../localization/translations';
import { formatNumber } from '../utils/formatters';

interface BottomNavProps {
  lang: Language;
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  unreadConversationsCount: number;
  interestsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  lang,
  currentScreen,
  onNavigate,
  unreadConversationsCount,
  interestsCount,
}) => {
  const ui = getUI(lang);

  // Map sub-screens to their parent bottom navigation tab
  const getActiveTab = (screen: ScreenId): ScreenId => {
    if (screen === 'product_details' || screen === 'price_comparison') return 'best_offers';
    if (screen === 'add_product') return 'interests';
    if (screen === 'add_telegram_source' || screen === 'source_details') return 'telegram_sources';
    if (screen === 'conversation_details') return 'conversations';
    return screen;
  };

  const activeTab = getActiveTab(currentScreen);

  const tabs: Array<{
    id: ScreenId;
    label: string;
    icon: React.FC<{ className?: string }>;
    badgeCount?: number;
  }> = [
    {
      id: 'best_offers',
      label: ui.nav.bestOffers,
      icon: Sparkles,
    },
    {
      id: 'interests',
      label: ui.nav.interests,
      icon: Heart,
      badgeCount: interestsCount,
    },
    {
      id: 'telegram_sources',
      label: ui.nav.telegramSources,
      icon: Radio,
    },
    {
      id: 'conversations',
      label: ui.nav.conversations,
      icon: MessageSquare,
      badgeCount: unreadConversationsCount > 0 ? unreadConversationsCount : undefined,
    },
    {
      id: 'settings',
      label: ui.nav.settings,
      icon: Settings,
    },
  ];

  return (
    <nav
      aria-label={lang === 'fa' ? 'ناوبری اصلی پایین صفحه' : 'Bottom Primary Navigation'}
      className="fixed bottom-0 left-0 right-0 z-40 h-[58px] bg-white/95 backdrop-blur-md border-t border-[#E1EBE5] shadow-[0_-2px_12px_rgba(38,61,56,0.05)]"
    >
      <div className="max-w-4xl mx-auto h-full grid grid-cols-5 items-center px-1 sm:px-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id)}
              className={`relative min-h-[46px] flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer select-none px-1 ${
                isActive
                  ? 'bg-[#D9EEE5]/75 text-[#263D38] font-bold'
                  : 'text-[#718780] hover:text-[#263D38] hover:bg-[#F7FAF8] font-medium'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-[19px] h-[19px] transition-colors ${
                    isActive ? 'text-[#477D72] stroke-[2.3]' : 'text-[#718780] stroke-[1.9]'
                  }`}
                />
                {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                  <span
                    className={`absolute -top-1.5 ${
                      lang === 'fa' ? '-left-3' : '-right-3'
                    } min-w-[16px] h-[16px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center tabular-nums-fa ${
                      tab.id === 'conversations'
                        ? 'bg-[#477D72] text-white'
                        : 'bg-[#E8F0F8] text-[#263D38] border border-[#A9D5C5]'
                    }`}
                  >
                    {formatNumber(tab.badgeCount, lang)}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] leading-tight mt-1 whitespace-nowrap truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
