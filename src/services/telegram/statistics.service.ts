import Telegram from "./telegram.service";
import { TelegramChannel } from "src/db/models/TelegramChannel";
import { Api } from "telegram";
import TelegramMessageAnalyzeService from "./messageAnalyze.service";

export default class TelegramStatistics extends Telegram {
  private channelId: number
  participants: number | undefined
  messagesCount: number
  channel: TelegramChannel | null
  viewsAverage: number
  messagePerDay: number

  constructor(userId: number, session: string, channeId: number) {
    super(userId, session)
    this.channelId = channeId
    this.getChannel()
  }

  async getChannel() {
    return this.channel = await this.telegramChannelsRepository.findOneBy({
      id: this.channelId
    })
  }

  async analyze() {
    // this.getBroadcastStats();
    await this.client.connect();
    await this.getParticipants()
    const messages = await this.getMessages() as Api.Message[]
    const messagesAnalyzer = new TelegramMessageAnalyzeService(messages)
    this.viewsAverage = messagesAnalyzer.viewsAverage;

    console.log({
      participants: this.participants,
      viewsAverage: this.viewsAverage,
      averageEngagementRate: messagesAnalyzer.averageEngagementRate
    })
  }

  private async getParticipants () {
    const channelFull = await this.client.invoke(
      new Api.channels.GetFullChannel({
        channel: this.channel?.tgUsername
      })
    ) as Api.messages.ChatFull;

    this.participants = (channelFull.fullChat as Api.ChannelFull).participantsCount
  }

  async getMessages() {
    const messagesResult = await this.client.invoke(
      new Api.messages.GetHistory({
        peer: this.channel?.tgUsername,
        hash: BigInt("-4156887774564"),
      })
    ) as Api.messages.Messages
    return messagesResult.messages.filter(message => message.className === "Message");
  }

  getMessagesPerDay() {}
  
  getBroadcastStats() {}
}
