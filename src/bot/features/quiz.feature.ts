import { Composer } from "grammy";
import { Context } from "~/bot/types";
import { quizKeyboard } from "~/bot/keyboards/quiz";

export const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.use(quizKeyboard);

feature.command("quiz", async (ctx) => {
  await ctx.reply(ctx.t("quiz.description"), {
    reply_markup: quizKeyboard,
  });
});
