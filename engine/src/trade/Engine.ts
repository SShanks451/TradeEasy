import { RedisManager } from "../RedisManager";
import { CANCEL_ORDER, CREATE_ORDER, GET_DEPTH, GET_OPEN_ORDERS, MessageFromApi } from "../types/fromApi";
import { DEPTH, OPEN_ORDERS, ORDER_CANCELLED, ORDER_PLACED } from "../types/toApi";
import { Order, Orderbook, Fill } from "./Orderbook";

interface UserBalance {
  [key: string]: {
    available: number;
    locked: number;
  };
}

const BASE_CURRENCY = "USDC";

export class Engine {
  private balances: Map<string, UserBalance> = new Map();
  private orderbooks: Orderbook[] = [];

  constructor() {
    this.orderbooks.push(new Orderbook([], [], "SOL", "USDC", 0, 0));
    this.setBaseBalances();
  }

  process({ clientId, message }: { clientId: string; message: MessageFromApi }) {
    switch (message.type) {
      case CREATE_ORDER:
        try {
          const { orderId, executedQty, fills } = this.createOrder(
            message.data.market,
            message.data.price,
            message.data.quantity,
            message.data.side,
            message.data.userId
          );

          RedisManager.getInstance().sendToApi(clientId, {
            type: ORDER_PLACED,
            payload: {
              orderId,
              executedQty,
              fills,
            },
          });
        } catch (e) {}

        break;

      case CANCEL_ORDER:
        try {
          const orderId = message.data.orderId;
          const cancelMarket = message.data.market;
          const cancelOrderbook = this.orderbooks.find((o) => o.ticker() === cancelMarket);
          if (!cancelOrderbook) {
            throw new Error("Orderbook not found for this market");
          }

          const baseAsset = cancelMarket.split("_")[0];
          const quoteAsset = cancelMarket.split("_")[1];
          const order = cancelOrderbook.asks.find((a) => a.orderId === orderId) || cancelOrderbook.bids.find((b) => b.orderId === orderId);
          if (!order) {
            throw new Error("No order found");
          }

          if (order.side === "buy") {
            const price = cancelOrderbook.cancelBid(order);
            const leftQuantity = (order.quantity - order.filled) * order.price;
            //@ts-ignore
            this.balances.get(order.userId)[baseAsset].available += leftQuantity;
            //@ts-ignore
            this.balances.get(order.userId)[baseAsset].locked -= leftQuantity;

            if (price) {
              this.sendUpdatedDepthAt(price.toString(), cancelMarket);
            }
          }

          if (order.side === "sell") {
            const price = cancelOrderbook.cancelAsk(order);
            const leftQuantity = order.quantity - order.filled;
            //@ts-ignore
            this.balances.get(order.userId)[quoteAsset].available += leftQuantity;
            //@ts-ignore
            this.balances.get(order.userId)[quoteAsset].locked -= leftQuantity;

            if (price) {
              this.sendUpdatedDepthAt(price.toString(), cancelMarket);
            }
          }

          RedisManager.getInstance().sendToApi(clientId, {
            type: ORDER_CANCELLED,
            payload: {
              orderId,
              executedQty: "0",
              remainingQty: "0",
            },
          });
        } catch (e) {}

        break;

      case GET_DEPTH:
        const market = message.data.market;
        const orderbook = this.orderbooks.find((o) => o.ticker() === market);
        if (!orderbook) {
          throw new Error("Orderbook not found");
        }

        RedisManager.getInstance().sendToApi(clientId, {
          type: DEPTH,
          payload: orderbook.getDepth(),
        });

        break;

      case GET_OPEN_ORDERS:
        const openOrderbook = this.orderbooks.find((o) => o.ticker() === message.data.market);
        if (!openOrderbook) {
          throw new Error("Orderbook not found");
        }

        const openOrders = openOrderbook.getOpenOrders(message.data.userId);

        RedisManager.getInstance().sendToApi(clientId, {
          type: OPEN_ORDERS,
          payload: openOrders,
        });

        break;
    }
  }

  createOrder(market: string, price: string, quantity: string, side: "buy" | "sell", userId: string) {
    const orderbook = this.orderbooks.find((o) => o.ticker() === market);
    if (!orderbook) {
      throw new Error("Orderbook not found");
    }

    const baseAsset = market.split("_")[0];
    const quoteAsset = market.split("_")[1];

    this.checkAndLockFunds(price, quantity, baseAsset, quoteAsset, side, userId);

    const order: Order = {
      price: Number(price),
      quantity: Number(quantity),
      orderId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      filled: 0,
      side,
      userId,
    };

    const { executedQty, fills } = orderbook.addOrder(order);

    this.updateBalance(userId, baseAsset, quoteAsset, side, fills, executedQty);

    this.publishWsDepthUpdates(fills, price, side, market);

    return { orderId: order.orderId, executedQty, fills };
  }

