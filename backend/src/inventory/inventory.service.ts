import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { getStatusFromDeliveryType } from './dto/status-mapper';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateInventoryDto) {
    const inventory = await this.prisma.inventory.create({
      data: {
        vendor: { connect: { id: data.vendorId } },
        purchaseDate: new Date(data.purchaseDate),
        purchaseInvoice: data.purchaseInvoice,
        creditTerms: data.creditTerms,
        dueDate: data.dueDate,
        invoiceNetAmount: data.invoiceNetAmount,
        gstAmount: data.gstAmount,
        invoiceGrossAmount: data.invoiceGrossAmount,
        status: data.status,
      },
    });

    if (data.products && data.products.length > 0) {
      const productData = await Promise.all(
        data.products.map(async (product) => {
          const existingProduct = await this.prisma.product.findUnique({
            where: { id: product.productId },
          });

          if (!existingProduct) {
            throw new Error(`Product with productId ${product.productId} not found`);
          }

          return {
            productId: existingProduct.id,
            inventoryId: inventory.id,
            serialNumber: product.serialNumber,
            macAddress: product.macAddress,
            warrantyPeriod: product.warrantyPeriod,
            purchaseRate: product.purchaseRate,
          };
        })
      );

      await this.prisma.productInventory.createMany({
        data: productData,
      });
    }

    return inventory;
  }

 // Ensure that the inventory update logic is correctly updating the fields
async update(id: number, data: UpdateInventoryDto) {
  const inventory = await this.prisma.inventory.findUnique({ where: { id } });
  if (!inventory) throw new NotFoundException('Inventory not found');

  const { vendorId, purchaseDate, purchaseInvoice, creditTerms, products } = data;

  const updatedInventoryData: any = {
    updatedAt: new Date(),
  };

  // Update fields only if they are provided in the request
  if (purchaseDate) updatedInventoryData.purchaseDate = new Date(purchaseDate);
  if (purchaseInvoice) updatedInventoryData.purchaseInvoice = purchaseInvoice;
  if (creditTerms) updatedInventoryData.creditTerms = creditTerms; // This line ensures the creditTerms field gets updated

  if (vendorId) updatedInventoryData.vendor = { connect: { id: vendorId } };

  // Perform the update operation
  await this.prisma.inventory.update({
    where: { id },
    data: updatedInventoryData,
  });

  // Handle products update (similar to what you have)
  if (products && products.length > 0) {
    const existingProductInventory = await this.prisma.productInventory.findMany({
      where: { inventoryId: id },
    });

    const productUpdates = products.map(async (product) => {
      const productInventory = existingProductInventory.find(
        (pi) => pi.productId === product.productId
      );

      if (productInventory) {
        return this.prisma.productInventory.update({
          where: { id: productInventory.id },
          data: {
            serialNumber: product.serialNumber ?? productInventory.serialNumber,
            macAddress: product.macAddress ?? productInventory.macAddress,
            warrantyPeriod: product.warrantyPeriod ?? productInventory.warrantyPeriod,
            purchaseRate: product.purchaseRate ?? productInventory.purchaseRate,
          },
        });
      } else {
        return this.prisma.productInventory.create({
          data: {
            productId: product.productId,
            inventoryId: id,
            serialNumber: product.serialNumber,
            macAddress: product.macAddress,
            warrantyPeriod: product.warrantyPeriod,
            purchaseRate: product.purchaseRate,
          },
        });
      }
    });

    await Promise.all(productUpdates);
  }

  return this.findOne(id);
}



  async updateStatusBySerialOrMac(serialNumber: string, macAddress: string, deliveryType: string) {
  const status = getStatusFromDeliveryType(deliveryType);

  const inventory = await this.prisma.inventory.findFirst({
    where: {
      OR: [
        {
          products: {
            some: {
              serialNumber: serialNumber ?? undefined,
              macAddress: macAddress ?? undefined,
            },
          },
        },
      ],
    },
  });

  if (!inventory) {
    throw new NotFoundException(`No inventory found for Serial: ${serialNumber} or MAC: ${macAddress}`);
  }

  return this.prisma.inventory.update({
    where: { id: inventory.id },
    data: { status },
  });
}


  async findAll() {
    return this.prisma.inventory.findMany({
    include: {
  products: {
    include: {
      product: true
    }
  },
  vendor: true
}
    });
  }

  async findOne(id: number) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { id },
include: {
  products: {
    include: {
      product: true
    }
  },
  vendor: true
}
    });
    if (!inventory) throw new NotFoundException('Inventory not found');
    return inventory;
  }

  

  async remove(id: number) {
    const inventory = await this.prisma.inventory.findUnique({ where: { id } });
    if (!inventory) throw new NotFoundException('Inventory not found');

    await this.prisma.productInventory.deleteMany({ where: { inventoryId: id } });

    return this.prisma.inventory.delete({ where: { id } });
  }
}
