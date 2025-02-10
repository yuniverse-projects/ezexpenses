// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 从各json文件 import (取决于你怎么配置webpack/bundler)
import zhCN from "./locales/zh/translation.json";
import zhTW from "./locales/zh-TW/translation.json";
import enUS from "./locales/en/translation.json";
import esES from "./locales/es/translation.json";
import frFR from "./locales/fr/translation.json";

// 组装成 resources
const resources = {
  zh: {
    translation: zhCN,
  },
  "zh-TW": {
    translation: zhTW,
  },
  en: {
    translation: enUS,
  },
  es: {
    translation: esES,
  },
  fr: {
    translation: frFR,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "zh", // 默认语言
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
