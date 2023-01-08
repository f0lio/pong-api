import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';

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

  @UseGuards(JwtGuard)
  @Get('search/:query')
  async searchUser(@Req() req) {
    const { query } = req.params;
    const users = await this.userService.searchByUsername(query);
    return users;
  }

  @UseGuards(JwtGuard)
  @Get('followers/:username')
  async getFollowers(@Req() req) {
    const { username } = req.params;
    const followers = await this.userService.getFollowers(username);
    return followers;
  }

  @UseGuards(JwtGuard)
  @Get('following/:username')
  async getFollowing(@Req() req) {
    const { username } = req.params;
    const following = await this.userService.getFollowing(username);
    return following;
  }

  @UseGuards(JwtGuard)
  @Get('follow/:username')
  async followUser(@Req() req) {
    const { username } = req.params;
    const { id } = req.user;
    const follow = await this.userService.followUser(id, username);
    return follow;
  }

  @UseGuards(JwtGuard)
  @Get('unfollow/:username')
  async unfollowUser(@Req() req) {
    const { username } = req.params;
    const { id } = req.user;
    const unfollow = await this.userService.unfollowUser(id, username);
    return unfollow;
  }

  @UseGuards(JwtGuard)
  @Get('follows/:username')
  async followsUser(@Req() req, @Res() res) {
    const { username } = req.params;
    const { id } = req.user;
    const follows = await this.userService.followsUser(id, username);
    if (follows) {
      res.status(204).send();
    }
    res.status(404).send();
  }
}
