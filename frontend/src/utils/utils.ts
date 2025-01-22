import { SLIPPAGE } from "@/config/contants";
import { formatEther } from "viem";

export const applySlippage = (amount: bigint) => {
  return (amount * (100n - SLIPPAGE)) / 100n;
};

export const beautifyBalance = (balance: bigint) => {
  return parseFloat(formatEther(balance)).toFixed(4);
};
