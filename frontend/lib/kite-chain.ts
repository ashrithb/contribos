export const KITE_TESTNET = {
  id: 2368,
  name: "Kite AI Testnet",
  rpcUrl: "https://rpc-testnet.gokite.ai/",
  explorerUrl: "https://testnet.kitescan.ai",
  faucetUrl: "https://faucet.gokite.ai",
  testUSDT: "0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63",
  nativeCurrency: {
    name: "KITE",
    symbol: "KITE",
    decimals: 18,
  },
};

export function getExplorerTxUrl(txHash: string): string {
  return `${KITE_TESTNET.explorerUrl}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${KITE_TESTNET.explorerUrl}/address/${address}`;
}
