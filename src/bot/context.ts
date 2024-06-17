import { AsyncLocalStorage } from "async_hooks";
import { User, Message, Blacklist, Quiz } from "@prisma/client";
import { Logger } from "pino";

export interface LocalContext {
  user?: User & {
    messages?: Message[];
    blacklist?: Blacklist | null;
    quizzes?: Quiz[] | null;
  };
  logger?: Logger;
}

export const context = new AsyncLocalStorage<LocalContext>();
