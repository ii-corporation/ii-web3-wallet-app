import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

/**
 * DTO for creating a Safe wallet
 */
export class CreateSafeDto {
  @IsString()
  @IsNotEmpty()
  userWalletId: string;

  @IsString()
  @IsNotEmpty()
  ownerAddress: string;

  @IsNumber()
  @IsOptional()
  saltNonce?: number;
}
