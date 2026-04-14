import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 'uuid-address-id' })
  @IsString()
  @IsUUID()
  addressId: string;
}
