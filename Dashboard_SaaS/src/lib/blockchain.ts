/**
 * Mock Polygon blockchain recording service.
 * Simulates tx submission with realistic delays and hash generation.
 */

export interface BlockchainTransaction {
  txHash: string;
  blockNumber: number;
  network: "polygon-mainnet";
  timestamp: number;
  gasUsed: string;
  status: "confirmed";
}

function generateTxHash(): string {
  return (
    "0x" +
    Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")
  );
}

export async function recordOnBlockchain(
  fileHash: string,
  metadata: { certId: string; studentId: string; issuer: string }
): Promise<BlockchainTransaction> {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

  return {
    txHash: generateTxHash(),
    blockNumber: 50_000_000 + Math.floor(Math.random() * 1_000_000),
    network: "polygon-mainnet",
    timestamp: Date.now(),
    gasUsed: (21000 + Math.floor(Math.random() * 30000)).toString(),
    status: "confirmed",
  };
}

export function getPolygonScanUrl(txHash: string): string {
  return `https://polygonscan.com/tx/${txHash}`;
}

export function shortenHash(hash: string, chars = 6): string {
  if (!hash) return "";
  return `${hash.slice(0, chars + 2)}…${hash.slice(-chars)}`;
}
