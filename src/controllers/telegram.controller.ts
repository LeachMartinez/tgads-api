import { Body, Controller, Get, Param, Post } from 'routing-controllers'
import TelegramConnection from '../services/telegram/connection.service'
import Telegram from '../services/telegram/telegram.service'
import TelegramChannels from '../services/telegram/channels.service'
import { TTelegramChannel } from '../types/Telegram'
import TelegramStatistics from '../services/telegram/statistics.service'

@Controller()
export class TelegramController {
  @Post('/telegram/code')
  async code (@Body() body: {
    phoneNumber: string,
    userId: number
  }) {
    const telegram = new TelegramConnection(body.userId)
    return await telegram.sendCode(body.phoneNumber)
  }

  @Post('/telegram/auth')
  async auth (@Body() body: {
    phoneCode: string
    userId: number
    phoneCodeHash: string
    session: string
  }) {
    const telegram = new TelegramConnection(body.userId, body.session)
    return await telegram.auth("79321270292", body.phoneCode, body.phoneCodeHash)
  }

  @Get('/telegram/saved_channels/:user_id') 
  async savedChannels(@Param('user_id') user_id: string) {
    if (!user_id) return;

    return await Telegram.getSavedUserChannels(Number(user_id));
  }

  @Get("/telegram/stats")
  async stats () {
    const session = await Telegram.getUserSession(18);
    const stats = new TelegramStatistics(18, session, 38)
    console.log(await stats.analyze());
    return "OK"
  }

  @Get('/telegram/channels/:user_id')
  async channels (@Param('user_id') user_id: string) {
    const session = await Telegram.getUserSession(Number(user_id));
    const telegram = new TelegramChannels(Number(user_id), session);
    return await telegram.getUserChannels()
  }

  @Post('/telegram/channels')
  async addChannels (@Body() { userId, channels } : {userId: number, channels: TTelegramChannel[]}) {
    const session = await Telegram.getUserSession(18);
    const telegram = new TelegramChannels(18, session);
    return await telegram.saveChannels(userId, channels);
  }
}
