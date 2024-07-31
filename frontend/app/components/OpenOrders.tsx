"use client";

import React, { use, useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:3000";
const USER_ID = "1";
const MARKET = "SOL_USDC";

const OpenOrders = () => {
  const [openOrders, setOpenOrders] = useState([]);
  if (openOrders.length > 0) {
    console.log(openOrders);
  }

  useEffect(() => {
    async function getOpenOrders() {
      const response = await axios.get(`${BASE_URL}/api/v1/order/open?userId=${USER_ID}&market=${MARKET}`);
      setOpenOrders(response.data);
    }

    getOpenOrders();
  });

  return (
    <div>
      <div className="ml-8 mt-8 mb-4 font-semibold">Open Orders</div>
      <div className="flex mb-4">
        <div className="w-[15%] text-center">Price</div>
        <div className="w-[15%] text-center">Quantity</div>
        <div className="w-[15%] text-center">Filled</div>
        <div className="w-[15%] text-center">Side</div>
        <div className="w-[15%] text-center">UserId</div>
      </div>
      <div>
        {openOrders.map((o: any) => (
          <div key={o.orderId} className="flex mb-2">
            <div className="w-[15%] text-center">{o.price}</div>
            <div className="w-[15%] text-center">{o.quantity}</div>
            <div className="w-[15%] text-center">{o.filled}</div>
            <div className="w-[15%] text-center">{o.side}</div>
            <div className="w-[15%] text-center">{o.userId}</div>
            <div className="w-[15%] text-center">
              <div
                className="bg-red-500 w-fit px-6 rounded-lg cursor-pointer"
                onClick={async () => {
                  await axios.delete(`${BASE_URL}/api/v1/order`, {
                    data: {
                      orderId: o.orderId,
                      market: MARKET,
                    },
                  });
                }}
              >
                Cancel Order
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpenOrders;
