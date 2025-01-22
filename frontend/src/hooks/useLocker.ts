import lockerAbi from "../abis/Locker.json";
import { parseEventLogs } from "viem";
import { config } from "@/config";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";

const useLocker = () => {
  const LOCKER_ADDRESS = "0xeBf418Fe2512e7E6bd9b87a8F0f294aCDC67e6B4";
  const LOCK_DURATION = 126230400n;

  const createLock = async (amount: bigint) => {
    const { request: requestCreateLock } = await simulateContract(config, {
      abi: lockerAbi,
      address: LOCKER_ADDRESS,
      functionName: "createLock",
      args: [amount, LOCK_DURATION],
    });

    const hash = await writeContract(config, requestCreateLock);

    const transactionReceipt = await waitForTransactionReceipt(config, {
      hash,
      confirmations: 1,
    });

    const logs = parseEventLogs({
      abi: lockerAbi,
      logs: transactionReceipt.logs,
    });

    // @ts-ignore
    const nftId = logs[1]?.args.tokenId;

    return nftId;
  };

  return { createLock };
};

export default useLocker;
