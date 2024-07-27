import { WebSocket } from "ws";
import { SubscriptionManager } from "./SubscriptionManager";
import { IncomingMessage } from "./types/in";
import { OutgoingMessage } from "./types/out";

export class User {
  private id: string;
  private ws: WebSocket;

  private subscriptions: string[] = [];

  constructor(id: string, ws: WebSocket) {
    this.id = id;
    this.ws = ws;
    this.addListeners();
  }

  public subscribe(subscription: string) {
    this.subscriptions.push(subscription);
  }

  public unsubscribe(subscription: string) {
    this.subscriptions = this.subscriptions.filter((s) => s != subscription);
  }

  emit(message: OutgoingMessage) {
    this.ws.send(JSON.stringify(message));
  }

  private addListeners() {
    this.ws.on("message", (message: string) => {
      const parsedMessage: IncomingMessage = JSON.parse(message);
      if (parsedMessage.method === "SUBSCRIBE") {
        parsedMessage.params.forEach((s: string) => SubscriptionManager.getInstance().subscribe(this.id, s));
      }

      if (parsedMessage.method === "UNSUBSCRIBE") {
        parsedMessage.params.forEach((s: string) => SubscriptionManager.getInstance().unsubscribe(this.id, s));
      }
    });
  }
}
