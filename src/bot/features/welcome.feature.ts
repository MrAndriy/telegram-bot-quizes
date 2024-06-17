import { Composer } from "grammy";
import { Context } from "~/bot/types";
import { mainKeyboard } from "~/bot/keyboards/main";
import { logHandle } from "~/bot/helpers/logging";

export const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.use(mainKeyboard);

feature.command("start", logHandle("handle /start"), async (ctx) => {
  await ctx.reply(ctx.t("main.welcome"), {
    reply_markup: mainKeyboard,
  });
});
