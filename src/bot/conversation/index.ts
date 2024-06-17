import { InlineKeyboard } from "grammy";
import { questionService, quizService } from "~/services";
import { Context, Conversation } from "~/bot/types";

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
      await ctx.reply("No more questions available in this quiz.");
      // eslint-disable-next-line no-useless-return
      return;
    }

    const randomQuestion =
      questions[Math.floor((await conversation.random()) * questions.length)];

    conversation.log("randomQuestion", randomQuestion);

    // Create inline keyboard with options
    const keyboard = new InlineKeyboard();
    randomQuestion.options.forEach((option) => {
      keyboard.text(option.text, option.id.toString()).row();
    });

    // Create inline keyboard with correct answers
    const correctKeyboard = new InlineKeyboard();
    randomQuestion.options.forEach((option) => {
      correctKeyboard
        .text(
          option.isCorrect ? `❇️ ${option.text}` : `⛔️ ${option.text}`,
          option.id.toString(),
        )
        .row();
    });

    // await ctx.editMessageText(getSafeString(randomQuestion.question), {
    await ctx.editMessageText(randomQuestion.question, {
      reply_markup: keyboard,
    });

    conversation.log(
      "array of option IDs",
      randomQuestion.options.map((option) => option.id.toString()),
    );

    const response = await conversation.waitForCallbackQuery(
      randomQuestion.options.map((option) => `${option.id}`),
      // {
      //   // eslint-disable-next-line no-shadow
      //   otherwise: (ctx) => {
      //     conversation.log("otherwise", ctx.update.callback_query?.data);
      //     ctx.reply("Use the buttons!");
      //   },
      // },
    );

    conversation.log("response", response);

    // Handle response (here you can process the user's choice)
    const selectedOptionId = response.match;
    const selectedOption = randomQuestion.options.find(
      (option) => option.id === +selectedOptionId,
    );

    // await ctx.editMessageText(getSafeString(randomQuestion.question), {
    await ctx.editMessageText(randomQuestion.question, {
      reply_markup: correctKeyboard,
    });

    if (selectedOption) {
      // Save the answer
      conversation.log("save answer", selectedOption);
      // conversation.external(async () => {})
    }

    // Continue asking questions
    await askQuestion();
  }

  await askQuestion();
}
