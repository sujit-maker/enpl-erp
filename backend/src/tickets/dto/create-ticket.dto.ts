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
    @IsOptional()
    categoryName: string;

    @IsString()
    @IsOptional()
    subCategoryName: string;

    @IsString()
    @IsOptional()
    serviceCategoryName: string;

    @IsNumber()
    @IsOptional()
    customerId: number;
  

    @IsNumber()
    @IsOptional()
    siteId: number;

    @IsOptional()
    manCustm: string;

    @IsOptional()
    manSite: string;

    @IsString()
    @IsOptional()
    contactPerson: string;

    @IsString()
    @IsOptional()
    mobileNo: string;

    @IsOptional()
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
