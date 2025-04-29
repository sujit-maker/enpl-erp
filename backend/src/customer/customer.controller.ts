import { Controller, Get, Post, Body, Param, Delete, Patch, Put } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

  @Controller('customers')
  export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  // Create a new customer
  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  // Get all customers
  @Get()
  async findAll() {
    return this.customerService.findAll();
  }

  // Get a single customer by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.customerService.findOne(Number(id));
  }

  // Update customer details
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(Number(id), updateCustomerDto);
  }

  // Delete customer
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.customerService.remove(Number(id));
  }
}
