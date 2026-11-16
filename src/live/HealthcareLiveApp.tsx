import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiClient, ApiError, type Account, type Conversation as ApiConversation, type Interest as ApiInterest, type Message as ApiMessage, type Offer as ApiOffer, type Preferences, type Product as ApiProduct, type Resolution, type ScoredOffer, type Session, type Source as ApiSource, type SourceAssignments } from "../api/client";
import type { Language, ScreenId, Product as UiProduct, Offer as UiOffer, TelegramSource as UiSource, WatchlistInterest, ConversationThread, ChatMessage, ProductCategory } from "../types/perso";
import "./live.css";
import "./healthcare-live.css";
import { Header } from "../components/Header";
import { BottomNav } from "../components/BottomNav";
import { BestOffersPage } from "../pages/BestOffersPage";
import { ProductDetailsPage } from "../pages/ProductDetailsPage";
import { PriceComparisonPage } from "../pages/PriceComparisonPage";
import { InterestsPage } from "../pages/InterestsPage";
import { AccountPanel } from "./AccountPanel";
import { useResource } from "./useResource";

type HealthcareOffer = ApiOffer & { source_id?: string };
type HealthcareSource = ApiSource & { linked_discussion_peer_id?: number };

type RouteState = {
  screen: ScreenId;
  productId?: string;
  offerId?: string;
  sourceId?: string;
  conversationId?: string;
};

const validScreens: ScreenId[] = [
  "best_offers", "product_details", "price_comparison", "interests",
  "add_product", "telegram_sources", "add_telegram_source", "source_details",
  "conversations", "conversation_details", "settings",
];

const categories: Array<{ value: ProductCategory; fa: string; en: string }> = [
  { value: "otc_medicine", fa: "داروی بدون نسخه", en: "OTC medicine" },
  { value: "pharmacy_products", fa: "محصولات داروخانه‌ای", en: "Pharmacy products" },
  { value: "medical_devices", fa: "تجهیزات پزشکی", en: "Medical devices" },
  { value: "medical_consumables", fa: "ملزومات مصرفی پزشکی", en: "Medical consumables" },
  { value: "health_monitoring", fa: "پایش سلامت", en: "Health monitoring" },
  { value: "hygiene_products", fa: "محصولات بهداشتی", en: "Hygiene products" },
  { value: "supplements", fa: "مکمل‌ها", en: "Supplements" },
  { value: "other", fa: "سایر موارد", en: "Other" },
];

function readRoute(): RouteState {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const raw = params.get("screen") as ScreenId | null;
  return {
    screen: raw && validScreens.includes(raw) ? raw : "best_offers",
    productId: params.get("product") || undefined,
    offerId: params.get("offer") || undefined,
    sourceId: params.get("source") || undefined,
    conversationId: params.get("conversation") || undefined,
  };
}

function routeHash(route: RouteState): string {
  const params = new URLSearchParams();
  params.set("screen", route.screen);
  if (route.productId) params.set("product", route.productId);
  if (route.offerId) params.set("offer", route.offerId);
  if (route.sourceId) params.set("source", route.sourceId);
  if (route.conversationId) params.set("conversation", route.conversationId);
  return "#" + params.toString();
}

function formatDate(value: string | undefined, lang: Language): string {
  if (!value) return lang === "fa" ? "ثبت نشده" : "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(lang === "fa" ? "fa-IR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function toToman(amount: number | undefined, currency: string | undefined): number | undefined {
  if (amount == null || !Number.isFinite(amount)) return undefined;
  if (currency === "IRR_RIAL") return Math.round(amount / 10);
  if (currency === "IRR_TOMAN") return Math.round(amount);
  return undefined;
}

function categoryOf(value: string | undefined): ProductCategory {
  const values = categories.map((item) => item.value);
  return value && values.includes(value as ProductCategory) ? (value as ProductCategory) : "other";
}

function attributeSummary(attributes: Record<string, unknown> | undefined): string {
  if (!attributes) return "";
  return Object.entries(attributes)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => {
      const printable = Array.isArray(value) ? value.join(", ") : typeof value === "object" ? JSON.stringify(value) : String(value);
      return key + ": " + printable;
    })
    .join(" · ");
}

function mapProduct(product: ApiProduct, stats?: { currency: string; min_price: number; max_price: number; avg_price: number; sample_count: number }, lang: Language = "fa"): UiProduct {
  const category = categoryOf(product.category);
  const brand = product.brand || product.manufacturer || "";
  const detail = attributeSummary(product.attributes);
  const spec = product.model || detail || (lang === "fa" ? "مشخصات ثبت نشده" : "Not provided");
  const price = stats ? {
    min: toToman(stats.min_price, stats.currency) || 0,
    max: toToman(stats.max_price, stats.currency) || 0,
    avg: toToman(stats.avg_price, stats.currency) || 0,
  } : { min: 0, max: 0, avg: 0 };
  const iconType: UiProduct["iconType"] =
    category === "otc_medicine" || category === "pharmacy_products" ? "pill" :
    category === "medical_devices" ? "monitor" :
    category === "medical_consumables" ? "consumable" :
    category === "health_monitoring" ? "thermometer" :
    category === "hygiene_products" ? "hygiene" :
    category === "supplements" ? "supplement" : "shield";
  const description = detail || (lang === "fa" ? "مشخصات تکمیلی در کاتالوگ ثبت نشده است." : "No additional catalog attributes are recorded.");
  return {
    id: product.id,
    nameFa: product.name,
    nameEn: product.name,
    brandFa: brand,
    brandEn: brand,
    modelOrSpecFa: spec,
    modelOrSpecEn: spec,
    category,
    unitFa: product.unit || (lang === "fa" ? "واحد" : "unit"),
    unitEn: product.unit || "unit",
    isPrescriptionOnly: Boolean(product.prescription_required),
    regulatoryNoteFa: product.prescription_required ? "این کالا در کاتالوگ نسخه‌ای علامت‌گذاری شده است؛ پیش از هر اقدام، الزامات مجوز را بررسی کنید." : undefined,
    regulatoryNoteEn: product.prescription_required ? "This catalog item is marked prescription-only; verify applicable authorization requirements before proceeding." : undefined,
    descriptionFa: description,
    descriptionEn: description,
    avgMarketPriceToman: price.avg,
    minMarketPriceToman: price.min,
    maxMarketPriceToman: price.max,
    activeOfferCount: stats?.sample_count || 0,
    iconType,
    isSampleData: false,
  };
}

function mapSource(source: HealthcareSource, lang: Language): UiSource {
  const active = source.is_active && source.ingestion_status === "active";
  const peerType = source.source_type === "basic_group" ? "group" : source.source_type;
  const lastSynced = formatDate(source.last_synced_at, lang);
  return {
    id: source.id,
    usernameOrUrl: source.username ? "@" + source.username : String(source.telegram_peer_id),
    titleFa: source.title,
    titleEn: source.title,
    peerType: peerType as UiSource["peerType"],
    isPublic: source.access_type === "public",
    accessStatus: source.capabilities?.can_read_history ? "verified" : "restricted",
    monitoringStatus: active ? "active" : source.ingestion_status === "paused" || !source.is_active ? "paused" : "error",
    lastSyncedFa: lastSynced,
    lastSyncedEn: lastSynced,
    cityFocusFa: "",
    cityFocusEn: "",
    descriptionFa: "",
    descriptionEn: "",
    keywords: [],
    linkedDiscussion: {
      hasLinkedDiscussion: Boolean(source.capabilities?.has_discussion && source.linked_discussion_peer_id),
      discussionUsername: undefined,
      discussionTitleFa: undefined,
      discussionTitleEn: undefined,
    },
    resolutionOrigin: "backend_mtproto",
  };
}

