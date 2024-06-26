import { InlineKeyboard } from "grammy";
import { answersService, questionService, quizService } from "~/services";
import { Context, Conversation } from "~/bot/types";
import { getSafeString } from "~/bot/lib";
import _ from "lodash";

/** Defines the conversation */
export async function quizConversation(
  conversation: Conversation,
  ctx: Context,
) {
  async function askQuestion() {
    // Fetch the active quiz for the user
    const activeQuiz = await conversation.external(async () => {
      const existingQuiz = await quizService.findFirst({
        where: {
          userId: ctx.local.user?.id as number,
          active: true,
        },
        include: {
          section: {
            select: {
              name: true,
            },
          },
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
            option: {
              isCorrect: true,
            },
          },
        });
      });

      const correctAnswers = quizAnswers.length;

      // update the quiz with the correct answers
      await conversation.external(async () => {
        await quizService.update({
          where: {
            id: activeQuiz?.id as number,
          },
          data: {
            score: correctAnswers,
          },
        });
      });

      const backKeyboard = new InlineKeyboard();
      backKeyboard.text(ctx.t("back"), "main");
      await ctx.editMessageText(
        `${ctx.t("quiz.finished")}\n ${ctx.t("quiz.score")}:\n${ctx.t("quiz.correct")} - ${correctAnswers}\n${ctx.t("quiz.wrong")} ${activeQuiz!.total - correctAnswers}\n${ctx.t("quiz.all")} - ${activeQuiz?.total}\n\n${ctx.t("quiz.thank_you")}`,
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

    const questionCount = activeQuiz?.answers.length || 0;
    const totalQuestions = activeQuiz?.total || 0;
    const progress = Math.floor((questionCount / totalQuestions) * 100);
    const progressText = `${questionCount} / ${totalQuestions}`;
    const progressMessage = `${ctx.t("quiz.category")} : ${activeQuiz?.section?.name ?? ""}\n${ctx.t("quiz.progress")}: ${progress}%\n${ctx.t("quiz.questions")}: ${progressText}\n\n`;

    await ctx.editMessageText(
      progressMessage + getSafeString(randomQuestion.question),
      {
        reply_markup: keyboard,
      },
    );

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

    await ctx.editMessageText(
      progressMessage + getSafeString(randomQuestion.question),
      {
        reply_markup: correctKeyboard,
      },
    );

    // Continue asking questions
    await askQuestion();
  }

  await askQuestion();
}
