import { IsString, IsOptional, IsBoolean, IsDateString, IsInt, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDropDto {
  @ApiProperty({ example: 'Air Jordan 1 Chicago Drop' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'air-jordan-1-chicago-drop' })
  @IsString()
  slug: string;

  @ApiProperty({ example: 'El drop más esperado del año...' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'https://media.tillas.ec/drops/banner.jpg' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: '2026-04-01T14:00:00.000Z' })
  @IsDateString()
  startsAt: string;

  @ApiPropertyOptional({ example: '2026-04-01T16:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional({ enum: ['NORMAL', 'RAFFLE', 'EARLY_ACCESS'], example: 'NORMAL' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isRaffle?: boolean;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxEntries?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  stock?: number;

  @ApiPropertyOptional({ example: ['uuid-product-1', 'uuid-product-2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];
}
