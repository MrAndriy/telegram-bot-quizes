import { Menu } from "@grammyjs/menu";
import { Context } from "~/bot/types";
import { isMultipleLocales } from "~/bot/helpers/i18n";
import { logHandle } from "~/bot/helpers/logging";
import { quizKeyboard } from "~/bot/keyboards/quiz";
import { showStatisticsKeyboard } from "~/bot/keyboards/statistic";
import { selectLanguageKeyboard } from "~/bot/keyboards/language";

export const keyboard = new Menu<Context>("main");

keyboard.submenu(
  {
    text: (ctx) => ctx.t("main.quiz"),
  },
  "quiz",
  logHandle("handle quiz"),
  async (ctx) => {
    await ctx.editMessageText(ctx.t("quiz.description"));
  },
);

keyboard
  .submenu(
    {
      text: (ctx) => ctx.t("main.statistics"),
      payload: "show_statistics",
    },
    "statistics",
    logHandle("handle show statistics"),
    async (ctx) => {
      const { user } = ctx.local;
      if (!user) {
        return;
      }

      await ctx.editMessageText(`
${ctx.t("statistics.description")}:
${ctx.t("statistics.id")}: <code>${user.telegramId}</code>
${ctx.t("statistics.messages")}: ${user.messages?.length}`);
    },
  )
  .row();

if (isMultipleLocales) {
  keyboard
    .submenu(
      {
        text: (ctx) => ctx.t("main.change_language"),
        payload: "change_language",
      },
      "language",
      logHandle("handle change language"),
      async (ctx) => {
        await ctx.editMessageText(ctx.t("language.select"));
      },
    )
    .row();
}

keyboard.register(showStatisticsKeyboard);
keyboard.register(selectLanguageKeyboard);
keyboard.register(quizKeyboard);
