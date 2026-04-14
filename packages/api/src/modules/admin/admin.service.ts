import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [
      totalProducts,
      pendingOrders,
      totalUsers,
      todaySales,
      yesterdaySales,
      totalRevenue,
      monthRevenue,
    ] = await Promise.all([
      this.prisma.product.count({ where: { status: 'ACTIVE' } }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.user.count(),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: today }, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: yesterday, lt: today }, status: { not: 'CANCELLED' } },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED'] } },
        _sum: { total: true },
      }),
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
          status: { in: ['PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED'] },
        },
        _sum: { total: true },
      }),
    ]);

    const todayTotal = todaySales._sum.total || 0;
    const yesterdayTotal = yesterdaySales._sum.total || 0;
    const salesTrend = yesterdayTotal > 0
      ? ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100
      : 0;

    return {
      totalProducts,
      pendingOrders,
      totalUsers,
      todaySales: todayTotal,
      salesTrend: Number(salesTrend.toFixed(2)),
      totalRevenue: totalRevenue._sum.total || 0,
      monthRevenue: monthRevenue._sum.total || 0,
    };
  }

  async getRecentOrders(limit = 10) {
    return this.prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          select: {
            id: true,
            productName: true,
            productImage: true,
            size: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
      },
    });
  }

  async getSalesReport(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' },
      },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const salesByDate: Record<string, number> = {};
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      salesByDate[date] = (salesByDate[date] || 0) + Number(order.total);
    });

    return Object.entries(salesByDate).map(([date, sales]) => ({
      date,
      sales,
    }));
  }

  async getBrandSales() {
    const orderItems = await this.prisma.orderItem.groupBy({
      by: ['brandName'],
      _sum: { totalPrice: true },
      _count: true,
      having: {
        brandName: { not: null },
      },
    });

    return orderItems
      .filter(item => item.brandName)
      .map(item => ({
        brand: item.brandName,
        sales: item._sum.totalPrice || 0,
        count: item._count,
      }))
      .sort((a, b) => b.sales - a.sales);
  }
}
