import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Router from "./Router.tsx";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <Router />
    </StrictMode>
  );
} else {
  console.error('Elementul cu ID-ul "root" nu a fost găsit în document.');
}
