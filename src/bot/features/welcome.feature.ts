import { Composer } from "grammy";
import { Context } from "~/bot/types";
import { mainKeyboard } from "~/bot/keyboards/main";
import { logHandle } from "~/bot/helpers/logging";

export const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.use(mainKeyboard);

feature.command("start", logHandle("handle /start"), async (ctx) => {
  const { message_id: id } = await ctx.reply(ctx.t("main.welcome"), {
    reply_markup: mainKeyboard,
  });

  ctx.session = {
    ...ctx.session,
    currentId: id,
    removeMessages: [
      ...(ctx.session.removeMessages ?? []),
      ctx.session.currentId,
    ],
  };
});

feature.callbackQuery(
  "main",
  logHandle("handle callbackQuery main"),
  async (ctx) => {
    await ctx.editMessageText(ctx.t("main.welcome"), {
      reply_markup: mainKeyboard,
    });
  },
);

feature.command("cancel", async (ctx) => {
  await ctx.conversation.exit();
  await ctx.reply("Leaving.");
});
