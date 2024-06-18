import { prisma } from "~/prisma";
import { createService as createUsersService } from "./users.service";
import { createService as createBlacklistService } from "./blacklist.service";
import { createService as createFiltersService } from "./filters.service";
import { createService as createMessagesService } from "./messages.service";
import { createService as createSectionService } from "./sections.service";
import { createService as createQuestionService } from "./questions.service";
import { createService as createQuizService } from "./quiz.service";
import { createService as createAnswersService } from "./answers.service";

export const usersService = createUsersService(prisma);
export const blacklistService = createBlacklistService(prisma);
export const filtersService = createFiltersService(prisma);
export const messagesService = createMessagesService(prisma);
export const sectionService = createSectionService(prisma);
export const questionService = createQuestionService(prisma);
export const quizService = createQuizService(prisma);
export const answersService = createAnswersService(prisma);
