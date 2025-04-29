import { IsInt, IsString, IsDateString } from 'class-validator';

export class CreateInventoryDto {
  @IsInt()
  productId: number;

  @IsInt()
  vendorId: number;

  @IsString()
  serialNumber: string;

  @IsString()
  macAddress: string;

  @IsDateString()
  purchaseDate: string;

  @IsString()
  purchaseInvoice: string;
}
