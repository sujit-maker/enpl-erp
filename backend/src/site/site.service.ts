import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';  
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

@Injectable()
export class SiteService {
  constructor(private prisma: PrismaService) {}

  // Create a Site
 // Create a Site with auto-incrementing siteCode
async create(createSiteDto: CreateSiteDto) {
  // Get the last site created to get the highest current siteCode
  const lastSite = await this.prisma.site.findFirst({
    orderBy: {
      siteCode: 'desc', // Order by siteCode in descending order to get the last one
    },
    select: {
      siteCode: true, // Only retrieve the siteCode
    },
  });

  // Extract the numeric part from the last siteCode (assuming the format is "EN-CAS-001")
  let nextSiteNumber = 1; // Default if no site exists yet
  if (lastSite && lastSite.siteCode) {
    const lastNumber = lastSite.siteCode.split('-')[2]; // Split and get the number part
    nextSiteNumber = parseInt(lastNumber, 10) + 1; // Increment the number
  }

  // Format the next siteCode (e.g., "EN-CAS-001")
  const nextsiteCode = `EN-CAS-${String(nextSiteNumber).padStart(3, '0')}`;

  // Create the site with the newly generated siteCode
  return this.prisma.site.create({
    data: {
      siteCode: nextsiteCode, // Use the generated siteCode
      siteName: createSiteDto.siteName,
      siteAddress: createSiteDto.siteAddress,
      contactName: createSiteDto.contactName, // Pass as an array of contact names
      contactNumber: createSiteDto.contactNumber, // Pass as an array of contact numbers
      emailId: createSiteDto.emailId, // Pass as an array of emails
      customerId: Number(createSiteDto.customerId), // Ensure customerId is a number
    },
  });
}

  

  // Get all Sites
  async findAll() {
    return this.prisma.site.findMany({
      include: {
        Customer: true, // This will also return the related Customer data
        Task: true, // Include related tasks if needed
      },
    });
  }

   // Get Sites by Customer ID
   async findByCustomerId(customerId: number) {
    return this.prisma.site.findMany({
      where: { customerId: customerId },
    });
  }
  
  // Get a specific Site by ID
  async findOne(id: number) {
    return this.prisma.site.findUnique({
      where: { id },
      include: {
        Customer: true, // Include customer data for editing
        Task: true, // Include related tasks if needed
      },
    });
  }

  

  // Update Site details
  async update(id: number, updateSiteDto: UpdateSiteDto) {
    return this.prisma.site.update({
      where: { id },
      data: {
        ...updateSiteDto,
        customerId: Number(updateSiteDto.customerId), // Ensure correct handling of customerId
      },
    });
  }

  // Delete a Site
  async remove(id: number) {
    return this.prisma.site.delete({
      where: { id },
    });
  }
}
