import React, { useState, useEffect } from "react";
import { ApiClient, type Account, type Preferences } from "../api/client";
import { useResource } from "./useResource";

type Props = {
  api: ApiClient;
  user: Account;
  fa: boolean;
  saved: (preferences?: Preferences) => void;
  signedOut: () => void;
};
export function AccountPanel({ api, user, fa, saved, signedOut }: Props) {
  const t = (a: string, b: string) => (fa ? a : b);
  const [name, setName] = useState(user.full_name || "");
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email || "");
  const [prefs, setPrefs] = useState<Preferences>(user.preferences);
  useEffect(() => {
    setPrefs(user.preferences);
  }, [
    user.preferences.language,
    user.preferences.preferred_city,
    user.preferences.preferred_area,
    user.preferences.default_sort,
    user.preferences.number_format,
  ]);
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  async function act(fn: () => Promise<unknown>, success: string) {
    setBusy(true);
    setMessage("");
    setFailed(false);
    try {
      await fn();
      setMessage(success);
    } catch (e) {
      setFailed(true);
      setMessage(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="live-account">
      <section className="live-panel">
        <h2>{t("حساب من", "My account")}</h2>
        <p>
          {user.username} · <strong>{user.role}</strong>
        </p>
        <form
          className="live-account-form"
          onSubmit={(e) => {
            e.preventDefault();
            void act(
              async () => {
                await api.profile({ username, full_name: name, email });
                saved();
              },
              t("مشخصات ذخیره شد.", "Profile saved."),
            );
          }}
        >
          <label>
            {t("نام نمایشی", "Display name")}
            <input
              value={name}
              maxLength={200}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            {t("نام کاربری", "Username")}
            <input
              dir="ltr"
              autoComplete="username"
              value={username}
              required
              pattern="[A-Za-z0-9][A-Za-z0-9_.-]{2,63}"
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label>
            {t("ایمیل", "Email")}
            <input
              dir="ltr"
              type="email"
              value={email}
              maxLength={254}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button className="live-primary" disabled={busy}>
            {t("ذخیره مشخصات", "Save profile")}
          </button>
        </form>
      </section>
      <section className="live-panel">
        <h2>{t("تنظیمات شخصی", "Personal preferences")}</h2>
        <form
          className="live-account-form"
          onSubmit={(e) => {
            e.preventDefault();
            void act(
              async () => {
                const result = await api.preferences(prefs);
                saved(result.data);
              },
              t("تنظیمات ذخیره شد.", "Preferences saved."),
            );
          }}
        >
          <label>
            {t("زبان", "Language")}
            <select
              value={prefs.language}
              onChange={(e) =>
                setPrefs({ ...prefs, language: e.target.value as "fa" | "en" })
              }
            >
              <option value="fa">فارسی</option>
              <option value="en">English</option>
            </select>
          </label>
          <label>
            {t("شهر ترجیحی", "Preferred city")}
            <input
              value={prefs.preferred_city}
              maxLength={100}
              onChange={(e) =>
                setPrefs({ ...prefs, preferred_city: e.target.value })
              }
            />
          </label>
          <label>
            {t("محدوده ترجیحی", "Preferred area")}
            <input
              value={prefs.preferred_area}
              maxLength={100}
              onChange={(e) =>
                setPrefs({ ...prefs, preferred_area: e.target.value })
              }
            />
          </label>
          <label>
            {t("مرتب‌سازی پیش‌فرض", "Default sort")}
            <select
              value={prefs.default_sort}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  default_sort: e.target.value as Preferences["default_sort"],
                })
              }
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
          </label>
          <label>
            {t("نمایش اعداد", "Number format")}
            <select
              value={prefs.number_format}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  number_format: e.target.value as Preferences["number_format"],
                })
              }
            >
              <option value="locale">
                {t("مطابق زبان", "Match language")}
              </option>
              <option value="latin">Latin</option>
            </select>
          </label>
          <p>
            {t(
              "شهر و محدوده برای مرحلهٔ فیلترهای خرید ذخیره می‌شوند.",
              "City and area are saved for the upcoming buying filters.",
            )}
          </p>
          <button className="live-primary" disabled={busy}>
            {t("ذخیره تنظیمات", "Save preferences")}
          </button>
        </form>
      </section>
      <section className="live-panel">
        <h2>{t("تغییر رمز عبور", "Change password")}</h2>
        <form
          className="live-account-form"
          onSubmit={(e) => {
            e.preventDefault();
            void act(async () => {
              await api.password(oldPassword, password);
              setOldPassword("");
              setPassword("");
              signedOut();
            }, "");
          }}
        >
          <label>
            {t("رمز عبور فعلی", "Current password")}
            <input
              dir="ltr"
              type="password"
              autoComplete="current-password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </label>
          <label>
            {t("رمز عبور جدید", "New password")}
            <input
              dir="ltr"
              type="password"
              autoComplete="new-password"
              required
              minLength={12}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <p>
            {t(
              "۱۲ تا ۷۲ بایت. پس از تغییر، دوباره وارد شوید.",
              "12–72 UTF-8 bytes. Changing your password signs out every session.",
            )}
          </p>
          <button className="live-secondary" disabled={busy}>
            {t("تغییر رمز و خروج", "Change password and sign out")}
          </button>
        </form>
      </section>
      {message && (
        <p
          className={failed ? "live-alert" : "live-notice"}
          role={failed ? "alert" : "status"}
        >
          {message}
        </p>
      )}
      {user.role !== "buyer" && (
        <UsersPanel api={api} user={user} fa={fa} signedOut={signedOut} />
      )}
    </div>
  );
}

