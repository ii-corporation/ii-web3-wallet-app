import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createPublicClient,
  createWalletClient,
  http,
  PublicClient,
  WalletClient,
  Address,
  Hex,
} from 'viem';
import { privateKeyToAccount, PrivateKeyAccount } from 'viem/accounts';
import { hedera, hederaTestnet } from 'viem/chains';
import {
  ZOOP_SAFE_FACTORY_ABI,
  EIP712_DOMAIN,
  CREATE_WALLET_TYPES,
  LOW_BALANCE_THRESHOLD,
  CRITICAL_BALANCE_THRESHOLD,
  MIN_BALANCE_FOR_TX,
} from '../constants';
import { SafeDeploymentResult, RelayerHealth } from '../interfaces';

@Injectable()
export class SafeFactoryService implements OnModuleInit {
  private readonly logger = new Logger(SafeFactoryService.name);
  private publicClient: PublicClient;
  private walletClient: WalletClient;
  private relayerAccount: PrivateKeyAccount;
  private factoryAddress: Address | undefined;
  private chainId: number;
  private chain: typeof hedera | typeof hederaTestnet;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const network = this.configService.get<string>('HEDERA_NETWORK', 'testnet');
    const rpcUrl = this.configService.get<string>(
      'HEDERA_JSON_RPC_URL',
      'https://testnet.hashio.io/api',
    );
    this.chainId = this.configService.get<number>('HEDERA_CHAIN_ID', 296);
    this.factoryAddress = this.configService.get<Address>('SAFE_FACTORY_ADDRESS');

    const relayerPrivateKey = this.configService.get<Hex>(
      'SAFE_FACTORY_RELAYER_PRIVATE_KEY',
    );

    if (!this.factoryAddress) {
      this.logger.warn('SAFE_FACTORY_ADDRESS not configured - Safe creation disabled');
      return;
    }

    if (!relayerPrivateKey) {
      this.logger.warn(
        'SAFE_FACTORY_RELAYER_PRIVATE_KEY not configured - Safe creation disabled',
      );
      return;
    }

