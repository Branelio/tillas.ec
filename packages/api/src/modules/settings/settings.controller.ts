import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Public } from '../../common/decorators';
import { SettingsService } from './settings.service';
import { UpdateBankInfoDto } from './dto/update-bank-info.dto';
import { UpdateSiteConfigDto } from './dto/update-site-config.dto';

@ApiTags('settings')
@Controller()
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('settings/public')
  @Public()
  @ApiOperation({ summary: 'Obtener configuración pública (costos de envío, datos de transferencia)' })
  async getPublicSettings() {
    const keys = [
      'bankName',
      'accountNumber',
      'accountType',
      'accountHolder',
      'idNumber',
      'siteName',
      'siteUrl',
      'shippingCostLocal',
      'shippingCostNational',
      'freeShippingThreshold',
      'currency',
      'timezone',
    ];
    const settings = await this.settingsService.getSettings(keys);
    return {
      bankInfo: {
        bankName: settings.bankName || 'Banco Pichincha',
        accountNumber: settings.accountNumber || '2209004611',
        accountType: settings.accountType || 'Ahorros',
        accountHolder: settings.accountHolder || 'BRANDON JOEL',
        idNumber: settings.idNumber || '',
      },
      siteConfig: {
        siteName: settings.siteName || 'TILLAS.EC',
        siteUrl: settings.siteUrl || 'https://tillas.ec',
        shippingCostLocal: settings.shippingCostLocal || '3.50',
        shippingCostNational: settings.shippingCostNational || '7.00',
        freeShippingThreshold: settings.freeShippingThreshold || '100.00',
        currency: settings.currency || 'USD',
        timezone: settings.timezone || 'America/Guayaquil',
      },
    };
  }

  @Get('admin/settings')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Obtener configuración del sistema para el panel de administración' })
  async getAdminSettings() {
    const keys = [
      'bankName',
      'accountNumber',
      'accountType',
      'accountHolder',
      'idNumber',
      'siteName',
      'siteUrl',
      'shippingCostLocal',
      'shippingCostNational',
      'freeShippingThreshold',
      'currency',
      'timezone',
    ];
    const settings = await this.settingsService.getSettings(keys);
    return {
      bankInfo: {
        bankName: settings.bankName || 'Banco Pichincha',
        accountNumber: settings.accountNumber || '2209004611',
        accountType: settings.accountType || 'Ahorros',
        accountHolder: settings.accountHolder || 'BRANDON JOEL',
        idNumber: settings.idNumber || '',
      },
      siteConfig: {
        siteName: settings.siteName || 'TILLAS.EC',
        siteUrl: settings.siteUrl || 'https://tillas.ec',
        shippingCostLocal: settings.shippingCostLocal || '3.50',
        shippingCostNational: settings.shippingCostNational || '7.00',
        freeShippingThreshold: settings.freeShippingThreshold || '100.00',
        currency: settings.currency || 'USD',
        timezone: settings.timezone || 'America/Guayaquil',
      },
    };
  }

  @Patch('admin/settings/bank')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar información bancaria para transferencias' })
  async updateBankInfo(@Body() dto: UpdateBankInfoDto) {
    await this.settingsService.setSettings({
      bankName: dto.bankName,
      accountNumber: dto.accountNumber,
      accountType: dto.accountType,
      accountHolder: dto.accountHolder,
      idNumber: dto.idNumber || '',
    });
    return { message: 'Información bancaria actualizada exitosamente' };
  }

  @Patch('admin/settings/site')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar configuración del sitio web' })
  async updateSiteConfig(@Body() dto: UpdateSiteConfigDto) {
    await this.settingsService.setSettings({
      siteName: dto.siteName,
      siteUrl: dto.siteUrl,
      shippingCostLocal: dto.shippingCostLocal,
      shippingCostNational: dto.shippingCostNational,
      freeShippingThreshold: dto.freeShippingThreshold,
      currency: dto.currency,
      timezone: dto.timezone,
    });
    return { message: 'Configuración del sitio actualizada exitosamente' };
  }
}
