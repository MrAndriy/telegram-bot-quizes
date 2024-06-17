import type { Conversation as DefaultConversation } from "@grammyjs/conversations";

import { Context } from "./context";

export type Conversation = DefaultConversation<Context>;
