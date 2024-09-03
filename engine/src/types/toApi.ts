export const ORDER_PLACED = "ORDER_PLACED";
export const DEPTH = "DEPTH";
export const ORDER_CANCELLED = "ORDER_CANCELLED";
export const OPEN_ORDERS = "OPEN_ORDERS";
export const TICKER = "TICKER";

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
    }
  | {
      type: typeof OPEN_ORDERS;
      payload: {
        price: number;
        quantity: number;
        orderId: string;
        filled: number;
        side: "buy" | "sell";
        userId: string;
      }[];
    }
  | {
      type: typeof TICKER;
      payload: {
        lastPrice: string;
      };
    };
