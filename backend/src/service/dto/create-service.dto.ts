import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateServiceDto {
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
  serviceCategoryId:number;

  @IsNotEmpty()
  @IsInt()
  serviceSubCategoryId : number;
}
