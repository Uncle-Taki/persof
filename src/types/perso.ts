export type Language = 'fa' | 'en';

export type ProductCategory =
  | 'otc_medicine'        // داروهای مجاز بدون نسخه
  | 'pharmacy_products'   // محصولات داروخانه‌ای
  | 'medical_devices'     // تجهیزات پزشکی
  | 'medical_consumables' // ملزومات مصرفی پزشکی
  | 'health_monitoring'   // تجهیزات پایش سلامت
  | 'hygiene_products'    // محصولات بهداشتی
  | 'supplements'         // مکمل‌ها
  | 'other';              // دسته‌بندی ثبت‌نشده

export type OfferStatus =
  | 'in_stock'            // موجود در انبار
  | 'immediate_dispatch'  // تحویل فوری
  | 'limited_stock'       // موجودی محدود
  | 'corporate_quota'     // سهمیه شرکتی
  | 'rx_verification'     // نیازمند تایید مجوز داروخانه
  | 'unknown';            // وضعیت موجودی در داده منبع مشخص نیست

export type TelegramPeerType =
  | 'broadcast_channel'   // کانال انتشار
  | 'supergroup'          // سوپرگروه
  | 'forum'               // فروم
  | 'group';              // گروه

export interface LinkedDiscussionRelationship {
  hasLinkedDiscussion: boolean;
  discussionUsername?: string;
  discussionTitleFa?: string;
  discussionTitleEn?: string;
  memberCount?: number;
  autoSyncReplies?: boolean;
}

export interface TelegramSource {
  id: string;
  usernameOrUrl: string;
  titleFa: string;
  titleEn: string;
  peerType: TelegramPeerType;
  isPublic: boolean;
  accessStatus: 'verified' | 'pending_join' | 'restricted';
  monitoringStatus: 'active' | 'paused' | 'error';
  memberCount?: number;
  extractedOffersCount?: number;
  matchPrecisionPercent?: number;
  lastSyncedFa: string;
  lastSyncedEn: string;
  cityFocusFa: string;
  cityFocusEn: string;
  descriptionFa: string;
  descriptionEn: string;
  keywords: string[];
  linkedDiscussion: LinkedDiscussionRelationship;
  resolutionOrigin: 'simulated_frontend' | 'backend_mtproto';
}

export interface Product {
  id: string;
  nameFa: string;
  nameEn: string;
  brandFa: string;
  brandEn: string;
  modelOrSpecFa: string;
  modelOrSpecEn: string;
  category: ProductCategory;
  unitFa: string;
  unitEn: string;
  ircCode?: string; // only show when supplied by a verified catalog source
  isSampleData?: boolean;
  isPrescriptionOnly: boolean;
  regulatoryNoteFa?: string;
  regulatoryNoteEn?: string;
  descriptionFa: string;
  descriptionEn: string;
  avgMarketPriceToman: number;
  minMarketPriceToman: number;
  maxMarketPriceToman: number;
  activeOfferCount: number;
  iconType: 'pill' | 'monitor' | 'consumable' | 'hygiene' | 'supplement' | 'thermometer' | 'syringe' | 'shield';
}

export interface Offer {
  id: string;
  productId: string;
  productNameFa: string;
  productNameEn: string;
  brandFa: string;
  brandEn: string;
  modelSpecFa: string;
  modelSpecEn: string;
  category: ProductCategory;
  priceToman?: number;
  unitFa: string;
  unitEn: string;
  minOrderQty?: number;
  availableQuantity?: number;
  cityFa: string;
  cityEn: string;
  tehranDistrictFa?: string;
  tehranDistrictEn?: string;
  status: OfferStatus;
  sellerNameFa: string;
  sellerNameEn: string;
  sellerTelegramHandle: string;
  sellerVerified: boolean;
  sellerLicenseCode: string;
  matchScore: number; // 0 to 100
  postedAtFa: string;
  postedAtEn: string;
  postedMinutesAgo: number;
  expiryDateSampleFa: string;
  expiryDateSampleEn: string;
  paymentTermsFa: string;
  paymentTermsEn: string;
  sourceId?: string;
  sourceTitleFa: string;
  sourceTitleEn: string;
  rawTelegramExcerptFa: string;
  rawTelegramExcerptEn: string;
  isPrescriptionOnly?: boolean;
  isSampleData: boolean;
}

export interface WatchlistInterest {
  id: string;
  productId: string;
  productNameFa: string;
  productNameEn: string;
  brandModelFa: string;
  brandModelEn: string;
  category: ProductCategory;
  targetMaxPriceToman: number;
  currentBestPriceToman?: number;
  preferredCityFa: string;
  preferredCityEn: string;
  requiredQty: number;
  notifyOnDrop?: boolean;
  matchedOffersCount?: number;
  createdAtFa: string;
  createdAtEn: string;
}

export interface ChatMessage {
  id: string;
  sender: 'buyer' | 'seller' | 'system';
  textFa: string;
  textEn: string;
  timestampFa: string;
  timestampEn: string;
}

export interface ConversationThread {
  id: string;
  offerId: string;
  productId: string;
  productNameFa: string;
  productNameEn: string;
  offeredPriceToman?: number;
  unitFa: string;
  unitEn: string;
  sellerNameFa: string;
  sellerNameEn: string;
  sellerHandle: string;
  sellerCityFa: string;
  sellerCityEn: string;
  tehranDistrictFa?: string;
  tehranDistrictEn?: string;
  sourceTitleFa: string;
  sourceTitleEn: string;
  status: 'awaiting_reply' | 'price_quoted' | 'confirmed' | 'archived';
  unreadCount: number;
  updatedAtFa: string;
  updatedAtEn: string;
  rawTelegramPostFa: string;
  rawTelegramPostEn: string;
  messages: ChatMessage[];
  backendState?: string;
  consentGranted?: boolean;
  missingFields?: string[];
  questionsAskedCount?: number;
}

export type ScreenId =
  | 'best_offers'          // 1. داشبورد / پیشنهادهای برتر
  | 'product_details'      // 2. جزئیات محصول
  | 'price_comparison'     // 3. مقایسه قیمت‌ها
  | 'interests'            // 4. علاقه‌مندی‌ها
  | 'add_product'          // 5. افزودن محصول
  | 'telegram_sources'     // 6. منابع تلگرام
  | 'add_telegram_source'  // 7. افزودن منبع تلگرام
  | 'source_details'       // 8. جزئیات منبع
  | 'conversations'        // 9. گفتگوها
  | 'conversation_details' // 10. جزئیات گفتگو
  | 'settings';            // 11. تنظیمات
