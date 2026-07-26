import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { Analytics } from "@vercel/analytics/react";
import App from "./App";
import { SiteFallback } from "./components/SiteFallback";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* A render crash must not leave a visitor on a blank page with no way to reach us */}
    <ErrorBoundary FallbackComponent={SiteFallback}>
      <App />
    </ErrorBoundary>
    <Analytics />
  </React.StrictMode>
);
