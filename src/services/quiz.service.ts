import { Prisma, PrismaClient } from "@prisma/client";

export const createService = (prisma: PrismaClient) =>
  Object.assign(prisma.quiz, {
    leaderBoard: <T extends Prisma.QuizDefaultArgs>(
      select: Prisma.SelectSubset<T, Prisma.QuizDefaultArgs>,
    ) => {
      const query = {
        where: {
          active: false,
        },
        orderBy: {
          score: "desc",
        },
        include: {
          user: true,
        },
      } satisfies Prisma.QuizFindManyArgs;

      return prisma.quiz.findMany<T>(Object.assign(query, select));
    },
  });
