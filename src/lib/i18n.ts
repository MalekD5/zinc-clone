import i18n from "i18next";
import detector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import localeAR from "../../public/locales/ar.json";
import localeEN from "../../public/locales/en.json";

const resources = {
	en: {
		translation: localeEN,
	},
	ar: {
		translation: localeAR,
	},
};

i18n
	.use(detector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: "en",
		keySeparator: false,
		interpolation: {
			escapeValue: false,
		},
	});

export default i18n;
