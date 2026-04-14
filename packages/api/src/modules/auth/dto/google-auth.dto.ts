import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthDto {
  @ApiProperty({ description: 'ID Token de Google OAuth2' })
  @IsString()
  idToken: string;
}