  checkAndLockFunds(price: string, quantity: string, baseAsset: string, quoteAsset: string, side: "buy" | "sell", userId: string) {
    if (side === "buy") {
      //@ts-ignore
      if (this.balances.get(userId)[quoteAsset].available < Number(price) * Number(quantity)) {
        throw new Error("Insufficient funds");
      }

      //@ts-ignore
      this.balances.get(userId)[quoteAsset].available = this.balances.get(userId)[quoteAsset].available - Number(price) * Number(quantity);

      //@ts-ignore
      this.balances.get(userId)[quoteAsset].locked = this.balances.get(userId)[quoteAsset].locked + Number(price) * Number(quantity);
    }
  }

  updateBalance(userId: string, baseAsset: string, quoteAsset: string, side: "buy" | "sell", fills: Fill[], executedQty: number) {
    if (side === "buy") {
      fills.forEach((fill) => {
        //@ts-ignore
        this.balances.get(fill.otherUserId)[quoteAsset].available =
          //@ts-ignore
          this.balances.get(fill.otherUserId)[quoteAsset].available + Number(fill.price) * fill.qty;

        //@ts-ignore
        this.balances.get(userId)[quoteAsset].locked = this.balances.get(userId)[quoteAsset].locked - Number(fill.price) * fill.qty;

        //@ts-ignore
        this.balances.get(fill.otherUserId)[baseAsset].locked = this.balances.get(userId)[baseAsset].locked - fill.qty;

        //@ts-ignore
        this.balances.get(userId)[baseAsset].available = this.balances.get(userId)[baseAsset].available + fill.qty;
      });
    } else {
      fills.forEach((fill) => {
        //@ts-ignore
        this.balances.get(fill.otherUserId)[quoteAsset].locked =
          //@ts-ignore
          this.balances.get(fill.otherUserId)[quoteAsset].locked - Number(fill.price) * fill.qty;

        //@ts-ignore
        this.balances.get(userId)[quoteAsset].available = this.balances.get(userId)[quoteAsset].available + Number(fill.price) * fill.qty;

        //@ts-ignore
        this.balances.get(fill.otherUserId)[baseAsset].available = this.balances.get(userId)[baseAsset].available + fill.qty;

        //@ts-ignore
        this.balances.get(userId)[baseAsset].locked = this.balances.get(userId)[baseAsset].locked - fill.qty;
      });
    }
  }

  publishWsDepthUpdates(fills: Fill[], price: string, side: "buy" | "sell", market: string) {
    const orderbook = this.orderbooks.find((o) => o.ticker() === market);
    if (!orderbook) {
      return;
    }

    const depth = orderbook.getDepth();

    if (side === "buy") {
      const updatedAsks = depth.asks.filter((x) => fills.map((f) => f.price).includes(x[0]));
      for (let i = 0; i < fills.length; i++) {
        let isPresent = false;
        for (let j = 0; j < updatedAsks.length; j++) {
          if (updatedAsks[j][0] === fills[i].price) {
            isPresent = true;
            break;
          }
        }
        if (!isPresent) {
          updatedAsks.push([fills[i].price, "0"]);
        }
      }

      const updatedBids = depth.bids.find((x) => x[0] === price);

      RedisManager.getInstance().publishMessage(`depth@${market}`, {
        stream: `depth@${market}`,
        data: {
          a: updatedAsks,
          b: updatedBids ? [updatedBids] : [],
          e: "depth",
        },
      });
    }
    if (side === "sell") {
      const updatedAsks = depth.asks.find((x) => x[0] === price);

      const updatedBids = depth.bids.filter((x) => fills.map((f) => f.price).includes(x[0]));
      for (let i = 0; i < fills.length; i++) {
        let isPresent = false;
        for (let j = 0; j < updatedBids.length; j++) {
          if (updatedBids[j][0] === fills[i].price) {
            isPresent = true;
            break;
          }
        }
        if (!isPresent) {
          updatedBids.push([fills[i].price, "0"]);
        }
      }

      RedisManager.getInstance().publishMessage(`depth@${market}`, {
        stream: `depth@${market}`,
        data: {
          a: updatedAsks ? [updatedAsks] : [],
          b: updatedBids,
          e: "depth",
        },
      });
    }
  }

  sendUpdatedDepthAt(price: string, market: string) {
    const orderbook = this.orderbooks.find((o) => o.ticker() === market);
    if (!orderbook) {
      return;
    }
    const depth = orderbook.getDepth();
    const updatedBids = depth.bids.filter((b) => b[0] === price);
    const updatedAsks = depth.asks.filter((a) => a[0] === price);

    RedisManager.getInstance().publishMessage(`depth@${market}`, {
      stream: `depth@${market}`,
      data: {
        b: updatedBids.length ? updatedBids : [[price, "0"]],
        a: updatedAsks.length ? updatedAsks : [[price, "0"]],
        e: "depth",
      },
    });
  }

  setBaseBalances() {
    this.balances.set("1", {
      [BASE_CURRENCY]: {
        available: 10000000,
        locked: 0,
      },
      SOL: {
        available: 10000000,
        locked: 0,
      },
    });

    this.balances.set("2", {
      [BASE_CURRENCY]: {
        available: 10000000,
        locked: 0,
      },
      SOL: {
        available: 10000000,
        locked: 0,
      },
    });

    this.balances.set("5", {
      [BASE_CURRENCY]: {
        available: 10000000,
        locked: 0,
      },
      SOL: {
        available: 10000000,
        locked: 0,
      },
    });
  }
}
