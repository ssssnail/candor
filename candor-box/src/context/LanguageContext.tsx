import { component$ } from "@builder.io/qwik";

export const LanguageContext = createContext({
  locale: "en",
  setLocale: (locale: string) => {},
});

export const LocaleProvider = component$(() => {
  const [locale, setLocale] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("candor-locale") || "en";
    }
    return "en";
  });

  useContextProvider(LocaleContext, {
    locale,
    setLocale: (newLocale: string) => {
      setLocale(newLocale);
      if (typeof window !== "undefined") {
        localStorage.setItem("candor-locale", newLocale);
      }
    },
  });

  return <Slot />;
});
