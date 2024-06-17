import { Middleware } from "grammy";
import { Context } from "~/bot/types";
import { i18n } from "~/bot/i18n";

/** Middleware for setting up i18n */
export const middleware = (): Middleware<Context> => i18n;
