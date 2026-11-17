import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Globe2,
  LoaderCircle,
  LogOut,
  MessageCircle,
  Pause,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  ApiClient,
  ApiError,
  type Offer,
  type Source,
  type SourceAssignments,
} from "../api/client";
import { useResource } from "./useResource";
import "./live.css";
import { AccountPanel } from "./AccountPanel";

type Tab = "offers" | "interests" | "sources" | "conversations" | "settings";
const tabs: { id: Tab; fa: string; en: string; icon: typeof Activity }[] = [
  { id: "offers", fa: "پیشنهادهای سلامت", en: "Healthcare offers", icon: Activity },
  { id: "interests", fa: "پایش محصولات", en: "Product interests", icon: Bookmark },
  { id: "sources", fa: "منابع سلامت", en: "Healthcare sources", icon: Radio },
  {
    id: "conversations",
    fa: "گفتگوها",
    en: "Conversations",
    icon: MessageCircle,
  },
  { id: "settings", fa: "تنظیمات", en: "Settings", icon: Settings },
];
function route() {
  const params = new URLSearchParams(location.hash.slice(1));
  return {
    tab: (tabs.find((t) => t.id === params.get("tab"))?.id || "offers") as Tab,
    product: params.get("product") || "",
    conversation: params.get("conversation") || "",
  };
}
function useRoute() {
  const [current, setCurrent] = useState(route);
  useEffect(() => {
    const update = () => setCurrent(route());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  return [
    current,
    (tab: Tab, extra: Record<string, string> = {}) => {
      location.hash = new URLSearchParams({ tab, ...extra }).toString();
    },
  ] as const;
}
const conditions: Record<string, [string, string]> = {
  new: ["نو", "New"],
  like_new: ["در حد نو", "Like new"],
  used_good: ["کارکرده تمیز", "Used, good"],
  used_fair: ["کارکرده", "Used"],
  used_poor: ["نیازمند بررسی", "Needs review"],
  unknown: ["وضعیت نامشخص", "Condition unknown"],
};

export function LiveApp() {
  const [lang, setLang] = useState<"fa" | "en">(() =>
    localStorage.getItem("perso.language") === "en" ? "en" : "fa",
  );
  const fa = lang === "fa",
    t = (a: string, b: string) => (fa ? a : b);
  const [authVersion, setAuthVersion] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [current, navigate] = useRoute();
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("best_offer");
  const [offset, setOffset] = useState(0);
  const [address, setAddress] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Source | null>(null);
  const [resolution, setResolution] = useState<
    Awaited<ReturnType<ApiClient["resolve"]>>["data"] | null
  >(null);
  const [assignmentSource, setAssignmentSource] = useState<string | null>(null);
  const [assignmentData, setAssignmentData] = useState<
    Record<string, SourceAssignments>
  >({});
  const [assignmentDrafts, setAssignmentDrafts] = useState<
    Record<string, string[]>
  >({});
  const [assignmentLoading, setAssignmentLoading] = useState<string | null>(
    null,
  );
  const [catalogDraft, setCatalogDraft] = useState({ name: "", category: "", unit: "", pack_size: "", prescription_required: false, expiry_required: false });
  const [interestDrafts, setInterestDrafts] = useState<Record<string, { max_price_amount: string; min_quantity: string; preferred_city: string }>>({});
  useEffect(() => {
    if (!confirmDelete) return;
    const previous = document.activeElement as HTMLElement | null;
    function handle(event: KeyboardEvent) {
      if (event.key === "Escape") setConfirmDelete(null);
      if (event.key !== "Tab") return;
      const controls = Array.from(
        document.querySelectorAll<HTMLButtonElement>(
          ".live-modal button:not(:disabled)",
        ),
      );
      if (!controls.length) return;
      if (event.shiftKey && document.activeElement === controls[0]) {
        event.preventDefault();
        controls.at(-1)?.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === controls.at(-1)
      ) {
        event.preventDefault();
        controls[0].focus();
      }
    }
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("keydown", handle);
      previous?.focus();
    };
  }, [confirmDelete]);
  const api = useMemo(() => new ApiClient(), []);
  const session = useResource(() => api.session(), [api, authVersion]);
  const ready = !!session.value && !session.error;
  const marketplace = ready && !!session.value?.data.marketplace_access;
  const canAssignSources = ["admin", "super_admin"].includes(
    session.value?.data.user?.role || "",
  );
  useEffect(() => {
    sessionStorage.removeItem("perso.apiToken");
  }, []);
  useEffect(() => {
    const prefs = session.value?.data.user?.preferences;
    if (prefs) {
      setLang(prefs.language);
      setSort(prefs.default_sort);
    }
  }, [
    session.value?.data.user?.preferences.language,
    session.value?.data.user?.preferences.default_sort,
  ]);
  const products = useResource(() => api.products(), [api, version], ready);
  const interests = useResource(() => api.interests(), [api, version], ready);
  const sources = useResource(() => api.sources(), [api, version], marketplace);
  const gateway = useResource(
    () => api.gateway(),
    [api, version],
    marketplace && canAssignSources,
  );
  const accounts = useResource(
    () => api.users(),
    [api, version],
    ready && canAssignSources && current.tab === "sources",
  );
  const conversations = useResource(
    () => api.conversations(),
    [api, version],
    marketplace && current.tab === "conversations",
  );
  const offers = useResource(
    () =>
      api.offers(
        new URLSearchParams({
          sort_by: sort,
          with_scores: "true",
          limit: "20",
          offset: String(offset),
          ...(current.product ? { product_id: current.product } : {}),
        }),
      ),
    [api, sort, offset, current.product, version],
    marketplace && current.tab === "offers",
  );
  const details = useResource(
    () => api.conversation(current.conversation),
    [api, current.conversation, version],
    marketplace && !!current.conversation,
  );
  const stats = useResource(
    () => api.statistics(current.product),
    [api, current.product, version],
    marketplace && !!current.product,
  );
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = fa ? "rtl" : "ltr";
    localStorage.setItem("perso.language", lang);
  }, [lang]);
  useEffect(() => {
    setOffset(0);
  }, [sort, current.product]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && !busy) {
        setVersion((v) => v + 1);
        void session.refresh();
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [busy]);
  const number = (n: number) =>
    new Intl.NumberFormat(
      session.value?.data.user?.preferences.number_format === "latin"
        ? "en-US"
        : fa
          ? "fa-IR"
          : "en-US",
    ).format(n);
  const money = (offer: Offer) =>
    offer.price_amount == null
      ? t("قیمت اعلام نشده", "Price not provided")
      : `${number(offer.price_currency === "IRR_RIAL" ? Math.trunc(offer.price_amount / 10) : offer.price_amount)} ${t("تومان", "Toman")}`;
  const date = (v?: string | null) =>
    v
      ? new Intl.DateTimeFormat(fa ? "fa-IR" : "en-GB", {
          dateStyle: "medium",
          ...(session.value?.data.user?.preferences.number_format === "latin"
            ? { numberingSystem: "latn" }
            : {}),
          timeStyle: "short",
        }).format(new Date(v))
      : t("هنوز همگام نشده", "Not synced yet");
  async function connect(e: React.FormEvent) {
    e.preventDefault();
    setConnecting(true);
    setAuthError("");
    try {
      await api.login(username.trim(), password);
      setPassword("");
      setAuthVersion((v) => v + 1);
    } catch (e) {
      setAuthError(
        e instanceof ApiError && e.status === 401
          ? t(
              "نام کاربری یا رمز عبور معتبر نیست.",
              "Invalid username or password.",
            )
          : t(
              "اتصال به سرور برقرار نشد. دوباره تلاش کنید.",
              "Could not reach the server. Please retry.",
            ),
      );
    } finally {
      setConnecting(false);
    }
  }
  async function mutate(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setNotice("");
    try {
      await action();
      setNotice(success);
      setVersion((v) => v + 1);
    } catch (e) {
      setNotice(
        e instanceof Error
          ? e.message
          : t("عملیات انجام نشد.", "Action failed."),
      );
    } finally {
      setBusy(false);
    }
  }
  function signedOut() {
    setPassword("");
    setNotice("");
    setAuthVersion((v) => v + 1);
    navigate("settings");
  }
  async function logout() {
    try {
      await api.logout();
      signedOut();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Sign out failed");
    }
  }
  async function toggleLanguage() {
    const language = fa ? "en" : "fa";
    if (!ready || !session.value?.data.user) {
      setLang(language);
      return;
    }
    try {
      await api.preferences({
        ...session.value.data.user.preferences,
        language,
      });
      setLang(language);
      await session.refresh();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Language update failed");
    }
  }
  const errorBox = (error: Error | null, retry?: () => void) =>
    error ? (
      <div className="live-alert" role="alert">
        <CircleHelp size={19} />
        <span>
          {error instanceof ApiError && error.status === 401
            ? t(
                "دسترسی پایان یافته است. دوباره وارد شوید.",
                "Access has expired. Sign in again.",
              )
            : error.message}
        </span>
        {retry && <button onClick={retry}>{t("تلاش مجدد", "Retry")}</button>}
      </div>
    ) : null;
  const empty = (
    title: string,
    description: string,
    action?: React.ReactNode,
  ) => (
    <div className="live-empty">
      <Sparkles size={30} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
  const catalog = products.value?.data || [];
  const interestList = interests.value?.data || [];
  const productName = (id?: string | null) =>
    catalog.find((p) => p.id === id)?.name || t("محصول", "Product");
  const isInterested = (id: string) =>
    interestList.some((i) => i.product_id === id);
  const interestFor = (id: string) => interestList.find((i) => i.product_id === id);
  function toggleInterest(id: string) {
    const existing = interestList.find((i) => i.product_id === id);
    void mutate(
      () => (existing ? api.removeInterest(existing.id) : api.addInterest(id)),
      existing
        ? t("علاقه‌مندی حذف شد.", "Interest removed.")
        : t("علاقه‌مندی ذخیره شد.", "Interest saved."),
    );
  }
  function saveInterestFilters(productID: string) {
    const interest = interestFor(productID);
    const draft = interestDrafts[productID];
    if (!interest || !draft) return;
    void mutate(
      () => api.updateInterest(interest.id, {
        max_price_amount: draft.max_price_amount ? Number(draft.max_price_amount) : null,
        min_quantity: draft.min_quantity ? Number(draft.min_quantity) : null,
        preferred_city: draft.preferred_city,
      }),
      t("فیلتر علاقه‌مندی ذخیره شد.", "Interest filters saved."),
    );
  }
  function createCatalogProduct(event: React.FormEvent) {
    event.preventDefault();
    void mutate(
      async () => {
        await api.createProduct({
          name: catalogDraft.name.trim(),
          category: catalogDraft.category.trim(),
          unit: catalogDraft.unit.trim(),
          ...(catalogDraft.pack_size ? { pack_size: Number(catalogDraft.pack_size) } : {}),
          prescription_required: catalogDraft.prescription_required,
          expiry_required: catalogDraft.expiry_required,
        });
        setCatalogDraft({ name: "", category: "", unit: "", pack_size: "", prescription_required: false, expiry_required: false });
      },
      t("محصول سلامت به کاتالوگ اضافه شد.", "Healthcare product added to catalog."),
    );
  }
  async function toggleAssignments(sourceID: string) {
    if (assignmentSource === sourceID) {
      setAssignmentSource(null);
      return;
    }
    setAssignmentSource(sourceID);
    if (assignmentData[sourceID]) return;
    setAssignmentLoading(sourceID);
    try {
      const result = await api.assignments(sourceID);
      setAssignmentData((current) => ({
        ...current,
        [sourceID]: result.data,
      }));
      setAssignmentDrafts((current) => ({
        ...current,
        [sourceID]: result.data.buyer_ids,
      }));
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not load assignments");
    } finally {
      setAssignmentLoading(null);
    }
  }
  function toggleBuyerAssignment(sourceID: string, buyerID: string) {
    setAssignmentDrafts((current) => {
      const selected = current[sourceID] || [];
      return {
        ...current,
        [sourceID]: selected.includes(buyerID)
          ? selected.filter((id) => id !== buyerID)
          : [...selected, buyerID],
      };
    });
  }
  function saveAssignments(sourceID: string) {
    const current = assignmentData[sourceID];
    if (!current) return;
    void mutate(
      async () => {
        const result = await api.replaceAssignments(
          sourceID,
          assignmentDrafts[sourceID] || [],
          current.version,
        );
        setAssignmentData((data) => ({ ...data, [sourceID]: result.data }));
        setAssignmentDrafts((drafts) => ({
          ...drafts,
          [sourceID]: result.data.buyer_ids,
        }));
      },
      t("دسترسی خریداران ذخیره شد.", "Buyer assignments saved."),
    );
  }
  const title = tabs.find((tab) => tab.id === current.tab)!;
  if (session.loading && !session.value && !authError)
    return (
      <div className="live-app live-loading" role="status">
        {t("در حال بررسی نشست…", "Checking session…")}
      </div>
    );
  if (!ready)
    return (
      <div className="live-app live-login" dir={fa ? "rtl" : "ltr"}>
        <div className="live-login-art">
          <div className="live-brand">
            <span className="live-logo">
              <Activity />
            </span>
            <strong>{t("پرسو", "Perso")}</strong>
          </div>
          <h1>
            {t("بازار را روشن‌تر ببین.", "A clearer view of your market.")}
          </h1>
          <p>
            {t(
              "پیشنهادهای تلگرام، قیمت‌های قابل مقایسه و علاقه‌مندی‌های شما؛ در یک فضای منظم.",
              "Telegram offers, comparable prices and your interests, in one focused workspace.",
            )}
          </p>
          <div className="live-login-note">
            <ShieldCheck />
            <span>
              {t(
                "فضای کاری خصوصی · پایش خرید",
                "Private workspace · Purchase monitoring",
              )}
            </span>
          </div>
        </div>
        <form className="live-login-form" onSubmit={connect}>
          <div className="live-eyebrow">PERSO WORKSPACE</div>
          <h2>{t("ورود به فضای کاری", "Open your workspace")}</h2>
          <p>
            {t(
              "با نام کاربری و رمز عبور خود وارد شوید.",
              "Sign in with your personal username and password.",
            )}
          </p>
          <label htmlFor="username">{t("نام کاربری", "Username")}</label>
          <input
            id="username"
            dir="ltr"
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="password">{t("رمز عبور", "Password")}</label>
          <input
            id="password"
            type="password"
            dir="ltr"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {session.error &&
            !(
              session.error instanceof ApiError && session.error.status === 401
            ) && (
              <p role="alert">
                {t("ارتباط با سرور برقرار نیست.", "Cannot reach the server.")}{" "}
                <button type="button" onClick={() => void session.refresh()}>
                  {t("تلاش مجدد", "Retry")}
                </button>
              </p>
            )}
          {authError && (
            <p role="alert" className="live-error-text">
              {authError}
            </p>
          )}
          <button className="live-primary" disabled={connecting} type="submit">
            {connecting ? (
              <LoaderCircle className="live-spin" />
            ) : (
              <ArrowLeft size={18} />
            )}{" "}
            {t("ورود امن", "Connect securely")}
          </button>
          <div className="live-login-links">
            <button type="button" onClick={() => void toggleLanguage()}>
              <Globe2 size={17} /> {fa ? "English" : "فارسی"}
            </button>
            <a href="?mode=demo">
              {t("دیدن پیش‌نمایش نمونه", "Explore sample preview")}
            </a>
          </div>
        </form>
      </div>
    );
  return (
    <div className="live-app" dir={fa ? "rtl" : "ltr"}>
      <header className="live-header">
        <a href="#tab=offers" className="live-brand">
          <span className="live-logo">
            <Activity size={23} />
          </span>
          <strong>{t("پرسو", "Perso")}</strong>
          <span className="live-header-label">
            {t("دستیار پایش بازار", "Market monitoring")}
          </span>
        </a>
        <div className="live-header-actions">
          <span
            className={`live-status ${gateway.value?.data.connected ? "is-connected" : ""}`}
          >
            <span />
            {!marketplace
              ? t("حساب خریدار", "Buyer account")
              : gateway.value?.data.mock
                ? t("اتصال آزمایشی", "Mock connection")
                : gateway.value?.data.connected
                  ? t("تلگرام متصل", "Telegram connected")
                  : t("اتصال تلگرام بررسی شود", "Check Telegram connection")}
          </span>
          <button
            className="live-icon"
            aria-label={t("تغییر زبان", "Change language")}
            onClick={() => void toggleLanguage()}
          >
            <Globe2 size={20} />
          </button>
          <button
            className="live-icon"
            aria-label={t("خروج", "Sign out")}
            onClick={logout}
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>
      <aside className="live-sidebar">
        <p className="live-eyebrow">WORKSPACE</p>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            aria-label={fa ? tab.fa : tab.en}
            className={tab.id === current.tab ? "active" : ""}
            onClick={() => navigate(tab.id)}
          >
            <tab.icon size={20} />
            <span>{fa ? tab.fa : tab.en}</span>
            {tab.id === "interests" && (
              <small>{number(interestList.length)}</small>
            )}
          </button>
        ))}
        <div className="live-sidebar-note">
          <ShieldCheck size={22} />
          <p>
            {t(
              "داده‌های نمونه و واقعی از هم جدا هستند.",
              "Sample and live workspaces stay separate.",
            )}
          </p>
        </div>
      </aside>
      <main className="live-main">
        <div className="live-page-heading">
          <div>
            <p className="live-eyebrow">
              {t("فضای کاری شما", "YOUR WORKSPACE")}
            </p>
            <h1>{fa ? title.fa : title.en}</h1>
          </div>
          <button
            className="live-secondary"
            disabled={busy}
            onClick={() => setVersion((v) => v + 1)}
          >
            <RefreshCw size={17} />
            {t("به‌روزرسانی", "Refresh")}
          </button>
        </div>
        {errorBox(session.error, () => void session.refresh())}
        {session.loading && !ready && (
          <div className="live-loading">
            <LoaderCircle className="live-spin" />{" "}
            {t("در حال اتصال…", "Connecting…")}
          </div>
        )}
        {notice && (
          <div className="live-notice" role="status">
            <span>{notice}</span>
            <button
              className="live-icon"
              aria-label={t("بستن پیام", "Dismiss message")}
              onClick={() => setNotice("")}
            >
              <X size={18} />
            </button>
          </div>
        )}
        {ready && (
          <>
            {session.value?.data.demo && (
              <div className="live-banner">
                {t(
                  "احراز هویت آزمایشی سرور فعال است.",
                  "Server demo authentication is enabled.",
                )}
              </div>
            )}
            {current.tab === "offers" && marketplace && (
              <>
                <section className="live-hero">
                  <div>
                    <span className="live-pill">
                      <Sparkles size={14} />
                      {t("پیشنهادهای قابل پیگیری", "TRACEABLE OPPORTUNITIES")}
                    </span>
                    <h2>
                      {t(
                        "قیمت بهتر، با اطلاعات روشن‌تر.",
                        "Better prices. Clearer information.",
                      )}
                    </h2>
                    <p>
                      {t(
                        "فقط آگهی‌های پردازش‌شده از منابع شما. جزئیات و امتیاز هر پیشنهاد را بررسی کنید.",
                        "Processed listings from your sources, with transparent details and scoring.",
                      )}
                    </p>
                  </div>
                  <div className="live-hero-stat">
                    <span>{number(offers.value?.meta?.total || 0)}</span>
                    <small>{t("پیشنهاد فعال", "active offers")}</small>
                  </div>
                </section>
                <div className="live-filters">
                  <label className="live-search">
                    <Search size={18} />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t("جستجو در این صفحه…", "Search this page…")}
                      aria-label={t("جستجوی پیشنهادها", "Search offers")}
                    />
                  </label>
                  <label className="live-select">
                    <SlidersHorizontal size={17} />
                    <select
                      aria-label={t("محصول", "Product")}
                      value={current.product}
                      onChange={(e) =>
                        navigate(
                          "offers",
                          e.target.value ? { product: e.target.value } : {},
                        )
                      }
                    >
                      <option value="">
                        {t("همه محصولات", "All products")}
                      </option>
                      {catalog.map((p) => (
                        <option value={p.id} key={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <select
                    className="live-sort"
                    aria-label={t("مرتب‌سازی", "Sort")}
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="best_offer">
                      {t("بهترین پیشنهاد", "Best offer")}
                    </option>
                    <option value="lowest_price">
                      {t("کمترین قیمت", "Lowest price")}
                    </option>
                    <option value="highest_price">
                      {t("بیشترین قیمت", "Highest price")}
                    </option>
                    <option value="newest">{t("جدیدترین", "Newest")}</option>
                  </select>
                </div>
                {current.product && (
                  <div className="live-stat-row">
                    {stats.value?.data.sample_count ? (
                      <>
                        <div>
                          <small>{t("کمترین قیمت", "Lowest price")}</small>
                          <strong>
                            {number(stats.value.data.min_price)}{" "}
                            {t("تومان", "Toman")}
                          </strong>
                        </div>
                        <div>
                          <small>{t("میانه قیمت", "Median price")}</small>
                          <strong>
                            {number(stats.value.data.median_price)}{" "}
                            {t("تومان", "Toman")}
                          </strong>
                        </div>
                        <div>
                          <small>
                            {t("تعداد نمونه معتبر", "Eligible samples")}
                          </small>
                          <strong>
                            {number(stats.value.data.sample_count)}
                          </strong>
                        </div>
                      </>
                    ) : (
                      <p>
                        {t(
                          "هنوز داده کافی برای مقایسه وجود ندارد.",
                          "Not enough eligible data to compare yet.",
                        )}
                      </p>
                    )}
                  </div>
                )}
                {errorBox(offers.error, () => void offers.refresh())}
                {errorBox(stats.error)}
                {offers.loading && !offers.value && (
                  <div className="live-loading">
                    <LoaderCircle className="live-spin" />
                    {t("در حال دریافت پیشنهادها…", "Loading offers…")}
                  </div>
                )}
                <div className="live-offer-grid">
                  {(offers.value?.data || [])
                    .filter(
                      (row) =>
                        !search ||
                        `${row.offer.product?.name} ${row.offer.brand} ${row.offer.model} ${row.offer.seller_city}`
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                    )
                    .map((row) => (
                      <article className="live-offer" key={row.offer.id}>
                        <div className="live-offer-top">
                          <span className="live-offer-icon">
                            <Activity size={21} />
                          </span>
                          <div>
                            <h3>
                              {row.offer.product?.name ||
                                `${row.offer.brand || ""} ${row.offer.model || t("کالای شناسایی‌نشده", "Unmatched listing")}`}
                            </h3>
                            <p>
                              {row.offer.brand} ·{" "}
                              {t(
                                ...(conditions[row.offer.condition] ||
                                  conditions.unknown),
                              )}
                            </p>
                          </div>
                          {row.offer.product_id && (
                            <button
                              disabled={busy}
                              className={`live-icon ${isInterested(row.offer.product_id) ? "saved" : ""}`}
                              aria-label={t(
                                "ذخیره علاقه‌مندی",
                                "Toggle interest",
                              )}
                              onClick={() =>
                                toggleInterest(row.offer.product_id!)
                              }
                            >
                              <Bookmark
                                size={19}
                                fill={
                                  isInterested(row.offer.product_id)
                                    ? "currentColor"
                                    : "none"
                                }
                              />
                            </button>
                          )}
                        </div>
                        <div className="live-offer-price">
                          <strong>{money(row.offer)}</strong>
                          <span className="live-score">
                            {number(
                              Math.round(row.score_breakdown.final_score),
                            )}
                            <small>/{number(100)}</small>
                          </span>
                        </div>
                        <div className="live-offer-meta">
                          <span>
                            {row.offer.seller_city ||
                              t("شهر نامشخص", "City unknown")}
                            {row.offer.seller_area
                              ? ` · ${row.offer.seller_area}`
                              : ""}
                          </span>
                          <span>
                            {t("تعداد", "Qty")} {number(row.offer.quantity)}
                          </span>
                        </div>
                        <div className="live-offer-footer">
                          <time>
                            {date(
                              row.offer.source_published_at ||
                                row.offer.created_at,
                            )}
                          </time>
                          {row.offer.product_id && (
                            <button
                              onClick={() =>
                                navigate("offers", {
                                  product: row.offer.product_id!,
                                })
                              }
                            >
                              {t("مقایسه", "Compare")}
                              <ChevronLeft size={15} />
                            </button>
                          )}
                        </div>
                        <details>
                          <summary>
                            {t(
                              "چرا این امتیاز؟ · منبع آگهی",
                              "Why this score? · Source",
                            )}
                          </summary>
                          <p>{row.score_breakdown.explanation}</p>
                          <code dir="ltr">{row.offer.source_message_id}</code>
                          <p>
                            {t(
                              "امتیاز، ارزیابی قیمت و تطبیق است و تأیید فروشنده نیست.",
                              "The score evaluates price and fit; it does not verify the seller.",
                            )}
                          </p>
                        </details>
                      </article>
                    ))}
                </div>
                {!offers.loading &&
                  !offers.error &&
                  offers.value?.data.length === 0 &&
                  empty(
                    t("هنوز پیشنهادی نیست", "No offers yet"),
                    t(
                      "یک منبع تلگرام و محصول مورد علاقه اضافه کنید. پیشنهادها پس از پردازش پیام‌ها ظاهر می‌شوند.",
                      "Add a Telegram source and a product interest. Offers appear after messages are processed.",
                    ),
                    <button
                      className="live-primary"
                      onClick={() => navigate("sources")}
                    >
                      <Plus size={18} />
                      {t("افزودن منبع", "Add a source")}
                    </button>,
                  )}
                {(offers.value?.meta?.total || 0) > 20 && (
                  <div className="live-pagination">
                    <button
                      disabled={offset === 0 || offers.loading}
                      onClick={() => setOffset((v) => Math.max(0, v - 20))}
                    >
                      <ChevronRight />
                      {t("قبلی", "Previous")}
                    </button>
                    <span>
                      {number(offset + 1)}–
                      {number(Math.min(offset + 20, offers.value!.meta!.total))}{" "}
                      / {number(offers.value!.meta!.total)}
                    </span>
                    <button
                      disabled={
                        offset + 20 >= offers.value!.meta!.total ||
                        offers.loading
                      }
                      onClick={() => setOffset((v) => v + 20)}
                    >
                      {t("بعدی", "Next")}
                      <ChevronLeft />
                    </button>
                  </div>
                )}
              </>
            )}
            {current.tab === "interests" && (
              <>
                <div className="live-section-intro">
                  <h2>
                    {t("دنبال چه محصولی هستید؟", "What are you looking for?")}
                  </h2>
                  <p>
                    {t(
                      "علاقه‌مندی‌ها در سرور ذخیره می‌شوند و مبنای تطبیق آگهی‌ها هستند.",
                      "Interests are saved on the server and used to match listings.",
                    )}
                  </p>
                </div>
                {errorBox(products.error, () => void products.refresh())}
                {errorBox(interests.error, () => void interests.refresh())}
                {canAssignSources && (
                  <form className="live-panel live-catalog-form" onSubmit={createCatalogProduct}>
                    <strong>{t("افزودن محصول به کاتالوگ سلامت", "Add product to healthcare catalog")}</strong>
                    <div className="live-input-action">
                      <input required placeholder={t("نام محصول", "Product name")} value={catalogDraft.name} onChange={(e) => setCatalogDraft({ ...catalogDraft, name: e.target.value })} />
                      <input required placeholder={t("دسته‌بندی", "Category")} value={catalogDraft.category} onChange={(e) => setCatalogDraft({ ...catalogDraft, category: e.target.value })} />
                      <input placeholder={t("واحد", "Unit")} value={catalogDraft.unit} onChange={(e) => setCatalogDraft({ ...catalogDraft, unit: e.target.value })} />
                      <input type="number" min="1" placeholder={t("تعداد بسته", "Pack size")} value={catalogDraft.pack_size} onChange={(e) => setCatalogDraft({ ...catalogDraft, pack_size: e.target.value })} />
                      <button className="live-primary" disabled={busy} type="submit"><Plus size={17} />{t("افزودن", "Add")}</button>
                    </div>
                    <div className="live-assignment-list">
                      <label><input type="checkbox" checked={catalogDraft.prescription_required} onChange={(e) => setCatalogDraft({ ...catalogDraft, prescription_required: e.target.checked })} />{t("نیازمند نسخه", "Prescription required")}</label>
                      <label><input type="checkbox" checked={catalogDraft.expiry_required} onChange={(e) => setCatalogDraft({ ...catalogDraft, expiry_required: e.target.checked })} />{t("تاریخ انقضا لازم است", "Expiry required")}</label>
                    </div>
                  </form>
                )}
                <div className="live-catalog-grid">
                  {catalog.map((product) => (
                    <article className="live-catalog-card" key={product.id}>
                      <span className="live-offer-icon">
                        <Activity />
                      </span>
                      <div>
                        <h3>{product.name}</h3>
                        <p>
                          {product.brand} · {product.model}
                        </p>
                        <small>{product.category}</small>
                        {(product.unit || product.pack_size) && <small>{product.pack_size ? `${product.pack_size} ` : ""}{product.unit}</small>}
                      </div>
                      <button
                        className={
                          isInterested(product.id)
                            ? "live-secondary saved"
                            : "live-primary"
                        }
                        disabled={busy}
                        onClick={() => toggleInterest(product.id)}
                      >
                        {isInterested(product.id) ? (
                          <Check size={18} />
                        ) : (
                          <Plus size={18} />
                        )}{" "}
                        {isInterested(product.id)
                          ? t("ذخیره شده", "Saved")
                          : t("افزودن", "Add")}
                      </button>
                      {isInterested(product.id) && (() => {
                        const interest = interestFor(product.id)!;
                        const draft = interestDrafts[product.id] || {
                          max_price_amount: interest.max_price_amount == null ? "" : String(interest.max_price_amount),
                          min_quantity: interest.min_quantity == null ? "" : String(interest.min_quantity),
                          preferred_city: interest.preferred_city || "",
                        };
                        return <div className="live-interest-filters">
                          <input type="number" min="0" placeholder={t("حداکثر قیمت", "Max price")} value={draft.max_price_amount} onChange={(e) => setInterestDrafts({ ...interestDrafts, [product.id]: { ...draft, max_price_amount: e.target.value } })} />
                          <input type="number" min="1" placeholder={t("حداقل تعداد", "Min quantity")} value={draft.min_quantity} onChange={(e) => setInterestDrafts({ ...interestDrafts, [product.id]: { ...draft, min_quantity: e.target.value } })} />
                          <input placeholder={t("شهر", "City")} value={draft.preferred_city} onChange={(e) => setInterestDrafts({ ...interestDrafts, [product.id]: { ...draft, preferred_city: e.target.value } })} />
                          <button type="button" className="live-secondary" disabled={busy} onClick={() => saveInterestFilters(product.id)}>{t("فیلتر", "Filters")}</button>
                        </div>;
                      })()}
                    </article>
                  ))}
                </div>
                {!products.loading &&
                  !catalog.length &&
                  empty(
                    t("کاتالوگ خالی است", "Catalog is empty"),
                    t(
                      "محصولات کاتالوگ هنوز توسط مدیر وارد نشده‌اند. افزودن علاقه‌مندی قیمت یا آگهی ساختگی ایجاد نمی‌کند.",
                      "The operator has not added catalog products yet. Adding an interest never creates a sample price or offer.",
                    ),
                  )}
              </>
            )}
            {current.tab === "sources" && marketplace && (
              <>
                <div className="live-section-intro">
                  <h2>
                    {t(
                      "منابع معتبر، داده‌های روشن‌تر.",
                      "Your sources, clearly connected.",
                    )}
                  </h2>
                  <p>
                    {t(
                      "نوع کانال یا گروه را حساب متصل تلگرام تشخیص می‌دهد.",
                      "Channel and group types are detected by the connected Telegram account.",
                    )}
                  </p>
                </div>
                {canAssignSources &&
                  errorBox(gateway.error, () => void gateway.refresh())}
                {canAssignSources && gateway.value && !gateway.value.data.connected && (
                  <div className="live-banner">
                    {t(
                      "حساب تلگرام نیاز به ورود دارد. راهنمای اتصال را در تنظیمات ببینید.",
                      "The Telegram account needs authorization. See connection instructions in Settings.",
                    )}
                  </div>
                )}
                {canAssignSources && <form
                  className="live-source-form live-panel"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void mutate(
                      async () => {
                        const result = await api.resolve(address.trim());
                        setResolution(result.data);
                      },
                      t("مشخصات منبع دریافت شد.", "Source details received."),
                    );
                  }}
                >
                  <label htmlFor="source-address">
                    {t(
                      "لینک یا نام کاربری تلگرام",
                      "Telegram link or username",
                    )}
                  </label>
                  <div className="live-input-action">
                    <input
                      id="source-address"
                      required
                      dir="ltr"
                      placeholder="https://t.me/your_channel"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        setResolution(null);
                      }}
                    />
                    <button
                      className="live-primary"
                      type="submit"
                      disabled={busy || !gateway.value?.data.connected}
                    >
                      <Search size={18} />
                      {t("بررسی منبع", "Resolve source")}
                    </button>
                  </div>
                  {resolution && (
                    <div className="live-resolution">
                      <strong>{resolution.title}</strong>
                      <span>
                        {resolution.detected_type} · {resolution.access_type}
                      </span>
                      <p>
                        {resolution.account_has_access && resolution.can_ingest
                          ? t(
                              "حساب متصل به پیام‌های این منبع دسترسی دارد.",
                              "The connected account can read this source.",
                            )
                          : t(
                              "حساب متصل به این منبع دسترسی ندارد.",
                              "The connected account cannot read this source.",
                            )}
                      </p>
                      <button
                        className="live-primary"
                        type="button"
                        disabled={
                          busy ||
                          !resolution.can_ingest ||
                          !resolution.account_has_access
                        }
                        onClick={() =>
                          void mutate(
                            async () => {
                              await api.addSource(address.trim());
                              setResolution(null);
                              setAddress("");
                            },
                            t(
                              "منبع اضافه شد. همگام‌سازی آغاز می‌شود.",
                              "Source saved. Synchronization will begin.",
                            ),
                          )
                        }
                      >
                        <Plus size={18} />
                        {t("افزودن به منابع", "Add source")}
                      </button>
                    </div>
                  )}
                </form>}
                {errorBox(sources.error, () => void sources.refresh())}
                <div className="live-source-list">
                  {(sources.value?.data || []).map((source) => (
                    <article className="live-source-card" key={source.id}>
                      <span className="live-source-icon">
                        <Radio />
                      </span>
                      <div className="live-source-content">
                        <h3>{source.title}</h3>
                        <p dir="ltr">
                          {source.username
                            ? `@${source.username}`
                            : source.telegram_peer_id}
                        </p>
                        <div className="live-tags">
                          <span>{source.source_type}</span>
                          <span>{source.ingestion_status}</span>
                          {source.capabilities?.has_discussion && (
                            <span>
                              {t("دارای بحث پیوندی", "Linked discussion")}
                            </span>
                          )}
                        </div>
                        <small>
                          {t("آخرین همگام‌سازی", "Last synchronized")}:{" "}
                          {date(source.last_synced_at)}
                        </small>
                      </div>
                      {canAssignSources && (
                        <div className="live-source-assignment">
                          <button
                            className="live-secondary"
                            type="button"
                            disabled={assignmentLoading === source.id}
                            onClick={() => void toggleAssignments(source.id)}
                          >
                            {assignmentLoading === source.id ? (
                              <LoaderCircle className="live-spin" size={16} />
                            ) : (
                              <ShieldCheck size={16} />
                            )}
                            {t("اختصاص خریداران", "Assign buyers")}
                          </button>
                          {assignmentSource === source.id &&
                            assignmentData[source.id] && (
                              <div className="live-assignment-panel">
                                <small>
                                  {t(
                                    "دسترسی این منبع را برای خریداران فعال انتخاب کنید.",
                                    "Choose active buyers who can access this source.",
                                  )}
                                </small>
                                <div className="live-assignment-list">
                                  {(accounts.value?.data || [])
                                    .filter((account) => account.role === "buyer")
                                    .map((account) => (
                                      <label key={account.id}>
                                        <input
                                          type="checkbox"
                                          checked={(
                                            assignmentDrafts[source.id] || []
                                          ).includes(account.id)}
                                          onChange={() =>
                                            toggleBuyerAssignment(
                                              source.id,
                                              account.id,
                                            )
                                          }
                                        />
                                        <span>
                                          {account.full_name || account.username}
                                        </span>
                                      </label>
                                    ))}
                                </div>
                                <button
                                  className="live-primary"
                                  type="button"
                                  disabled={busy}
                                  onClick={() => saveAssignments(source.id)}
                                >
                                  <Check size={16} />
                                  {t("ذخیره دسترسی", "Save access")}
                                </button>
                              </div>
                            )}
                        </div>
                      )}
                      {canAssignSources && <div className="live-source-actions">
                        <button
                          disabled={busy}
                          className="live-secondary"
                          onClick={() =>
                            void mutate(
                              () =>
                                api.sourceStatus(
                                  source.id,
                                  source.ingestion_status !== "active",
                                ),
                              t("وضعیت منبع ذخیره شد.", "Source status saved."),
                            )
                          }
                        >
                          {source.ingestion_status === "active" ? (
                            <Pause size={17} />
                          ) : (
                            <RefreshCw size={17} />
                          )}{" "}
                          {source.ingestion_status === "active"
                            ? t("توقف", "Pause")
                            : t("فعال‌سازی", "Resume")}
                        </button>
                        <button
                          className="live-icon live-danger"
                          aria-label={t("حذف منبع", "Delete source")}
                          onClick={() => setConfirmDelete(source)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>}
                    </article>
                  ))}
                </div>
                {!sources.loading &&
                  !sources.error &&
                  sources.value?.data.length === 0 &&
                  empty(
                    t("اولین منبع را اضافه کنید", "Add your first source"),
                    t(
                      "فقط منابعی را اضافه کنید که حساب شما اجازه دسترسی و پایش آن‌ها را دارد.",
                      "Add sources your account is authorized to access and monitor.",
                    ),
                  )}
              </>
            )}
            {current.tab === "conversations" && marketplace && (
              <>
                <div className="live-section-intro">
                  <h2>
                    {t("گفتگوهای قابل پیگیری", "Conversations you can follow")}
                  </h2>
                  <p>
                    {t(
                      "پیش‌نویس‌ها برای آگهی‌های منطبق ایجاد می‌شوند. ارسال نیازمند تأیید شماست.",
                      "Drafts are created for matching listings. Outreach requires your approval.",
                    )}
                  </p>
                </div>
                {!session.value?.data.outreach_enabled && (
                  <div className="live-banner">
                    {t(
                      "ارسال پیام در این فضای کاری غیرفعال است. پیش‌نویس‌ها و وضعیت‌ها قابل مشاهده‌اند.",
                      "Outreach is disabled for this workspace. Drafts and their status remain visible.",
                    )}
                  </div>
                )}
                {errorBox(
                  conversations.error,
                  () => void conversations.refresh(),
                )}
                {current.conversation ? (
                  <section className="live-panel live-thread">
                    <button
                      className="live-secondary"
                      onClick={() => navigate("conversations")}
                    >
                      <ArrowLeft size={17} />
                      {t("همه گفتگوها", "All conversations")}
                    </button>
                    {errorBox(details.error, () => void details.refresh())}
                    {details.value && (
                      <>
                        <h2>
                          {productName(
                            details.value.data.conversation.product_id,
                          )}
                        </h2>
                        <span className="live-pill">
                          {details.value.data.conversation.state}
                        </span>
                        <div className="live-messages">
                          {(details.value.data.messages || []).map(
                            (message) => (
                              <div
                                className={`live-message ${message.sender === "seller" ? "seller" : ""}`}
                                key={message.id}
                              >
                                <p>{message.text}</p>
                                <small>
                                  {date(message.sent_at)} ·{" "}
                                  {message.status || message.sender}
                                </small>
                                {message.last_error && (
                                  <p className="live-error-text">
                                    {message.last_error}
                                  </p>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                        <div className="live-thread-actions">
                          {details.value.data.conversation.state ===
                            "AWAITING_APPROVAL" && (
                            <button
                              className="live-primary"
                              disabled={
                                busy || !session.value?.data.outreach_enabled
                              }
                              onClick={() =>
                                void mutate(
                                  () =>
                                    api.action(current.conversation, "approve"),
                                  t(
                                    "درخواست ارسال در صف قرار گرفت.",
                                    "Outreach queued.",
                                  ),
                                )
                              }
                            >
                              <Check size={18} />
                              {t(
                                "تأیید ارسال درخواست رضایت",
                                "Approve consent request",
                              )}
                            </button>
                          )}
                          {!["COMPLETED", "DECLINED", "OPTED_OUT"].includes(
                            details.value.data.conversation.state,
                          ) && (
                            <>
                              <button
                                className="live-secondary"
                                disabled={busy}
                                onClick={() =>
                                  void mutate(
                                    () =>
                                      api.action(current.conversation, "pause"),
                                    t(
                                      "گفتگو متوقف شد.",
                                      "Conversation paused.",
                                    ),
                                  )
                                }
                              >
                                <Pause size={17} />
                                {t("توقف", "Pause")}
                              </button>
                              {details.value.data.conversation.state !==
                                "AWAITING_APPROVAL" && (
                                <button
                                  className="live-secondary"
                                  disabled={busy}
                                  onClick={() =>
                                    void mutate(
                                      () =>
                                        api.action(
                                          current.conversation,
                                          "close",
                                        ),
                                      t(
                                        "گفتگو بسته شد.",
                                        "Conversation closed.",
                                      ),
                                    )
                                  }
                                >
                                  {t("بستن گفتگو", "Close conversation")}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                        <p className="live-muted">
                          {t("فیلدهای باقی‌مانده", "Unresolved fields")}:{" "}
                          {(
                            details.value.data.conversation.missing_fields || []
                          ).join("، ") || t("ندارد", "None")}
                        </p>
                      </>
                    )}
                  </section>
                ) : (
                  <div className="live-conversation-list">
                    {(conversations.value?.data || []).map((conversation) => (
                      <button
                        className="live-conversation-row"
                        key={conversation.id}
                        onClick={() =>
                          navigate("conversations", {
                            conversation: conversation.id,
                          })
                        }
                      >
                        <span className="live-offer-icon">
                          <MessageCircle />
                        </span>
                        <div>
                          <strong>
                            {productName(conversation.product_id)}
                          </strong>
                          <small>{date(conversation.updated_at)}</small>
                        </div>
                        <span className="live-pill">{conversation.state}</span>
                        <ChevronLeft size={18} />
                      </button>
                    ))}
                  </div>
                )}
                {!conversations.loading &&
                  !conversations.error &&
                  conversations.value?.data.length === 0 &&
                  empty(
                    t("هنوز گفتگویی نیست", "No conversations yet"),
                    t(
                      "پیش‌نویس‌ها پس از یافتن آگهی مرتبط با مشخصات ناقص ظاهر می‌شوند.",
                      "Drafts appear when matching listings need more information.",
                    ),
                  )}
              </>
            )}
            {!marketplace &&
              ["offers", "sources", "conversations"].includes(current.tab) && (
                <div className="live-panel">
                  <h2>{t("فضای خریدار", "Buyer workspace")}</h2>
                  <p>
                    {t(
                      "حساب، تنظیمات و علاقه‌مندی‌های شما فعال است. دسترسی به پیشنهادها و منابع پس از تکمیل تخصیص منابع در مرحلهٔ ۳ فعال می‌شود.",
                        "Your account, preferences and interests are available. Offers and conversations follow your administrator-managed source assignments.",
                    )}
                  </p>
                  <button
                    className="live-primary"
                    onClick={() => navigate("interests")}
                  >
                    {t("علاقه‌مندی‌های من", "My interests")}
                  </button>
                </div>
              )}
            {current.tab === "settings" && session.value?.data.user && (
              <AccountPanel
                key={session.value.data.user.id}
                api={api}
                user={session.value.data.user}
                fa={fa}
                saved={(preferences) => {
                  if (preferences) {
                    setLang(preferences.language);
                    setSort(preferences.default_sort);
                  }
                  void session.refresh();
                }}
                signedOut={signedOut}
              />
            )}
          </>
        )}
      </main>
      <nav
        className="live-bottom-nav"
        aria-label={t("ناوبری اصلی", "Main navigation")}
      >
        {tabs.map((tab) => (
          <button
            aria-current={current.tab === tab.id ? "page" : undefined}
            className={current.tab === tab.id ? "active" : ""}
            key={tab.id}
            onClick={() => navigate(tab.id)}
          >
            <tab.icon size={21} />
            <span>{fa ? tab.fa : tab.en}</span>
          </button>
        ))}
      </nav>
      {confirmDelete && (
        <div className="live-modal-backdrop">
          <section
            className="live-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
          >
            <h2 id="delete-title">
              {t("این منبع حذف شود؟", "Remove this source?")}
            </h2>
            <p>{confirmDelete.title}</p>
            <p>
              {t(
                "پایش این منبع متوقف می‌شود. پیام‌های ذخیره‌شده طبق سیاست نگهداری باقی می‌مانند.",
                "Monitoring stops. Previously stored messages follow the retention policy.",
              )}
            </p>
            <div>
              <button
                autoFocus
                className="live-secondary"
                onClick={() => setConfirmDelete(null)}
              >
                {t("انصراف", "Cancel")}
              </button>
              <button
                className="live-primary"
                disabled={busy}
                onClick={() =>
                  void mutate(
                    async () => {
                      await api.removeSource(confirmDelete.id);
                      setConfirmDelete(null);
                    },
                    t("منبع حذف شد.", "Source removed."),
                  )
                }
              >
                {t("حذف منبع", "Remove source")}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
