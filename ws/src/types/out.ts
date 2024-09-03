export type TickerUpdateMessage = {
  type: "ticker";
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

export type DepthUpdateMessage = {
  type: "depth";
  data: {
    b?: [string, string][];
    a?: [string, string][];
    e: "depth";
  };
};

export type OutgoingMessage = TickerUpdateMessage | DepthUpdateMessage;
