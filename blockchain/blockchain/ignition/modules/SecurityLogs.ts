import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SecurityLogsModule = buildModule("SecurityLogsModule", (m) => {
  const securityLogs = m.contract("SecurityLogs");
  return { securityLogs };
});

export default SecurityLogsModule;