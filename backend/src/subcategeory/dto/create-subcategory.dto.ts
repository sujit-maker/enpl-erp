// create-subcategory.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateSubCategoryDto {
  @IsOptional()
  @IsString()
  subCategoryName: string;

  @IsOptional()
  @IsNumber()
  categoryId: number; 
}
