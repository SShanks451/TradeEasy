import axios from "axios";

const BASE_URL = "http://localhost:3000";
const USER_ID = "5";
const MARKET = "SOL_USDC";
const TOTAL_BIDS = 20;
const TOTAL_ASKS = 20;

async function main() {
  const price = 1000 + Math.random() * 2;

  const openOrders = await axios.get(`${BASE_URL}/api/v1/order/open?userId=${USER_ID}&market=${MARKET}`);

  const totalBids = openOrders.data.filter((o: any) => o.side === "buy").length;
  const totalAsks = openOrders.data.filter((o: any) => o.side === "ask").length;

  const totalCancelledBids = await cancelBids(openOrders.data, price);
  const totalCancelledAsks = await cancelAsks(openOrders.data, price);

  let reqBids = TOTAL_BIDS - totalBids + totalCancelledBids;
  let reqAsks = TOTAL_ASKS - totalAsks + totalCancelledAsks;

  let promises: any[] = [];

  while (reqBids > 0 || reqAsks > 0) {
    if (reqBids > 0) {
      promises.push(
        axios.post(`${BASE_URL}/api/v1/order`, {
          market: MARKET,
          price: (price - Math.random()).toFixed(2),
          quantity: "1",
          side: "buy",
          userId: USER_ID,
        })
      );
      reqBids--;
    }

    if (reqAsks > 0) {
      promises.push(
        axios.post(`${BASE_URL}/api/v1/order`, {
          market: MARKET,
          price: (price + Math.random()).toFixed(2),
          quantity: "1",
          side: "sell",
          userId: USER_ID,
        })
      );
      reqAsks--;
    }
  }

  await Promise.all(promises);

  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });

  main();
}

async function cancelBids(openOrders: any[], price: number) {
  let promises: any[] = [];

  openOrders.forEach((order) => {
    if (order.side === "buy" && order.price > price) {
      promises.push(
        axios.delete(`${BASE_URL}/api/v1/order`, {
          data: {
            orderId: order.orderId,
            market: MARKET,
          },
        })
      );
    }
  });

  await Promise.all(promises);
  return promises.length;
}

async function cancelAsks(openOrders: any[], price: number) {
  let promises: any[] = [];

  openOrders.forEach((order) => {
    if (order.side === "sell" && order.price < price) {
      promises.push(
        axios.delete(`${BASE_URL}/api/v1/order`, {
          data: {
            orderId: order.orderId,
            market: MARKET,
          },
        })
      );
    }
  });

  await Promise.all(promises);
  return promises.length;
}

main();
