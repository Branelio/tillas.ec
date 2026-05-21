import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene el valor de una configuración por su clave.
   * Si no existe, retorna el valor por defecto provisto.
   */
  async getSetting(key: string, defaultValue = ''): Promise<string> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key },
    });
    return setting ? setting.value : defaultValue;
  }

  /**
   * Guarda o actualiza el valor de una configuración por su clave.
   */
  async setSetting(key: string, value: string): Promise<void> {
    await this.prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  /**
   * Obtiene múltiples configuraciones dada una lista de claves.
   * Retorna un mapa estructurado de clave-valor.
   */
  async getSettings(keys: string[]): Promise<Record<string, string>> {
    const settings = await this.prisma.systemSetting.findMany({
      where: {
        key: { in: keys },
      },
    });

    const result: Record<string, string> = {};
    // Rellenamos primero con strings vacíos para las claves pedidas
    keys.forEach((key) => {
      result[key] = '';
    });

    // Sobrescribimos con los valores encontrados en la DB
    settings.forEach((s) => {
      result[s.key] = s.value;
    });

    return result;
  }

  /**
   * Guarda múltiples configuraciones dadas en un mapa clave-valor.
   */
  async setSettings(settings: Record<string, string>): Promise<void> {
    const queries = Object.entries(settings).map(([key, value]) =>
      this.prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    );

    await this.prisma.$transaction(queries);
  }
}
