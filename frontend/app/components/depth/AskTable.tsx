export const AskTable = ({ asks }: { asks: [string, string][] }) => {
  asks.sort((a, b) => {
    let firstNum = parseFloat(a[0]);
    let secondNum = parseFloat(b[0]);
    return firstNum - secondNum;
  });

  let currentTotal = 0;
  const relevantAsks = asks.slice(0, 15);

  const asksWithTotal: [string, string, number][] = [];

  let maxTotal = 0;

  for (let i = 0; i < relevantAsks.length; i++) {
    const [price, quantity] = relevantAsks[i];
    asksWithTotal.push([price, quantity, (currentTotal += Number(quantity))]);
    maxTotal += Number(quantity);
  }

  const reversedAsksWithTotal = [...asksWithTotal].reverse();

  return (
    <div>
      {reversedAsksWithTotal.map(([price, quantity, total]) => (
        <Ask price={price} quantity={quantity} total={total} maxTotal={maxTotal} />
      ))}
    </div>
  );
};

const Ask = ({ price, quantity, total, maxTotal }: { price: string; quantity: string; total: number; maxTotal: number }) => {
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
            background: "rgba(253, 75, 78, 0.16)",
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
