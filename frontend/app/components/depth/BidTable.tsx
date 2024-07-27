export const BidTable = ({ bids }: { bids: [string, string][] }) => {
  bids.sort((a, b) => {
    let firstNum = parseFloat(a[0]);
    let secondNum = parseFloat(b[0]);
    return firstNum - secondNum;
  });

  const reversedBids = [...bids].reverse();

  let currentTotal = 0;
  const relevantBids = reversedBids.slice(0, 15);

  const bidsWithTotal: [string, string, number][] = [];

  let maxTotal = 0;

  relevantBids.map(([price, quantity]) => {
    bidsWithTotal.push([price, quantity, (currentTotal += Number(quantity))]);
    maxTotal += Number(quantity);
  });

  return (
    <div>
      {bidsWithTotal.map(([price, quantity, total]) => (
        <Bid price={price} quantity={quantity} total={total} maxTotal={maxTotal} />
      ))}
    </div>
  );
};

const Bid = ({ price, quantity, total, maxTotal }: { price: string; quantity: string; total: number; maxTotal: number }) => {
  return (
    <div className="h-full w-full">
      <div className="flex flex-row relative h-full w-full overflow-hidden px-3 hover:border-t hover:border-dashed">
        <div
          style={{
            position: "absolute",
            top: "1px",
            bottom: "1px",
            right: "0px",
            width: `${(100 * total) / maxTotal}%`,
            background: "rgba(0, 194, 120, 0.16)",
            transition: "width 0.4s ease-in-out 0s",
          }}
        ></div>
        <div className="flex justify-between w-full">
          <p className="z-10 text-xs font-normal tabular-nums">{price}</p>
          <p className="z-10 text-xs font-normal tabular-nums">{quantity}</p>
          <p className="z-10 text-xs font-normal tabular-nums">{total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};
