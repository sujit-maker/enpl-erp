import { IsInt, IsString, IsDateString, IsOptional } from 'class-validator';

export class UpdateInventoryDto {
  @IsOptional()
  @IsInt()
  productId?: number;

  @IsOptional()
  @IsInt()
  vendorId?: number;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  macAddress?: string;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsString()
  purchaseInvoice?: string;
}
