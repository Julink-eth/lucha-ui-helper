import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { config } from "@/config";
import voterAbi from "../abis/Voter.json";

const useVoter = () => {
  // Wagmi

  const VOTER_ADDRESS = "0x16613524e02ad97eDfeF371bC883F2F5d6C480A5";
  const LUCHA_RELAY_NFT_TOKEN_ID = 40953n;

  const depositToVoter = async (nftId: bigint) => {
    const { request: requestDepositToRelayer } = await simulateContract(
      config,
      {
        abi: voterAbi,
        address: VOTER_ADDRESS,
        functionName: "depositManaged",
        args: [nftId, LUCHA_RELAY_NFT_TOKEN_ID],
      }
    );

    const hash = await writeContract(config, requestDepositToRelayer);

    const transactionReceipt = await waitForTransactionReceipt(config, {
      hash,
      confirmations: 1,
    });

    return transactionReceipt;
  };

  return { depositToVoter };
};

export default useVoter;
