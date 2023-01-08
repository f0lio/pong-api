import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { user as User } from '@prisma/client';

import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @UseGuards(JwtGuard)
  @Get('me')
  getMe(@GetUser() user: User): User {
    return user;
  }

  @UseGuards(JwtGuard)
  @Get(':username')
  async getUser(@Req() req) {
    const { username } = req.params;
    const user = await this.userService.findOne(username);
    return user;

    // throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
}
