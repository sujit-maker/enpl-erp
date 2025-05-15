import { IsString, IsNumber, IsDate, IsOptional, IsArray } from 'class-validator';

export class CreateInventoryDto {
  @IsNumber()
  vendorId: number;

  @IsDate()
  purchaseDate: Date;

  @IsString()
  purchaseInvoice: string;

  @IsString()
  creditTerms: string;

  @IsString()
  @IsOptional()
  dueDate: string;

  @IsString()
  invoiceNetAmount: string;

  @IsString()
  gstAmount: string;

  @IsString()
  invoiceGrossAmount: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  dueAmount?: number;
  
  @IsOptional()
  @IsString()
  duration?: string;

  @IsArray()
  products: {
    productId: number;
    make: string;
    model: string;
    serialNumber: string;
    macAddress: string;
    warrantyPeriod: string;
    purchaseRate: string;
  }[];
}