function UsersPanel({ api, user, fa, signedOut }: Omit<Props, "saved">) {
  const t = (a: string, b: string) => (fa ? a : b);
  const [version, setVersion] = useState(0);
  const users = useResource(() => api.users(), [api, version]);
  const [draft, setDraft] = useState({
    username: "",
    full_name: "",
    email: "",
    password: "",
    role: "buyer" as Account["role"],
  });
  const [selected, setSelected] = useState<Account | null>(null);
  const [reset, setReset] = useState("");
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const roles: Account["role"][] =
    user.role === "super_admin" ? ["buyer", "admin", "super_admin"] : ["buyer"];
  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    setMessage("");
    setFailed(false);
    try {
      await fn();
      setVersion((v) => v + 1);
      setMessage(t("تغییرات ذخیره شد.", "Changes saved."));
    } catch (e) {
      setFailed(true);
      setMessage(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="live-panel">
      <h2>{t("مدیریت کاربران", "User management")}</h2>
      <p>
        {t(
          "مدیر فقط حساب‌های خریدار را مدیریت می‌کند.",
          "Admins manage buyer accounts. Super admins also manage roles.",
        )}
      </p>
      <form
        className="live-account-form"
        onSubmit={(e) => {
          e.preventDefault();
          void act(async () => {
            await api.createUser(draft);
            setDraft({
              username: "",
              full_name: "",
              email: "",
              password: "",
              role: "buyer",
            });
          });
        }}
      >
        <h3>{t("کاربر جدید", "Create account")}</h3>
        <label>
          {t("نام کاربری جدید", "New username")}
          <input
            dir="ltr"
            required
            pattern="[A-Za-z0-9][A-Za-z0-9_.-]{2,63}"
            value={draft.username}
            onChange={(e) => setDraft({ ...draft, username: e.target.value })}
          />
        </label>
        <label>
          {t("نام کاربر جدید", "New display name")}
          <input
            maxLength={200}
            value={draft.full_name}
            onChange={(e) => setDraft({ ...draft, full_name: e.target.value })}
          />
        </label>
        <label>
          {t("ایمیل کاربر جدید", "New email")}
          <input
            dir="ltr"
            type="email"
            value={draft.email}
            onChange={(e) => setDraft({ ...draft, email: e.target.value })}
          />
        </label>
        <label>
          {t("نقش کاربر جدید", "New role")}
          <select
            value={draft.role}
            onChange={(e) =>
              setDraft({ ...draft, role: e.target.value as Account["role"] })
            }
          >
            {roles.map((role) => (
              <option key={role}>{role}</option>
            ))}
          </select>
        </label>
        <label>
          {t("رمز عبور اولیه", "Initial password")}
          <input
            dir="ltr"
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
            value={draft.password}
            onChange={(e) => setDraft({ ...draft, password: e.target.value })}
          />
        </label>
        <button className="live-primary" disabled={busy}>
          {t("ایجاد حساب", "Create user")}
        </button>
      </form>
      {users.loading && (
        <p role="status">{t("در حال دریافت…", "Loading accounts…")}</p>
      )}
      {users.error && (
        <p role="alert">
          {users.error.message}{" "}
          <button onClick={() => void users.refresh()}>
            {t("تلاش مجدد", "Retry")}
          </button>
        </p>
      )}
      <div className="live-user-list">
        {(users.value?.data || []).map((account) => (
          <article key={account.id} className="live-user-row">
            <span>
              <strong>{account.full_name || account.username}</strong>
              <br />
              {account.username} · {account.role} ·{" "}
              {account.active ? t("فعال", "Active") : t("غیرفعال", "Inactive")}
            </span>
            <button
              className="live-secondary"
              onClick={() => {
                setSelected(account);
                setReset("");
                setMessage("");
              }}
            >
              {t("ویرایش", "Edit")} {account.username}
            </button>
          </article>
        ))}
      </div>
      {selected && (
        <form
          className="live-account-form"
          onSubmit={(e) => {
            e.preventDefault();
            const account = selected;
            void act(async () => {
              const roleChanged =
                users.value?.data.find((u) => u.id === account.id)?.role !==
                account.role;
              await api.updateUser(account.id, {
                username: account.username,
                email: account.email || "",
                full_name: account.full_name || "",
                active: account.active,
                ...(user.role === "super_admin" ? { role: account.role } : {}),
              });
              setSelected(null);
              if (account.id === user.id && (roleChanged || !account.active))
                signedOut();
            });
          }}
        >
          <h3>
            {t("ویرایش حساب", "Edit account")}: {selected.username}
          </h3>
          <label>
            {t("نام کاربری حساب", "Account username")}
            <input
              dir="ltr"
              required
              pattern="[A-Za-z0-9][A-Za-z0-9_.-]{2,63}"
              value={selected.username}
              onChange={(e) =>
                setSelected({ ...selected, username: e.target.value })
              }
            />
          </label>
          <label>
            {t("نام نمایشی حساب", "Account display name")}
            <input
              value={selected.full_name || ""}
              onChange={(e) =>
                setSelected({ ...selected, full_name: e.target.value })
              }
            />
          </label>
          <label>
            {t("ایمیل حساب", "Account email")}
            <input
              dir="ltr"
              type="email"
              value={selected.email || ""}
              onChange={(e) =>
                setSelected({ ...selected, email: e.target.value })
              }
            />
          </label>
          <label>
            {t("نقش حساب", "Account role")}
            <select
              value={selected.role}
              disabled={user.role !== "super_admin"}
              onChange={(e) =>
                setSelected({
                  ...selected,
                  role: e.target.value as Account["role"],
                })
              }
            >
              {roles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={selected.active}
              onChange={(e) =>
                setSelected({ ...selected, active: e.target.checked })
              }
            />
            {t("حساب فعال", "Account active")}
          </label>
          <button className="live-primary" disabled={busy}>
            {t("ذخیره حساب", "Save account")}
          </button>
          <button
            className="live-secondary"
            type="button"
            onClick={() => setSelected(null)}
          >
            {t("انصراف", "Cancel")}
          </button>
          <label>
            {t("بازنشانی رمز عبور", "Reset password")}
            <input
              dir="ltr"
              type="password"
              autoComplete="new-password"
              minLength={12}
              value={reset}
              onChange={(e) => setReset(e.target.value)}
            />
          </label>
          <button
            className="live-secondary"
            disabled={busy || reset.length < 12}
            type="button"
            onClick={() => {
              const id = selected.id;
              void act(async () => {
                await api.resetPassword(id, reset);
                setReset("");
                if (id === user.id) signedOut();
              });
            }}
          >
            {t("بازنشانی و لغو نشست‌ها", "Reset password and revoke sessions")}
          </button>
        </form>
      )}
      {message && (
        <p
          className={failed ? "live-alert" : "live-notice"}
          role={failed ? "alert" : "status"}
        >
          {message}
        </p>
      )}
    </section>
  );
}
