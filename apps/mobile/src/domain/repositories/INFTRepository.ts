/**
 * NFT Repository Interface
 * Defines the contract for NFT operations
 */

import { NFT, NFTCollection } from "../entities/NFT";
import { PaginatedResponse } from "../dto/common.dto";

export interface IFTRepository {
  /**
   * Get user's NFTs
   */
  getUserNFTs(limit?: number, offset?: number): Promise<PaginatedResponse<NFT>>;

  /**
   * Get NFT by ID
   */
  getNFT(nftId: string): Promise<NFT>;

  /**
   * Get NFT by token ID and contract
   */
  getNFTByToken(contractAddress: string, tokenId: string): Promise<NFT>;

  /**
   * Get user's NFT collections
   */
  getCollections(): Promise<NFTCollection[]>;
}
