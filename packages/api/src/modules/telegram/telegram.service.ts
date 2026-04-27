// ==============================================
// TILLAS.EC — Telegram GramJS Service
// Escucha el canal del proveedor y descarga imágenes
// ==============================================

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { TelegramParserService } from './telegram-parser.service';

// GramJS imports
import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { NewMessage, NewMessageEvent } from 'telegram/events';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private client: TelegramClient | null = null;
  private isConnected = false;
  private channelUsername: string;
  private lastTextCaption: { id: number; text: string } | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
    private readonly parser: TelegramParserService,
  ) {
    this.channelUsername = this.config.get<string>('TELEGRAM_CHANNEL_USERNAME', 'rancyd');
  }

  async onModuleInit() {
    const apiId = this.config.get<string>('TELEGRAM_API_ID');
    const apiHash = this.config.get<string>('TELEGRAM_API_HASH');
    const sessionStr = this.config.get<string>('TELEGRAM_STRING_SESSION');

    if (!apiId || !apiHash) {
      this.logger.warn('⚠️ Telegram API credentials no configuradas. Módulo deshabilitado.');
      return;
    }

    if (!sessionStr) {
      this.logger.warn(
        '⚠️ TELEGRAM_STRING_SESSION no configurada. ' +
        'Ejecuta el script de generación de sesión primero: npm run telegram:session',
      );
      return;
    }

    try {
      await this.initClient(parseInt(apiId, 10), apiHash, sessionStr);
    } catch (error) {
      this.logger.error(`❌ Error inicializando Telegram client: ${error}`);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
      this.logger.log('🔌 Telegram client desconectado');
    }
  }

  private async initClient(apiId: number, apiHash: string, sessionStr: string) {
    const session = new StringSession(sessionStr);

    this.client = new TelegramClient(session, apiId, apiHash, {
      connectionRetries: 5,
    });

    await this.client.connect();
    this.isConnected = true;
    this.logger.log('✅ Telegram client conectado correctamente');

    // Empezar a escuchar mensajes del canal
    await this.startListening();
  }

  private async startListening() {
    if (!this.client) return;

    this.logger.log(`👂 Escuchando mensajes del canal: @${this.channelUsername}`);

    this.client.addEventHandler(
      async (event: NewMessageEvent) => {
        try {
          await this.handleMessage(event.message);
        } catch (error) {
          this.logger.error(`Error procesando mensaje: ${error}`);
        }
      },
      new NewMessage({ chats: [this.channelUsername] }),
    );
  }

  private async handleMessage(message: Api.Message) {
    if (!message) return;

    let caption = message.message || '';

    // Modo Detective: Si recibimos texto sin foto
    if (!message.media && caption.trim().length > 0) {
      // Guardamos en memoria por si el álbum llega DESPUÉS
      this.lastTextCaption = { id: message.id, text: caption };

      // También intentamos enlazar por si el álbum llegó ANTES
      this.logger.log(`🔎 Mensaje de texto suelto detectado (ID: ${message.id}). Buscando álbum reciente...`);
      const recentAlbum = await this.prisma.telegramImport.findFirst({
        where: { 
          channelId: this.channelUsername,
          telegramMsgId: { lt: message.id } 
        },
        orderBy: { telegramMsgId: 'desc' }
      });

      if (recentAlbum && (message.id - recentAlbum.telegramMsgId > 0 && message.id - recentAlbum.telegramMsgId < 20)) {
        this.logger.log(`🔗 Enlazando texto al álbum ${recentAlbum.groupedId || recentAlbum.telegramMsgId}`);
        const parsed = this.parser.parseCaption(caption);
        await this.prisma.telegramImport.update({
          where: { id: recentAlbum.id },
          data: {
            caption: caption,
            parsedPrice: parsed.price,
            parsedSizeMin: parsed.sizeMin,
            parsedSizeMax: parsed.sizeMax,
            parsedHorma: parsed.horma,
            parsedType: parsed.type,
            isAvailable: parsed.isAvailable,
          }
        });
      }
      return;
    }

    // Si es foto y no tiene caption, intentamos usar el de la memoria
    if (message.media && !caption && this.lastTextCaption && (message.id - this.lastTextCaption.id > 0 && message.id - this.lastTextCaption.id < 20)) {
      caption = this.lastTextCaption.text;
      this.logger.log(`🔗 Usando caption en memoria del mensaje ${this.lastTextCaption.id} para la foto ${message.id}`);
    }

    // Verificar si es una foto
    const isPhoto = message.media instanceof Api.MessageMediaPhoto;
    if (!isPhoto) {
      this.logger.debug(`Ignorando mensaje ID ${message.id} (no es foto ni texto asociado)`);
      return;
    }

    const groupedId = message.groupedId ? message.groupedId.toString() : null;

    let existing: any = null;

    if (groupedId) {
      existing = await this.prisma.telegramImport.findFirst({
        where: { groupedId, channelId: this.channelUsername },
      });
    } else {
      existing = await this.prisma.telegramImport.findFirst({
        where: { telegramMsgId: message.id, channelId: this.channelUsername },
      });
    }

    if (existing && !groupedId) {
      this.logger.debug(`Mensaje ${message.id} ya procesado, saltando...`);
      return;
    }

    // Evitar descargar la imagen si ya la hemos procesado para este álbum
    if (existing && groupedId) {
      const alreadyProcessed = existing.images.some((url: string) => url.includes(`telegram-${message.id}-`));
      if (alreadyProcessed) {
        this.logger.debug(`Mensaje ${message.id} ya existe en el álbum ${groupedId}, saltando descarga...`);
        return;
      }
    }

    // Descargar la imagen
    const imageUrls = await this.downloadAndUpload(message);

    if (imageUrls.length === 0) {
      this.logger.warn(`No se pudieron descargar imágenes del mensaje ${message.id}`);
      return;
    }

    // Si ya existe un álbum, le agregamos la imagen
    if (existing && groupedId) {

      this.logger.log(`🔗 Mensaje ${message.id} pertenece al álbum ${groupedId}. Agregando foto...`);

      const dataToUpdate: any = {
        images: { push: imageUrls[0] },
      };

      // Si este es el mensaje del álbum que trae la descripción (caption), usamos esos datos
      if (caption && !existing.caption) {
        const parsed = this.parser.parseCaption(caption);
        dataToUpdate.caption = caption;
        dataToUpdate.parsedPrice = parsed.price;
        dataToUpdate.parsedSizeMin = parsed.sizeMin;
        dataToUpdate.parsedSizeMax = parsed.sizeMax;
        dataToUpdate.parsedHorma = parsed.horma;
        dataToUpdate.parsedType = parsed.type;
        dataToUpdate.isAvailable = parsed.isAvailable;
      }

      await this.prisma.telegramImport.update({
        where: { id: existing.id },
        data: dataToUpdate,
      });

      return;
    }

    this.logger.log(`📸 Nueva importación detectada: ID ${message.id} ${groupedId ? `(Álbum ${groupedId})` : ''}`);

    // Parsear el caption
    const parsed = this.parser.parseCaption(caption);

    // Guardar en la base de datos
    await this.prisma.telegramImport.create({
      data: {
        telegramMsgId: message.id,
        groupedId: groupedId,
        channelId: this.channelUsername,
        channelName: 'RANCYD AL POR MAYOR',
        caption: caption,
        images: imageUrls,
        parsedPrice: parsed.price,
        parsedSizeMin: parsed.sizeMin,
        parsedSizeMax: parsed.sizeMax,
        parsedHorma: parsed.horma,
        parsedType: parsed.type,
        isAvailable: parsed.isAvailable,
      },
    });
  }

  private async downloadAndUpload(message: Api.Message): Promise<string[]> {
    if (!this.client) return [];

    const urls: string[] = [];

    try {
      // Descargar la imagen como buffer
      const buffer = await this.client.downloadMedia(message, {});

      if (buffer && Buffer.isBuffer(buffer)) {
        // Crear un objeto File-like para el MediaService
        const timestamp = Date.now();
        const filename = `telegram-${message.id}-${timestamp}.jpg`;

        const fakeFile = {
          buffer: buffer,
          originalname: filename,
          mimetype: 'image/jpeg',
          size: buffer.length,
        } as Express.Multer.File;

        const url = await this.mediaService.uploadImage(fakeFile, 'telegram');
        urls.push(url);
      }
    } catch (error) {
      this.logger.error(`Error descargando imagen: ${error}`);
    }

    return urls;
  }

  // ─── Métodos públicos para el Controller ───

  async syncHistory(limit: number) {
    if (!this.client || !this.isConnected) {
      throw new Error('El cliente de Telegram no está conectado');
    }

    this.logger.log(`🔄 Iniciando sincronización de historial: últimos ${limit} mensajes`);

    try {
      const messages = await this.client.getMessages(this.channelUsername, { limit });
      // Invertir para procesar los más antiguos primero (como si fuera en tiempo real)
      messages.reverse(); 
      
      let newCount = 0;

      for (const message of messages) {
        // Verificar si ya procesamos este mensaje
        const existing = await this.prisma.telegramImport.findFirst({
          where: { telegramMsgId: message.id, channelId: this.channelUsername },
        });

        if (existing) continue;

        try {
          await this.handleMessage(message);
          newCount++;
        } catch (err) {
          this.logger.error(`Error procesando mensaje histórico ${message.id}: ${err}`);
        }
      }

      this.logger.log(`✅ Sincronización completa. ${newCount} nuevos posts importados.`);
      return { success: true, processed: limit, imported: newCount };
    } catch (error) {
      this.logger.error(`Error en syncHistory: ${error}`);
      throw error;
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      channel: this.channelUsername,
      clientReady: !!this.client,
    };
  }

  async getImports(params: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where = status ? { status: status as 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'PRODUCT_CREATED' } : {};

    const [data, total] = await Promise.all([
      this.prisma.telegramImport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { product: true },
      }),
      this.prisma.telegramImport.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getImportById(id: string) {
    return this.prisma.telegramImport.findUnique({
      where: { id },
      include: { product: true },
    });
  }

  async getPendingCount() {
    return this.prisma.telegramImport.count({ where: { status: 'PENDING_REVIEW' } });
  }

  async approveImport(
    id: string,
    data: {
      productName: string;
      sellPrice: number;
      brandName?: string;
      categoryName?: string;
      sizes?: string[];
    },
  ) {
    const imported = await this.prisma.telegramImport.findUnique({ where: { id } });
    if (!imported) throw new Error('Importación no encontrada');

    // Generar slug del nombre
    const slug = data.productName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Buscar o crear la marca
    let brandId: string;
    const brandSlug = (data.brandName || 'sin-marca').toLowerCase().replace(/\s+/g, '-');
    const existingBrand = await this.prisma.brand.findUnique({ where: { slug: brandSlug } });
    if (existingBrand) {
      brandId = existingBrand.id;
    } else {
      const newBrand = await this.prisma.brand.create({
        data: { name: data.brandName || 'Sin Marca', slug: brandSlug },
      });
      brandId = newBrand.id;
    }

    // Buscar o crear la categoría
    let categoryId: string;
    const catSlug = (data.categoryName || 'zapatillas').toLowerCase().replace(/\s+/g, '-');
    const existingCat = await this.prisma.category.findUnique({ where: { slug: catSlug } });
    if (existingCat) {
      categoryId = existingCat.id;
    } else {
      const newCat = await this.prisma.category.create({
        data: { name: data.categoryName || 'Zapatillas', slug: catSlug },
      });
      categoryId = newCat.id;
    }

    // Generar variantes con las tallas
    const sizes = data.sizes
      || this.parser.generateSizeRange(imported.parsedSizeMin, imported.parsedSizeMax);

    const variants = sizes.map((size, i) => ({
      size,
      price: data.sellPrice,
      stock: 10, // Stock por defecto
      sku: `${slug}-${size}-${Date.now()}-${i}`,
    }));

    // Crear el producto
    const product = await this.prisma.product.create({
      data: {
        name: data.productName,
        slug: `${slug}-${Date.now()}`,
        model: data.productName,
        description: `${imported.parsedType || 'Modelo'} — ${imported.parsedHorma ? 'Horma ' + imported.parsedHorma : ''}. Importado automáticamente desde Telegram.`,
        brandId,
        categoryId,
        images: imported.images,
        isFeatured: false,
        variants: { create: variants },
      },
    });

    // Actualizar la importación
    await this.prisma.telegramImport.update({
      where: { id },
      data: {
        status: 'PRODUCT_CREATED',
        productId: product.id,
        productName: data.productName,
        sellPrice: data.sellPrice,
        brandName: data.brandName,
        categoryName: data.categoryName,
        reviewedAt: new Date(),
      },
    });

    this.logger.log(`🎉 Producto creado desde Telegram: ${product.name} (${product.id})`);
    return product;
  }

  async rejectImport(id: string, reason?: string) {
    return this.prisma.telegramImport.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedReason: reason,
        reviewedAt: new Date(),
      },
    });
  }
}
