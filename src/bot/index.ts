import { Bot } from "grammy";
import { limit as rateLimit } from "@grammyjs/ratelimiter";
import { apiThrottler } from "@grammyjs/transformer-throttler";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";
import { hydrate } from "@grammyjs/hydrate";
import { Context } from "~/bot/types";
import { config } from "~/config";
import { handleError } from "~/bot/helpers/error-handler";
import {
  updatesLogger,
  setupSession,
  setupLocalContext,
  setupLogger,
  setUser,
  setupI18n,
  collectMetrics,
} from "~/bot/middlewares";
import { apiCallsLogger } from "~/bot/transformers";
import { botAdminFeature, quizFeature, welcomeFeature } from "~/bot/features";
import { conversations, createConversation } from "@grammyjs/conversations";
import { quizConversation } from "./conversation";

export const bot = new Bot<Context>(config.BOT_TOKEN);

// Middlewares

bot.api.config.use(apiThrottler());
bot.api.config.use(parseMode("HTML"));

if (config.isDev) {
  bot.api.config.use(apiCallsLogger);
  bot.use(updatesLogger());
}

bot.use(collectMetrics());
bot.use(rateLimit({ limit: 5 }));
bot.use(hydrateReply);
bot.use(hydrate());
bot.use(setupSession());
bot.use(setupLocalContext());
bot.use(setupLogger());
bot.use(setupI18n());
bot.use(setUser());
bot.use(conversations());

// Conversations
bot.use(createConversation(quizConversation, "quiz"));

// Handlers
bot.use(botAdminFeature);
bot.use(welcomeFeature);
bot.use(quizFeature);

if (config.isDev) {
  bot.catch(handleError);
}
