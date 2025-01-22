"use client";

import {
  AERO_GAUGE_ADDRESS,
  LP_LUCHA_WETH_ADDRESS,
  LUCHA_ADDRESS,
  WETH_ADDRESS,
} from "@/config/contants";
import useERC20 from "@/hooks/useERC20";
import { useEffect, useState } from "react";
import Position from "./Position";
import useRouter from "@/hooks/useRouter";
import { useBlockNumber } from "wagmi";

export default function UserPositions() {
  const [liquidity, setLiquidity] = useState<bigint>(0n);
  const [stakedLiquidity, setStakedLiquidity] = useState<bigint>(0n);

  const [lpBalances, setLpBalances] = useState<bigint[]>([]);
  const [stakedBalances, setStakedBalances] = useState<bigint[]>([]);

  const { getBalance } = useERC20();
  const { quoteRemoveLiquidity } = useRouter();
  const { data: blockNumber } = useBlockNumber({
    watch: true,
  });

  useEffect(() => {
    const fetchBalances = async () => {
      const lpBalance = await getBalance(LP_LUCHA_WETH_ADDRESS);
      setLiquidity(lpBalance);
      const stakedBalance = await getBalance(AERO_GAUGE_ADDRESS);
      setStakedLiquidity(stakedBalance);
      const lpBalances_ = await quoteRemoveLiquidity(
        LUCHA_ADDRESS,
        WETH_ADDRESS,
        lpBalance
      );
      setLpBalances(lpBalances_);
      const stakedBalances_ = await quoteRemoveLiquidity(
        LUCHA_ADDRESS,
        WETH_ADDRESS,
        stakedBalance
      );
      setStakedBalances(stakedBalances_);
    };
    if (blockNumber) {
      fetchBalances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  const displayPositions = (balances: bigint[]) => {
    return balances.length > 0 && balances[0] !== undefined && balances[0] > 0n;
  };

  return (
    <>
      {displayPositions(lpBalances) && (
        <Position
          tokenBalances={lpBalances}
          tokenSymbols={["LUCHA", "WETH"]}
          liquidity={liquidity}
          title="LP LUCHA/WETH"
          staked={false}
        />
      )}

      {displayPositions(stakedBalances) && (
        <Position
          tokenBalances={stakedBalances}
          tokenSymbols={["LUCHA", "WETH"]}
          liquidity={stakedLiquidity}
          title="Staked LP LUCHA/WETH"
          staked={true}
        />
      )}
    </>
  );
}
