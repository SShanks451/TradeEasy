import { Router } from "express";
import { RedisManager } from "../RedisManager";
import { GET_DEPTH } from "../types/to";

const depthRouter = Router();

depthRouter.get("/", async (req, res) => {
  const { symbol } = req.query;
  const response = await RedisManager.getInstance().sendAndAwait({
    type: GET_DEPTH,
    data: {
      market: symbol as unknown as string,
    },
  });

  res.json(response.payload);
});

export default depthRouter;
