type DepthUpdateMessage = {
  stream: string;
  data: {
    b: [string, string][];
    a: [string, string][];
    e: "depth";
  };
};

export type WsMessage = DepthUpdateMessage;
