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
    const productInventoryData = await Promise.all(
      data.products.flatMap(async (product) => {
        // Validate product existence
        const existingProduct = await this.prisma.product.findUnique({
          where: { id: product.productId },
        });

        if (!existingProduct) {
          throw new Error(`Product with productId ${product.productId} not found`);
        }

        // Split serial numbers
        const serials = product.serialNumber
          .split(',')
          .map((sn) => sn.trim())
          .filter((sn) => sn !== '');

        return serials.map((serialNumber) => ({
          productId: existingProduct.id,
          make: product.make,
          model: product.model,
          inventoryId: inventory.id,
          serialNumber,
          macAddress: product.macAddress,
          warrantyPeriod: product.warrantyPeriod,
          purchaseRate: product.purchaseRate,
        }));
      })
    );

    // Flatten the nested arrays from Promise.all
    const flatProductInventoryData = productInventoryData.flat();

    await this.prisma.productInventory.createMany({
      data: flatProductInventoryData,
    });
  }

  return inventory;
}


  // Ensure that the inventory update logic is correctly updating the fields
 async update(id: number, data: UpdateInventoryDto) {
  const inventory = await this.prisma.inventory.findUnique({ where: { id } });
  if (!inventory) throw new NotFoundException('Inventory not found');

  const { vendorId, purchaseDate, purchaseInvoice, creditTerms, dueDate, invoiceNetAmount, gstAmount, invoiceGrossAmount, status, products } = data;

 const updatedInventoryData: any = {
  updatedAt: new Date().toISOString(),
};

if (purchaseDate) updatedInventoryData.purchaseDate = new Date(purchaseDate).toISOString();
if (purchaseInvoice) updatedInventoryData.purchaseInvoice = purchaseInvoice;
if (creditTerms) updatedInventoryData.creditTerms = creditTerms;
if (dueDate) updatedInventoryData.dueDate = new Date(dueDate).toISOString();
if (invoiceNetAmount !== undefined) updatedInventoryData.invoiceNetAmount = invoiceNetAmount;
if (gstAmount !== undefined) updatedInventoryData.gstAmount = gstAmount;
if (invoiceGrossAmount !== undefined) updatedInventoryData.invoiceGrossAmount = invoiceGrossAmount;
if (status) updatedInventoryData.status = status;
if (vendorId) updatedInventoryData.vendor = { connect: { id: vendorId } };


  await this.prisma.inventory.update({
    where: { id },
    data: updatedInventoryData,
  });

  if (products && products.length > 0) {
    // Delete all old productInventory entries for this inventory
    await this.prisma.productInventory.deleteMany({
      where: { inventoryId: id },
    });

    const productInventoryData = await Promise.all(
      products.flatMap(async (product) => {
        const existingProduct = await this.prisma.product.findUnique({
          where: { id: product.productId },
        });

        if (!existingProduct) {
          throw new Error(`Product with productId ${product.productId} not found`);
        }

        const serials = product.serialNumber
          .split(',')
          .map((sn) => sn.trim())
          .filter((sn) => sn !== '');

        return serials.map((serialNumber) => ({
          productId: existingProduct.id,
          make: product.make,
          model: product.model,
          inventoryId: id,
          serialNumber,
          macAddress: product.macAddress,
          warrantyPeriod: product.warrantyPeriod,
          purchaseRate: product.purchaseRate,
        }));
      })
    );

    const flatProductInventoryData = productInventoryData.flat();

    await this.prisma.productInventory.createMany({
      data: flatProductInventoryData,
    });
  }

  return this.findOne(id);
}

  async updateStatusBySerialOrMac(
    serialNumber: string,
    macAddress: string,
    deliveryType: string,
  ) {
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
      throw new NotFoundException(
        `No inventory found for Serial: ${serialNumber} or MAC: ${macAddress}`,
      );
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
            product: true,
          },
        },
        vendor: true,
      },
    });
  }

  async findOne(id: number) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: true,
          },
        },
        vendor: true,
      },
    });
    if (!inventory) throw new NotFoundException('Inventory not found');
    return inventory;
  }

  async remove(id: number) {
    const inventory = await this.prisma.inventory.findUnique({ where: { id } });
    if (!inventory) throw new NotFoundException('Inventory not found');

    await this.prisma.productInventory.deleteMany({
      where: { inventoryId: id },
    });

    return this.prisma.inventory.delete({ where: { id } });
  }
}
