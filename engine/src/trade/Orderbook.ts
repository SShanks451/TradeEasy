export interface Order {
  price: number;
  quantity: number;
  orderId: string;
  filled: number;
  side: "buy" | "sell";
  userId: string;
}

export interface Fill {
  price: string;
  qty: number;
  tradeId: number;
  otherUserId: string;
  markerOrderId: string;
}

export class Orderbook {
  private bids: Order[];
  private asks: Order[];
  private baseAsset: string;
  private quoteAsset: string;
  private lastTradeId: number;
  private currentPrice: number;

  constructor(bids: Order[], asks: Order[], baseAsset: string, quoteAsset: string, lastTradeId: number, currentPrice: number) {
    this.bids = bids;
    this.asks = asks;
    this.baseAsset = baseAsset;
    this.quoteAsset = quoteAsset;
    this.lastTradeId = lastTradeId;
    this.currentPrice = currentPrice;
  }

  ticker() {
    return `${this.baseAsset}_${this.quoteAsset}`;
  }

  addOrder(order: Order): { executedQty: number; fills: Fill[] } {
    if (order.side === "buy") {
      const { executedQty, fills } = this.matchBids(order);
      order.filled = executedQty;
      if (executedQty === order.quantity) {
        return {
          executedQty,
          fills,
        };
      }

      this.bids.push(order);
      return {
        executedQty,
        fills,
      };
    } else {
      const { executedQty, fills } = this.matchAsks(order);
      order.filled = executedQty;
      if (executedQty === order.quantity) {
        return {
          executedQty,
          fills,
        };
      }

      this.asks.push(order);
      return {
        executedQty,
        fills,
      };
    }
  }

  matchBids(order: Order): { executedQty: number; fills: Fill[] } {
    let executedQty = 0;
    const fills: Fill[] = [];

    this.asks.sort((a, b) => {
      return a.price - b.price;
    });

    for (let i = 0; i < this.asks.length; i++) {
      if (executedQty === order.quantity) break;

      if (this.asks[i].price <= order.price) {
        const filledQty = Math.min(order.quantity - executedQty, this.asks[i].quantity - this.asks[i].filled);
        executedQty += filledQty;
        this.asks[i].filled += filledQty;
        fills.push({
          price: this.asks[i].price.toString(),
          qty: filledQty,
          tradeId: this.lastTradeId++,
          otherUserId: this.asks[i].userId,
          markerOrderId: this.asks[i].orderId,
        });
      }

      // if (this.asks[i].filled === this.asks[i].quantity) {
      //   this.asks.splice(i, 1);
      //   i--;
      // }
    }

    return {
      executedQty,
      fills,
    };
  }

  matchAsks(order: Order): { executedQty: number; fills: Fill[] } {
    let executedQty = 0;
    const fills: Fill[] = [];

    this.bids.sort((a, b) => {
      return a.price - b.price;
    });

    this.bids.reverse();

    for (let i = 0; i < this.bids.length; i++) {
      if (executedQty === order.quantity) break;

      if (this.bids[i].price >= order.price) {
        const filledQty = Math.min(order.quantity - executedQty, this.bids[i].quantity - this.bids[i].filled);
        executedQty += filledQty;
        this.bids[i].filled += filledQty;
        fills.push({
          price: this.bids[i].price.toString(),
          qty: filledQty,
          tradeId: this.lastTradeId++,
          otherUserId: this.bids[i].userId,
          markerOrderId: this.bids[i].orderId,
        });
      }

      // if (this.bids[i].filled === this.bids[i].quantity) {
      //   this.bids.splice(i, 1);
      //   i--;
      // }
    }

    return {
      executedQty,
      fills,
    };
  }

  getDepth() {
    const bids: [string, string][] = [];
    const asks: [string, string][] = [];

    const bidsObj: { [key: string]: number } = {};
    const asksObj: { [key: string]: number } = {};

    for (let i = 0; i < this.bids.length; i++) {
      const orderPrice = this.bids[i].price.toString();
      const orderQty = this.bids[i].quantity - this.bids[i].filled;
      if (!bidsObj[orderPrice]) {
        bidsObj[orderPrice] = 0;
      }
      bidsObj[orderPrice] += orderQty;
    }

    for (let i = 0; i < this.asks.length; i++) {
      const orderPrice = this.asks[i].price.toString();
      const orderQty = this.asks[i].quantity - this.asks[i].filled;
      if (!asksObj[orderPrice]) {
        asksObj[orderPrice] = 0;
      }
      asksObj[orderPrice] += orderQty;
    }

    for (let price in bidsObj) {
      bids.push([price, bidsObj[price].toString()]);
    }

    for (let price in asksObj) {
      asks.push([price, asksObj[price].toString()]);
    }

    return {
      bids,
      asks,
    };
  }
}
