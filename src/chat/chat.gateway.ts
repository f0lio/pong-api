import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateMessageDto, JoinRoomDto } from './dto/chat_common.dto';

const NAMESPACE = '/chat';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: NAMESPACE,
})
export class ChatGateway {
  @WebSocketServer()
  private server;
  private connectedClient = {};

  constructor(
    private readonly chatService: ChatService,
    private readonly jwt: JwtService,
  ) {}

  async handleConnection(@ConnectedSocket() client: any) {
    const user = this.getUserInfo(client.handshake.auth.token);
    if (user === null) return;

    const userRooms = await this.chatService.getUserRooms(user['id']);
    this.connectedClient[user['id']] = client.id;
    userRooms.forEach((element) => {
      client.join(NAMESPACE + element.room_id);
    });
  }

  handleDisconnect(@ConnectedSocket() client: any) {
    const user = this.getUserInfo(client.handshake.auth.token);
    if (user === null) return;

    delete this.connectedClient[user['id']];
  }

  @SubscribeMessage('createMessage')
  async createMessage(
    @MessageBody() createMessage: CreateMessageDto,
    @ConnectedSocket() client: any,
  ) {
    const user = this.getUserInfo(createMessage.token);
    const message = await this.chatService.createMessage(
      createMessage.roomId,
      user['id'],
      createMessage.message,
    );
    client.to(createMessage.roomId).emit('createMessage', message);
    return message;
  }

  @SubscribeMessage('joinRoom')
  joinRoom(
    @ConnectedSocket() client: any,
    @MessageBody() joinRoomDto: JoinRoomDto,
  ) {
    const user = this.getUserInfo(client.handshake.auth.token);
    if (user === null) return;
    client.join(NAMESPACE + joinRoomDto.roomId);
    /*
     ** Get the other client if included, otherwise,
     ** its either a private/protected room
     */
    if (joinRoomDto.userId) {
      const socketId = this.connectedClient[user['id']];
      this.server.sockets[socketId].join(NAMESPACE + joinRoomDto.roomId);
    }
  }

  @SubscribeMessage('findAllMessages')
  findAll() {
    return this.chatService.findAllMessages();
  }

  getUserInfo(token: string) {
    return this.jwt.decode(token);
  }
}
