// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export const AERO_ROUTER_ADDRESS = "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43";
export const LUCHE_TREASURY_ADDRESS =
  "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43"; // TODO: Add treasury address
export const FEE = 5;

const LuchaHelperModule = buildModule("LuchaHelperModule", (m) => {
  const luchaHelper = m.contract("LuchaHelper", [
    AERO_ROUTER_ADDRESS,
    LUCHE_TREASURY_ADDRESS,
    FEE,
  ]);

  return { luchaHelper };
});

export default LuchaHelperModule;
