import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

async create(data: CreateTicketDto) {
  const {
    title,
    description,
    categoryName,
    subCategoryName,
    serviceCategoryName,
    customerId,
    siteId,
    contactPerson,
    mobileNo,
    proposedDate,
    priority,
    status,
    createdBy,
    assignedTo,
  } = data;

  if (!createdBy) {
    throw new Error('createdBy user ID must be provided');
  }

  // Generate ticketId: EN-SR-YYMMDDHHMMSS
  const now = new Date();
  const formatNumber = (n: number) => n.toString().padStart(2, '0');
  const YY = now.getFullYear().toString().slice(-2);
  const MM = formatNumber(now.getMonth() + 1);
  const DD = formatNumber(now.getDate());
  const HH = formatNumber(now.getHours());
  const mm = formatNumber(now.getMinutes());
  const SS = formatNumber(now.getSeconds());

  const ticketId = `EN-SR-${YY}${MM}${DD}${HH}${mm}${SS}`;

  return this.prisma.ticket.create({
    data: {
      ticketId,
      title,
      description,
      categoryName,
      subCategoryName,
      serviceCategoryName,
      customer: {
        connect: { id: customerId },
      },
      site: {
        connect: { id: siteId },
      },
      contactPerson,
      mobileNo,
      proposedDate,
      priority,
      status: status ?? 'OPEN',
      createdBy: {
        connect: { id: createdBy },
      },
      ...(assignedTo && {
        assignedTo: {
          connect: { id: assignedTo },
        },
      }),
    },
    include: {
      createdBy: true,
      assignedTo: true,
      customer: true,
      site: true,
    },
  });
}


  findAll() {
    return this.prisma.ticket.findMany({ include: { messages: true } });
  }

  // Show all tickets (for SUPERADMIN)
findAllUnfiltered() {
  return this.prisma.ticket.findMany({
    include: { messages: true },
  });
}

// Show tickets created by user, assigned to SUPERADMIN
findByCreatedByAndAssignedTo(userId: number) {
  return this.prisma.ticket.findMany({
    where: {
      createdById: userId,
      assignedToId: 61,
    },
    include: { messages: true },
  });
}



  findOne(id: number) {
    return this.prisma.ticket.findUnique({ where: { id }, include: { messages: true } });
  }

update(id: number, data: UpdateTicketDto) {
  console.log('Service updating ticket ID:', id); // ✅ Add this
  return this.prisma.ticket.update({
    where: { id },
    data,
  });
}


  remove(id: number) {
    return this.prisma.ticket.delete({ where: { id } });
  }
}
