import { cookieStorage, createStorage } from "@wagmi/core";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { base, type AppKitNetwork, hardhat } from "@reown/appkit/networks";

export const projectId = process.env["NEXT_PUBLIC_PROJECT_ID"];

if (!projectId) {
  throw new Error("Project ID is not defined");
}

export const networks = [base, hardhat] as [AppKitNetwork, ...AppKitNetwork[]];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  networks,
  projectId,
});

export const config = wagmiAdapter.wagmiConfig;
