import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prismaService: PrismaService) {}

  async createMessage(room_id: number, user_id: number, message: string) {
    await this.prismaService.$queryRaw(Prisma.sql`
			UPDATE room
			SET count_message = count_message + 1
			WHERE room_id = ${room_id}`);

    return this.prismaService.message.create({
      data: {
        room_id,
        user_id,
        message,
      },
    });
  }

  createRoom(user, roomTypeId: number) {
    return this.prismaService.room.create({
      data: {
        owner_id: user.id,
        room_type_id: roomTypeId,
      },
    });
  }

  joinRoom(roomId: number, userId: number) {
    return this.prismaService.room_user_rel.create({
      data: {
        room_id: roomId,
        user_id: userId,
      },
    });
  }

  /*
   ** Get all rooms that the current user has been joined
   */
  getUserRooms(userId: number, offset = 0): Promise<Array<any>> {
    return this.prismaService.$queryRaw(Prisma.sql`
			SELECT receiver.*, room_type.type,
			users.avatar_url AS "avatar_url",
			(
				SELECT message
				FROM message
				WHERE room_id = receiver.room_id
				ORDER BY id DESC
				LIMIT 1
			) AS "lastMessage",
			
			(
				SELECT COUNT(message.*)
				FROM message
				WHERE message.room_id = receiver.room_id
				AND message.user_id != receiver.user_id
				AND is_read = false
			)::INTEGER AS "unreadMessageCount",
			
			room.updated_at AS "lastMessageTime",
			CASE
				WHEN room_type.type = 'dm'
					THEN users.username
				ELSE
				--Here I should return the name of the room
					'shared room'
			END AS name
			FROM room_user_rel as sender, room_user_rel as receiver, room, room_type, users
			-- here is inner join
			WHERE sender.room_id = room.id
			AND room.room_type_id = room_type.id
			AND users.id = receiver.user_id
			-- Here is a self join
			AND sender.room_id = receiver.room_id
			AND sender.user_id != receiver.user_id
			AND sender.user_id = ${userId}
			ORDER BY room.updated_at DESC
		`);
  }

  findRoomBetweenUsers(currentUserId: number, targetUserId: number) {
    return this.prismaService.$queryRaw(Prisma.sql`
			SELECT u1.*
			FROM room_user_rel as u1, room_user_rel as u2
			WHERE u1.user_id = ${currentUserId}
			AND u2.user_id = ${targetUserId}
			AND u1.room_id = u2.room_id
		`);
  }

  getRoomInfo(roomId: number) {
    return this.prismaService.room.findFirst({
      where: {
        id: +roomId,
      },
    });
  }

  getRoomType(name: string) {
    return this.prismaService.room_type.findFirst({
      where: {
        type: name,
      },
    });
  }

  getRoomMembers(roomId: number) {
    return this.prismaService.$queryRaw(Prisma.sql`
				SELECT users.id, users.username AS name, users.avatar_url AS "avatar_url"
				FROM room_user_rel
				INNER JOIN users ON users.id = room_user_rel.user_id
				WHERE room_user_rel.room_id = ${+roomId}
		`);
  }

  findAllMessages() {
    return this.prismaService.message.findMany();
  }

  findRoomMessage(roomId: number, offset = 0, limit = 20) {
    // shud load last 20 message
    return this.prismaService.message.findMany({
      where: {
        room_id: +roomId,
      },
      include: {
        userLink: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: limit,
      skip: offset,
    });
  }
}
