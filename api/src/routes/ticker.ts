import { Router } from "express";
import { RedisManager } from "../RedisManager";
import { GET_TICKER } from "../types/to";

const tickerRouter = Router();

tickerRouter.get("/", async (req, res) => {
  const { symbol } = req.query;
  const response = await RedisManager.getInstance().sendAndAwait({
    type: GET_TICKER,
    data: {
      market: symbol as unknown as string,
    },
  });

  res.json(response.payload);
});

export default tickerRouter;
