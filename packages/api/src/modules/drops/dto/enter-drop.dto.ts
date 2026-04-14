import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnterDropDto {
  @ApiProperty({ example: 'US 9' })
  @IsString()
  selectedSize: string;
}
