type DepthUpdateMessage = {
  stream: string;
  data: {
    b: [string, string][];
    a: [string, string][];
    e: "depth";
  };
};

type TickerUpdateMessage = {
  stream: string;
  data: {
    c?: string;
    h?: string;
    l?: string;
    v?: string;
    V?: string;
    s?: string;
    e: "ticker";
  };
};

export type WsMessage = DepthUpdateMessage | TickerUpdateMessage;
