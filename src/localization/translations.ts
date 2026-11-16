import { Language, OfferStatus, ProductCategory, TelegramPeerType } from '../types/perso';

export const CATEGORY_LABELS: Record<ProductCategory, { fa: string; en: string }> = {
  otc_medicine: {
    fa: 'داروهای مجاز بدون نسخه',
    en: 'OTC Medications',
  },
  pharmacy_products: {
    fa: 'محصولات داروخانه‌ای',
    en: 'Pharmacy Products',
  },
  medical_devices: {
    fa: 'تجهیزات پزشکی',
    en: 'Medical Devices',
  },
  medical_consumables: {
    fa: 'ملزومات مصرفی پزشکی',
    en: 'Medical Consumables',
  },
  health_monitoring: {
    fa: 'تجهیزات پایش سلامت',
    en: 'Health Monitoring Equipment',
  },
  hygiene_products: {
    fa: 'محصولات بهداشتی',
    en: 'Hygiene & Care Products',
  },
  supplements: {
    fa: 'مکمل‌ها',
    en: 'Supplements',
  },
  other: {
    fa: 'سایر موارد',
    en: 'Other',
  },
};

export const STATUS_LABELS: Record<OfferStatus, { fa: string; en: string; bg: string; text: string }> = {
  in_stock: {
    fa: 'موجود در انبار',
    en: 'In Stock',
    bg: 'bg-[#D9EEE5]',
    text: 'text-[#263D38]',
  },
  immediate_dispatch: {
    fa: 'تحویل فوری',
    en: 'Immediate Dispatch',
    bg: 'bg-[#E8F0F8]',
    text: 'text-[#263D38]',
  },
  limited_stock: {
    fa: 'موجودی محدود',
    en: 'Limited Stock',
    bg: 'bg-[#F5F0DE]',
    text: 'text-[#263D38]',
  },
  corporate_quota: {
    fa: 'سهمیه شرکتی',
    en: 'Corporate Quota',
    bg: 'bg-[#EEE9F8]',
    text: 'text-[#263D38]',
  },
  rx_verification: {
    fa: 'نیازمند مجوز داروخانه',
    en: 'Pharmacy License Required',
    bg: 'bg-[#F7EAE2]',
    text: 'text-[#263D38]',
  },
  unknown: {
    fa: 'وضعیت موجودی اعلام نشده',
    en: 'Stock status not provided',
    bg: 'bg-[#F5F0DE]',
    text: 'text-[#263D38]',
  },
};

export const PEER_TYPE_LABELS: Record<TelegramPeerType, { fa: string; en: string; badgeBg: string }> = {
  broadcast_channel: {
    fa: 'کانال انتشار',
    en: 'Broadcast Channel',
    badgeBg: 'bg-[#D9EEE5]',
  },
  supergroup: {
    fa: 'سوپرگروه',
    en: 'Supergroup',
    badgeBg: 'bg-[#E8F0F8]',
  },
  forum: {
    fa: 'فروم',
    en: 'Forum',
    badgeBg: 'bg-[#EEE9F8]',
  },
  group: {
    fa: 'گروه',
    en: 'Group',
    badgeBg: 'bg-[#F5F0DE]',
  },
};

export function getUI(lang: Language) {
  const isFa = lang === 'fa';
  return {
    appName: isFa ? 'پرسو' : 'Perso',
    appSubtitle: isFa ? 'پایش هوشمند بازار تلگرام سلامت' : 'Intelligent Telegram Healthcare Market Monitor',
    sampleDataBadge: isFa ? '«داده نمونه آزمایشی»' : '«Sample Test Data»',
    sampleDataNotice: isFa
      ? 'تمامی قیمت‌ها، فروشندگان، موجودی‌ها و تاریخ‌های انقضا در این نسخه پیش‌نمایش «داده نمونه آزمایشی» هستند و اطلاعات واقعی بازار محسوب نمی‌شوند.'
      : 'All prices, sellers, stock statuses, and expiry dates in this prototype are «Sample Test Data» and do not represent live market offers.',
    buyModeActive: isFa ? 'حالت خرید فعال' : 'BUY Mode Active',
    sellModeInactive: isFa ? 'فروش (غیرفعال در نسخه اول)' : 'SELL (Inactive in v1)',
    nav: {
      bestOffers: isFa ? 'پیشنهادهای برتر' : 'Best Offers',
      interests: isFa ? 'علاقه‌مندی‌ها' : 'Interests',
      telegramSources: isFa ? 'منابع تلگرام' : 'Telegram Sources',
      conversations: isFa ? 'گفتگوها' : 'Conversations',
      settings: isFa ? 'تنظیمات' : 'Settings',
    },
    welcome: {
      greeting: isFa ? 'خوش آمدید به پایشگر هوشمند پرسو' : 'Welcome to Perso Market Intelligence',
      desc: isFa
        ? 'پایش لحظه‌ای کانال‌ها و گروه‌های تلگرامی تجهیزات پزشکی و محصولات داروخانه‌ای'
        : 'Real-time monitoring of Telegram groups & channels for pharmacy & medical supplies',
      statsSources: isFa ? 'منابع فعال تلگرام' : 'Active Sources',
      statsOffers: isFa ? 'پیشنهاد استخراج‌شده' : 'Extracted Offers',
      statsMatch: isFa ? 'میانگین دقت تطبیق' : 'Avg Match Precision',
      statsSavings: isFa ? 'مزیت قیمتی شناسایی‌شده' : 'Avg Price Advantage',
    },
    filters: {
      searchPlaceholder: isFa
        ? 'جستجوی نام محصول، برند، مدل یا شهر فروشنده...'
        : 'Search product name, brand, model, or seller city...',
      allCategories: isFa ? 'همه دسته‌ها' : 'All Categories',
      allCities: isFa ? 'همه شهرها' : 'All Cities',
      tehranOnly: isFa ? 'فقط تهران' : 'Tehran Only',
      sortByMatch: isFa ? 'بیشترین امتیاز تطبیق' : 'Highest Match Score',
      sortByPriceAsc: isFa ? 'کمترین قیمت' : 'Lowest Price',
      sortByPriceDesc: isFa ? 'بیشترین قیمت' : 'Highest Price',
      sortByNewest: isFa ? 'جدیدترین ثبت' : 'Most Recent',
      rxExcludeNotice: isFa
        ? 'داروهای نسخه‌ای از پیشنهادهای عادی خرید مستثنی شده‌اند (نیازمند احراز مجوز رسمی داروخانه)'
        : 'Prescription-only medicines are excluded from ordinary purchase recommendations',
      showRxToggle: isFa ? 'نمایش اقلام نیازمند مجوز داروخانه' : 'Show Pharmacy-Restricted Items',
    },
    card: {
      matchScore: isFa ? 'تطبیق' : 'Match',
      seller: isFa ? 'فروشنده' : 'Seller',
      tehranLoc: isFa ? 'تهران،' : 'Tehran,',
      comparePrices: isFa ? 'مقایسه قیمت‌ها' : 'Compare Prices',
      productDetails: isFa ? 'جزئیات محصول' : 'Product Details',
      startChat: isFa ? 'گفتگو با فروشنده' : 'Chat with Seller',
      minOrder: isFa ? 'حداقل سفارش:' : 'Min Order:',
      rxWarning: isFa
        ? 'داروی نسخه‌ای — خرید عادی غیرفعال است (نیازمند تایید پروانه داروخانه)'
        : 'Prescription Medicine — Ordinary purchase disabled (Requires verified pharmacy license)',
    },
  };
}
