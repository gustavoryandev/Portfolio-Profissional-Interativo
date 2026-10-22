import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import pt from "./pt.json";
import en from "./en.json";

const resources = {
  pt: { translation: pt },
  en: { translation: en },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "pt",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

const setHtmlLang = (lng) => {
  document.documentElement.lang = lng.startsWith("en") ? "en" : "pt-BR";
};

setHtmlLang(i18n.language);
i18n.on("languageChanged", setHtmlLang);

export default i18n;