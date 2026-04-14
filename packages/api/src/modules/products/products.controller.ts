import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar productos con filtros y paginación' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'brand', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'size', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'price_asc', 'price_desc'] })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('brand') brand?: string,
    @Query('category') category?: string,
    @Query('size') size?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    return this.productsService.findAll({ page, limit, brand, category, size, minPrice, maxPrice, search, sort });
  }

  @Get('featured')
  @ApiOperation({ summary: 'Productos destacados' })
  getFeatured() {
    return this.productsService.getFeatured();
  }

  @Get('new-arrivals')
  @ApiOperation({ summary: 'Últimos lanzamientos' })
  getNewArrivals() {
    return this.productsService.getNewArrivals();
  }

  @Get('brands')
  @ApiOperation({ summary: 'Listar marcas' })
  getBrands() {
    return this.productsService.getBrands();
  }

  @Get('categories')
  @ApiOperation({ summary: 'Listar categorías' })
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Detalle de producto por slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  // === Admin endpoints ===
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Crear producto' })
  create(@Body() body: any) {
    return this.productsService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Actualizar producto' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.productsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Archivar producto' })
  delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }
}
