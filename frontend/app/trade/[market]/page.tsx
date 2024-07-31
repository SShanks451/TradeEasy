"use client";
import { MarketBar } from "@/app/components/MarketBar";
import OpenOrders from "@/app/components/OpenOrders";
import { SwapUI } from "@/app/components/SwapUI";
import { TradeView } from "@/app/components/TradeView";
import { Depth } from "@/app/components/depth/Depth";
import { useParams } from "next/navigation";

export default function Page() {
  const { market } = useParams();
  console.log(market);
  return (
    <div>
      <div>
        <MarketBar market={market as string} />
      </div>
      <div className="flex w-[100%]">
        <div className="w-[60%] border-r border-b border-slate-800">
          <TradeView market={market as string} />
        </div>
        <div className="w-[20%] border-b border-slate-800">
          <Depth market={market as string} />
        </div>
        <div className="w-[20%] border-l border-b border-slate-800">
          <SwapUI market={market as string} />
        </div>
      </div>
      <div>
        <OpenOrders />
      </div>
    </div>
  );
}
