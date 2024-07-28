export const CREATE_ORDER = "CREATE_ORDER";
export const GET_DEPTH = "GET_DEPTH";
export const CANCEL_ORDER = "CANCEL_ORDER";

export type MessageFromApi =
  | {
      type: typeof CREATE_ORDER;
      data: {
        market: string;
        price: string;
        quantity: string;
        side: "buy" | "sell";
        userId: string;
      };
    }
  | {
      type: typeof GET_DEPTH;
      data: {
        market: string;
      };
    }
  | {
      type: typeof CANCEL_ORDER;
      data: {
        orderId: string;
        market: string;
      };
    };
