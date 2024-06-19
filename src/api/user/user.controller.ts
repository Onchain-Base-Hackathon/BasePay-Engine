import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('connect')
  async connectUser(@Body() dto: CreateUserDto) {
    const data = await this.userService.connectUser(dto);
    return data;
  }
}
