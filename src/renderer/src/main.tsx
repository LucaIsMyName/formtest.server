import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { scan } from "react-scan";
import App from "./App";
import "./index.css";

if (import.meta.env.DEV) {
  scan({
    enabled: true,
    log: true,
  });
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
