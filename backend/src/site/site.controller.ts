import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { SiteService } from './site.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

@Controller('sites')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  // Create a new site
  @Post()
  async create(@Body() createSiteDto: CreateSiteDto) {
    return this.siteService.create(createSiteDto);
  }

   // Get sites by customer ID
   @Get('customer/:customerId')
   async findByCustomerId(@Param('customerId') customerId: string) {
     const parsedCustomerId = parseInt(customerId, 10);
     if (isNaN(parsedCustomerId)) {
       throw new Error('Invalid customer ID');
     }
     return this.siteService.findByCustomerId(parsedCustomerId);
   }

  // Get all sites
  @Get()
  async findAll() {
    return this.siteService.findAll();
  }

  // Get a single site by ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.siteService.findOne(Number(id));
  }

  // Update site details
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSiteDto: UpdateSiteDto,
  ) {
    return this.siteService.update(Number(id), updateSiteDto);
  }

  // Delete site
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.siteService.remove(Number(id));
  }
}
