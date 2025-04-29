import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMaterialDeliveryDto } from './dto/create-material-delivery.dto';
import { UpdateMaterialDeliveryDto } from './dto/update-material-delivery.dto';
import { MaterialDelivery } from '@prisma/client';

@Injectable()
export class MaterialDeliveryService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMaterialDeliveryDto): Promise<MaterialDelivery> { 
    try {
      // Validate if materialDeliveryItems are provided and correctly structured
      if (!data.materialDeliveryItems || data.materialDeliveryItems.length === 0) {
        throw new Error("Material delivery items are required.");
      }
  
      // Get the last delivery challan number
      const lastEntry = await this.prisma.materialDelivery.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { deliveryChallan: true },
        where: {
          deliveryChallan: {
            startsWith: 'EN-MDN-',
          },
        },
      });
  
      let nextNumber = 1;
      if (lastEntry?.deliveryChallan) {
        const lastNumber = parseInt(lastEntry.deliveryChallan.split('EN-MDN-')[1]);
        if (!isNaN(lastNumber)) {
          nextNumber = lastNumber + 1;
        }
      }
      const paddedNumber = String(nextNumber).padStart(3, '0');
      const deliveryChallan = `EN-MDN-${paddedNumber}`;
 
  
      // Safely create materialDeliveryItems, ensuring the necessary fields exist
      const materialDeliveryItems = data.materialDeliveryItems.map((item) => ({
        inventoryId: item.inventoryId ?? null, // Handle optional inventoryId
        productId: item.productId,
        serialNumber: item.serialNumber,
        macAddress: item.macAddress,
        productName: item.productName,
      }));
  
      // Create material delivery record along with associated items
      const created = await this.prisma.materialDelivery.create({
        data: {
          deliveryType: data.deliveryType,
          deliveryChallan: deliveryChallan,
          refNumber: data.refNumber || "0000",
          customerId: data.customerId ?? null,
          vendorId: data.vendorId ?? null,
          materialDeliveryItems: {
            create: materialDeliveryItems,
          },
        },
        include: {
          materialDeliveryItems: true,
        },
      });
  
      console.log('Created Material Delivery:', created);
      return created;
  
    } catch (error) {
      // Log the error and provide more details if possible
      console.error('Error creating material delivery:', error.message, error.stack);
      throw new Error(`Failed to create material delivery: ${error.message}`);
    }
  }
  
  
  
  async update(id: number, data: UpdateMaterialDeliveryDto) {
    const delivery = await this.prisma.materialDelivery.findUnique({ where: { id } });
    if (!delivery) throw new NotFoundException('Material Delivery not found');
  
    // 🧹 Delete old items first
    await this.prisma.materialDeliveryItem.deleteMany({
      where: { materialDeliveryId: id },
    });

    // Now update MaterialDelivery and recreate items
    const updated = await this.prisma.materialDelivery.update({
      where: { id },
      data: {
        deliveryType: data.deliveryType,
        refNumber: data.refNumber,
        deliveryChallan: data.deliveryChallan ?? undefined,
        customerId: data.customerId ? Number(data.customerId) : null,
        vendorId: data.vendorId ? Number(data.vendorId) : null,
        materialDeliveryItems: {
          create: data.materialDeliveryItems?.map((item) => ({
            inventoryId: item.inventoryId,
            productId: item.productId,
            serialNumber: item.serialNumber,
            macAddress: item.macAddress,
            productName: item.productName,
          })) ?? [],
        },
        updatedAt: new Date(),
      },
      include: {
        materialDeliveryItems: {
          include: {
            inventory: true,
            product: true,
          },
        },
        customer: true,
        vendor: true,
      },
    });
  
    return updated;
  }
  
  async findAll() {
    const result = await this.prisma.materialDelivery.findMany({
      include: {
        materialDeliveryItems: {
          include: {
            inventory: true,
            product: true,
          },
        },
        customer: true,
        vendor: true,
      },
    });
  
    return result;
  }
  

  async findOne(id: number) {
    const delivery = await this.prisma.materialDelivery.findUnique({
      where: { id },
      include: {
        materialDeliveryItems: {
          include: {
            inventory: true,
            product: true,
          },
        },
        customer: true,
        vendor: true,
      },
    });

    if (!delivery) throw new NotFoundException('Material Delivery not found');
    return delivery;
  }

  async remove(id: number) {
    const delivery = await this.prisma.materialDelivery.findUnique({ where: { id } });
    if (!delivery) throw new NotFoundException('Material Delivery not found');
  
    // Manually delete the related MaterialDeliveryItem records
    await this.prisma.materialDeliveryItem.deleteMany({
      where: { materialDeliveryId: id },
    });
  
    // Now delete the MaterialDelivery record
    return this.prisma.materialDelivery.delete({
      where: { id },
    });
  }
  
}
