export type HumanMessage = {
  type: "human";
  id?: string | undefined;
  content: string;
};

export type AIMessage = {
  type: "ai";
  id?: string | undefined;
  content: string;
};

export type Message =
  | HumanMessage
  | AIMessage


export type UserQuery = {
    messages: Message[];
    extra_info: Record<string, any>;
};