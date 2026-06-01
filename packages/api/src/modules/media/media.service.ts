import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private minioClient: Minio.Client;
  private bucket: string;
  private publicUrl: string;

  constructor(private config: ConfigService) {
    const useSSL = this.config.get<string>('MINIO_USE_SSL') === 'true';
    this.minioClient = new Minio.Client({
      endPoint: this.config.get<string>('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.config.get<string>('MINIO_PORT', '9000')),
      useSSL,
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY', ''),
      secretKey: this.config.get<string>('MINIO_SECRET_KEY', ''),
    });
    this.bucket = this.config.get<string>('MINIO_BUCKET', 'tillas-media');
    this.publicUrl = this.config.get<string>('MINIO_PUBLIC_URL', 'http://localhost:9000');
  }

  async onModuleInit() {
    const exists = await this.minioClient.bucketExists(this.bucket);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucket);
      // Hacer público el bucket para lectura
      const policy = {
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${this.bucket}/*`],
        }],
      };
      await this.minioClient.setBucketPolicy(this.bucket, JSON.stringify(policy));
      this.logger.log(`Bucket '${this.bucket}' creado con acceso público de lectura`);
    }
  }

  async uploadImage(file: Express.Multer.File, folder: string = 'products'): Promise<string> {
    // Validate file type for images
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Tipo de archivo no permitido. Solo se aceptan imágenes (JPEG, PNG, GIF, WEBP).`);
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException(`El archivo es demasiado grande. El tamaño máximo es 5MB.`);
    }

    const timestamp = Date.now();
    const ext = file.originalname.split('.').pop();
    const filename = `${folder}/${timestamp}-${Math.random().toString(36).slice(2)}.${ext}`;

    await this.minioClient.putObject(
      this.bucket,
      filename,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    const url = `${this.publicUrl}/${this.bucket}/${filename}`;
    this.logger.log(`Imagen subida: ${url}`);
    return url;
  }

  async uploadMultiple(files: Express.Multer.File[], folder: string = 'products'): Promise<string[]> {
    return Promise.all(files.map((file) => this.uploadImage(file, folder)));
  }

  async deleteImage(filename: string): Promise<void> {
    await this.minioClient.removeObject(this.bucket, filename);
  }

  async getObjectStream(bucket: string, filename: string): Promise<{ stream: any; stat: any }> {
    try {
      const stat = await this.minioClient.statObject(bucket, filename);
      const stream = await this.minioClient.getObject(bucket, filename);
      return { stream, stat };
    } catch (error) {
      this.logger.error(`Error obteniendo objeto ${bucket}/${filename}: ${error}`);
      throw new NotFoundException('Archivo no encontrado');
    }
  }
}
