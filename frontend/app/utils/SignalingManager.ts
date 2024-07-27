import { Ticker } from "./types";

const BASE_URL = "ws://localhost:3001";

export class SignalingManager {
  private static instance: SignalingManager;
  private ws: WebSocket;
  private bufferedMessages: any[];
  private id: number;
  private initialized: boolean;
  private callbacks: any;

  private constructor() {
    this.ws = new WebSocket(BASE_URL);
    this.bufferedMessages = [];
    this.id = 1;
    this.initialized = false;
    this.callbacks = {};
    this.init();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new SignalingManager();
    }

    return this.instance;
  }

  init() {
    this.ws.onopen = () => {
      this.initialized = true;
      this.bufferedMessages.forEach((message) => {
        this.ws.send(JSON.stringify(message));
      });
      this.bufferedMessages = [];
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("frontend ws msg: ", message);
      const type = message.data.e;

      if (this.callbacks[type]) {
        this.callbacks[type].forEach(({ callback }: { callback: any }) => {
          if (type === "depth") {
            const updatedAsks = message.data.a;
            const updatedBids = message.data.b;

            callback({ asks: updatedAsks, bids: updatedBids });
          }

          if (type === "ticker") {
            const newTicker: Partial<Ticker> = {
              firstPrice: message.data.o,
              high: message.data.h,
              lastPrice: message.data.c,
              low: message.data.l,
              quoteVolume: message.data.V,
              symbol: message.data.s,
              trades: message.data.n,
              volume: message.data.v,
            };

            callback(newTicker);
          }
        });
      }
    };
  }

  sendMessage(message: any) {
    const messageToSend = {
      ...message,
      id: this.id++,
    };

    if (!this.initialized) {
      this.bufferedMessages.push(messageToSend);
      return;
    }

    this.ws.send(JSON.stringify(messageToSend));
  }

  async registerCallback(type: string, callback: any, id: string) {
    if (!this.callbacks[type]) {
      this.callbacks[type] = [];
    }

    this.callbacks[type].push({ callback, id });
  }

  async deRegisterCallback(type: string, id: string) {
    if (this.callbacks[type]) {
      const ind = this.callbacks[type].findIndex((callback) => callback.id === id);
      if (ind !== -1) {
        this.callbacks[type].splice(ind, 1);
      }
    }
  }
}
