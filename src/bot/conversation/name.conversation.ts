import { Context, Conversation } from "~/bot/types";
import { usersService } from "~/services";
import { InlineKeyboard } from "grammy";
import { mainKeyboard } from "../keyboards/main";

export async function nameConversation(
  conversation: Conversation,
  ctx: Context,
) {
  async function askName() {
    const { message } = await conversation.waitFor(":text");

    const keyboard = new InlineKeyboard().text("Yes", "yes").text("No", "no");
    await ctx.reply(`${message?.text} do you want to save your name?`, {
      reply_markup: keyboard,
    });

    const response = await conversation.waitForCallbackQuery(["yes", "no"]);

    if (response.match === "yes") {
      await usersService.update({
        where: {
          id: ctx.local.user?.id as number,
        },
        data: {
          name: message?.text,
        },
      });
    } else {
      await ctx.reply("Okay, I won't save your name.");
    }

    // // Save the user's name
    // await conversation.external(async () => {
    //   await usersService.update({
    //     where: {
    //       id: ctx.local.user?.id as number,
    //     },
    //     data: {
    //       name: message?.text,
    //     },
    //   });
    // });

    // await ctx.editMessageText(ctx.t("main.welcome"), {
    //   reply_markup: mainKeyboard,
    // });
  }

  await askName();
}
