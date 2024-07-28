export const ORDER_PLACED = "ORDER_PLACED";
export const DEPTH = "DEPTH";
export const ORDER_CANCELLED = "ORDER_CANCELLED";

export type MessageToApi =
  | {
      type: typeof ORDER_PLACED;
      payload: {
        orderId: string;
        executedQty: number;
        fills: {
          price: string;
          qty: number;
          tradeId: number;
        }[];
      };
    }
  | {
      type: typeof DEPTH;
      payload: {
        bids: [string, string][];
        asks: [string, string][];
      };
    }
  | {
      type: typeof ORDER_CANCELLED;
      payload: {
        orderId: string;
        executedQty: string;
        remainingQty: string;
      };
    };
