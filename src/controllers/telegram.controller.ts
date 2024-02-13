import { Body, Controller, Get, Post } from 'routing-controllers'
import TelegramConnection from '../services/telegram/connection.service'
import Telegram from '../services/telegram/telegram.service'
import TelegramChannels from '../services/telegram/channels.service'
import { TTelegramChannel } from 'src/types/Telegram'

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

  @Get('/telegram/channels')
  async chats () {
    const session = await Telegram.getUserSession(18);
    const telegram = new TelegramChannels(18, session);
    return await telegram.getUserChannels()
  }

  @Post('/telegram/channels')
  async addChannels (@Body() { userId, channels } : {userId: number, channels: TTelegramChannel[]}) {
    const session = await Telegram.getUserSession(18);
    const telegram = new TelegramChannels(18, session);
    return await telegram.saveChannels(userId, channels);
  }
}
