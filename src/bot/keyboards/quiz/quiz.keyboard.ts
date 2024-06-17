import { Menu, MenuRange } from "@grammyjs/menu";
import { Context } from "~/bot/types";
import { logHandle } from "~/bot/helpers/logging";
import { sectionService, quizService } from "~/services";
import { logger } from "../../../logger";

export const keyboard = new Menu<Context>("quiz");

keyboard.dynamic(async () => {
  // fetch all sections
  const sections = await sectionService.findMany({});

  // Generate a part of the menu dynamically!
  const range = new MenuRange<Context>();
  sections.forEach((section) => {
    const isRow = section.name.length >= 5;

    const btn = range.text(
      section.name,
      logHandle(`handle ${section.name}`),
      async (ctx) => {
        // create a new quiz for the section

        const newQuiz = await quizService.create({
          data: {
            sectionId: section.id,
            userId: ctx.local.user?.id as number,
          },
        });

        logger.info(
          `Creating a new quiz for the section ${section.name} for user ${ctx.local.user?.id} with quiz id ${newQuiz.id}`,
        );

        await ctx.conversation.enter("quiz");
      },
    );
    if (isRow) {
      btn.row();
    }
    return btn;
  });

  return range;
});

keyboard.back("Back").row();
