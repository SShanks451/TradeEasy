import { WebSocket } from "ws";
import { SubscriptionManager } from "./SubscriptionManager";
import { IncomingMessage } from "./types/in";
import { OutgoingMessage } from "./types/out";

export class User {
  private id: string;
  private ws: WebSocket;

  constructor(id: string, ws: WebSocket) {
    this.id = id;
    this.ws = ws;
    this.addListeners();
  }

  emit(message: OutgoingMessage) {
    console.log("ws msg: ", message);
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
