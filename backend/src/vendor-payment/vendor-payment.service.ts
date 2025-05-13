import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVendorPaymentDto } from './dto/create-vendor-payment.dto';
import { UpdateVendorPaymentDto } from './dto/update-vendor-payment.dto';

@Injectable()
export class VendorPaymentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateVendorPaymentDto) {
    return this.prisma.vendorPayment.create({
      data: {
        vendorId: dto.vendorId,
        purchaseInvoiceNo: dto.purchaseInvoiceNo,
        invoiceGrossAmount: dto.invoiceGrossAmount,
        dueAmount: dto.dueAmount,
        paidAmount: dto.paidAmount,
        balanceDue: dto.balanceDue,
        paymentType: dto.paymentType,
        referenceNo: dto.referenceNo,
        remark: dto.remark,
        paymentDate: new Date(dto.paymentDate),
        createdAt: new Date(), // Optional, Prisma can auto handle this
      },
    });
  }

  async findAll() {
    return this.prisma.vendorPayment.findMany({
      include: {
        vendor: true,
        inventory: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.vendorPayment.findUnique({
      where: { id },
      include: {
        vendor: true,
        inventory: true,
      },
    });
  }

  async update(id: number, dto: UpdateVendorPaymentDto) {
    return this.prisma.vendorPayment.update({
      where: { id },
      data: {
        vendorId: dto.vendorId,
        purchaseInvoiceNo: dto.purchaseInvoiceNo,
        invoiceGrossAmount: dto.invoiceGrossAmount,
        dueAmount: dto.dueAmount,
        paidAmount: dto.paidAmount,
        balanceDue: dto.balanceDue,
        paymentType: dto.paymentType,
        referenceNo: dto.referenceNo,
        remark: dto.remark,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.vendorPayment.delete({
      where: { id },
    });
  }
}
