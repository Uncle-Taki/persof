/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ConversationThread,
  Language,
  Offer,
  Product,
  ProductCategory,
  ScreenId,
  TelegramSource,
  WatchlistInterest,
} from './types/perso';
import {
  INITIAL_CONVERSATIONS,
  INITIAL_INTERESTS,
  INITIAL_OFFERS,
  INITIAL_PRODUCTS,
  INITIAL_TELEGRAM_SOURCES,
} from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { BestOffersPage } from './pages/BestOffersPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { PriceComparisonPage } from './pages/PriceComparisonPage';
import { InterestsPage } from './pages/InterestsPage';
import { AddProductPage } from './pages/AddProductPage';
import { TelegramSourcesPage } from './pages/TelegramSourcesPage';
import { AddTelegramSourcePage } from './pages/AddTelegramSourcePage';
import { SourceDetailsPage } from './pages/SourceDetailsPage';
import { ConversationsPage } from './pages/ConversationsPage';
import { ConversationDetailsPage } from './pages/ConversationDetailsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [lang, setLang] = useState<Language>('fa');
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('best_offers');
  const [screenHistory, setScreenHistory] = useState<ScreenId[]>([]);

  // Core Prototype State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);
  const [sources, setSources] = useState<TelegramSource[]>(INITIAL_TELEGRAM_SOURCES);
  const [interests, setInterests] = useState<WatchlistInterest[]>(INITIAL_INTERESTS);
  const [conversations, setConversations] = useState<ConversationThread[]>(INITIAL_CONVERSATIONS);
  const [showRxRestricted, setShowRxRestricted] = useState<boolean>(false);

  // Selected entity IDs for detail screens
  const [selectedProductId, setSelectedProductId] = useState<string>('prod-4');
  const [selectedOfferId, setSelectedOfferId] = useState<string | undefined>('off-1');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('src-1');
  const [selectedConversationId, setSelectedConversationId] = useState<string>('conv-1');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msgFa: string, msgEn: string) => {
    setToastMessage(lang === 'fa' ? msgFa : msgEn);
    setTimeout(() => {
      setToastMessage((prev) => (prev === (lang === 'fa' ? msgFa : msgEn) ? null : prev));
    }, 2800);
  };

  // Sync document language and RTL/LTR direction whenever `lang` changes
  useEffect(() => {
    document.documentElement.lang = lang === 'fa' ? 'fa' : 'en';
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }, [lang]);

  const navigateTo = (nextScreen: ScreenId) => {
    if (nextScreen !== currentScreen) {
      setScreenHistory((prev) => [...prev, currentScreen]);
      setCurrentScreen(nextScreen);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (screenHistory.length > 0) {
      const prevScreen = screenHistory[screenHistory.length - 1];
      setScreenHistory((prev) => prev.slice(0, -1));
      setCurrentScreen(prevScreen);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentScreen('best_offers');
    }
  };

  const interestedProductIds = useMemo(
    () => interests.map((item) => item.productId),
    [interests]
  );

  const unreadConversationsCount = useMemo(
    () => conversations.reduce((acc, c) => acc + c.unreadCount, 0),
    [conversations]
  );

  // Handlers
  const handleSelectProduct = (productId: string, offerId?: string) => {
    setSelectedProductId(productId);
    setSelectedOfferId(offerId);
    navigateTo('product_details');
  };

  const handleComparePrices = (productId: string) => {
    setSelectedProductId(productId);
    navigateTo('price_comparison');
  };

  const handleToggleInterest = (productId: string) => {
    const exists = interests.find((i) => i.productId === productId);
    if (exists) {
      setInterests((prev) => prev.filter((i) => i.productId !== productId));
      showToast(
        'محصول از لیست علاقه‌مندی‌ها حذف شد.',
        'Product removed from watchlist interests.'
      );
    } else {
      const prod = products.find((p) => p.id === productId);
      if (!prod) return;
      const newInterest: WatchlistInterest = {
        id: `int-${Date.now()}`,
        productId: prod.id,
        productNameFa: prod.nameFa,
        productNameEn: prod.nameEn,
        brandModelFa: `${prod.brandFa} — ${prod.modelOrSpecFa}`,
        brandModelEn: `${prod.brandEn} — ${prod.modelOrSpecEn}`,
        category: prod.category,
        targetMaxPriceToman: prod.avgMarketPriceToman,
        currentBestPriceToman: prod.minMarketPriceToman,
        preferredCityFa: 'تهران',
        preferredCityEn: 'Tehran',
        requiredQty: 5,
        notifyOnDrop: true,
        matchedOffersCount: offers.filter((o) => o.productId === prod.id).length || 1,
        createdAtFa: 'امروز · ۲۳ آبان ۱۴۰۵',
        createdAtEn: 'Today · Nov 13, 2026',
      };
      setInterests((prev) => [newInterest, ...prev]);
      showToast(
        'محصول به علاقه‌مندی‌ها و پایشگر قیمت اضافه شد.',
        'Product added to watchlist interests.'
      );
    }
  };

  const handleStartChat = (offer: Offer) => {
    const existing = conversations.find((c) => c.offerId === offer.id);
    if (existing) {
      setSelectedConversationId(existing.id);
      setConversations((prev) =>
        prev.map((c) => (c.id === existing.id ? { ...c, unreadCount: 0 } : c))
      );
      navigateTo('conversation_details');
      return;
    }

    const newThread: ConversationThread = {
      id: `conv-${Date.now()}`,
      offerId: offer.id,
      productId: offer.productId,
      productNameFa: `${offer.productNameFa} (${offer.brandFa})`,
      productNameEn: `${offer.productNameEn} (${offer.brandEn})`,
      offeredPriceToman: offer.priceToman,
      unitFa: offer.unitFa,
      unitEn: offer.unitEn,
      sellerNameFa: offer.sellerNameFa,
      sellerNameEn: offer.sellerNameEn,
      sellerHandle: offer.sellerTelegramHandle,
      sellerCityFa: offer.cityFa,
      sellerCityEn: offer.cityEn,
      tehranDistrictFa: offer.tehranDistrictFa,
      tehranDistrictEn: offer.tehranDistrictEn,
      sourceTitleFa: offer.sourceTitleFa,
      sourceTitleEn: offer.sourceTitleEn,
      status: 'awaiting_reply',
      unreadCount: 0,
      updatedAtFa: 'هم‌اکنون',
      updatedAtEn: 'Just now',
      rawTelegramPostFa: offer.rawTelegramExcerptFa,
      rawTelegramPostEn: offer.rawTelegramExcerptEn,
      messages: [
        {
          id: `sys-${Date.now()}`,
          sender: 'system',
          textFa: `گفتگو برای پیشنهاد «${offer.productNameFa}» با امتیاز تطبیق ${offer.matchScore}٪ آغاز شد («داده نمونه آزمایشی»).`,
          textEn: `Started conversation for "${offer.productNameEn}" (${offer.matchScore}% match — Sample Test Data).`,
          timestampFa: 'هم‌اکنون',
          timestampEn: 'Just now',
        },
      ],
    };

    setConversations((prev) => [newThread, ...prev]);
    setSelectedConversationId(newThread.id);
    navigateTo('conversation_details');
  };

  const handleSendMessage = (convId: string, text: string) => {
    const buyerMsg = {
      id: `msg-${Date.now()}`,
      sender: 'buyer' as const,
      textFa: text,
      textEn: text,
      timestampFa: 'هم‌اکنون',
      timestampEn: 'Just now',
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              updatedAtFa: 'هم‌اکنون',
              updatedAtEn: 'Just now',
              messages: [...c.messages, buyerMsg],
            }
          : c
      )
    );

    // Simulated sample seller response
    setTimeout(() => {
      const sellerReply = {
        id: `msg-reply-${Date.now()}`,
        sender: 'seller' as const,
        textFa:
          'پیام شما دریافت شد. موجودی انبار و قیمت اعلام‌شده در کانال تایید می‌گردد. پیش‌فاکتور نمونه آزمایشی برای شما ارسال شد.',
        textEn:
          'Message received. Warehouse stock and listed channel price are confirmed. Sample proforma invoice has been generated.',
        timestampFa: 'هم‌اکنون',
        timestampEn: 'Just now',
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                status: 'price_quoted',
                messages: [...c.messages, sellerReply],
              }
            : c
        )
      );
    }, 650);
  };

  const handleAddProductAndInterest = (data: {
    nameFa: string;
    nameEn: string;
    brandFa: string;
    modelSpecFa: string;
    category: ProductCategory;
    unitFa: string;
    targetMaxPriceToman: number;
    preferredCityFa: string;
    requiredQty: number;
    isPrescriptionOnly: boolean;
  }) => {
    const newProdId = `prod-${Date.now()}`;
    const sampleBestPrice = Math.round(data.targetMaxPriceToman * 0.96);

    const newProduct: Product = {
      id: newProdId,
      nameFa: data.nameFa,
      nameEn: data.nameEn,
      brandFa: data.brandFa,
      brandEn: data.brandFa,
      modelOrSpecFa: data.modelSpecFa,
      modelOrSpecEn: data.modelSpecFa,
      category: data.category,
      unitFa: data.unitFa,
      unitEn: data.unitFa,
      ircCode: `IRC-SAMPLE-${Math.floor(100000 + Math.random() * 900000)}`,
      isPrescriptionOnly: data.isPrescriptionOnly,
      regulatoryNoteFa: data.isPrescriptionOnly
        ? 'داروی نسخه‌ای نیازمند احراز مجوز رسمی داروخانه.'
        : undefined,
      regulatoryNoteEn: data.isPrescriptionOnly
        ? 'Prescription-only item requiring verified pharmacy license.'
        : undefined,
      descriptionFa: `${data.nameFa} — ثبت‌شده توسط کاربر جهت پایش خودکار در منابع تلگرام (داده نمونه آزمایشی).`,
      descriptionEn: `${data.nameEn} — User-created product for Telegram monitoring (Sample Test Data).`,
      avgMarketPriceToman: data.targetMaxPriceToman,
      minMarketPriceToman: sampleBestPrice,
      maxMarketPriceToman: Math.round(data.targetMaxPriceToman * 1.08),
      activeOfferCount: 1,
      iconType: 'monitor',
    };

    const newOffer: Offer = {
      id: `off-${Date.now()}`,
      productId: newProdId,
      productNameFa: data.nameFa,
      productNameEn: data.nameEn,
      brandFa: data.brandFa,
      brandEn: data.brandFa,
      modelSpecFa: data.modelSpecFa,
      modelSpecEn: data.modelSpecFa,
      category: data.category,
      priceToman: sampleBestPrice,
      unitFa: data.unitFa,
      unitEn: data.unitFa,
      minOrderQty: data.requiredQty,
      cityFa: 'تهران',
      cityEn: 'Tehran',
      tehranDistrictFa: data.preferredCityFa,
      tehranDistrictEn: data.preferredCityFa,
      status: data.isPrescriptionOnly ? 'rx_verification' : 'in_stock',
      sellerNameFa: 'پخش نمونه تجهیزات سلامت تهران (نمونه)',
      sellerNameEn: 'Tehran Sample Health Supply',
      sellerTelegramHandle: '@sample_med_supplier',
      sellerVerified: true,
      sellerLicenseCode: 'DEMO-USR-7700',
      matchScore: 96,
      postedAtFa: 'لحظاتی پیش · ۲۳ آبان ۱۴۰۵',
      postedAtEn: 'Just now · Nov 13, 2026',
      postedMinutesAgo: 1,
      expiryDateSampleFa: '۰۸/۱۴۰۷ (نمونه آزمایشی)',
      expiryDateSampleEn: '11/2028 (Sample)',
      paymentTermsFa: 'نقدی / فاکتور نمونه',
      paymentTermsEn: 'Cash / Sample Invoice',
      sourceId: 'src-1',
      sourceTitleFa: 'بازار تجهیزات پزشکی و داروخانه‌ای تهران',
      sourceTitleEn: 'Tehran Medical & Pharmacy Supply Hub',
      rawTelegramExcerptFa: `عرضه نمونه ${data.nameFa} (${data.brandFa})، تحویل ${data.preferredCityFa}، قیمت هر ${data.unitFa}: ${sampleBestPrice} تومان (داده نمونه آزمایشی)`,
      rawTelegramExcerptEn: `Sample offer for ${data.nameEn} (${data.brandFa}), delivery ${data.preferredCityFa}, ${sampleBestPrice} Toman (Sample Test Data)`,
      isPrescriptionOnly: data.isPrescriptionOnly,
      isSampleData: true,
    };

    const newInterest: WatchlistInterest = {
      id: `int-${Date.now()}`,
      productId: newProdId,
      productNameFa: data.nameFa,
      productNameEn: data.nameEn,
      brandModelFa: `${data.brandFa} — ${data.modelSpecFa}`,
      brandModelEn: `${data.brandFa} — ${data.modelSpecFa}`,
      category: data.category,
      targetMaxPriceToman: data.targetMaxPriceToman,
      currentBestPriceToman: sampleBestPrice,
      preferredCityFa: data.preferredCityFa,
      preferredCityEn: data.preferredCityFa,
      requiredQty: data.requiredQty,
      notifyOnDrop: true,
      matchedOffersCount: 1,
      createdAtFa: 'امروز · ۲۳ آبان ۱۴۰۵',
      createdAtEn: 'Today · Nov 13, 2026',
    };

    setProducts((prev) => [newProduct, ...prev]);
    setOffers((prev) => [newOffer, ...prev]);
    setInterests((prev) => [newInterest, ...prev]);
  };

  const handleResetDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setOffers(INITIAL_OFFERS);
    setSources(INITIAL_TELEGRAM_SOURCES);
    setInterests(INITIAL_INTERESTS);
    setConversations(INITIAL_CONVERSATIONS);
    setShowRxRestricted(false);
    showToast(
      'تمامی داده‌های نمونه آزمایشی به حالت اولیه بازگردانده شدند.',
      'All sample test data restored to initial defaults.'
    );
  };

  const currentProduct =
    products.find((p) => p.id === selectedProductId) || products[0];
  const currentSource =
    sources.find((s) => s.id === selectedSourceId) || sources[0];
  const currentConversation =
    conversations.find((c) => c.id === selectedConversationId) || conversations[0];

  return (
    <div
      dir={lang === 'fa' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#F7FAF8] text-[#263D38] flex flex-col"
    >
      {/* Top Header */}
      <Header
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'fa' ? 'en' : 'fa'))}
        currentScreen={currentScreen}
        onNavigate={navigateTo}
        onBack={handleBack}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-[#263D38] text-white text-xs font-bold shadow-lg border border-[#5F978B]">
          {toastMessage}
        </div>
      )}

      {/* Main Active Screen */}
      <main className="flex-1">
        {currentScreen === 'best_offers' && (
          <BestOffersPage
            lang={lang}
            offers={offers}
            products={products}
            sources={sources}
            interestedProductIds={interestedProductIds}
            showRxRestricted={showRxRestricted}
            onToggleShowRx={setShowRxRestricted}
            onSelectProduct={handleSelectProduct}
            onComparePrices={handleComparePrices}
            onToggleInterest={handleToggleInterest}
            onStartChat={handleStartChat}
            onNavigate={navigateTo}
          />
        )}

        {currentScreen === 'product_details' && (
          <ProductDetailsPage
            lang={lang}
            product={currentProduct}
            productOffers={offers.filter((o) => o.productId === currentProduct.id)}
            selectedOfferId={selectedOfferId}
            isInterested={interestedProductIds.includes(currentProduct.id)}
            onToggleInterest={handleToggleInterest}
            onComparePrices={handleComparePrices}
            onStartChat={handleStartChat}
            onSelectSource={(srcId) => {
              setSelectedSourceId(srcId);
              navigateTo('source_details');
            }}
            onNavigate={navigateTo}
          />
        )}

        {currentScreen === 'price_comparison' && (
          <PriceComparisonPage
            lang={lang}
            products={products}
            offers={offers}
            selectedProductId={selectedProductId}
            onSelectProductId={setSelectedProductId}
            onStartChat={handleStartChat}
            onViewProductDetails={handleSelectProduct}
          />
        )}

        {currentScreen === 'interests' && (
          <InterestsPage
            lang={lang}
            interests={interests}
            onToggleNotify={(intId) =>
              setInterests((prev) =>
                prev.map((i) =>
                  i.id === intId ? { ...i, notifyOnDrop: !i.notifyOnDrop } : i
                )
              )
            }
            onUpdateTargetPrice={(intId, newTarget) => {
              setInterests((prev) =>
                prev.map((i) =>
                  i.id === intId ? { ...i, targetMaxPriceToman: newTarget } : i
                )
              );
              showToast(
                'سقف قیمت هدف با موفقیت به‌روزرسانی شد.',
                'Target price threshold updated.'
              );
            }}
            onRemoveInterest={(intId) => {
              setInterests((prev) => prev.filter((i) => i.id !== intId));
              showToast('مورد از علاقه‌مندی‌ها حذف شد.', 'Removed from interests.');
            }}
            onSelectProduct={handleSelectProduct}
            onComparePrices={handleComparePrices}
            onNavigate={navigateTo}
          />
        )}

        {currentScreen === 'add_product' && (
          <AddProductPage
            lang={lang}
            onAddProductAndInterest={handleAddProductAndInterest}
            onNavigate={navigateTo}
          />
        )}

        {currentScreen === 'telegram_sources' && (
          <TelegramSourcesPage
            lang={lang}
            sources={sources}
            onSelectSource={(srcId) => {
              setSelectedSourceId(srcId);
              navigateTo('source_details');
            }}
            onToggleSourceMonitoring={(srcId) => {
              setSources((prev) =>
                prev.map((s) =>
                  s.id === srcId
                    ? {
                        ...s,
                        monitoringStatus:
                          s.monitoringStatus === 'active' ? 'paused' : 'active',
                      }
                    : s
                )
              );
            }}
            onDeleteSource={(srcId) => {
              setSources((prev) => prev.filter((s) => s.id !== srcId));
              showToast('منبع تلگرام از لیست پایش حذف شد.', 'Telegram source removed.');
            }}
            onNavigate={navigateTo}
          />
        )}

        {currentScreen === 'add_telegram_source' && (
          <AddTelegramSourcePage
            lang={lang}
            onAddSource={(newSrc) => {
              setSources((prev) => [newSrc, ...prev]);
              showToast(
                'منبع تلگرام جدید با موفقیت به پایشگر اضافه شد.',
                'New Telegram source added to monitor.'
              );
            }}
            onNavigate={navigateTo}
          />
        )}

        {currentScreen === 'source_details' && (
          <SourceDetailsPage
            lang={lang}
            source={currentSource}
            sourceOffers={offers.filter((o) => o.sourceId === currentSource.id)}
            interestedProductIds={interestedProductIds}
            onToggleSourceMonitoring={(srcId) =>
              setSources((prev) =>
                prev.map((s) =>
                  s.id === srcId
                    ? {
                        ...s,
                        monitoringStatus:
                          s.monitoringStatus === 'active' ? 'paused' : 'active',
                      }
                    : s
                )
              )
            }
            onDeleteSource={(srcId) => {
              setSources((prev) => prev.filter((s) => s.id !== srcId));
              showToast('منبع تلگرام حذف شد.', 'Telegram source deleted.');
            }}
            onSelectProduct={handleSelectProduct}
            onComparePrices={handleComparePrices}
            onToggleInterest={handleToggleInterest}
            onStartChat={handleStartChat}
            onNavigate={navigateTo}
          />
        )}

        {currentScreen === 'conversations' && (
          <ConversationsPage
            lang={lang}
            conversations={conversations}
            onSelectConversation={(convId) => {
              setSelectedConversationId(convId);
              setConversations((prev) =>
                prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
              );
              navigateTo('conversation_details');
            }}
          />
        )}

        {currentScreen === 'conversation_details' && (
          <ConversationDetailsPage
            lang={lang}
            conversation={currentConversation}
            onSendMessage={handleSendMessage}
            onViewProduct={handleSelectProduct}
            onComparePrices={handleComparePrices}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsPage
            lang={lang}
            onSetLang={setLang}
            showRxRestricted={showRxRestricted}
            onToggleShowRx={setShowRxRestricted}
            onResetDemoData={handleResetDemoData}
          />
        )}
      </main>

      {/* Fixed 5-Tab Bottom Navigation */}
      <BottomNav
        lang={lang}
        currentScreen={currentScreen}
        onNavigate={navigateTo}
        unreadConversationsCount={unreadConversationsCount}
        interestsCount={interests.length}
      />
    </div>
  );
}
