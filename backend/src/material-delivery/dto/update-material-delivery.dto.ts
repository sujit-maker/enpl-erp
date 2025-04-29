import { IsInt, IsString, IsOptional, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateMaterialDeliveryItemDto {
  @IsInt()
  @IsNotEmpty()
  inventoryId: number;

  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @IsString()
  @IsNotEmpty()
  macAddress: string;

  @IsString()
  @IsNotEmpty()
  productName: string;

  @IsOptional()
  id?: number; // optional if updating existing items
}


export class UpdateMaterialDeliveryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  deliveryType?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  deliveryChallan?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  refNumber?: string;

  @IsOptional()
  @IsInt()
  customerId?: number;

  @IsOptional()
  @IsInt()
  vendorId?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMaterialDeliveryItemDto)
  materialDeliveryItems?: UpdateMaterialDeliveryItemDto[];
}
