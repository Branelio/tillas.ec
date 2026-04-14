import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReturnDto {
  @ApiProperty({ example: 'uuid-order-id' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 'El producto llegó con defectos de fábrica' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ example: ['https://media.tillas.ec/returns/img1.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
