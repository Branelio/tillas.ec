// ==============================================
// TILLAS.EC — Telegram Caption Parser
// Extrae datos del formato de RANCYD AL POR MAYOR
// ==============================================

import { Injectable, Logger } from '@nestjs/common';

export interface ParsedCaption {
  price: number | null;
  sizeMin: number | null;
  sizeMax: number | null;
  horma: string | null;
  type: string | null;       // FABRICACIÓN, IMPORTADO
  isAvailable: boolean;
}

@Injectable()
export class TelegramParserService {
  private readonly logger = new Logger(TelegramParserService.name);

  /**
   * Parsea el caption de un mensaje del canal de Rancyd.
   *
   * Formato esperado:
   *   *MODELO DE FABRICACIÓN* 🇪🇨
   *   ✅ Modelos Siempre Disponibles 👟
   *   👟 Talla desde la 34 a la 44 👟
   *   💲 *PRECIO:12.50$* 💲💰
   *   👟 Horma Normal 🦶
   *   📸 Foto referencial
   */
  parseCaption(text: string | undefined | null): ParsedCaption {
    if (!text) {
      return {
        price: null,
        sizeMin: null,
        sizeMax: null,
        horma: null,
        type: null,
        isAvailable: true,
      };
    }

    const result: ParsedCaption = {
      price: null,
      sizeMin: null,
      sizeMax: null,
      horma: null,
      type: null,
      isAvailable: true,
    };

    try {
      // === Precio ===
      // Patrones: "*_PRECIO:12,50$*_", "PRECIO: 12$"
      const priceMatch = text.match(/PRECIO[^0-9]*(\d+(?:[.,]\d+)?)/i);
      if (priceMatch) {
        result.price = parseFloat(priceMatch[1].replace(',', '.'));
      }

      // === Tallas ===
      // Patrones: "Talla desde la 34 a la 44", "Tallas 35 - 43" (extrae el primer par de números tras 'Talla')
      const sizeMatch = text.match(/Talla[^0-9]*(\d+)[^0-9]*(\d+)/i);
      if (sizeMatch) {
        result.sizeMin = parseInt(sizeMatch[1], 10);
        result.sizeMax = parseInt(sizeMatch[2], 10);
      }

      // === Horma ===
      // Patrones: "Horma Normal", "Horma Ancha"
      const hormaMatch = text.match(/Horma\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)/i);
      if (hormaMatch) {
        result.horma = hormaMatch[1].trim();
      }

      // === Tipo del modelo ===
      // Patrones: "MODELO DE FABRICACIÓN", "MODELO IMPORTADO"
      if (/FABRICACI[OÓ]N/i.test(text)) {
        result.type = 'FABRICACIÓN';
      } else if (/IMPORTAD[OA]/i.test(text)) {
        result.type = 'IMPORTADO';
      }

      // === Disponibilidad ===
      if (/Siempre\s+Disponible/i.test(text)) {
        result.isAvailable = true;
      } else if (/AGOTAD[OA]/i.test(text) || /NO\s+DISPONIBLE/i.test(text)) {
        result.isAvailable = false;
      }
    } catch (error) {
      this.logger.error(`Error parseando caption: ${error}`);
    }

    this.logger.debug(`Caption parseado: ${JSON.stringify(result)}`);
    return result;
  }

  /**
   * Genera un rango de tallas basado en min/max.
   * Ejemplo: (34, 44) → ['34', '35', '36', ..., '44']
   */
  generateSizeRange(min: number | null, max: number | null): string[] {
    if (min === null || max === null || min > max) return [];
    const sizes: string[] = [];
    for (let i = min; i <= max; i++) {
      sizes.push(i.toString());
    }
    return sizes;
  }
}
