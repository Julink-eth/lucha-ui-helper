"use client";

import useGauge from "@/hooks/useGauge";
import { useEffect, useState } from "react";
import Progression from "./Progression";
import useERC20 from "@/hooks/useERC20";
import { AERO_ADDRESS, LUCHA_HELPER_ADDRESS } from "@/config/contants";
import useRouter from "@/hooks/useRouter";
import { useBlockNumber } from "wagmi";
import { beautifyBalance } from "@/utils/utils";

export default function ClaimAndZapIn() {
  const [step, setStep] = useState(0);
  const [amountClaimable, setAmountClaimable] = useState(0n);

  const { approve } = useERC20();
  const { claimRewards, earned } = useGauge();
  const { zapIn } = useRouter();
  const { data: blockNumber } = useBlockNumber({
    watch: true,
  });

  useEffect(() => {
    const fetchEarned = async () => {
      const amount = await earned();
      setAmountClaimable(amount);
    };
    if (blockNumber) {
      fetchEarned();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  const handleClaimAndZapIn = async () => {
    setStep(1);
    const amount = await claimRewards();
    setStep(2);
    await approve(AERO_ADDRESS, LUCHA_HELPER_ADDRESS, amount);
    setStep(3);
    const tx = await zapIn(AERO_ADDRESS, amount);
    console.log({ tx });
    setStep(4);
  };

  return (
    <>
      <Progression step={step} />
      <button
        className="btn btn-primary btn-sm"
        onClick={handleClaimAndZapIn}
        disabled={step !== 0 || amountClaimable === 0n}
      >
        Claim and Zap In
      </button>
      <div className="text-sm text-gray-500">
        {amountClaimable === 0n
          ? "No rewards to claim"
          : `AERO Claimable: ${beautifyBalance(amountClaimable)}`}
      </div>
    </>
  );
}
