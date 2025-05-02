import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MaterialDeliveryItemDto {
  @IsOptional()
  @IsNumber()
  inventoryId?: number;

  @IsNumber()
  productId: number;

  @IsString()
  serialNumber: string;

  @IsString()
  macAddress: string;

  @IsString()
  productName: string;
}

export enum DeliveryType {
  Customer = 'Customer',
  Vendor = 'Vendor',
}


export class CreateMaterialDeliveryDto {
  @IsEnum(DeliveryType)
  deliveryType: DeliveryType; 

  @IsOptional()
  @IsString()
  refNumber?: string;

  @IsOptional()
  @IsNumber()
siteId?: number;

  @IsOptional()
  @IsNumber()
  customerId?: number;

  @IsOptional()
  @IsNumber()
  vendorId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MaterialDeliveryItemDto)
  materialDeliveryItems: MaterialDeliveryItemDto[];
}
