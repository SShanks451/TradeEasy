import express from "express";
import cors from "cors";
import orderRouter from "./routes/order";
import depthRouter from "./routes/depth";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/order", orderRouter);
app.use("/api/v1/depth", depthRouter);

app.listen(3000, () => {
  console.log("Listening on PORT 3000");
});
