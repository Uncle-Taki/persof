import type { components } from "./schema";
export type Product = components["schemas"]["Product"];
export type Offer = components["schemas"]["Offer"];
export type ScoredOffer = components["schemas"]["ScoredOffer"];
export type Interest = components["schemas"]["Interest"];
export type Source = components["schemas"]["TelegramSource"];
export type Conversation = components["schemas"]["Conversation"];
export type Session = components["schemas"]["Session"];
export type Resolution = components["schemas"]["ResolveSourceResponse"];
export type Account = components["schemas"]["Account"];
export type Preferences = components["schemas"]["Preferences"];
export type Message = {
  id: string;
  sender: string;
  text: string;
  status?: string;
  sent_at: string;
  last_error?: string;
  delivered: boolean;
};
export type Meta = { total: number; limit: number; offset: number };
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export class ApiClient {
  private csrfToken = "";
  constructor(private base = "/api/v1") {}
  async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<{ data: T; meta?: Meta }> {
    const response = await fetch(this.base + path, {
      ...options,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...(this.csrfToken ? { "X-CSRF-Token": this.csrfToken } : {}),
        ...options.headers,
      },
      signal: options.signal ?? AbortSignal.timeout(45000),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok || !body?.success)
      throw new ApiError(
        body?.error || `Request failed (${response.status})`,
        response.status,
      );
    if (body.data?.csrf_token) this.csrfToken = body.data.csrf_token;
    return { data: body.data, meta: body.meta };
  }
  login = (username: string, password: string) =>
    this.request<components["schemas"]["LoginResult"]>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  logout = () => this.request("/auth/logout", { method: "POST", body: "{}" });
  me = () => this.request<Account>("/me");
  profile = (data: { username: string; full_name: string; email: string }) =>
    this.request<Account>("/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  preferences = (data: Preferences) =>
    this.request<Preferences>("/me/preferences", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  password = (current_password: string, password: string) =>
    this.request("/me/password", {
      method: "POST",
      body: JSON.stringify({ current_password, password }),
    });
  users = () => this.request<Account[]>("/users");
  createUser = (data: {
    username: string;
    full_name: string;
    email: string;
    role: Account["role"];
    password: string;
  }) =>
    this.request<Account>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  updateUser = (
    id: string,
    data: {
      username?: string;
      full_name?: string;
      email?: string;
      role?: Account["role"];
      active?: boolean;
    },
  ) =>
    this.request<Account>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  resetPassword = (id: string, password: string) =>
    this.request(`/users/${id}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ password }),
    });
  session = () => this.request<Session>("/session");
  products = () => this.request<Product[]>("/products?limit=100");
  offers = (query: URLSearchParams) =>
    this.request<ScoredOffer[]>(`/offers?${query}`);
  interests = () => this.request<Interest[]>("/interests");
  sources = () => this.request<Source[]>("/sources");
  conversations = () =>
    this.request<Conversation[]>("/conversations?limit=100");
  gateway = () =>
    this.request<{
      connected: boolean;
      mock: boolean;
      authorization_required: boolean;
    }>("/telegram/status");
  resolve = (address: string) =>
    this.request<Resolution>("/sources/resolve", {
      method: "POST",
      body: JSON.stringify({ address }),
    });
  addSource = (address: string) =>
    this.request<Source>("/sources", {
      method: "POST",
      body: JSON.stringify({ address }),
    });
  sourceStatus = (id: string, active: boolean) =>
    this.request<Source>(`/sources/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({
        ingestion_status: active ? "active" : "paused",
        is_active: active,
      }),
    });
  removeSource = (id: string) =>
    this.request(`/sources/${id}`, { method: "DELETE" });
  addInterest = (id: string) =>
    this.request<Interest>("/interests", {
      method: "POST",
      body: JSON.stringify({ product_id: id }),
    });
  removeInterest = (id: string) =>
    this.request(`/interests/${id}`, { method: "DELETE" });
  conversation = (id: string) =>
    this.request<{ conversation: Conversation; messages: Message[] }>(
      `/conversations/${id}`,
    );
  action = (id: string, action: "approve" | "pause" | "close") =>
    this.request(`/conversations/${id}/${action}`, { method: "POST" });
  statistics = (id: string) =>
    this.request<components["schemas"]["PriceStatistics"]>(
      `/products/${id}/statistics`,
    );
}
