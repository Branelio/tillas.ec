import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Casa' })
  @IsString()
  label: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  recipientName: string;

  @ApiProperty({ example: '+593983199406' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Quito' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Cumbayá' })
  @IsString()
  sector: string;

  @ApiProperty({ example: 'Av. Interoceánica' })
  @IsString()
  mainStreet: string;

  @ApiPropertyOptional({ example: 'Calle de los Cedros' })
  @IsOptional()
  @IsString()
  secondaryStreet?: string;

  @ApiPropertyOptional({ example: 'N45-123' })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiProperty({ example: 'Frente al parque central' })
  @IsString()
  reference: string;

  @ApiPropertyOptional({ example: -0.1807 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -78.4678 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
