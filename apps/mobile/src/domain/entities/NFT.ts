/**
 * NFT Entity
 * NFT domain model
 */

export interface NFT {
  id: string;
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  thumbnailUrl?: string;
  ownerAddress: string;
  contractAddress: string;
  network: string;
  mintedAt: string;
  serialNumber?: number;
  attributes?: NFTAttribute[];
}

export interface NFTAttribute {
  traitType: string;
  value: string | number;
  displayType?: "string" | "number" | "date";
}

export interface NFTCollection {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  nftCount: number;
}

/**
 * Format serial number for display
 */
export function formatSerialNumber(serialNumber: number): string {
  return `#${serialNumber.toLocaleString()}`;
}

/**
 * Truncate NFT name for display
 */
export function truncateNFTName(name: string, maxLength: number = 20): string {
  if (name.length <= maxLength) return name;
  return `${name.slice(0, maxLength - 3)}...`;
}
