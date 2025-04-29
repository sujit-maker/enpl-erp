import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateInventoryDto) {
    return this.prisma.inventory.create({
      data: {
        productId: Number(data.productId),
        vendorId: Number(data.vendorId),
        serialNumber: data.serialNumber,
        macAddress: data.macAddress,
        purchaseDate: new Date(data.purchaseDate),
        purchaseInvoice: data.purchaseInvoice,
      },
    });
  }

  async findAll() {
    return this.prisma.inventory.findMany({
      include: { product: true, vendor: true },
    });
  }

  async findOne(id: number) {
    const inventory = await this.prisma.inventory.findUnique({ where: { id } });
    if (!inventory) throw new NotFoundException('Inventory not found');
    return inventory;
  }

  async update(id: number, data: UpdateInventoryDto) {
    const inventory = await this.prisma.inventory.findUnique({ where: { id } });
    if (!inventory) throw new NotFoundException('Inventory not found');
  
    const {
      productId,
      vendorId,
      serialNumber,
      macAddress,
      purchaseDate,
      purchaseInvoice,
    } = data;
  
    return this.prisma.inventory.update({
      where: { id },
      data: {
        serialNumber,
        macAddress,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        purchaseInvoice,
        // for product relation
        product: productId ? { connect: { id: productId } } : undefined,
        // for vendor relation
        vendor: vendorId ? { connect: { id: vendorId } } : undefined,
        updatedAt: new Date(), // update the timestamp manually if needed
      },
    });
  }
  

  async remove(id: number) {
    const inventory = await this.prisma.inventory.findUnique({ where: { id } });
    if (!inventory) throw new NotFoundException('Inventory not found');
    return this.prisma.inventory.delete({ where: { id } });
  }
}
