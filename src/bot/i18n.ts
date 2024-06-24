import { I18n } from "@grammyjs/i18n";
import { Context } from "~/bot/types";

export const i18n = new I18n<Context>({
  defaultLocale: "uk",
  directory: "locales",
  useSession: true,
  fluentBundleOptions: {
    useIsolating: false,
  },
});