function mapOffer(scored: ScoredOffer, products: Map<string, ApiProduct>, sources: Map<string, ApiSource>, lang: Language): UiOffer {
  const offer: HealthcareOffer = scored.offer;
  const product = offer.product || (offer.product_id ? products.get(offer.product_id) : undefined);
  const source = offer.source_id ? sources.get(offer.source_id) : undefined;
  const created = offer.created_at;
  const createdDate = new Date(created);
  const age = Number.isNaN(createdDate.getTime()) ? 0 : Math.max(0, Math.floor((Date.now() - createdDate.getTime()) / 60000));
  const brand = offer.brand || product?.brand || product?.manufacturer || "";
  const model = offer.model || product?.model || attributeSummary(product?.attributes) || "";
  const name = product?.name || model || (lang === "fa" ? "کالای تطبیق‌نیافته" : "Unmatched listing");
  const unit = product?.unit || (lang === "fa" ? "واحد" : "unit");
  const dateLabel = formatDate(created, lang);
  return {
    id: offer.id,
    productId: offer.product_id || product?.id || "",
    productNameFa: name,
    productNameEn: name,
    brandFa: brand,
    brandEn: brand,
    modelSpecFa: model,
    modelSpecEn: model,
    category: categoryOf(product?.category),
    priceToman: toToman(offer.price_amount, offer.price_currency),
    unitFa: unit,
    unitEn: unit,
    minOrderQty: undefined,
    availableQuantity: offer.quantity,
    cityFa: offer.seller_city || offer.seller_area || (lang === "fa" ? "اعلام نشده" : "Not provided"),
    cityEn: offer.seller_city || offer.seller_area || "Not provided",
    status: "unknown",
    sellerNameFa: lang === "fa" ? "نام فروشنده در آگهی ثبت نشده" : "Seller details not included",
    sellerNameEn: "Seller details not included",
    sellerTelegramHandle: "",
    sellerVerified: false,
    sellerLicenseCode: "",
    matchScore: scored.score_breakdown?.final_score || 0,
    postedAtFa: dateLabel,
    postedAtEn: dateLabel,
    postedMinutesAgo: age,
    expiryDateSampleFa: "",
    expiryDateSampleEn: "",
    paymentTermsFa: "",
    paymentTermsEn: "",
    sourceId: offer.source_id || undefined,
    sourceTitleFa: source?.title || "",
    sourceTitleEn: source?.title || "",
    rawTelegramExcerptFa: "",
    rawTelegramExcerptEn: "",
    isPrescriptionOnly: Boolean(product?.prescription_required),
    isSampleData: false,
    listingStatus: offer.listing_status,
  };
}

function mapInterest(interest: ApiInterest, products: Map<string, ApiProduct>, offers: UiOffer[], lang: Language): WatchlistInterest {
  const product = interest.product || products.get(interest.product_id);
  const name = product?.name || interest.product_id;
  const best = offers
    .filter((offer) => offer.productId === interest.product_id && offer.priceToman != null)
    .sort((a, b) => (a.priceToman || 0) - (b.priceToman || 0))[0];
  const brand = product?.brand || product?.manufacturer || "";
  const model = product?.model || attributeSummary(product?.attributes) || "";
  const city = interest.preferred_city || (lang === "fa" ? "بدون ترجیح" : "No preference");
  return {
    id: interest.id,
    productId: interest.product_id,
    productNameFa: name,
    productNameEn: name,
    brandModelFa: [brand, model].filter(Boolean).join(" · "),
    brandModelEn: [brand, model].filter(Boolean).join(" · "),
    category: categoryOf(product?.category),
    targetMaxPriceToman: interest.max_price_amount || 0,
    currentBestPriceToman: best?.priceToman,
    preferredCityFa: city,
    preferredCityEn: city,
    requiredQty: interest.min_quantity || 0,
    notifyOnDrop: false,
    matchedOffersCount: undefined,
    createdAtFa: "",
    createdAtEn: "",
  };
}

function mapConversation(conv: ApiConversation, products: Map<string, ApiProduct>, offers: UiOffer[], messages: ApiMessage[], lang: Language): ConversationThread {
  const product = conv.product_id ? products.get(conv.product_id) : undefined;
  const offer = conv.offer_id ? offers.find((item) => item.id === conv.offer_id) : undefined;
  const name = product?.name || (lang === "fa" ? "محصول ثبت‌نشده" : "Product not recorded");
  const state = String(conv.state || "").toUpperCase();
  const status: ConversationThread["status"] =
    state === "COMPLETED" ? "confirmed" :
    state === "CLOSED" || state === "PAUSED" || state === "OPTED_OUT" || state === "FAILED" ? "archived" :
    state === "ACTIVE" ? "price_quoted" : "awaiting_reply";
  const mappedMessages: ChatMessage[] = messages.map((message) => {
    const sender = message.sender.toLowerCase();
    const normalizedSender: ChatMessage["sender"] = sender.includes("buyer") ? "buyer" : sender.includes("seller") ? "seller" : "system";
    const timestamp = formatDate(message.sent_at, lang);
    return {
      id: message.id,
      sender: normalizedSender,
      textFa: message.text,
      textEn: message.text,
      timestampFa: timestamp,
      timestampEn: timestamp,
    };
  });
  const updated = formatDate(conv.updated_at, lang);
  const unit = product?.unit || (lang === "fa" ? "واحد" : "unit");
  return {
    id: conv.id,
    offerId: conv.offer_id || "",
    productId: conv.product_id || "",
    productNameFa: name,
    productNameEn: name,
    offeredPriceToman: offer?.priceToman,
    unitFa: unit,
    unitEn: unit,
    sellerNameFa: lang === "fa" ? "فروشنده" : "Seller",
    sellerNameEn: "Seller",
    sellerHandle: "",
    sellerCityFa: lang === "fa" ? "ثبت نشده" : "Not provided",
    sellerCityEn: "Not provided",
    sourceTitleFa: "",
    sourceTitleEn: "",
    status,
    unreadCount: 0,
    updatedAtFa: updated,
    updatedAtEn: updated,
    rawTelegramPostFa: "",
    rawTelegramPostEn: "",
    messages: mappedMessages,
    backendState: conv.state,
    consentGranted: conv.consent_granted,
    missingFields: conv.missing_fields || [],
    questionsAskedCount: conv.questions_asked_count || 0,
  };
}

function ScreenState(props: { loading: boolean; error: Error | null; retry: () => void; lang: Language; children: React.ReactNode }) {
  const { loading, error, retry, lang, children } = props;
  if (loading) return <div className="hc-state" role="status">{lang === "fa" ? "در حال دریافت اطلاعات از سرور…" : "Loading server data…"}</div>;
  if (error) return (
    <div className="hc-state hc-error" role="alert">
      <strong>{lang === "fa" ? "دریافت اطلاعات ناموفق بود" : "Unable to load server data"}</strong>
      <p>{error.message}</p>
      <button type="button" onClick={retry}>{lang === "fa" ? "تلاش دوباره" : "Retry"}</button>
    </div>
  );
  return <>{children}</>;
}

