import { createClient, RedisClientType } from "redis";
import { UserManager } from "./UserManager";

export class SubscriptionManager {
  private static instance: SubscriptionManager;
  private redisClient: RedisClientType;
  private subscriptions: Map<string, string[]> = new Map();
  private reverseSubscriptions: Map<string, string[]> = new Map();

  private constructor() {
    this.redisClient = createClient();
    this.redisClient.connect();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new SubscriptionManager();
    }

    return this.instance;
  }

  public subscribe(userId: string, subscription: string) {
    if (this.subscriptions.get(userId)?.includes(subscription)) {
      return;
    }

    let userSubscriptions = this.subscriptions.get(userId);
    if (userSubscriptions) {
      userSubscriptions.push(subscription);
    } else {
      userSubscriptions = [subscription];
    }
    this.subscriptions.set(userId, userSubscriptions);

    let reverseUserSubscriptions = this.reverseSubscriptions.get(subscription);
    if (reverseUserSubscriptions) {
      reverseUserSubscriptions.push(userId);
    } else {
      reverseUserSubscriptions = [userId];
    }
    this.reverseSubscriptions.set(subscription, reverseUserSubscriptions);

    if (this.reverseSubscriptions.get(subscription)?.length === 1) {
      this.redisClient.subscribe(subscription, this.redisCallbackHandler);
    }
  }

  private redisCallbackHandler = (message: string, channel: string) => {
    const parsedMessage = JSON.parse(message);
    this.reverseSubscriptions.get(channel)?.forEach((x) => UserManager.getInstance().getUser(x)?.emit(parsedMessage));
  };

  public unsubscribe(userId: string, subscription: string) {
    const subscriptions = this.subscriptions.get(userId);
    if (subscriptions) {
      this.subscriptions.set(
        userId,
        subscriptions.filter((s) => s !== subscription)
      );
    }
    const reverseSubscriptions = this.reverseSubscriptions.get(subscription);
    if (reverseSubscriptions) {
      this.reverseSubscriptions.set(
        subscription,
        reverseSubscriptions.filter((r) => r !== userId)
      );
      if (this.reverseSubscriptions.get(subscription)?.length === 0) {
        this.reverseSubscriptions.delete(subscription);
        this.redisClient.unsubscribe(subscription);
      }
    }
  }

  public userLeft(userId: string) {
    this.subscriptions.get(userId)?.forEach((x) => this.unsubscribe(userId, x));
  }
}
