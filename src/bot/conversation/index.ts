import { InlineKeyboard } from "grammy";
import { answersService, questionService, quizService } from "~/services";
import { Context, Conversation } from "~/bot/types";
import { getSafeString } from "~/bot/lib";
import _ from "lodash";

/** Defines the conversation */
export async function quiz(conversation: Conversation, ctx: Context) {
  async function askQuestion() {
    // Fetch the active quiz for the user
    const activeQuiz = await conversation.external(async () => {
      const existingQuiz = await quizService.findFirst({
        where: {
          userId: ctx.local.user?.id as number,
          active: true,
        },
        include: {
          answers: {
            select: {
              questionId: true,
            },
          },
        },
      });

      return existingQuiz;
    });

    // Get the list of answered question IDs
    const answeredQuestionIds =
      activeQuiz?.answers.map((answer) => answer.questionId) || [];

    const questions = await conversation.external(async () => {
      return questionService.findMany({
        where: {
          sectionId: activeQuiz?.sectionId,
          id: {
            notIn: answeredQuestionIds,
          },
        },
        include: { options: true },
      });
    });

    // Select a random question
    if (questions.length === 0) {
      const quizAnswers = await conversation.external(async () => {
        return answersService.findMany({
          where: {
            quizId: activeQuiz?.id as number,
          },
          include: {
            question: true,
            option: true,
          },
        });
      });

      const correctAnswers = quizAnswers.filter((answer) => {
        return answer.option?.isCorrect;
      });

      const backKeyboard = new InlineKeyboard();
      backKeyboard.text(ctx.t("back"), "main");
      await ctx.editMessageText(
        `${ctx.t("quiz.finished")} ${correctAnswers.length} / ${quizAnswers.length}`,
        {
          reply_markup: backKeyboard,
        },
      );

      await conversation.external(async () => {
        // mark quiz as finished
        await quizService.update({
          where: {
            id: activeQuiz?.id as number,
          },
          data: { active: false },
        });
      });
      // eslint-disable-next-line no-useless-return
      return;
    }

    const randomQuestion =
      questions[Math.floor((await conversation.random()) * questions.length)];

    const shuffledOptions = await conversation.external(() =>
      _.shuffle(randomQuestion.options),
    );

    // Create inline keyboard with options
    const keyboard = new InlineKeyboard();
    shuffledOptions.forEach((option) => {
      keyboard.text(option.text, option.id.toString()).row();
    });

    // Create inline keyboard with correct answers
    const correctKeyboard = new InlineKeyboard();
    shuffledOptions.forEach((option) => {
      correctKeyboard
        .text(
          option.isCorrect ? `❇️ ${option.text}` : `⛔️ ${option.text}`,
          option.id.toString(),
        )
        .row();
    });

    // await ctx.editMessageText(getSafeString(randomQuestion.question), {
    await ctx.editMessageText(getSafeString(randomQuestion.question), {
      reply_markup: keyboard,
    });

    const response = await conversation.waitForCallbackQuery(
      randomQuestion.options.map((option) => `${option.id}`),
      // {
      //   // eslint-disable-next-line no-shadow
      //   otherwise: (ctx) => {
      //     conversation.log("otherwise", ctx.update.callback_query?.data);
      //     ctx.reply("Use the buttons!", {
      //       reply_markup: keyboard,
      //     });
      //   },
      // },
    );

    // save answer in db
    conversation.external(async () => {
      return answersService.create({
        data: {
          quizId: activeQuiz?.id as number,
          questionId: randomQuestion.id,
          optionId: +response.match!,
        },
      });
    });

    await ctx.editMessageText(getSafeString(randomQuestion.question), {
      reply_markup: correctKeyboard,
    });

    // Continue asking questions
    await askQuestion();
  }

  await askQuestion();
}