export function HealthcareLiveApp() {
  const api = useMemo(() => new ApiClient(), []);
  const [route, setRoute] = useState<RouteState>(() => readRoute());
  const historyRef = useRef<RouteState[]>([]);
  const [authVersion, setAuthVersion] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lang, setLang] = useState<Language>(() => localStorage.getItem("perso.language") === "en" ? "en" : "fa");
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [showRxRestricted, setShowRxRestricted] = useState(false);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [selectedBuyerIds, setSelectedBuyerIds] = useState<string[]>([]);

  const session = useResource(() => api.session(), [api, authVersion]);
  const sessionData: Session | undefined = session.value?.data;
  const user: Account | undefined = sessionData?.user;
  const authenticated = Boolean(user);
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const marketplaceAccess = Boolean(sessionData?.marketplace_access);

  useEffect(() => {
    const onPop = () => setRoute(readRoute());
    window.addEventListener("popstate", onPop);
    window.addEventListener("hashchange", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("hashchange", onPop);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    localStorage.setItem("perso.language", lang);
  }, [lang]);

  useEffect(() => {
    if (user?.preferences?.language) setLang(user.preferences.language);
  }, [user?.id, user?.preferences?.language]);

  const navigateTo = useCallback((screen: ScreenId, extra: Partial<RouteState> = {}) => {
    const next: RouteState = { screen, ...extra };
    historyRef.current.push(route);
    window.history.pushState({}, "", routeHash(next));
    setRoute(next);
    setNotice("");
    setActionError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [route]);

  const goBack = useCallback(() => {
    const previous = historyRef.current.pop();
    const next = previous || { screen: "best_offers" as ScreenId };
    window.history.pushState({}, "", routeHash(next));
    setRoute(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const productsResource = useResource(() => api.products(), [api, authVersion, refreshKey], authenticated);
  const interestsResource = useResource(() => api.interests(), [api, authVersion, refreshKey], authenticated);
  const sourcesResource = useResource(() => api.sources(), [api, authVersion, refreshKey], authenticated);
  const conversationsResource = useResource(() => api.conversations(), [api, authVersion, refreshKey, route.screen], authenticated && marketplaceAccess && route.screen === "conversations");
  const gatewayResource = useResource(() => api.gateway(), [api, authVersion], authenticated);

  const offerSort = route.screen === "price_comparison" ? "lowest_price" : user?.preferences?.default_sort || "best_offer";
  const offersResource = useResource(() => {
    const query = new URLSearchParams({ limit: "100", sort_by: offerSort, with_scores: "true" });
    if (route.productId) query.set("product_id", route.productId);
    return api.offers(query);
  }, [api, authVersion, refreshKey, route.screen, route.productId, offerSort], authenticated && marketplaceAccess && ["best_offers", "product_details", "price_comparison", "source_details"].includes(route.screen));

  const productDetailResource = useResource(() => api.product(route.productId || ""), [api, authVersion, refreshKey, route.productId], authenticated && Boolean(route.productId) && ["product_details", "price_comparison"].includes(route.screen));
  const statisticsResource = useResource(() => api.statistics(route.productId || ""), [api, authVersion, refreshKey, route.productId], authenticated && Boolean(route.productId) && ["product_details", "price_comparison"].includes(route.screen));
  const sourceDetailResource = useResource(() => api.source(route.sourceId || ""), [api, authVersion, refreshKey, route.sourceId], authenticated && Boolean(route.sourceId) && route.screen === "source_details");
  const assignmentsResource = useResource(() => api.assignments(route.sourceId || ""), [api, authVersion, refreshKey, route.sourceId], authenticated && isAdmin && Boolean(route.sourceId) && route.screen === "source_details");
  const usersResource = useResource(() => api.users(), [api, authVersion, refreshKey], authenticated && isAdmin && route.screen === "source_details");
  const conversationDetailResource = useResource(() => api.conversation(route.conversationId || ""), [api, authVersion, refreshKey, route.conversationId], authenticated && Boolean(route.conversationId) && route.screen === "conversation_details");

  useEffect(() => {
    if (assignmentsResource.value?.data) setSelectedBuyerIds(assignmentsResource.value.data.buyer_ids || []);
  }, [assignmentsResource.value?.data?.source_id, assignmentsResource.value?.data?.version]);

  const productsApi = productsResource.value?.data || [];
  const interestsApi = interestsResource.value?.data || [];
  const sourcesApi = sourcesResource.value?.data || [];
  const conversationsApi = conversationsResource.value?.data || [];
  const productsById = useMemo(() => new Map(productsApi.map((product) => [product.id, product])), [productsApi]);
  const sourcesById = useMemo(() => new Map(sourcesApi.map((source) => [source.id, source])), [sourcesApi]);
  const offersApi = offersResource.value?.data || [];
  const offersUi = useMemo(() => offersApi.map((offer) => mapOffer(offer, productsById, sourcesById, lang)), [offersApi, productsById, sourcesById, lang]);
  const currentProductApi = productDetailResource.value?.data || (route.productId ? productsById.get(route.productId) : undefined);
  const statsApi = statisticsResource.value?.data;
  const productsUi = useMemo(() => {
    const mapped = productsApi.map((product) => mapProduct(product, statsApi?.product_id === product.id ? statsApi : undefined, lang));
    if (currentProductApi && !mapped.some((product) => product.id === currentProductApi.id)) {
      mapped.unshift(mapProduct(currentProductApi, statsApi, lang));
    }
    return mapped;
  }, [productsApi, currentProductApi, statsApi, lang]);
  const currentProductUi = currentProductApi ? mapProduct(currentProductApi, statsApi, lang) : undefined;
  const interestsUi = useMemo(() => interestsApi.map((interest) => mapInterest(interest, productsById, offersUi, lang)), [interestsApi, productsById, offersUi, lang]);
  const sourcesUi = useMemo(() => sourcesApi.map((source) => mapSource(source, lang)), [sourcesApi, lang]);
  const conversationsUi = useMemo(() => conversationsApi.map((conv) => mapConversation(conv, productsById, offersUi, [], lang)), [conversationsApi, productsById, offersUi, lang]);
  const currentSourceApi = sourceDetailResource.value?.data;
  const currentSourceUi = currentSourceApi ? mapSource(currentSourceApi, lang) : undefined;
  const sourceOffersUi = currentSourceApi ? offersUi.filter((offer) => offer.sourceId === currentSourceApi.id) : [];
  const currentConversationData = conversationDetailResource.value?.data;
  const currentConversationApi = currentConversationData?.conversation || conversationsApi.find((conv) => conv.id === route.conversationId);
  const currentConversationUi = currentConversationApi
    ? mapConversation(currentConversationApi, productsById, offersUi, currentConversationData?.messages || [], lang)
    : undefined;
  const interestedProductIds = interestsApi.map((interest) => interest.product_id);

  const runAction = async (action: () => Promise<unknown>, success: string) => {
    setActionError("");
    setNotice("");
    try {
      await action();
      setNotice(success);
      setRefreshKey((value) => value + 1);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Request failed");
    }
  };

  const toggleInterest = async (productId: string) => {
    if (!productId) return;
    const existing = interestsApi.find((interest) => interest.product_id === productId);
    await runAction(
      () => existing ? api.removeInterest(existing.id) : api.addInterest(productId),
      existing ? (lang === "fa" ? "از علاقه‌مندی‌ها حذف شد." : "Removed from interests.") : (lang === "fa" ? "به علاقه‌مندی‌ها اضافه شد." : "Added to interests."),
    );
  };

  const onLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoginBusy(true);
    setLoginError("");
    try {
      await api.login(loginName.trim(), loginPassword);
      setLoginPassword("");
      setAuthVersion((value) => value + 1);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoginBusy(false);
    }
  };

  const logout = async () => {
    try { await api.logout(); } catch { /* Session may already have expired. */ }
    setAuthVersion((value) => value + 1);
    historyRef.current = [];
    navigateTo("best_offers");
  };

  const refreshAll = () => {
    setRefreshKey((value) => value + 1);
    void session.refresh();
  };

  if (!session.value && session.loading) {
    return <div className="live-login"><p role="status">{lang === "fa" ? "در حال بررسی نشست کاربری…" : "Checking your session…"}</p></div>;
  }

  if (!session.value && session.error && (session.error instanceof ApiError ? session.error.status === 401 : false)) {
    return (
      <main className="live-login">
        <form onSubmit={onLogin} className="live-login-card">
          <div className="live-login-brand">Perso <span>Healthcare</span></div>
          <h1>{lang === "fa" ? "ورود به پایشگر سلامت پرسو" : "Sign in to Perso Healthcare"}</h1>
          <label htmlFor="username">{lang === "fa" ? "نام کاربری" : "Username"}</label>
          <input id="username" autoComplete="username" value={loginName} onChange={(event) => setLoginName(event.target.value)} required />
          <label htmlFor="password">{lang === "fa" ? "گذرواژه" : "Password"}</label>
          <input id="password" type="password" autoComplete="current-password" value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} required />
          {loginError && <p role="alert">{loginError}</p>}
          <button className="live-primary" disabled={loginBusy}>{loginBusy ? (lang === "fa" ? "در حال ورود…" : "Signing in…") : (lang === "fa" ? "ورود امن" : "Connect securely")}</button>
          <a href="?mode=demo">{lang === "fa" ? "مشاهده پیش‌نمایش نمونه (بدون داده زنده)" : "Open sample preview (no live data)"}</a>
        </form>
      </main>
    );
  }

  if (!session.value && session.error) {
    return <div className="live-login"><div role="alert" className="hc-state hc-error">{session.error.message}<button type="button" onClick={() => void session.refresh()}>{lang === "fa" ? "تلاش دوباره" : "Retry"}</button></div></div>;
  }

  const sourceAction = (sourceId: string, active: boolean) => runAction(() => api.sourceStatus(sourceId, active), lang === "fa" ? "وضعیت منبع ذخیره شد." : "Source status saved.");
  const removeSource = (sourceId: string) => runAction(() => api.removeSource(sourceId), lang === "fa" ? "منبع حذف شد." : "Source removed.");
  const selectedConversation = currentConversationApi;
  const selectedConversationOwner = selectedConversation?.owner_id;
  const canManageConversation = Boolean(isAdmin || (selectedConversationOwner && selectedConversationOwner === sessionData?.user_id));
  const conversationState = String(selectedConversation?.state || "").toUpperCase();
  const canApproveConversation = Boolean(isAdmin && sessionData?.outreach_enabled && conversationState === "AWAITING_APPROVAL");

  return (
    <div className="live-app">
      <div className="live-header">
        <Header lang={lang} onToggleLang={() => setLang((value) => value === "fa" ? "en" : "fa")} currentScreen={route.screen} onNavigate={navigateTo} onBack={goBack} canManageSources={isAdmin} />
        <div className="hc-session-strip">
          <span className="hc-connection">{gatewayResource.value?.data.mock ? "Mock connection" : gatewayResource.value?.data.connected ? (lang === "fa" ? "اتصال تلگرام برقرار" : "Telegram connected") : (lang === "fa" ? "اتصال تلگرام برقرار نیست" : "Telegram disconnected")}</span>
          <span>{user?.full_name || user?.username} · {user?.role}</span>
          <button type="button" onClick={() => void logout()}>{lang === "fa" ? "خروج" : "Sign out"}</button>
        </div>
      </div>

      <main className="live-main">
        {notice && <p className="hc-notice" role="status">{notice}</p>}
        {actionError && <p className="hc-action-error" role="alert">{actionError}</p>}

        {route.screen === "best_offers" && (
          !marketplaceAccess
            ? <div className="hc-state">{lang === "fa" ? "برای مشاهده پیشنهادها، مدیر باید دسترسی منابع تلگرام را به حساب شما اختصاص دهد." : "An administrator must assign Telegram sources to your account before offers are available."}</div>
            : <ScreenState loading={productsResource.loading || offersResource.loading || sourcesResource.loading || interestsResource.loading} error={productsResource.error || offersResource.error || sourcesResource.error || interestsResource.error} retry={refreshAll} lang={lang}>
                <BestOffersPage lang={lang} offers={offersUi} products={productsUi} sources={sourcesUi} interestedProductIds={interestedProductIds} showRxRestricted={showRxRestricted} onToggleShowRx={setShowRxRestricted} onSelectProduct={(productId, offerId) => navigateTo("product_details", { productId, offerId })} onComparePrices={(productId) => navigateTo("price_comparison", { productId })} onToggleInterest={toggleInterest} onStartChat={() => undefined} onNavigate={navigateTo} isLive canStartChat={false} onRefresh={refreshAll} refreshing={offersResource.loading || productsResource.loading} />
              </ScreenState>
        )}

        {route.screen === "product_details" && (
          !marketplaceAccess
            ? <div className="hc-state">{lang === "fa" ? "دسترسی بازار برای این حساب فعال نیست." : "Marketplace access is not enabled for this account."}</div>
            : <ScreenState loading={productDetailResource.loading || offersResource.loading} error={productDetailResource.error || offersResource.error} retry={refreshAll} lang={lang}>
                {currentProductUi ? <ProductDetailsPage lang={lang} product={currentProductUi} productOffers={offersUi.filter((offer) => offer.productId === currentProductUi.id)} selectedOfferId={route.offerId} isInterested={interestedProductIds.includes(currentProductUi.id)} onToggleInterest={toggleInterest} onComparePrices={(productId) => navigateTo("price_comparison", { productId })} onStartChat={() => undefined} onSelectSource={(sourceId) => navigateTo("source_details", { sourceId })} onNavigate={navigateTo} isLive canStartChat={false} /> : <div className="hc-state">{lang === "fa" ? "محصول پیدا نشد." : "Product not found."}</div>}
              </ScreenState>
        )}

        {route.screen === "price_comparison" && (
          !marketplaceAccess
            ? <div className="hc-state">{lang === "fa" ? "دسترسی بازار برای این حساب فعال نیست." : "Marketplace access is not enabled for this account."}</div>
            : <ScreenState loading={productsResource.loading || offersResource.loading || productDetailResource.loading} error={productsResource.error || offersResource.error || productDetailResource.error} retry={refreshAll} lang={lang}>
                {productsUi.length ? <PriceComparisonPage lang={lang} products={productsUi} offers={offersUi} selectedProductId={route.productId || productsUi[0].id} onSelectProductId={(productId) => navigateTo("price_comparison", { productId })} onStartChat={() => undefined} onViewProductDetails={(productId, offerId) => navigateTo("product_details", { productId, offerId })} isLive canStartChat={false} /> : <div className="hc-state">{lang === "fa" ? "کاتالوگ محصول خالی است." : "The healthcare catalog is empty."}</div>}
              </ScreenState>
        )}

        {route.screen === "interests" && (
          <ScreenState loading={productsResource.loading || interestsResource.loading || offersResource.loading} error={productsResource.error || interestsResource.error} retry={refreshAll} lang={lang}>
            <InterestsPage lang={lang} interests={interestsUi} onToggleNotify={() => undefined} onUpdateTargetPrice={(interestId, amount) => void runAction(() => api.updateInterest(interestId, { max_price_amount: amount }), lang === "fa" ? "سقف قیمت ذخیره شد." : "Target price saved.")} onRemoveInterest={(interestId) => void runAction(() => api.removeInterest(interestId), lang === "fa" ? "علاقه‌مندی حذف شد." : "Interest removed.")} onSelectProduct={(productId) => navigateTo("product_details", { productId })} onComparePrices={(productId) => navigateTo("price_comparison", { productId })} onNavigate={navigateTo} isLive />
          </ScreenState>
        )}

        {route.screen === "add_product" && (
          <ScreenState loading={productsResource.loading || interestsResource.loading} error={productsResource.error || interestsResource.error} retry={refreshAll} lang={lang}>
            <LiveCatalogPage lang={lang} products={productsApi} isAdmin={isAdmin} interestedProductIds={interestedProductIds} onSelectProduct={(productId) => navigateTo("product_details", { productId })} onAddInterest={(productId, filters) => void runAction(() => api.addInterest(productId, filters), lang === "fa" ? "محصول به علاقه‌مندی‌ها اضافه شد." : "Product added to interests.")} onCreateProduct={(payload) => void runAction(async () => { const created = await api.createProduct(payload); setRefreshKey((value) => value + 1); navigateTo("product_details", { productId: created.data.id }); }, lang === "fa" ? "محصول به کاتالوگ اضافه شد." : "Product added to catalog.")} />
          </ScreenState>
        )}

        {route.screen === "telegram_sources" && (
          <ScreenState loading={sourcesResource.loading} error={sourcesResource.error} retry={refreshAll} lang={lang}>
            <LiveSourcesPage lang={lang} sources={sourcesApi} canManage={isAdmin} onAdd={() => navigateTo("add_telegram_source")} onSelect={(sourceId) => navigateTo("source_details", { sourceId })} onToggle={(source) => void sourceAction(source.id, !source.is_active)} onDelete={(sourceId) => void removeSource(sourceId)} />
          </ScreenState>
        )}

        {route.screen === "add_telegram_source" && (
          isAdmin
            ? <LiveAddSourcePage api={api} lang={lang} onBack={goBack} onAdded={() => { setRefreshKey((value) => value + 1); navigateTo("telegram_sources"); }} />
            : <div className="hc-state" role="alert">{lang === "fa" ? "فقط مدیران می‌توانند منبع تلگرام اضافه کنند." : "Only administrators can add Telegram sources."}</div>
        )}

        {route.screen === "source_details" && (
          <ScreenState loading={sourceDetailResource.loading || offersResource.loading} error={sourceDetailResource.error || offersResource.error} retry={refreshAll} lang={lang}>
            {currentSourceApi ? <LiveSourceDetailsPage lang={lang} source={currentSourceApi} offers={sourceOffersUi} canManage={isAdmin} assignments={assignmentsResource.value?.data} users={usersResource.value?.data || []} selectedBuyerIds={selectedBuyerIds} onSelectedBuyerIds={setSelectedBuyerIds} onSaveAssignments={() => assignmentsResource.value?.data && void runAction(() => api.replaceAssignments(currentSourceApi.id, selectedBuyerIds, assignmentsResource.value!.data.version), lang === "fa" ? "تخصیص منابع ذخیره شد." : "Source assignments saved.")} onToggle={() => void sourceAction(currentSourceApi.id, !currentSourceApi.is_active)} onDelete={() => { void removeSource(currentSourceApi.id); navigateTo("telegram_sources"); }} onSelectProduct={(productId) => navigateTo("product_details", { productId })} onComparePrices={(productId) => navigateTo("price_comparison", { productId })} /> : <div className="hc-state">{lang === "fa" ? "منبع پیدا نشد یا به آن دسترسی ندارید." : "Source not found or access denied."}</div>}
          </ScreenState>
        )}

        {route.screen === "conversations" && (
          !marketplaceAccess
            ? <div className="hc-state">{lang === "fa" ? "دسترسی بازار برای این حساب فعال نیست." : "Marketplace access is not enabled for this account."}</div>
            : <ScreenState loading={conversationsResource.loading} error={conversationsResource.error} retry={refreshAll} lang={lang}>
                <LiveConversationsPage lang={lang} conversations={conversationsUi} onSelect={(conversationId) => navigateTo("conversation_details", { conversationId })} />
              </ScreenState>
        )}

        {route.screen === "conversation_details" && (
          <ScreenState loading={conversationDetailResource.loading} error={conversationDetailResource.error} retry={refreshAll} lang={lang}>
            {currentConversationUi && currentConversationApi ? <LiveConversationDetailsPage lang={lang} conversation={currentConversationUi} state={conversationState} consentGranted={Boolean(currentConversationApi.consent_granted)} missingFields={currentConversationApi.missing_fields || []} outreachEnabled={Boolean(sessionData?.outreach_enabled)} canApprove={canApproveConversation} canManage={canManageConversation} onApprove={() => void runAction(() => api.action(currentConversationApi.id, "approve"), lang === "fa" ? "گفتگو تأیید شد." : "Conversation approved.")} onPause={() => void runAction(() => api.action(currentConversationApi.id, "pause"), lang === "fa" ? "گفتگو متوقف شد." : "Conversation paused.")} onClose={() => void runAction(() => api.action(currentConversationApi.id, "close"), lang === "fa" ? "گفتگو بسته شد." : "Conversation closed.")} onViewProduct={() => currentConversationUi.productId && navigateTo("product_details", { productId: currentConversationUi.productId })} onCompare={() => currentConversationUi.productId && navigateTo("price_comparison", { productId: currentConversationUi.productId })} /> : <div className="hc-state">{lang === "fa" ? "گفتگو پیدا نشد یا دسترسی ندارید." : "Conversation not found or access denied."}</div>}
          </ScreenState>
        )}

        {route.screen === "settings" && user && (
          <section className="max-w-6xl mx-auto px-3 sm:px-6 pt-3 pb-24 space-y-3">
            <h1 className="text-base font-extrabold text-[#263D38]">{lang === "fa" ? "تنظیمات حساب و workspace" : "Account & workspace settings"}</h1>
            <AccountPanel api={api} user={user} fa={lang === "fa"} saved={(preferences?: Preferences) => { if (preferences?.language) setLang(preferences.language); setAuthVersion((value) => value + 1); }} signedOut={() => void logout()} />
          </section>
        )}
      </main>

      <div className="live-bottom-nav">
        <BottomNav lang={lang} currentScreen={route.screen} onNavigate={navigateTo} unreadConversationsCount={0} interestsCount={interestsApi.length} />
      </div>
    </div>
  );
}

function LiveCatalogPage(props: {
  lang: Language;
  products: ApiProduct[];
  isAdmin: boolean;
  interestedProductIds: string[];
  onSelectProduct: (id: string) => void;
  onAddInterest: (id: string, filters?: { max_price_amount?: number; min_quantity?: number; preferred_city?: string }) => void;
  onCreateProduct: (payload: { name: string; brand?: string; manufacturer?: string; model?: string; category: string; attributes: Record<string, unknown>; unit?: string; pack_size?: number; prescription_required?: boolean; expiry_required?: boolean }) => void;
}) {
  const { lang, products, isAdmin, interestedProductIds, onSelectProduct, onAddInterest, onCreateProduct } = props;
  const fa = lang === "fa";
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [category, setCategory] = useState("medical_devices");
  const [unit, setUnit] = useState("");
  const [packSize, setPackSize] = useState("");
  const [strength, setStrength] = useState("");
  const [dosageForm, setDosageForm] = useState("");
  const [prescription, setPrescription] = useState(false);
  const [expiry, setExpiry] = useState(false);
  const visible = products.filter((product) => [product.name, product.brand, product.manufacturer, product.model].join(" ").toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-3 pb-24 space-y-4">
      <section className="rounded-3xl bg-gradient-main-mint border border-[#A9D5C5] p-4 sm:p-5">
        <h1 className="text-base sm:text-lg font-extrabold text-[#263D38]">{fa ? "کاتالوگ محصولات سلامت" : "Healthcare product catalog"}</h1>
        <p className="text-xs text-[#477D72] mt-1">{fa ? "محصولات ثبت‌شده از API کاتالوگ خوانده می‌شوند؛ هیچ داده نمونه‌ای به فهرست زنده اضافه نمی‌شود." : "Products are loaded from the catalog API. No demo fixtures are inserted into the live list."}</p>
      </section>
      {isAdmin && (
        <form className="rounded-2xl bg-white border border-[#E1EBE5] p-4 grid grid-cols-1 sm:grid-cols-2 gap-3" onSubmit={(event) => { event.preventDefault(); if (!name.trim()) return; onCreateProduct({ name: name.trim(), brand: brand.trim() || undefined, manufacturer: manufacturer.trim() || undefined, model: model.trim() || undefined, category, unit: unit.trim() || undefined, pack_size: packSize ? Number(packSize) : undefined, prescription_required: prescription, expiry_required: expiry, attributes: { strength: strength.trim() || undefined, dosage_form: dosageForm.trim() || undefined } }); }}>
          <h2 className="sm:col-span-2 text-sm font-extrabold text-[#263D38]">{fa ? "ثبت محصول جدید در کاتالوگ (مدیر)" : "Create catalog product (administrator)"}</h2>
          <label className="hc-field">{fa ? "نام محصول" : "Product name"}<input required value={name} onChange={(event) => setName(event.target.value)} /></label>
          <label className="hc-field">{fa ? "دسته‌بندی" : "Category"}<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item.value} value={item.value}>{fa ? item.fa : item.en}</option>)}</select></label>
          <label className="hc-field">{fa ? "برند" : "Brand"}<input value={brand} onChange={(event) => setBrand(event.target.value)} /></label>
          <label className="hc-field">{fa ? "تولیدکننده" : "Manufacturer"}<input value={manufacturer} onChange={(event) => setManufacturer(event.target.value)} /></label>
          <label className="hc-field">{fa ? "مدل / مشخصات" : "Model / specification"}<input value={model} onChange={(event) => setModel(event.target.value)} /></label>
          <label className="hc-field">{fa ? "واحد" : "Unit"}<input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder={fa ? "مثلاً عدد، بسته، ویال" : "e.g. piece, pack, vial"} /></label>
          <label className="hc-field">{fa ? "تعداد در بسته" : "Pack size"}<input type="number" min="1" value={packSize} onChange={(event) => setPackSize(event.target.value)} /></label>
          <label className="hc-field">{fa ? "قدرت / غلظت" : "Strength"}<input value={strength} onChange={(event) => setStrength(event.target.value)} /></label>
          <label className="hc-field">{fa ? "شکل دارویی / نوع" : "Dosage form / type"}<input value={dosageForm} onChange={(event) => setDosageForm(event.target.value)} /></label>
          <label className="hc-check"><input type="checkbox" checked={prescription} onChange={(event) => setPrescription(event.target.checked)} />{fa ? "نسخه‌ای است" : "Prescription required"}</label>
          <label className="hc-check"><input type="checkbox" checked={expiry} onChange={(event) => setExpiry(event.target.checked)} />{fa ? "تاریخ انقضا الزامی است" : "Expiry date required"}</label>
          <button className="live-primary sm:col-span-2" type="submit">{fa ? "ثبت در کاتالوگ" : "Create product"}</button>
        </form>
      )}
      <section className="rounded-2xl bg-white border border-[#E1EBE5] p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-extrabold text-[#263D38]">{fa ? "محصولات ثبت‌شده" : "Catalog products"} ({visible.length})</h2>
          <input className="hc-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={fa ? "جستجوی محصول…" : "Search products…"} />
        </div>
        {visible.length === 0 ? <p className="hc-empty">{fa ? "محصولی در کاتالوگ پیدا نشد." : "No catalog products found."}</p> : visible.map((product) => {
          const saved = interestedProductIds.includes(product.id);
          return (
            <article key={product.id} className="hc-list-row">
              <button type="button" className="hc-row-main" onClick={() => onSelectProduct(product.id)}>
                <strong>{product.name}</strong><span>{[product.brand, product.model, product.category].filter(Boolean).join(" · ")}</span>
              </button>
              <button type="button" className={saved ? "live-secondary" : "live-primary"} disabled={saved} onClick={() => onAddInterest(product.id)}>{saved ? (fa ? "ذخیره‌شده" : "Saved") : (fa ? "افزودن به علاقه‌مندی‌ها" : "Add to interests")}</button>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function LiveSourcesPage(props: {
  lang: Language; sources: ApiSource[]; canManage: boolean;
  onAdd: () => void; onSelect: (id: string) => void;
  onToggle: (source: ApiSource) => void; onDelete: (id: string) => void;
}) {
  const { lang, sources, canManage, onAdd, onSelect, onToggle, onDelete } = props;
  const fa = lang === "fa";
  const [search, setSearch] = useState("");
  const visible = sources.filter((source) => (source.title + " " + (source.username || "") + " " + source.telegram_peer_id).toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-3 pb-24 space-y-4">
      <section className="rounded-3xl bg-gradient-main-mint border border-[#A9D5C5] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-base sm:text-lg font-extrabold text-[#263D38]">{fa ? "منابع تلگرام" : "Telegram sources"}</h1><p className="text-xs text-[#477D72] mt-1">{fa ? "فقط منابعی نمایش داده می‌شوند که API برای حساب فعلی مجاز می‌داند." : "Only sources authorized for the current account are returned by the API."}</p></div>
        {canManage && <button type="button" className="live-primary" onClick={onAdd}>{fa ? "افزودن منبع" : "Add source"}</button>}
      </section>
      <input className="hc-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={fa ? "جستجوی نام یا شناسه منبع…" : "Search source title or ID…"} />
      {visible.length === 0 ? <p className="hc-empty">{fa ? "منبعی برای این حساب ثبت نشده است." : "No Telegram sources are assigned to this account."}</p> : visible.map((source) => (
        <article key={source.id} className="hc-source-card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <button type="button" className="hc-row-main" onClick={() => onSelect(source.id)}><strong>{source.title}</strong><span>{source.username ? "@" + source.username : source.telegram_peer_id} · {source.source_type} · {source.access_type}</span></button>
            <span className={source.is_active && source.ingestion_status === "active" ? "hc-state-pill hc-state-active" : "hc-state-pill"}>{source.ingestion_status}</span>
          </div>
          <div className="hc-meta-grid">
            <span>{fa ? "شناسه تلگرام" : "Telegram peer"}: {source.telegram_peer_id}</span>
            <span>{fa ? "آخرین همگام‌سازی" : "Last sync"}: {formatDate(source.last_synced_at, lang)}</span>
            <span>{fa ? "خواندن تاریخچه" : "History access"}: {source.capabilities?.can_read_history ? (fa ? "مجاز" : "Available") : (fa ? "نامشخص / محدود" : "Unavailable / restricted")}</span>
            <span>{fa ? "موضوعات" : "Topics"}: {source.capabilities?.has_topics ? (fa ? "دارد" : "Yes") : (fa ? "ندارد" : "No")}</span>
          </div>
          <div className="hc-actions">
            <button type="button" className="live-secondary" onClick={() => onSelect(source.id)}>{fa ? "جزئیات" : "Details"}</button>
            {canManage && <button type="button" className="live-secondary" onClick={() => onToggle(source)}>{source.is_active ? (fa ? "توقف پایش" : "Pause") : (fa ? "ادامه پایش" : "Resume")}</button>}
            {canManage && <button type="button" className="hc-danger" onClick={() => onDelete(source.id)}>{fa ? "حذف" : "Remove"}</button>}
          </div>
        </article>
      ))}
    </div>
  );
}

function LiveAddSourcePage(props: { api: ApiClient; lang: Language; onBack: () => void; onAdded: () => void }) {
  const { api, lang, onBack, onAdded } = props;
  const fa = lang === "fa";
  const [address, setAddress] = useState("");
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resolved, setResolved] = useState(false);
  const resolve = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true); setError(""); setResolution(null); setResolved(false);
    try {
      const result = await api.resolve(address.trim());
      setResolution(result.data);
      setResolved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Resolve failed");
    } finally { setBusy(false); }
  };
  const add = async () => {
    setBusy(true); setError("");
    try {
      await api.addSource(address.trim());
      onAdded();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Add source failed");
    } finally { setBusy(false); }
  };
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-3 pb-24 space-y-4">
      <section className="rounded-3xl bg-gradient-main-mint border border-[#A9D5C5] p-4"><h1 className="text-lg font-extrabold text-[#263D38]">{fa ? "افزودن منبع تلگرام" : "Add Telegram source"}</h1><p className="text-xs text-[#477D72] mt-1">{fa ? "ابتدا نوع منبع و دسترسی حساب تلگرام از درگاه واقعی بررسی می‌شود." : "The connected Telegram gateway resolves the peer and its access capabilities before it is added."}</p></section>
      <form className="rounded-2xl bg-white border border-[#E1EBE5] p-4 space-y-3" onSubmit={resolve}>
        <label className="hc-field">{fa ? "پیوند یا نام کاربری تلگرام" : "Telegram link or username"}<input dir="ltr" value={address} onChange={(event) => { setAddress(event.target.value); setResolution(null); setResolved(false); }} placeholder="@channel or https://t.me/channel" required /></label>
        <div className="hc-actions"><button className="live-primary" disabled={busy}>{busy ? (fa ? "در حال بررسی…" : "Resolving…") : (fa ? "بررسی منبع" : "Resolve source")}</button><button type="button" className="live-secondary" onClick={onBack}>{fa ? "بازگشت" : "Back"}</button></div>
      </form>
      {error && <p className="hc-action-error" role="alert">{error}</p>}
      {resolved && resolution && (
        <section className="hc-source-card live-resolution">
          <h2 className="text-sm font-extrabold text-[#263D38]">{resolution.title}</h2>
          <div className="hc-meta-grid"><span>{fa ? "نوع تشخیص‌داده‌شده" : "Detected type"}: {resolution.detected_type}</span><span>{fa ? "دسترسی" : "Access"}: {resolution.access_type}</span><span>{fa ? "شناسه تلگرام" : "Telegram peer"}: {resolution.peer_id}</span><span>{fa ? "دسترسی حساب" : "Account access"}: {resolution.account_has_access ? (fa ? "دارد" : "Available") : (fa ? "ندارد" : "Unavailable")}</span><span>{fa ? "خواندن تاریخچه" : "Read history"}: {resolution.capabilities?.can_read_history ? (fa ? "مجاز" : "Available") : (fa ? "نامجاز" : "Unavailable")}</span><span>{fa ? "امکان پایش" : "Can ingest"}: {resolution.can_ingest ? (fa ? "بله" : "Yes") : (fa ? "خیر" : "No")}</span></div>
          {resolution.type_mismatch && <p className="hc-action-error">{fa ? "نوع منبع با نوع مورد انتظار سازگار نیست." : "The detected peer type does not match the expected type."}</p>}
          <button type="button" className="live-primary" disabled={busy || !resolution.can_ingest || resolution.type_mismatch || !resolution.account_has_access} onClick={() => void add()}>{fa ? "افزودن و شروع پایش" : "Add and start monitoring"}</button>
        </section>
      )}
    </div>
  );
}

function LiveSourceDetailsPage(props: {
  lang: Language; source: ApiSource; offers: UiOffer[]; canManage: boolean;
  assignments?: SourceAssignments; users: Account[]; selectedBuyerIds: string[];
  onSelectedBuyerIds: (ids: string[]) => void; onSaveAssignments: () => void;
  onToggle: () => void; onDelete: () => void; onSelectProduct: (id: string) => void; onComparePrices: (id: string) => void;
}) {
  const { lang, source, offers, canManage, assignments, users, selectedBuyerIds, onSelectedBuyerIds, onSaveAssignments, onToggle, onDelete, onSelectProduct, onComparePrices } = props;
  const fa = lang === "fa";
  const buyers = users.filter((user) => user.role === "buyer" && user.active);
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-3 pb-24 space-y-4">
      <section className="rounded-3xl bg-white border border-[#E1EBE5] p-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><span className="hc-state-pill">{source.ingestion_status}</span><h1 className="text-lg font-extrabold text-[#263D38] mt-2">{source.title}</h1><p className="text-xs text-[#718780]">{source.username ? "@" + source.username : source.telegram_peer_id} · {source.source_type} · {source.access_type}</p></div>{canManage && <div className="hc-actions"><button className="live-secondary" onClick={onToggle} type="button">{source.is_active ? (fa ? "توقف پایش" : "Pause") : (fa ? "ادامه پایش" : "Resume")}</button><button className="hc-danger" onClick={onDelete} type="button">{fa ? "حذف منبع" : "Remove source"}</button></div>}</div>
        <div className="hc-meta-grid"><span>{fa ? "شناسه تلگرام" : "Telegram peer"}: {source.telegram_peer_id}</span><span>{fa ? "آخرین پیام" : "Last message ID"}: {source.last_message_id}</span><span>{fa ? "آخرین همگام‌سازی" : "Last sync"}: {formatDate(source.last_synced_at, lang)}</span><span>{fa ? "تاریخچه" : "History"}: {source.capabilities?.can_read_history ? (fa ? "قابل خواندن" : "Readable") : (fa ? "غیرقابل خواندن" : "Not readable")}</span><span>{fa ? "موضوعات" : "Topics"}: {source.capabilities?.has_topics ? (fa ? "فعال" : "Available") : (fa ? "غیرفعال" : "Unavailable")}</span><span>{fa ? "گروه مباحثه متصل" : "Linked discussion"}: {source.capabilities?.has_discussion ? (fa ? "گزارش شده" : "Reported") : (fa ? "گزارش نشده" : "Not reported")}</span></div>
      </section>
      {canManage && (
        <section className="rounded-2xl bg-white border border-[#E1EBE5] p-4 space-y-3">
          <div><h2 className="text-sm font-extrabold text-[#263D38]">{fa ? "تخصیص دسترسی خریداران" : "Buyer source assignments"}</h2><p className="text-xs text-[#718780]">{fa ? "فقط خریداران انتخاب‌شده این منبع را در فضای کاری خود خواهند دید." : "Only selected buyers receive access to this source in their workspace."}</p></div>
          {buyers.length === 0 ? <p className="hc-empty">{fa ? "حساب خریدار فعالی وجود ندارد." : "No active buyer accounts."}</p> : buyers.map((buyer) => <label key={buyer.id} className="hc-check"><input type="checkbox" checked={selectedBuyerIds.includes(buyer.id)} onChange={(event) => onSelectedBuyerIds(event.target.checked ? [...selectedBuyerIds, buyer.id] : selectedBuyerIds.filter((id) => id !== buyer.id))} />{buyer.full_name || buyer.username} ({buyer.username})</label>)}
          <button type="button" className="live-primary" disabled={!assignments} onClick={onSaveAssignments}>{fa ? "ذخیره تخصیص‌ها" : "Save assignments"}</button>
        </section>
      )}
      <section className="rounded-2xl bg-white border border-[#E1EBE5] p-4 space-y-3">
        <h2 className="text-sm font-extrabold text-[#263D38]">{fa ? "پیشنهادهای منتسب به این منبع" : "Offers attributed to this source"} ({offers.length})</h2>
        {offers.length === 0 ? <p className="hc-empty">{fa ? "هنوز پیشنهادی با شناسه این منبع در API ثبت نشده است." : "No offers with this source ID are currently returned by the API."}</p> : offers.map((offer) => <article key={offer.id} className="hc-list-row"><button type="button" className="hc-row-main" onClick={() => onSelectProduct(offer.productId)}><strong>{offer.productNameFa}</strong><span>{offer.brandFa} · {offer.cityFa}</span></button><div className="hc-actions"><strong>{offer.priceToman != null ? offer.priceToman.toLocaleString(lang === "fa" ? "fa-IR" : "en-US") + (fa ? " تومان" : " Toman") : (fa ? "قیمت اعلام نشده" : "Price not listed")}</strong><button type="button" className="live-secondary" onClick={() => onComparePrices(offer.productId)}>{fa ? "مقایسه" : "Compare"}</button></div></article>)}
      </section>
    </div>
  );
}

function LiveConversationsPage(props: { lang: Language; conversations: ConversationThread[]; onSelect: (id: string) => void }) {
  const { lang, conversations, onSelect } = props;
  const fa = lang === "fa";
  const [search, setSearch] = useState("");
  const visible = conversations.filter((conversation) => (conversation.productNameFa + " " + conversation.backendState).toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-3 pb-24 space-y-4">
      <section className="rounded-3xl bg-gradient-main-mint border border-[#A9D5C5] p-4"><h1 className="text-lg font-extrabold text-[#263D38]">{fa ? "گفتگوها و استعلام‌ها" : "Conversations & inquiries"}</h1><p className="text-xs text-[#477D72] mt-1">{fa ? "وضعیت و تاریخچه از API خوانده می‌شود. ارسال پیام مستقیم در این مرحله فعال نیست." : "Conversation state and message history are read from the API. Direct messaging is not enabled in this step."}</p></section>
      <input className="hc-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={fa ? "جستجوی محصول یا وضعیت…" : "Search product or state…"} />
      {visible.length === 0 ? <p className="hc-empty">{fa ? "گفتگویی برای این حساب ثبت نشده است." : "No conversations are available for this account."}</p> : visible.map((conversation) => <button key={conversation.id} type="button" className="hc-conversation-card" onClick={() => onSelect(conversation.id)}><span className="hc-state-pill">{conversation.backendState || conversation.status}</span><strong>{fa ? conversation.productNameFa : conversation.productNameEn}</strong><span>{fa ? "آخرین تغییر" : "Last updated"}: {fa ? conversation.updatedAtFa : conversation.updatedAtEn}</span><span>{fa ? "رضایت فروشنده" : "Seller consent"}: {conversation.consentGranted ? (fa ? "ثبت شده" : "Granted") : (fa ? "ثبت نشده" : "Not granted")}</span></button>)}
    </div>
  );
}

function LiveConversationDetailsPage(props: {
  lang: Language; conversation: ConversationThread; state: string; consentGranted: boolean; missingFields: string[];
  outreachEnabled: boolean; canApprove: boolean; canManage: boolean;
  onApprove: () => void; onPause: () => void; onClose: () => void; onViewProduct: () => void; onCompare: () => void;
}) {
  const { lang, conversation, state, consentGranted, missingFields, outreachEnabled, canApprove, canManage, onApprove, onPause, onClose, onViewProduct, onCompare } = props;
  const fa = lang === "fa";
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-3 pb-24 space-y-4">
      <section className="rounded-3xl bg-gradient-main-mint border border-[#A9D5C5] p-4 space-y-2"><span className="hc-state-pill">{state || "UNKNOWN"}</span><h1 className="text-lg font-extrabold text-[#263D38]">{conversation.productNameFa}</h1><p className="text-xs text-[#718780]">{fa ? "شناسه گفتگو" : "Conversation ID"}: {conversation.id}</p><div className="hc-actions"><button type="button" className="live-secondary" onClick={onViewProduct} disabled={!conversation.productId}>{fa ? "جزئیات محصول" : "Product details"}</button><button type="button" className="live-secondary" onClick={onCompare} disabled={!conversation.productId}>{fa ? "مقایسه قیمت" : "Compare prices"}</button></div></section>
      <section className="rounded-2xl bg-white border border-[#E1EBE5] p-4 space-y-2"><h2 className="text-sm font-extrabold text-[#263D38]">{fa ? "وضعیت و کنترل‌های گردش کار" : "Workflow state and controls"}</h2><p className="text-xs">{fa ? "رضایت فروشنده:" : "Seller consent:"} <strong>{consentGranted ? (fa ? "ثبت شده" : "Granted") : (fa ? "ثبت نشده" : "Not granted")}</strong></p><p className="text-xs">{fa ? "تعداد پرسش‌های ثبت‌شده:" : "Questions recorded:"} <strong>{conversation.questionsAskedCount ?? 0}</strong></p>{missingFields.length > 0 && <div><strong className="text-xs">{fa ? "اطلاعات ناقص" : "Missing fields"}</strong><ul className="list-disc ps-5 text-xs">{missingFields.map((field) => <li key={field}>{field}</li>)}</ul></div>}{canApprove && <button type="button" className="live-primary" onClick={onApprove}>{fa ? "تأیید پیش‌نویس ارتباط" : "Approve outreach draft"}</button>}{state === "AWAITING_APPROVAL" && !outreachEnabled && <p className="hc-action-error">{fa ? "ارسال ارتباط از پیکربندی سرور غیرفعال است؛ هیچ پیامی ارسال نشده است." : "Outreach is disabled by server configuration; no message has been sent."}</p>}{canManage && <div className="hc-actions"><button type="button" className="live-secondary" onClick={onPause}>{fa ? "توقف گفتگو" : "Pause conversation"}</button><button type="button" className="hc-danger" onClick={onClose}>{fa ? "بستن گفتگو" : "Close conversation"}</button></div>}</section>
      <section className="rounded-2xl bg-white border border-[#E1EBE5] p-4 space-y-3"><h2 className="text-sm font-extrabold text-[#263D38]">{fa ? "تاریخچه پیام‌های ثبت‌شده" : "Persisted message history"}</h2>{conversation.messages.length === 0 ? <p className="hc-empty">{fa ? "هنوز پیامی در این گفتگو ثبت نشده است." : "No messages have been recorded for this conversation."}</p> : conversation.messages.map((message) => <article key={message.id} className="hc-message"><div className="flex justify-between gap-2"><strong>{message.sender === "buyer" ? (fa ? "خریدار" : "Buyer") : message.sender === "seller" ? (fa ? "فروشنده" : "Seller") : (fa ? "سامانه" : "System")}</strong><time>{fa ? message.timestampFa : message.timestampEn}</time></div><p>{fa ? message.textFa : message.textEn}</p></article>)}</section>
      <p className="hc-readonly-note">{fa ? "ارسال پیام مستقیم در این مرحله عمداً غیرفعال است. گردش‌کار استعلام، تأیید مدیر و رضایت فروشنده در مرحله ۷ تکمیل می‌شود." : "Direct messaging is intentionally disabled in this step. The supervised inquiry, administrator approval, and seller-consent workflow is completed in Step 7."}</p>
    </div>
  );
}
