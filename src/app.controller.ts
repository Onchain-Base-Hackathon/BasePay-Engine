import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class AppController {
  @Get()
  async checkHealth() {
    return 'Welcome to BasePay API 🤘🏾';
  }
}
