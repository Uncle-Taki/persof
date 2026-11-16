import React, { lazy, Suspense } from "react";
const DemoApp = lazy(() => import("./DemoApp"));
import { HealthcareLiveApp } from "./live/HealthcareLiveApp";

// Demo fixtures never become an implicit fallback for a failing live API.
export default function App() {
  return new URLSearchParams(window.location.search).get("mode") === "demo" ? (
    <>
      <a className="demo-return" href={window.location.pathname}>
        خروج از پیش‌نمایش / Open live workspace
      </a>
      <Suspense fallback={<p role="status">در حال بارگذاری پیش‌نمایش…</p>}>
        <DemoApp />
      </Suspense>
    </>
  ) : (
    <HealthcareLiveApp />
  );
}
