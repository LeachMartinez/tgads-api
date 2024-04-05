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

  constructor (session: string, channeId: number, period: string = 'all') {
    super(session)
    this.channelId = channeId
    this.period = period
    this.getChannel().catch(e => { console.log(e) })
  }

  async getChannel () {
    this.channel = await this.tgChannelRep.findOneBy({
      id: this.channelId
    })
    return this.channel
  }

  async analyze () {
    await this.client.connect()
    if (!this.channel) return

    const fullChannel = await this.getFullChannelByLink(this.channel.link)
    if (!fullChannel) return
    await this.getParticipants(fullChannel)
    const messages = await this.getMessages(fullChannel) as Api.Message[]
    const messagesAnalyzer = new TelegramMessageAnalyzeService(messages)
    const stats = await this.getBroadcastStats(fullChannel)
    this.viewsAverage = messagesAnalyzer.viewsAverage

    return {
      participants: this.participants,
      viewsAverage: this.viewsAverage,
      averageEngagementRate: messagesAnalyzer.averageEngagementRate,
      messagesPerDay: messagesAnalyzer.messagesPerDay,
      broadcast: stats
    }
  }

  async getParticipants (fullChannel: Api.TypeChat) {
    const channelFull = await this.client.invoke(
      new Api.channels.GetFullChannel({
        channel: fullChannel
      })
    )

    this.participants = (channelFull.fullChat as Api.ChannelFull).participantsCount
    return this.participants
  }

  // TODO: GET STATS OF PERIOD
  private async getMessages (fullChannel: Api.TypeChat) {
    const messagesResult = await this.client.invoke(
      new Api.messages.GetHistory({
        peer: fullChannel,
        // @ts-expect-error ошибка приведения bigInt в BitInteger
        hash: BigInt('-4156887774564')
      })
    ) as Api.messages.Messages
    return messagesResult.messages.filter(message => message.className === 'Message')
  }

  getMessagesPerDay () {}

  private async getBroadcastStats (fullChannel: Api.TypeChat) {
    try {
      const result = await this.client.invoke(
        new Api.stats.GetBroadcastStats({
          channel: fullChannel
        })
      )
      return result
    } catch (error) {
      console.log(error)
      return {}
    }
  }
}
