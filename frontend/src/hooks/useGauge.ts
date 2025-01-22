import { useAccount } from "wagmi";
import gaugeAbi from "../abis/Gage.json";
import {
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { config } from "@/config";
import { parseEventLogs } from "viem";

const useGauge = () => {
  const { address } = useAccount();

  const GAUGE_ADDRESS = "0xd3011443522E904092232CD7C73586D0b1b61418";

  const earned = async () => {
    const earned = (await readContract(config, {
      address: GAUGE_ADDRESS,
      abi: gaugeAbi,
      functionName: "earned",
      args: [address || "0x0"],
    })) as bigint;
    return earned;
  };

  const claimRewards = async () => {
    try {
      /// Claim rewards ///
      const { request: requestClaim } = await simulateContract(config, {
        abi: gaugeAbi,
        address: GAUGE_ADDRESS,
        functionName: "getReward",
        args: [address || "0x0"],
      });
      let hash = await writeContract(config, requestClaim);

      let transactionReceipt = await waitForTransactionReceipt(config, {
        hash,
        confirmations: 1,
      });

      let logs = parseEventLogs({
        abi: gaugeAbi,
        logs: transactionReceipt.logs,
      });

      // @ts-ignore
      const amount: bigint = logs[0]?.args.amount;

      return amount;
    } catch (error) {
      console.error("Error claiming rewards:", error);
      throw error;
    }
  };

  const unstake = async (amount: bigint) => {
    const { request } = await simulateContract(config, {
      abi: gaugeAbi,
      address: GAUGE_ADDRESS,
      functionName: "withdraw",
      args: [amount],
    });

    const hash = await writeContract(config, request);

    const transactionReceipt = await waitForTransactionReceipt(config, {
      hash,
      confirmations: 1,
    });

    return transactionReceipt;
  };

  return { claimRewards, unstake, earned };
};

export default useGauge;
