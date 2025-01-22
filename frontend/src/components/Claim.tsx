"use client";

import useGauge from "@/hooks/useGauge";

export default function Claim() {
  const { claimRewards } = useGauge();

  return <button onClick={() => claimRewards()}>Claim</button>;
}
