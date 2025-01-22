import { erc20Abi, type Address } from "viem";
import { config } from "@/config";
import {
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
  getBalance as getEthBalance,
} from "@wagmi/core";
import { useAccount } from "wagmi";
import { ETH_ADDRESS, MAX_UINT256 } from "@/config/contants";

const useERC20 = () => {
  const { address: userAddress } = useAccount();

  const getBalance = async (tokenAddress: Address) => {
    if (tokenAddress === ETH_ADDRESS) {
      const ethBalance = await getEthBalance(config, {
        address: userAddress ?? "0x",
      });
      return ethBalance.value;
    }
    const balance = (await readContract(config, {
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [userAddress || ETH_ADDRESS],
    })) as bigint;
    return balance;
  };

  const getAllowance = async (tokenAddress: Address, spender: Address) => {
    if (tokenAddress === ETH_ADDRESS) {
      return MAX_UINT256;
    }
    const allowance = (await readContract(config, {
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "allowance",
      args: [userAddress || ETH_ADDRESS, spender],
    })) as bigint;
    return allowance;
  };

  const approve = async (token: Address, spender: Address, amount: bigint) => {
    //Only approve if the allowance is less than the amount
    const allowance = await getAllowance(token, spender);
    if (allowance < amount) {
      const { request } = await simulateContract(config, {
        abi: erc20Abi,
        address: token,
        functionName: "approve",
        args: [spender, amount],
      });

      const hash = await writeContract(config, request);

      const transactionReceipt = await waitForTransactionReceipt(config, {
        hash,
        confirmations: 1,
      });

      return transactionReceipt;
    }

    return null;
  };

  return { getBalance, getAllowance, approve };
};

export default useERC20;
