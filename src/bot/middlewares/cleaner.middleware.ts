import { Middleware } from "grammy";

import { Context } from "~/bot/types";

export const middleware = (): Middleware<Context> => async (ctx, next) => {
  const { session } = ctx;

  const isWrongText = ctx.message && !ctx.message.text?.startsWith("/");
  if (session && session.removeMessages?.length && ctx.from?.id) {
    try {
      await ctx.api.deleteMessages(
        ctx.from.id,
        session.removeMessages.filter((e) => e !== null),
      );
      session.removeMessages = [];
    } catch (error) {
      session.removeMessages = [];
    }
  }
  if (isWrongText && ctx.chat?.id) {
    try {
      await ctx.api.deleteMessage(
        ctx.chat.id,
        ctx.message?.message_id as number,
      );
      const message = await ctx.reply(ctx.t("messages.wrong_command"));
      session.removeMessages.push(message.message_id);
    } catch (error) {
      ctx.local.logger?.error(error);
    }
  }
  return next();
};
