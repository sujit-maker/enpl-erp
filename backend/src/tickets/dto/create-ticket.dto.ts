  import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsDateString,
    IsEnum,
  } from 'class-validator';
  import { TicketStatus } from '@prisma/client';

  export class CreateTicketDto {

    @IsString()
    @IsNotEmpty()
    ticketId: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    categoryName: string;

    @IsString()
    @IsNotEmpty()
    subCategoryName: string;

    @IsString()
    @IsNotEmpty()
    serviceCategoryName: string;

    @IsNumber()
    @IsNotEmpty()
    customerId: number;

    @IsNumber()
    @IsNotEmpty()
    siteId: number;

    @IsString()
    @IsNotEmpty()
    contactPerson: string;

    @IsString()
    @IsNotEmpty()
    mobileNo: string;

    @IsDateString()
    @IsNotEmpty()
    proposedDate: Date;

    @IsString()
    @IsNotEmpty()
    priority: string;

    @IsEnum(TicketStatus)
    @IsOptional() // optional since default is OPEN
    status?: TicketStatus;

    @IsNumber()
    @IsNotEmpty()
    createdBy: number;

    @IsNumber()
    @IsOptional() // optional since assignedToId is nullable
    assignedTo?: number;
  }
