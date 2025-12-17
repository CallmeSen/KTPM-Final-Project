import {OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse} from '@nestjs/websockets'
import {from, Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {Server} from 'ws'

@WebSocketGateway(3002,{ cors: { origin: '*' } })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  handleConnection(socket: WebSocket) {
    this.server.on('event', (event, data) => socket.send(JSON.stringify({event, data})))
  }

  handleDisconnect(socket: WebSocket) {}

  @SubscribeMessage('events')
  onEvent(client: any, data: any): Observable<WsResponse<number>> {
    console.log('received:', data)
    console.log('emitted:', this.server.emit('event', 'test', 'hello event'))
    return from([1, 2, 3]).pipe(map(item => ({event: 'events', data: item})))
  }

@SubscribeMessage('message')
onMessage(client: any, data: any) {
  console.log('received:', data);

  this.server.emit('test', 'hello message');

}

}