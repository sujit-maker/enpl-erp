import { IsIn, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UpdateServiceDto {
  @IsNotEmpty()
  @IsString()
  serviceName: string;

  @IsNotEmpty()
  @IsString()
  serviceDescription: string;

  @IsNotEmpty()
  @IsString()
  SAC: string;

  @IsNotEmpty()
  @IsInt()
  departmentId: number;

   @IsNotEmpty()
    @IsInt()
    serviceCategoryId?:number;
  
    @IsNotEmpty()
    @IsInt()
    serviceSubCategoryId?: number;
}
