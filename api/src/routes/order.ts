import { Router } from "express";
import { RedisManager } from "../RedisManager";
import { CREATE_ORDER } from "../types/to";

const orderRouter = Router();

orderRouter.post("/", async (req, res) => {
  const { market, price, quantity, side, userId } = req.body;
  const response = await RedisManager.getInstance().sendAndAwait({ type: CREATE_ORDER, data: { market, price, quantity, side, userId } });
  res.json(response.payload);
});

export default orderRouter;
