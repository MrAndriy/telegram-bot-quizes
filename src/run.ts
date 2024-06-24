import "module-alias/register";

import { bot } from "~/bot";
import { server } from "~/server";
import { config } from "~/config";
import { logger } from "~/logger";

const run = async () => {
  if (config.isProd) {
    server.listen(
      {
        host: config.BOT_SERVER_HOST,
        port: config.BOT_SERVER_PORT,
      },
      (serverError) => {
        if (serverError) {
          logger.error(serverError);
        } else if (config.ENABLE_WEBHOOK === "true") {
          bot.api
            .setWebhook(config.BOT_WEBHOOK, {
              allowed_updates: config.BOT_ALLOWED_UPDATES,
            })
            .catch((err) => logger.error(err));
        } else {
          bot.start({
            allowed_updates: config.BOT_ALLOWED_UPDATES,
            onStart: ({ username }) =>
              logger.info({
                msg: "bot running...",
                username,
              }),
          });
        }
      },
    );
  } else {
    bot.start({
      allowed_updates: config.BOT_ALLOWED_UPDATES,
      onStart: ({ username }) =>
        logger.info({
          msg: "bot running...",
          username,
        }),
    });
  }
};

run();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line no-extend-native, func-names
BigInt.prototype.toJSON = function () {
  return this.toString();
};
