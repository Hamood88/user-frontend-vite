import * as Sentry from "@sentry/react";

export function initSentry() {
  const isProd = import.meta.env.PROD;
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!isProd) {
    window.__SENTRY_TEST__ = () => {
      throw new Error("Sentry test event");
    };
    window.__SENTRY_MESSAGE__ = () => {
      Sentry.captureMessage("Sentry test message", "info");
    };
  }

  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE || "development",
    release: import.meta.env.VITE_SENTRY_RELEASE || undefined,
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || 0),
  });

  Sentry.setTag("app", "user-frontend-vite-temp");
}