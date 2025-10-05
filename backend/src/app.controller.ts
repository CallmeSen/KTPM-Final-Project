import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';


@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService
  ) { }

  @Post()
  async trackSearch(@Body() body: any) {

    const { userId, searchTerm } = body;

    await this.appService.saveSearch(userId, searchTerm);

    return { success: true, message: 'Search saved successfully' };
    
  }

}


