import { Middleware, session } from "grammy";
import { RedisAdapter } from "@grammyjs/storage-redis";
import { connection } from "~/redis";
import { Context } from "~/bot/types";

const storage = new RedisAdapter({
  instance: connection,
});

/** Middleware for setting up session */
export const middleware = (): Middleware<Context> =>
  session({
    initial: () => ({}),
    storage,
  });
