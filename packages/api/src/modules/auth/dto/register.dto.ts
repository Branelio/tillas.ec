import { IsEmail, IsString, MinLength, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'juan@email.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ example: 'MiPassword123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  password: string;

  @ApiPropertyOptional({ example: '+593991234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: ['US 9', 'US 9.5'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteSizes?: string[];

  @ApiPropertyOptional({ example: 'REF-ABC123', description: 'Código de referido' })
  @IsOptional()
  @IsString()
  referralCode?: string;
}
