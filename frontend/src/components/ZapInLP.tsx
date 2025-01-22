"use client";

import useRouter from "@/hooks/useRouter";
import {
  AERO_ADDRESS,
  ETH_ADDRESS,
  LUCHA_ADDRESS,
  LUCHA_HELPER_ADDRESS,
  WETH_ADDRESS,
} from "@/config/contants";
import useERC20 from "@/hooks/useERC20";
import { formatEther, parseEther, type Address } from "viem";
import { useEffect, useState } from "react";
import { beautifyBalance } from "@/utils/utils";
import { useBlockNumber } from "wagmi";

export default function ZapInLP() {
  const { zapIn } = useRouter();

  const { data: blockNumber } = useBlockNumber({
    watch: true,
  });
  const { getBalance, approve } = useERC20();

  const [tokenIn, setTokenIn] = useState<Address>(AERO_ADDRESS);
  const [userBalance, setUserbalance] = useState<bigint>(0n);
  const [amount, setAmount] = useState<bigint>(0n);
  const [amountDisplayed, setAmountDisplayed] = useState<string>("0");

  useEffect(() => {
    const fetchBalance = async () => {
      const userBalance = await getBalance(tokenIn);
      setUserbalance(userBalance);
    };
    if (blockNumber) {
      fetchBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  const handleTokenChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tokenSelected = e.target.value as Address;
    setTokenIn(tokenSelected);
    const userBalance = await getBalance(tokenSelected);
    setUserbalance(userBalance);
  };

  const handleMax = async () => {
    setAmount(userBalance);
    setAmountDisplayed(formatEther(userBalance));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amountInput = e.target.value;
    let amount = parseEther(amountInput);
    if (amount > userBalance) {
      amount = userBalance;
      setAmount(userBalance);
    } else if (amount < 0n) {
      amount = 0n;
      setAmount(0n);
    } else {
      setAmount(amount);
    }

    if (amount !== 0n) {
      setAmountDisplayed(formatEther(amount));
    } else {
      setAmountDisplayed(amountInput);
    }
  };

  const handleZapInLP = async () => {
    if (amount > userBalance) {
      throw new Error("Insufficient balance");
    }

    if (tokenIn !== ETH_ADDRESS) {
      await approve(tokenIn, LUCHA_HELPER_ADDRESS, amount);
    }

    const tx = await zapIn(tokenIn, amount);
    console.log({ tx });
  };

  return (
    <>
      <select
        id="tokenSelect"
        className="form-select"
        onChange={handleTokenChange}
      >
        <option value={AERO_ADDRESS}>AERO</option>
        <option value={LUCHA_ADDRESS}>LUCHA</option>
        <option value={ETH_ADDRESS}>ETH</option>
        <option value={WETH_ADDRESS}>WETH</option>
      </select>
      <div className="text-sm text-gray-500">
        Amount: {beautifyBalance(userBalance)}
      </div>
      <div className="flex flex-row input-group">
        <input
          type="number"
          className="form-control"
          placeholder="Amount"
          aria-label="Amount"
          aria-describedby="button-max"
          onChange={handleAmountChange}
          value={amountDisplayed}
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          id="button-max"
          onClick={handleMax}
        >
          Max
        </button>
      </div>
      <button className="btn btn-primary btn-sm" onClick={handleZapInLP}>
        Zap in LUCHA/WETH LP
      </button>
    </>
  );
}
