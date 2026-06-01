import { Controller, Get, Post, Res, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, Param, StreamableFile } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MediaService } from './media.service';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Get(':bucket/:path(*)')
  @ApiOperation({ summary: 'Servir archivo desde Minio (proxy público)' })
  async serveFile(
    @Param('bucket') bucket: string,
    @Param('path') path: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const filename = path;
    const { stream, stat } = await this.mediaService.getObjectStream(bucket, filename);

    res.setHeader('Content-Type', stat.metaData?.['content-type'] || 'application/octet-stream');
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    stream.pipe(res);
  }

  @Post('upload')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir una imagen' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    const url = await this.mediaService.uploadImage(file);
    return { url };
  }

  @Post('upload-multiple')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir múltiples imágenes' })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = await this.mediaService.uploadMultiple(files);
    return { urls };
  }
}
