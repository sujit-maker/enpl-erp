import { IsInt, IsString, IsDateString, IsOptional } from 'class-validator';

export class CreateInventoryDto {
  @IsInt()
  productId: number;

  @IsInt()
  vendorId: number;

  @IsString()
  serialNumber: string;

  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  duration?: string;


  @IsString()
  macAddress: string;

  @IsDateString()
  purchaseDate: string;

  @IsString()
  purchaseInvoice: string;
}
