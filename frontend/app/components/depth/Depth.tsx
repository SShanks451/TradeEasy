"use client";

import { useEffect, useState } from "react";
import { getDepth } from "@/app/utils/httpClient";
import { AskTable } from "./AskTable";
import { BidTable } from "./BidTable";
import { SignalingManager } from "@/app/utils/SignalingManager";

export function Depth({ market }: { market: string }) {
  const [bids, setBids] = useState<[string, string][]>();
  const [asks, setAsks] = useState<[string, string][]>();

  useEffect(() => {
    SignalingManager.getInstance().registerCallback(
      "depth",
      (data: any) => {
        console.log("depth data: ", data);
        setBids((originalBids) => {
          const updatedBids = [...(originalBids || [])];

          for (let j = 0; j < data.bids.length; j++) {
            let isNewBidAdded = false;
            for (let i = 0; i < updatedBids.length; i++) {
              if (Number(updatedBids[i][0]) === Number(data.bids[j][0])) {
                if (Number(data.bids[j][1]) === 0) {
                  updatedBids.splice(i, 1);
                  isNewBidAdded = true;
                  break;
                }

                updatedBids[i][1] = data.bids[j][1];
                isNewBidAdded = true;
                break;
              }
            }
            if (!isNewBidAdded) {
              updatedBids.push(data.bids[j]);
            }
          }

          return updatedBids;
        });

        setAsks((originalAsks) => {
          const updatedAsks = [...(originalAsks || [])];

          for (let j = 0; j < data.asks.length; j++) {
            let isNewAskAdded = false;
            for (let i = 0; i < updatedAsks.length; i++) {
              if (Number(updatedAsks[i][0]) === Number(data.asks[j][0])) {
                if (Number(data.asks[j][1]) === 0) {
                  updatedAsks.splice(i, 1);
                  isNewAskAdded = true;
                  break;
                }

                updatedAsks[i][1] = data.asks[j][1];
                isNewAskAdded = true;
                break;
              }
            }
            if (!isNewAskAdded) {
              updatedAsks.push(data.asks[j]);
            }
          }

          return updatedAsks;
        });
      },
      `DEPTH-${market}`
    );

    SignalingManager.getInstance().sendMessage({ method: "SUBSCRIBE", params: [`depth@${market}`] });

    getDepth(market).then((res) => {
      setAsks(res.asks);
      setBids(res.bids);
    });

    return () => {
      SignalingManager.getInstance().sendMessage({ method: "UNSUBSCRIBE", params: [`depth@${market}`] });
      SignalingManager.getInstance().deRegisterCallback("depth", `DEPTH-${market}`);
    };
  }, []);

  return (
    <div>
      <TableHeader />
      {asks && <AskTable asks={asks} />}
      {bids && <BidTable bids={bids} />}
    </div>
  );
}

function TableHeader() {
  return (
    <div className="flex justify-between text-xs px-3 py-2">
      <div className="text-white">Price</div>
      <div className="text-slate-500">Size</div>
      <div className="text-slate-500">Total</div>
    </div>
  );
}
