import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto';
import { UserGuard } from 'src/guards';
import { GetUser } from 'src/decorators';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('connect')
  async connectUser(@Body() dto: CreateUserDto) {
    const data = await this.userService.connectUser(dto);
    return data;
  }

  @Post('addWebhookUrl')
  @UseGuards(UserGuard)
  async addWebhookUrl(
    @Body('webhookUrl') webhookUrl: string,
    @GetUser('address') address: string,
  ) {
    const data = await this.userService.addWebhookUrl(webhookUrl, address);
    return data;
  }
}
