import { Body, Controller, Get, Param, Post } from 'routing-controllers'
import TelegramConnection from '../services/telegram/connection.service'
import Telegram from '../services/telegram/telegram.service'
import TelegramChannels from '../services/telegram/channels.service'
import { type TTelegramChannel } from '../types/Telegram'
import TelegramStatistics from '../services/telegram/statistics.service'

@Controller()
export class TelegramController {
  @Post('/telegram/code')
  async code (@Body() body: {
    phoneNumber: string
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
    return await telegram.auth('79321270292', body.phoneCode, body.phoneCodeHash)
  }

  @Get('/telegram/saved_channels/:userId')
  async savedChannels (@Param('userId') userId: string) {
    if (!userId) return

    return await Telegram.getSavedUserChannels(Number(userId))
  }

  @Get('/telegram/stats')
  async stats () {
    const session = await Telegram.getUserSession(18)
    const stats = new TelegramStatistics(18, session, 38)
    await stats.analyze()
    return 'OK'
  }

  @Get('/telegram/channels/:userId')
  async channels (@Param('userId') userId: string) {
    console.log(1123)

    const session = await Telegram.getUserSession(Number(userId))
    const telegram = new TelegramChannels(Number(userId), session)
    return await telegram.getUserChannels()
  }

  @Post('/telegram/channels')
  async addChannels (@Body() { userId, channels }: { userId: number, channels: TTelegramChannel[] }) {
    const session = await Telegram.getUserSession(18)
    const telegram = new TelegramChannels(18, session)
    return await telegram.saveChannels(userId, channels)
  }
}
