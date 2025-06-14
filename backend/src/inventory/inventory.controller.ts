import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Put } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(createInventoryDto);
  }

  @Get('generate-serial/:productId')
generateSerial(@Param('productId', ParseIntPipe) id: number) {
  return this.inventoryService.generateNextSerialNumber(id);
}


  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOne(id);
  }

  @Get('purchaseRate/count')
  getTotalPurchaseRate() {
    return this.inventoryService.getTotalPurchaseRate();
  }

  @Get('sold/purchaseRate')
  getSoldPyrchaseRate(){
    return this.inventoryService.getTotalPurchaseRateSold();
  }

   @Get('rest/sold')
  getRestSoldPyrchaseRate(){
    return this.inventoryService.getTotalPurchaseRestSold();
  }

  @Get('/count/purchaseInvoice')
  getCountPurchaseInvoice(){
  return this.inventoryService.getUniquePurchaseInvoiceCount();
  }

  @Get('/count/dueAmount')
  getDueAmount(){
    return this.inventoryService.getTotalDueAmout();
  }

  @Get('count/demo')
  getDemoOut(){
    return this.inventoryService.getTotalDemoOut();
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(id, updateInventoryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.remove(id);
  }
}
