import { IsString, IsOptional, IsBoolean, IsEnum, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateVariantDto {
  @ApiProperty({ example: 'US 9' })
  @IsString()
  size: string;

  @ApiProperty({ example: 89.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 109.99 })
  @IsOptional()
  @IsNumber()
  compareAt?: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'NAF1-WHT-9' })
  @IsString()
  sku: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Nike Air Force 1 Low White' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'uuid-brand-id' })
  @IsString()
  brandId: string;

  @ApiProperty({ example: 'Air Force 1' })
  @IsString()
  model: string;

  @ApiProperty({ example: 'El clásico que nunca pasa de moda.' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'nike-air-force-1-low-white' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: ['https://media.tillas.ec/products/img1.jpg'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({ example: 'uuid-category-id' })
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({ enum: ['MALE', 'FEMALE', 'UNISEX', 'KIDS'], example: 'UNISEX' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 'Triple White' })
  @IsOptional()
  @IsString()
  colorway?: string;

  @ApiPropertyOptional({ example: 'CW2288-111' })
  @IsOptional()
  @IsString()
  styleCode?: string;

  @ApiPropertyOptional({ example: 'La historia de este sneaker...' })
  @IsOptional()
  @IsString()
  story?: string;

  @ApiProperty({ type: [CreateVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants: CreateVariantDto[];
}
