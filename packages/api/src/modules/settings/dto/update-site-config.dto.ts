import { IsString, IsNumberString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSiteConfigDto {
  @ApiProperty({ example: 'TILLAS.EC' })
  @IsString()
  siteName: string;

  @ApiProperty({ example: 'https://tillas.ec' })
  @IsString()
  siteUrl: string;

  @ApiProperty({ example: '3.50' })
  @IsNumberString()
  shippingCostLocal: string;

  @ApiProperty({ example: '7.00' })
  @IsNumberString()
  shippingCostNational: string;

  @ApiProperty({ example: '100.00' })
  @IsNumberString()
  freeShippingThreshold: string;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ example: 'America/Guayaquil' })
  @IsString()
  timezone: string;
}
