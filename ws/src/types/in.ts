const SUBSCRIBE = "SUBSCRIBE";
const UNSUBSCRIBE = "UNSUBSCRIBE";

type SubscribeMessage = {
  method: typeof SUBSCRIBE;
  params: string[];
};

type UnsubscribeMessage = {
  method: typeof UNSUBSCRIBE;
  params: string[];
};

export type IncomingMessage = SubscribeMessage | UnsubscribeMessage;
