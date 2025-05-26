import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMessageDto) {
     console.log('Incoming create data:', data);
  // ✅ 1. Get the current ticket using ID
  const ticket = await this.prisma.ticket.findUnique({
    where: { id: data.ticketId }, // ✅ CORRECT — this is numeric
    select: { status: true },
  });

  if (!ticket) throw new Error('Ticket not found');

  // ✅ 2. Create the message
  const message = await this.prisma.message.create({
    data: {
      content: data.content,
      status: ticket.status,
      ticket: {
        connect: { id: data.ticketId }, // ✅ using numeric ID
      },
      sender: {
        connect: { id: data.senderId },
      },
    },
  });

  return message;
}


  findAll(ticketId: number) {
    return this.prisma.message.findMany({
      where: { ticketId },
      include: { sender: true },
    });
  }
}
