import { parseEventLogs, type Address, type TransactionReceipt } from "viem";
import { config } from "@/config";
import {
  readContract,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import routerAbi from "@/abis/Router.json";
import poolAbi from "@/abis/Pool.json";
import { useAccount } from "wagmi";
import {
  AERO_FACTORY_ADDRESS,
  AERO_ROUTER_ADDRESS,
  ETH_ADDRESS,
  LUCHA_ADDRESS,
  LUCHA_HELPER_ADDRESS,
  WETH_ADDRESS,
} from "@/config/contants";
import { applySlippage } from "@/utils/utils";
const useRouter = () => {
  const { address: userAddress } = useAccount();

  const getPoolAddress = async (
    tokenA: Address,
    tokenB: Address
  ): Promise<Address> => {
    const poolAddress = (await readContract(config, {
      address: AERO_ROUTER_ADDRESS,
      abi: routerAbi,
      functionName: "poolFor",
      args: [tokenA, tokenB, false, AERO_FACTORY_ADDRESS],
    })) as Address;
    return poolAddress;
  };

  const getAmountOut = async (
    amountIn: bigint,
    tokenIn: Address,
    poolAddress: Address
  ): Promise<bigint> => {
    const amountOut = (await readContract(config, {
      address: poolAddress,
      abi: poolAbi,
      functionName: "getAmountOut",
      args: [amountIn, tokenIn],
    })) as bigint;
    return amountOut;
  };

  const getAmountsOut = async (
    amountIn: bigint,
    tokenIn: Address,
    tokenOut: Address
  ): Promise<bigint[]> => {
    const amountsOut = (await readContract(config, {
      address: AERO_ROUTER_ADDRESS,
      abi: routerAbi,
      functionName: "getAmountsOut",
      args: [
        amountIn,
        [
          {
            from: tokenIn,
            to: tokenOut,
            stable: false,
            factory: AERO_FACTORY_ADDRESS,
          },
        ],
      ],
    })) as bigint[];
    return amountsOut;
  };

  const getAmountsFromReceipt = async (txReceipt: TransactionReceipt) => {
    const logs = parseEventLogs({
      abi: routerAbi,
      eventName: "Swap",
      logs: txReceipt.logs,
    });

    console.log({ logs });

    // @ts-ignore
    const amountTokenA = logs[0]?.args.amount0;
    // @ts-ignore
    const amountTokenB = logs[0]?.args.amount1;

    return { amountTokenA, amountTokenB };
  };

  const generateZapInParams = async (token: Address, tokenAmount: bigint) => {
    const amountInA = tokenAmount / 2n;
    const amountInB = amountInA;
    const routeA =
      token === ETH_ADDRESS || token === WETH_ADDRESS
        ? []
        : [
            {
              from: token,
              to: WETH_ADDRESS,
              stable: false,
              factory: AERO_FACTORY_ADDRESS,
            },
          ];
    const routeB =
      token === ETH_ADDRESS || token === WETH_ADDRESS
        ? [
            {
              from: WETH_ADDRESS,
              to: LUCHA_ADDRESS,
              stable: false,
              factory: AERO_FACTORY_ADDRESS,
            },
          ]
        : [
            {
              from: token,
              to: WETH_ADDRESS,
              stable: false,
              factory: AERO_FACTORY_ADDRESS,
            },
            {
              from: WETH_ADDRESS,
              to: LUCHA_ADDRESS,
              stable: false,
              factory: AERO_FACTORY_ADDRESS,
            },
          ];
    return (await readContract(config, {
      address: AERO_ROUTER_ADDRESS,
      abi: routerAbi,
      functionName: "generateZapInParams",
      args: [
        WETH_ADDRESS,
        LUCHA_ADDRESS,
        false,
        AERO_FACTORY_ADDRESS,
        amountInA,
        amountInB,
        routeA,
        routeB,
      ],
    })) as bigint[];
  };

  const quoteRemoveLiquidity = async (
    tokenA: Address,
    tokenB: Address,
    liquidity: bigint
  ) => {
    return (await readContract(config, {
      address: AERO_ROUTER_ADDRESS,
      abi: routerAbi,
      functionName: "quoteRemoveLiquidity",
      args: [tokenA, tokenB, false, AERO_FACTORY_ADDRESS, liquidity],
    })) as bigint[];
  };

  const swapERC20ForERC20 = async (
    tokenA: Address,
    tokenB: Address,
    amountIn: bigint
  ) => {
    const poolAddress = await getPoolAddress(tokenA, tokenB);
    const amountOutMin = applySlippage(
      await getAmountOut(amountIn, tokenA, poolAddress)
    );
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now

    const { request } = await simulateContract(config, {
      abi: routerAbi,
      address: AERO_ROUTER_ADDRESS,
      functionName: "swapExactTokensForTokens",
      args: [
        amountIn,
        amountOutMin,
        [
          {
            from: tokenA,
            to: tokenB,
            stable: false,
            factory: AERO_FACTORY_ADDRESS,
          },
        ],
        userAddress,
        deadline,
      ],
    });

    const hash = await writeContract(config, request);

    const transactionReceipt = await waitForTransactionReceipt(config, {
      hash,
      confirmations: 1,
    });

    return transactionReceipt;
  };

  const swapERC20ForETH = async (tokenA: Address, amountIn: bigint) => {
    const poolAddress = await getPoolAddress(tokenA, WETH_ADDRESS);
    const amountOutMin = applySlippage(
      await getAmountOut(amountIn, tokenA, poolAddress)
    );
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now

    const { request } = await simulateContract(config, {
      abi: routerAbi,
      address: AERO_ROUTER_ADDRESS,
      functionName: "swapExactTokensForETH",
      args: [
        amountIn,
        amountOutMin,
        [
          {
            from: tokenA,
            to: WETH_ADDRESS,
            stable: false,
            factory: AERO_FACTORY_ADDRESS,
          },
        ],
        userAddress,
        deadline,
      ],
    });

    const hash = await writeContract(config, request);

    const transactionReceipt = await waitForTransactionReceipt(config, {
      hash,
      confirmations: 1,
    });

    return transactionReceipt;
  };

  const swapETHForERC20 = async (tokenB: Address, amountIn: bigint) => {
    const poolAddress = await getPoolAddress(WETH_ADDRESS, tokenB);
    const amountOutMin = applySlippage(
      await getAmountOut(amountIn, WETH_ADDRESS, poolAddress)
    );
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now

    const { request } = await simulateContract(config, {
      abi: routerAbi,
      address: AERO_ROUTER_ADDRESS,
      functionName: "swapExactETHForTokens",
      args: [
        amountIn,
        amountOutMin,
        [
          {
            from: WETH_ADDRESS,
            to: tokenB,
            stable: false,
            factory: AERO_FACTORY_ADDRESS,
          },
        ],
        userAddress,
        deadline,
      ],
    });

    const hash = await writeContract(config, request);

    const transactionReceipt = await waitForTransactionReceipt(config, {
      hash,
      confirmations: 1,
    });

    return transactionReceipt;
  };

  const addLiquidityETH = async (
    token: Address,
    amountToken: bigint,
    amountETH: bigint
  ) => {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now

    const { request } = await simulateContract(config, {
      abi: routerAbi,
      address: AERO_ROUTER_ADDRESS,
      functionName: "addLiquidityETH",
      args: [
        token,
        false,
        amountToken,
        amountToken,
        amountETH,
        userAddress,
        deadline,
      ],
      value: amountETH,
    });

    const hash = await writeContract(config, request);

    const transactionReceipt = await waitForTransactionReceipt(config, {
      hash,
      confirmations: 1,
    });

    return transactionReceipt;
  };

  const removeLiquidity = async (
    tokenA: Address,
    tokenB: Address,
    liquidity: bigint
  ) => {
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now
    const quotedAmount = await quoteRemoveLiquidity(tokenA, tokenB, liquidity);
    const amountAMin = applySlippage(quotedAmount[0] ?? 0n);
    const amountBMin = applySlippage(quotedAmount[1] ?? 0n);
    const { request } = await simulateContract(config, {
      abi: routerAbi,
      address: AERO_ROUTER_ADDRESS,
      functionName: "removeLiquidity",
      args: [
        tokenA,
        tokenB,
        false,
        liquidity,
        amountAMin,
        amountBMin,
        userAddress,
        deadline,
      ],
    });

    const hash = await writeContract(config, request);

    const transactionReceipt = await waitForTransactionReceipt(config, {
      hash,
      confirmations: 1,
    });

    return transactionReceipt;
  };

  const zapIn = async (tokenIn: Address, tokenAmount: bigint) => {
    const zapInParams = await generateZapInParams(tokenIn, tokenAmount);
    const amountInA = tokenAmount / 2n;
    const amountInB = amountInA;
    zapInParams[0] = applySlippage(zapInParams[0] ?? 0n);
    zapInParams[1] = applySlippage(zapInParams[1] ?? 0n);
    zapInParams[2] = applySlippage(zapInParams[2] ?? 0n);
    zapInParams[3] = applySlippage(zapInParams[3] ?? 0n);

    const routeA =
      tokenIn === ETH_ADDRESS || tokenIn === WETH_ADDRESS
        ? []
        : [
            {
              from: tokenIn,
              to: WETH_ADDRESS,
              stable: false,
              factory: AERO_FACTORY_ADDRESS,
            },
          ];
    const routeB =
      tokenIn === ETH_ADDRESS || tokenIn === WETH_ADDRESS
        ? [
            {
              from: WETH_ADDRESS,
              to: LUCHA_ADDRESS,
              stable: false,
              factory: AERO_FACTORY_ADDRESS,
            },
          ]
        : [
            {
              from: tokenIn,
              to: WETH_ADDRESS,
              stable: false,
              factory: AERO_FACTORY_ADDRESS,
            },
            {
              from: WETH_ADDRESS,
              to: LUCHA_ADDRESS,
              stable: false,
              factory: AERO_FACTORY_ADDRESS,
            },
          ];

    const { request } = await simulateContract(config, {
      abi: routerAbi,
      address: LUCHA_HELPER_ADDRESS,
      functionName: "zapIn",
      args: [
        tokenIn,
        amountInA,
        amountInB,
        {
          tokenA: WETH_ADDRESS,
          tokenB: LUCHA_ADDRESS,
          stable: false,
          factory: AERO_FACTORY_ADDRESS,
          amountOutMinA: zapInParams[0],
          amountOutMinB: zapInParams[1],
          amountAMin: zapInParams[2],
          amountBMin: zapInParams[3],
        },
        routeA,
        routeB,
        userAddress,
        true,
      ],
      value: tokenIn === ETH_ADDRESS ? tokenAmount : 0n,
    });

    const hash = await writeContract(config, request);

    const transactionReceipt = await waitForTransactionReceipt(config, {
      hash,
      confirmations: 1,
    });

    return transactionReceipt;
  };

  return {
    zapIn,
    swapERC20ForERC20,
    swapERC20ForETH,
    swapETHForERC20,
    addLiquidityETH,
    removeLiquidity,
    getAmountsOut,
    getAmountsFromReceipt,
    generateZapInParams,
    quoteRemoveLiquidity,
  };
};

export default useRouter;
