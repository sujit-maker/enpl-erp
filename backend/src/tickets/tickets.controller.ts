import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketService: TicketsService) {}

  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.ticketService.create(dto);
  }

  @Get('user/:userId')
async getTicketsByUserId(@Param('userId', ParseIntPipe) id: number) {
    if (id === 61) {
      // SUPERADMIN sees all tickets
      return this.ticketService.findAllUnfiltered();
    } else {
      // Regular users see only tickets they created that are assigned to SUPERADMIN (61)
      return this.ticketService.findByCreatedByAndAssignedTo(id);
    }
  }

  @Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.findOne(+id);
  }

    @Get('count/all')
  async countAllTickets(): Promise<number> {
    return this.ticketService.countTickets();
  }

  @Get('count/open')
async countOpenTickets(): Promise<number> {
  return this.ticketService.countTicketsByStatus('OPEN');
}

  @Get('count/closed')
async countClosedTickets(): Promise<number> {
  return this.ticketService.countTicketsByStatus('CLOSED');
}

  @Get('count/inprogress')
async countInprogressTickets(): Promise<number> {
  return this.ticketService.countTicketsByStatus('IN_PROGRESS');
}

  @Get('count/resolved')
async countResolvedTickets(): Promise<number> {
  return this.ticketService.countTicketsByStatus('RESOLVED');
}

  @Get('count/reopened')
async countReopenedTickets(): Promise<number> {
  return this.ticketService.countTicketsByStatus('REOPENED');
}




  @Patch(':id')
  updateTicket(@Param('id') id: string, @Body() data: UpdateTicketDto) {
    const ticketId = Number(id);
    if (isNaN(ticketId)) {
      throw new BadRequestException('Invalid ticket ID');
    }
    return this.ticketService.update(ticketId, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ticketService.remove(+id);
  }
}
