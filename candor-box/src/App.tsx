import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { en, zh } from "./i18n/translations";

type Translations = typeof en;
const translations: Record<string, Translations> = { en, zh };

interface LocaleContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: Translations;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: "en",
  setLocale: () => {},
  t: en,
});

export function useLocale() {
  return useContext(LocaleContext);
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("candor-locale") || "en";
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("candor-locale", locale);
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function hashToken(token: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  return crypto.subtle.digestSync("SHA-256", data);
}

export function getUserHash(): string {
  let token = localStorage.getItem("candor-token");
  if (!token) {
    token = generateToken();
    localStorage.setItem("candor-token", token);
  }
  const hashBuffer = hashToken(token);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface Feedback {
  id: string;
  linkId: string;
  coreStrengths: string[];
  optimization: string[];
  oneThing: string;
  timestamp: number;
  read: boolean;
}

export function getInboxData(): { linkId: string; feedback: Feedback[] }[] {
  const userHash = getUserHash();
  const data = localStorage.getItem(`candor-inbox-${userHash}`);
  return data ? JSON.parse(data) : [];
}

export function saveInboxData(data: { linkId: string; feedback: Feedback[] }[]) {
  const userHash = getUserHash();
  localStorage.setItem(`candor-inbox-${userHash}`, JSON.stringify(data));
}

export function generateLinkId(): string {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function getShareableLink(linkId: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/r/${linkId}`;
  }
  return `/r/${linkId}`;
}

import { Landing } from "./pages/Landing";
import { Inbox } from "./pages/Inbox";
import { Submit } from "./pages/Submit";
import { Submitted } from "./pages/Submitted";
import { Privacy } from "./pages/Privacy";

export default function App() {
  return (
    <LocaleProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/r/:linkId" element={<Submit />} />
          <Route path="/submitted" element={<Submitted />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </BrowserRouter>
    </LocaleProvider>
  );
}
