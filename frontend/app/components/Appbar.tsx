"use client";

import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { PrimaryButton, SuccessButton } from "./Button";

export default function Appbar() {
  const pathName = usePathname();
  const router = useRouter();

  return (
    <div className="border-b flex justify-between">
      <div className="flex mx-4 py-4">
        <div className="mx-6 cursor-pointer text-lg flex flex-col justify-center" onClick={() => router.push("/")}>
          Exchange
        </div>
        <div
          className={`mx-6 cursor-pointer text-sm flex flex-col justify-center ${pathName.startsWith("/markets") ? "" : "text-gray-400"} `}
          onClick={() => router.push("/markets")}
        >
          Markets
        </div>
        <div
          className={`mx-6 cursor-pointer text-sm flex flex-col justify-center ${pathName.startsWith("/trade") ? "" : "text-gray-400"}`}
          onClick={() => router.push("/trade/SOL_USDC")}
        >
          Trade
        </div>
      </div>
      <div className="flex">
        <div className="flex flex-col justify-center mr-2">
          <SuccessButton>Deposit</SuccessButton>
        </div>
        <div className="flex flex-col justify-center mr-2">
          <PrimaryButton>Withdraw</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
