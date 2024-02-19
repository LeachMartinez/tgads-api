import Telegram from './telegram.service'
import { type TelegramChannel } from 'src/db/models/TelegramChannel'
import { Api } from 'telegram'
import TelegramMessageAnalyzeService from './messageAnalyze.service'

export default class TelegramStatistics extends Telegram {
  private readonly channelId: number
  participants: number | undefined
  messagesCount: number
  channel: TelegramChannel | null
  viewsAverage: number
  messagePerDay: number
  period: string

  constructor (userId: number, session: string, channeId: number, period: string = 'all') {
    super(userId, session)
    this.channelId = channeId
    this.period = period
    this.getChannel().catch(e => { console.log(e) })
  }

  async getChannel () {
    this.channel = await this.telegramChannelsRepository.findOneBy({
      id: this.channelId
    })
  }

  async analyze () {
    // this.getBroadcastStats();
    await this.client.connect()
    await this.getParticipants()
    const messages = await this.getMessages() as Api.Message[]
    const messagesAnalyzer = new TelegramMessageAnalyzeService(messages)
    this.viewsAverage = messagesAnalyzer.viewsAverage

    console.log({
      participants: this.participants,
      viewsAverage: this.viewsAverage,
      averageEngagementRate: messagesAnalyzer.averageEngagementRate,
      messagesPerDay: messagesAnalyzer.messagesPerDay
    })
  }

  private async getParticipants () {
    const channelFull = await this.client.invoke(
      new Api.channels.GetFullChannel({
        channel: this.channel?.tgUsername
      })
    )

    this.participants = (channelFull.fullChat as Api.ChannelFull).participantsCount
  }

  // TODO: GET STATS OF PERIOD
  async getMessages () {
    const messagesResult = await this.client.invoke(
      new Api.messages.GetHistory({
        peer: this.channel?.tgUsername,
        // @ts-expect-error api erorr
        hash: BigInt('-4156887774564')
      })
    ) as Api.messages.Messages
    return messagesResult.messages.filter(message => message.className === 'Message')
  }

  getMessagesPerDay () {}

  getBroadcastStats () {}
}
