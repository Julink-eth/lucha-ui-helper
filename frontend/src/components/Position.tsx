"use client";

import {
  AERO_ROUTER_ADDRESS,
  LP_LUCHA_WETH_ADDRESS,
  LUCHA_ADDRESS,
} from "@/config/contants";
import { WETH_ADDRESS } from "@/config/contants";
import useERC20 from "@/hooks/useERC20";
import useGauge from "@/hooks/useGauge";
import useRouter from "@/hooks/useRouter";
import { beautifyBalance } from "@/utils/utils";

export default function Position({
  tokenBalances,
  tokenSymbols,
  liquidity,
  title,
  staked,
}: {
  tokenBalances: bigint[];
  tokenSymbols: string[];
  liquidity: bigint;
  title: string;
  staked: boolean;
}) {
  const { approve } = useERC20();
  const { removeLiquidity } = useRouter();
  const { unstake } = useGauge();

  const displayTokenBalances = () => {
    const balanceWithSymbols = tokenBalances.map((balance, index) => {
      return beautifyBalance(balance) + " " + tokenSymbols[index];
    });

    return balanceWithSymbols;
  };

  const handleZapOut = async () => {
    if (staked) {
      await unstake(liquidity);
    }

    await approve(LP_LUCHA_WETH_ADDRESS, AERO_ROUTER_ADDRESS, liquidity);

    await removeLiquidity(LUCHA_ADDRESS, WETH_ADDRESS, liquidity);
  };

  return (
    <div className="card bg-neutral text-neutral-content w-96">
      <div className="card-body items-center text-center">
        <h2 className="card-title">{title}</h2>
        <p>
          {displayTokenBalances().map((balanceWithSymbol, index) => (
            <span key={index}>
              {balanceWithSymbol}
              <br />
            </span>
          ))}
        </p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary" onClick={handleZapOut}>
            Unstake and Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}