    // Setup viem clients
    this.chain = network === 'mainnet' ? hedera : hederaTestnet;

    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(rpcUrl),
    });

    this.relayerAccount = privateKeyToAccount(relayerPrivateKey);
    this.walletClient = createWalletClient({
      account: this.relayerAccount,
      chain: this.chain,
      transport: http(rpcUrl),
    });

    this.logger.log(`SafeFactoryService initialized`);
    this.logger.log(`  Network: ${network}`);
    this.logger.log(`  Factory: ${this.factoryAddress}`);
    this.logger.log(`  Relayer: ${this.relayerAccount.address}`);
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return (
      !!this.factoryAddress &&
      !!this.relayerAccount &&
      !!this.publicClient &&
      !!this.walletClient
    );
  }

  /**
   * Compute the predicted Safe address before deployment
   */
  async computeWalletAddress(
    ownerAddress: Address,
    saltNonce: bigint,
  ): Promise<Address> {
    if (!this.isConfigured()) {
      throw new Error('SafeFactoryService not properly configured');
    }

    const predictedAddress = await this.publicClient.readContract({
      address: this.factoryAddress!,
      abi: ZOOP_SAFE_FACTORY_ABI,
      functionName: 'computeWalletAddress',
      args: [ownerAddress, saltNonce],
    });

    return predictedAddress as Address;
  }

  /**
   * Check if an owner already has a wallet
   */
  async hasWallet(ownerAddress: Address): Promise<{ hasWallet: boolean; walletAddress: Address }> {
    if (!this.isConfigured()) {
      throw new Error('SafeFactoryService not properly configured');
    }

    const result = await this.publicClient.readContract({
      address: this.factoryAddress!,
      abi: ZOOP_SAFE_FACTORY_ABI,
      functionName: 'hasWallet',
      args: [ownerAddress],
    });

    return {
      hasWallet: result[0] as boolean,
      walletAddress: result[1] as Address,
    };
  }

  /**
   * Create a Safe wallet for an owner (relayer pays gas)
   */
  async createSafe(
    ownerAddress: Address,
    saltNonce: bigint,
  ): Promise<SafeDeploymentResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'SafeFactoryService not properly configured',
      };
    }

    try {
      this.logger.log(`Creating Safe for owner: ${ownerAddress}`);
      this.logger.log(`  Salt Nonce: ${saltNonce}`);

      // First check if wallet already exists
      const { hasWallet, walletAddress } = await this.hasWallet(ownerAddress);
      if (hasWallet) {
        this.logger.log(`  Wallet already exists: ${walletAddress}`);
        return {
          success: true,
          safeAddress: walletAddress,
        };
      }

      // Compute predicted address
      const predictedAddress = await this.computeWalletAddress(ownerAddress, saltNonce);
      this.logger.log(`  Predicted Address: ${predictedAddress}`);

      // Create the Safe
      const txHash = await this.walletClient.writeContract({
        address: this.factoryAddress!,
        abi: ZOOP_SAFE_FACTORY_ABI,
        functionName: 'createWallet',
        args: [ownerAddress, saltNonce],
        chain: this.chain,
        account: this.relayerAccount,
      });

      this.logger.log(`  Transaction Hash: ${txHash}`);

      // Wait for transaction confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({
        hash: txHash,
        timeout: 120_000, // 2 minutes for Hedera
      });

      if (receipt.status === 'success') {
        this.logger.log(`  Safe created successfully at: ${predictedAddress}`);
        return {
          success: true,
          safeAddress: predictedAddress,
          txHash,
        };
      } else {
        this.logger.error(`  Transaction failed`);
        return {
          success: false,
          txHash,
          error: 'Transaction reverted',
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`  Safe creation failed: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get the EIP-712 domain for signing
   */
  getEIP712Domain() {
    return {
      ...EIP712_DOMAIN,
      chainId: this.chainId,
      verifyingContract: this.factoryAddress,
    };
  }

  /**
   * Get the EIP-712 types for CreateWallet
   */
  getCreateWalletTypes() {
    return CREATE_WALLET_TYPES;
  }

  /**
   * Generate a unique salt nonce for a user
   */
  generateSaltNonce(ownerAddress: Address, timestamp: number = Date.now()): bigint {
    const combined = `${ownerAddress}${timestamp}`;
    let hash = 0n;
    for (let i = 0; i < combined.length; i++) {
      const char = BigInt(combined.charCodeAt(i));
      hash = (hash << 5n) - hash + char;
      hash &= 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn;
    }
    return hash;
  }

  /**
   * Get the relayer's current balance
   */
  async getRelayerBalance(): Promise<bigint> {
    if (!this.isConfigured()) {
      throw new Error('SafeFactoryService not properly configured');
    }

    return this.publicClient.getBalance({
      address: this.relayerAccount.address,
    });
  }

  /**
   * Get relayer health status with balance info
   */
  async getRelayerHealth(): Promise<RelayerHealth> {
    if (!this.isConfigured()) {
      return {
        address: '0x0' as Address,
        balance: 0n,
        balanceHbar: '0',
        isLow: true,
        isCritical: true,
        canProcessJobs: false,
      };
    }

    const balance = await this.getRelayerBalance();
    const balanceHbar = (Number(balance) / 1e18).toFixed(4);
    const isLow = balance < LOW_BALANCE_THRESHOLD;
    const isCritical = balance < CRITICAL_BALANCE_THRESHOLD;
    const canProcessJobs = balance >= MIN_BALANCE_FOR_TX;

    if (isCritical) {
      this.logger.error(
        `CRITICAL: Relayer balance is critically low: ${balanceHbar} HBAR. Safe creation will fail!`,
      );
    } else if (isLow) {
      this.logger.warn(
        `WARNING: Relayer balance is low: ${balanceHbar} HBAR. Please top up soon.`,
      );
    }

    return {
      address: this.relayerAccount.address,
      balance,
      balanceHbar,
      isLow,
      isCritical,
      canProcessJobs,
    };
  }

  /**
   * Check if relayer has enough balance to process a Safe creation
   */
  async canProcessSafeCreation(): Promise<boolean> {
    try {
      const health = await this.getRelayerHealth();
      return health.canProcessJobs;
    } catch {
      return false;
    }
  }

  /**
   * Get relayer address
   */
  getRelayerAddress(): Address | null {
    return this.relayerAccount?.address || null;
  }
}
