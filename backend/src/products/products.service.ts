import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private extractCodeFromName(name: string): string {
    const match = name.match(/\((.*?)\)/);
    if (match && match[1]) {
      return match[1].trim().toUpperCase(); // Example: (RTR) → RTR
    }
  
    // fallback: first letters of each word
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 3); // e.g., Networking Active → NWA
  }
  
  async createProduct(createProductDto: CreateProductDto) {
    const { productName, productDescription, HSN, categoryId, subCategoryId } =
      createProductDto;
  
    // Find Category
    const category = await this.prisma.category.findUnique({
      where: { id: Number(categoryId) },
    });
    if (!category) throw new NotFoundException('Category not found');
  
    // Find SubCategory (optional)
    const subCategory = subCategoryId
      ? await this.prisma.subCategory.findUnique({
          where: { id: Number(subCategoryId) },
        })
      : null;
  
    // Generate codes
    const categoryCode = this.extractCodeFromName(category.categoryName);
    const subCategoryCode = subCategory
      ? this.extractCodeFromName(subCategory.subCategoryName)
      : 'GEN'; // General if no subcategory
  
    // Base ID only from Category
    const baseProductId = `${categoryCode}`;
  
    // Find existing products starting with CategoryCode
    const existingProducts = await this.prisma.product.findMany({
      where: {
        productId: {
          startsWith: `${baseProductId}-`,
          mode: 'insensitive',
        },
      },
    });
  
    // Find maximum number suffix
    let maxSuffix = 0;
    for (const product of existingProducts) {
      const match = product.productId.match(/-(\d{2,})$/);
      if (match) {
        const suffix = parseInt(match[1], 10);
        if (suffix > maxSuffix) {
          maxSuffix = suffix;
        }
      }
    }
  
    // Next number
    const nextNumber = maxSuffix + 1;
    const padded = String(nextNumber).padStart(2, '0');
  
    // Final productId
    const productId = `${baseProductId}-${subCategoryCode}-${padded}`;
  
    // Create product
    try {
      return await this.prisma.product.create({
        data: {
          productId,
          productName,
          productDescription,
          HSN,
          categoryId: Number(categoryId),
          subCategoryId: subCategoryId ? Number(subCategoryId) : null,
        },
      });
    } catch (error) {
      console.error('Failed to create product:', error);
      throw new BadRequestException('Failed to create product');
    }
  }
  

  async getProducts() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        subCategory: true,
      },
    });
  }

  async getProductById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        subCategory: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async updateProduct(id: number, updateProductDto: UpdateProductDto) {
    try {
      const {
        productId,
        productName,
        productDescription,
        HSN,
        categoryId,
        subCategoryId,
      } = updateProductDto;

      const productIdNumber = Number(id);
      const categoryNumber = Number(categoryId);
      const subCategoryNumber = subCategoryId ? Number(subCategoryId) : null;

      if (isNaN(productIdNumber)) {
        throw new BadRequestException('Invalid product ID');
      }

      return await this.prisma.product.update({
        where: { id: productIdNumber },
        data: {
          productId,
          productName,
          productDescription,
          HSN,
          categoryId: categoryNumber,
          subCategoryId: subCategoryNumber,
        },
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw new BadRequestException(`Failed to update product: ${error.message}`);
    }
  }

  async deleteProduct(id: number) {
    return this.prisma.product.delete({
      where: {
        id: Number(id),
      },
    });
  }
}
