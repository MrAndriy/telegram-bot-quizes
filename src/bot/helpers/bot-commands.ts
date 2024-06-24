import { i18n } from "~/bot/helpers/i18n";

export const DEFAULT_LANGUAGE_CODE = "uk";

if (!i18n.locales.includes(DEFAULT_LANGUAGE_CODE)) {
  throw new Error(
    `Localization for default language code (${DEFAULT_LANGUAGE_CODE}) is missing`,
  );
}

export const getPrivateChatCommands = (options: {
  localeCode: string;
  includeLanguageCommand: boolean;
}) => {
  const commands = [
    {
      command: "start",
      description: i18n.t(options.localeCode, "start_command.description"),
    },
  ];

  if (options.includeLanguageCommand) {
    commands.push({
      command: "language",
      description: i18n.t(options.localeCode, "language_command.description"),
    });
  }

  return commands;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getPrivateChatAdminCommands = (_options: {
  localeCode: string;
  includeLanguageCommand: boolean;
}) => {
  const commands = [
    {
      command: "stats",
      description: "Stats",
    },
    {
      command: "setcommands",
      description: "Set bot commands",
    },
    {
      command: "user",
      description: "Show info about user",
    },
    {
      command: "filter",
      description: "Set filter word for chat",
    },
  ];

  return commands;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getGroupChatCommands = (_options: { localeCode: string }) => {
  return [];
};
