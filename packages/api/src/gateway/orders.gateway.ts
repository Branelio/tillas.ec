// ==============================================
// Socket.io Gateway — Real-time order tracking
// ==============================================

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/orders',
  cors: { origin: '*' },
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(OrdersGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('subscribe:order')
  handleSubscribe(client: Socket, orderId: string) {
    client.join(`order:${orderId}`);
    this.logger.log(`Cliente ${client.id} suscrito a orden ${orderId}`);
  }

  @SubscribeMessage('unsubscribe:order')
  handleUnsubscribe(client: Socket, orderId: string) {
    client.leave(`order:${orderId}`);
  }

  /**
   * Emitir actualización de estado de orden
   * Llamado desde PaymentsService u OrdersService
   */
  emitOrderUpdate(orderId: string, data: any) {
    this.server.to(`order:${orderId}`).emit('order:updated', data);
    this.logger.log(`Orden ${orderId} actualizada: ${data.status}`);
  }

  /**
   * Emitir confirmación de pago
   */
  emitPaymentConfirmed(orderId: string, data: any) {
    this.server.to(`order:${orderId}`).emit('order:paid', data);
    this.logger.log(`Pago confirmado para orden ${orderId}`);
  }
}
