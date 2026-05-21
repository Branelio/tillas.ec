import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBankInfoDto {
  @ApiProperty({ example: 'Banco Pichincha' })
  @IsString()
  bankName: string;

  @ApiProperty({ example: '2209004611' })
  @IsString()
  accountNumber: string;

  @ApiProperty({ example: 'Ahorros' })
  @IsString()
  accountType: string;

  @ApiProperty({ example: 'BRANDON JOEL' })
  @IsString()
  accountHolder: string;

  @ApiProperty({ example: '1712345678', required: false })
  @IsString()
  @IsOptional()
  idNumber?: string;
}
