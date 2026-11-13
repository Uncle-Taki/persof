import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Filter,
  MapPin,
  PackagePlus,
  RefreshCw,
  Scale,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import {
  Language,
  Offer,
  Product,
  ProductCategory,
  ScreenId,
  TelegramSource,
} from '../types/perso';
import { CATEGORY_LABELS, getUI } from '../localization/translations';
import { formatNumber, formatPercent, formatPrice } from '../utils/formatters';
import { OfferCard } from '../components/OfferCard';

interface BestOffersPageProps {
  lang: Language;
  offers: Offer[];
  products: Product[];
  sources: TelegramSource[];
  interestedProductIds: string[];
  showRxRestricted: boolean;
  onToggleShowRx: (val: boolean) => void;
  onSelectProduct: (productId: string, offerId?: string) => void;
  onComparePrices: (productId: string) => void;
  onToggleInterest: (productId: string) => void;
  onStartChat: (offer: Offer) => void;
  onNavigate: (screen: ScreenId) => void;
}

type SortOption = 'match_desc' | 'price_asc' | 'price_desc' | 'newest';

export const BestOffersPage: React.FC<BestOffersPageProps> = ({
  lang,
  offers,
  products,
  sources,
  interestedProductIds,
  showRxRestricted,
  onToggleShowRx,
  onSelectProduct,
  onComparePrices,
  onToggleInterest,
  onStartChat,
  onNavigate,
}) => {
  const ui = getUI(lang);
  const isFa = lang === 'fa';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('match_desc');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);
  const [isSimulatingSync, setIsSimulatingSync] = useState(false);
  const [viewMode, setViewMode] = useState<'offers' | 'catalog'>('offers');

  const cities = [
    { id: 'all', fa: 'همه شهرها', en: 'All Cities' },
    { id: 'تهران', fa: 'تهران', en: 'Tehran' },
    { id: 'مشهد', fa: 'مشهد', en: 'Mashhad' },
    { id: 'اصفهان', fa: 'اصفهان', en: 'Isfahan' },
    { id: 'شیراز', fa: 'شیراز', en: 'Shiraz' },
    { id: 'تبریز', fa: 'تبریز', en: 'Tabriz' },
    { id: 'کرج', fa: 'کرج', en: 'Karaj' },
  ];

  const activeSourcesCount = useMemo(
    () => sources.filter((s) => s.monitoringStatus === 'active').length,
    [sources]
  );

  const filteredOffers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = offers.filter((offer) => {
      if (!showRxRestricted && offer.isPrescriptionOnly) {
        return false;
      }
      if (selectedCategory !== 'all' && offer.category !== selectedCategory) {
        return false;
      }
      if (selectedCity !== 'all' && offer.cityFa !== selectedCity) {
        return false;
      }
      if (q) {
        const haystack = [
          offer.productNameFa,
          offer.productNameEn,
          offer.brandFa,
          offer.brandEn,
          offer.modelSpecFa,
          offer.modelSpecEn,
          offer.cityFa,
          offer.cityEn,
          offer.tehranDistrictFa || '',
          offer.sellerNameFa,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'match_desc') return b.matchScore - a.matchScore;
      if (sortBy === 'price_asc') return a.priceToman - b.priceToman;
      if (sortBy === 'price_desc') return b.priceToman - a.priceToman;
      return a.postedMinutesAgo - b.postedMinutesAgo;
    });
  }, [offers, searchQuery, selectedCategory, selectedCity, sortBy, showRxRestricted]);

  const handleManualSync = () => {
    setIsSimulatingSync(true);
    setTimeout(() => {
      setIsSimulatingSync(false);
    }, 650);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-2 pb-20">
      {/* Compact Welcome & Market Statistics Hero Strip */}
      <section className="rounded-2xl bg-gradient-main-mint border border-[#A9D5C5]/70 px-3 py-2 sm:p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-[#263D38]">
                <Sparkles className="w-3.5 h-3.5 text-[#477D72]" />
                <span>{ui.welcome.greeting}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/80 text-[#477D72] border border-[#A9D5C5]">
                {ui.sampleDataBadge}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#263D38]/85 mt-0.5 leading-snug">
              {ui.welcome.desc}
            </p>
          </div>

          {/* 4 Market Stats Pills */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 shrink-0">
            <div className="bg-white/85 rounded-xl px-2 py-1 border border-[#E1EBE5] text-center">
              <div className="text-xs sm:text-sm font-extrabold text-[#263D38] tabular-nums-fa">
                {formatNumber(activeSourcesCount, lang)}
              </div>
              <div className="text-[9.5px] sm:text-[10px] text-[#718780] truncate">
                {isFa ? 'منبع فعال' : 'Sources'}
              </div>
            </div>
            <div className="bg-white/85 rounded-xl px-2 py-1 border border-[#E1EBE5] text-center">
              <div className="text-xs sm:text-sm font-extrabold text-[#263D38] tabular-nums-fa">
                {formatNumber(offers.length, lang)}
              </div>
              <div className="text-[9.5px] sm:text-[10px] text-[#718780] truncate">
                {isFa ? 'پیشنهاد' : 'Offers'}
              </div>
            </div>
            <div className="bg-white/85 rounded-xl px-2 py-1 border border-[#E1EBE5] text-center">
              <div className="text-xs sm:text-sm font-extrabold text-[#263D38] tabular-nums-fa">
                {formatNumber(products.length, lang)}
              </div>
              <div className="text-[9.5px] sm:text-[10px] text-[#718780] truncate">
                {isFa ? 'کالای سلامت' : 'Products'}
              </div>
            </div>
            <div className="bg-white/85 rounded-xl px-2 py-1 border border-[#E1EBE5] text-center">
              <div className="text-xs sm:text-sm font-extrabold text-[#477D72] tabular-nums-fa">
                {formatPercent(96, lang)}
              </div>
              <div className="text-[9.5px] sm:text-[10px] text-[#718780] truncate">
                {isFa ? 'دقت تطبیق' : 'Precision'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search, Filter & Sort Controls (Compact for 390x844 viewport) */}
      <section className="mt-2 space-y-1.5">
        <div className="flex items-center gap-1.5">
          {/* Search Input */}
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
              placeholder={ui.filters.searchPlaceholder}
              className={`w-full h-9 rounded-xl bg-white border border-[#E1EBE5] focus:border-[#5F978B] focus:outline-none text-xs text-[#263D38] placeholder:text-[#718780] ${
                isFa ? 'pr-9 pl-7' : 'pl-9 pr-7'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={`absolute top-1/2 -translate-y-1/2 ${
                  isFa ? 'left-2' : 'right-2'
                } text-[#718780] hover:text-[#263D38] cursor-pointer`}
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label={isFa ? 'مرتب‌سازی بر اساس' : 'Sort offers by'}
              className="h-9 px-2.5 rounded-xl bg-white border border-[#E1EBE5] text-[11px] font-bold text-[#263D38] focus:border-[#5F978B] focus:outline-none cursor-pointer"
            >
              <option value="match_desc">{ui.filters.sortByMatch}</option>
              <option value="price_asc">{ui.filters.sortByPriceAsc}</option>
              <option value="price_desc">{ui.filters.sortByPriceDesc}</option>
              <option value="newest">{ui.filters.sortByNewest}</option>
            </select>
          </div>

          {/* Filter Drawer Toggle Button */}
          <button
            type="button"
            onClick={() => setShowFiltersDrawer((prev) => !prev)}
            className={`h-9 px-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
              showFiltersDrawer || selectedCity !== 'all' || showRxRestricted
                ? 'bg-[#D9EEE5] border-[#5F978B] text-[#263D38]'
                : 'bg-white border-[#E1EBE5] text-[#263D38] hover:bg-[#F7FAF8]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#477D72]" />
            <span className="hidden sm:inline">{isFa ? 'فیلتر پیشرفته' : 'Filters'}</span>
          </button>

          {/* Simulated Refresh Button */}
          <button
            type="button"
            onClick={handleManualSync}
            className="h-9 w-9 rounded-xl bg-white hover:bg-[#D9EEE5] border border-[#E1EBE5] flex items-center justify-center text-[#477D72] transition-colors cursor-pointer shrink-0"
            title={isFa ? 'به‌روزرسانی نمونه پیشنهادها' : 'Refresh sample offers'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingSync ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Horizontal Category Tabs + View Switcher */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`h-7 px-2.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-[#5F978B] text-white'
                  : 'bg-white border border-[#E1EBE5] text-[#718780] hover:text-[#263D38]'
              }`}
            >
              {ui.filters.allCategories} ({formatNumber(offers.length, lang)})
            </button>
            {(Object.keys(CATEGORY_LABELS) as ProductCategory[]).map((catKey) => {
              const label = CATEGORY_LABELS[catKey];
              const isSelected = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategory(catKey)}
                  className={`h-7 px-2.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#5F978B] text-white'
                      : 'bg-white border border-[#E1EBE5] text-[#718780] hover:text-[#263D38]'
                  }`}
                >
                  {isFa ? label.fa : label.en}
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#E1EBE5] shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('offers')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                viewMode === 'offers' ? 'bg-[#D9EEE5] text-[#263D38]' : 'text-[#718780]'
              }`}
            >
              {isFa ? 'پیشنهادهای زنده' : 'Live Offers'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('catalog')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                viewMode === 'catalog' ? 'bg-[#D9EEE5] text-[#263D38]' : 'text-[#718780]'
              }`}
            >
              {isFa ? `کاتالوگ کامل (${formatNumber(products.length, lang)})` : `Catalog (${products.length})`}
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters Panel (City, Tehran District, Rx Compliance, Quick Actions) */}
        {showFiltersDrawer && (
          <div className="p-3 rounded-2xl bg-white border border-[#A9D5C5] shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-[#263D38] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#5F978B]" />
                  <span>{isFa ? 'شهر فروشنده:' : 'Seller City:'}</span>
                </span>
                {cities.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCity(c.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                      selectedCity === c.id
                        ? 'bg-[#5F978B] text-white'
                        : 'bg-[#F7FAF8] text-[#718780] hover:text-[#263D38] border border-[#E1EBE5]'
                    }`}
                  >
                    {isFa ? c.fa : c.en}
                  </button>
                ))}
              </div>

              {/* View Mode Switcher for Mobile */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onNavigate('add_product')}
                  className="px-2.5 py-1 rounded-lg bg-[#EEE9F8] hover:bg-[#D9EEE5] text-[#263D38] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <PackagePlus className="w-3.5 h-3.5 text-[#477D72]" />
                  <span>{isFa ? 'افزودن محصول جدید' : 'Add New Product'}</span>
                </button>
              </div>
            </div>

            {/* Regulatory Exclusion Toggle for Prescription Medicines */}
            <div className="pt-2 border-t border-[#E1EBE5] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-[#718780]">
                <ShieldAlert className="w-4 h-4 text-[#477D72] shrink-0" />
                <span>{ui.filters.rxExcludeNotice}</span>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-[#263D38] shrink-0">
                <input
                  type="checkbox"
                  checked={showRxRestricted}
                  onChange={(e) => onToggleShowRx(e.target.checked)}
                  className="rounded accent-[#5F978B] w-4 h-4"
                />
                <span>{ui.filters.showRxToggle}</span>
              </label>
            </div>
          </div>
        )}
      </section>

      {/* Main Content Area: Offer Cards or Full Product Catalog */}
      {isSimulatingSync ? (
        <div className="mt-3 space-y-2.5">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-[158px] rounded-2xl bg-white border border-[#E1EBE5] p-3.5 animate-pulse flex flex-col justify-between"
            >
              <div className="flex justify-between">
                <div className="space-y-2 w-2/3">
                  <div className="h-4 bg-[#D9EEE5] rounded w-3/4" />
                  <div className="h-3 bg-[#F7FAF8] rounded w-1/2" />
                </div>
                <div className="h-10 w-28 bg-[#D9EEE5] rounded-xl" />
              </div>
              <div className="h-3 bg-[#F7FAF8] rounded w-full" />
              <div className="h-7 bg-[#F7FAF8] rounded w-full" />
            </div>
          ))}
        </div>
      ) : viewMode === 'catalog' ? (
        <section className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-extrabold text-[#263D38]">
              {isFa
                ? `کاتالوگ کامل محصولات سلامت (${formatNumber(products.length, lang)} کالا — داده نمونه آزمایشی)`
                : `Complete Healthcare Product Catalog (${products.length} items — Sample Test Data)`}
            </h2>
            <button
              type="button"
              onClick={() => setViewMode('offers')}
              className="text-xs font-bold text-[#477D72] hover:underline cursor-pointer"
            >
              {isFa ? 'بازگشت به لیست پیشنهادها' : 'Back to Offers Feed'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="rounded-2xl bg-white border border-[#E1EBE5] p-3.5 flex flex-col justify-between hover:border-[#5F978B] transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-extrabold text-[#263D38]">
                      {isFa ? prod.nameFa : prod.nameEn}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-[#D9EEE5] text-[10px] font-bold text-[#263D38] shrink-0">
                      {isFa ? CATEGORY_LABELS[prod.category].fa : CATEGORY_LABELS[prod.category].en}
                    </span>
                  </div>
                  <p className="text-xs text-[#718780] mt-1">
                    {isFa ? prod.brandFa : prod.brandEn} · {isFa ? prod.modelOrSpecFa : prod.modelOrSpecEn}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-[#E1EBE5] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#718780] block">
                      {isFa ? 'شروع قیمت نمونه از:' : 'Sample Price From:'}
                    </span>
                    <span className="text-sm font-extrabold text-[#263D38] tabular-nums-fa">
                      {formatPrice(prod.minMarketPriceToman, lang)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onComparePrices(prod.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#F7FAF8] hover:bg-[#D9EEE5] border border-[#E1EBE5] text-xs font-bold text-[#263D38] cursor-pointer"
                    >
                      {isFa ? 'مقایسه قیمت' : 'Compare'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectProduct(prod.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#5F978B] hover:bg-[#477D72] text-xs font-bold text-white cursor-pointer"
                    >
                      {isFa ? 'مشخصات' : 'Details'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : filteredOffers.length === 0 ? (
        /* Empty State */
        <div className="mt-4 rounded-2xl bg-white border border-[#E1EBE5] p-8 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#D9EEE5] text-[#477D72] flex items-center justify-center mx-auto mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-[#263D38]">
            {isFa ? 'پیشنهادی مطابق با فیلتر شما یافت نشد' : 'No offers match your active filters'}
          </h3>
          <p className="text-xs text-[#718780] mt-1 leading-relaxed">
            {isFa
              ? 'عبارت جستجو یا فیلتر دسته‌بندی و شهر را تغییر دهید یا کالای مورد نظر خود را به لیست پایش اضافه کنید.'
              : 'Try clearing your search query or city filter, or add a custom product to monitor.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedCity('all');
              }}
              className="px-4 py-2 rounded-xl bg-[#5F978B] hover:bg-[#477D72] text-xs font-bold text-white cursor-pointer"
            >
              {isFa ? 'پاک کردن فیلترها' : 'Reset Filters'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('add_product')}
              className="px-4 py-2 rounded-xl bg-[#F7FAF8] hover:bg-[#D9EEE5] border border-[#E1EBE5] text-xs font-bold text-[#263D38] cursor-pointer"
            >
              {isFa ? 'افزودن محصول جدید' : 'Add Product'}
            </button>
          </div>
        </div>
      ) : (
        /* Offer Cards Grid — 1 col on mobile (3 cards visible in 390x844 viewport), 2 on md, 3 on lg */
        <section className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {filteredOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              lang={lang}
              isInterested={interestedProductIds.includes(offer.productId)}
              onSelectProduct={onSelectProduct}
              onComparePrices={onComparePrices}
              onToggleInterest={onToggleInterest}
              onStartChat={onStartChat}
            />
          ))}
        </section>
      )}

      {/* Footer Sample Data & Regulatory Disclaimer */}
      <footer className="mt-6 rounded-2xl bg-[#F5F0DE]/70 border border-[#E1EBE5] p-3 text-center text-[11px] text-[#263D38]">
        <span className="font-bold">{ui.sampleDataBadge}: </span>
        <span>{ui.sampleDataNotice}</span>
      </footer>
    </div>
  );
};
