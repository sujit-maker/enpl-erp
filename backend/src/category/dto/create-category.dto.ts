import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  categoryName: string;

  @IsNotEmpty()
  @IsString()
  subCategories: { subCategoryName: string }[];
}
