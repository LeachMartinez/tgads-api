import { Api } from "telegram";

export default class TelegramMessageAnalyzeService {
  messages: Api.Message[];

  constructor(messages: Api.Message[]) {
    this.messages = messages
  }

  get viewsAverage() {
    const messagesCount = this.messages.length;
    const allMessagesViews = this.messages.flatMap(message => Number(message.views)).reduce((prev, current) => {
      return prev + current
    });

    this.engagementRate(this.messages[3])
    return allMessagesViews / messagesCount;
  }

  get averageEngagementRate() {
    const engagementRates = this.messages.map(message => this.engagementRate(message));

    return Number((engagementRates.reduce((prev, current) => prev + current) / engagementRates.length).toFixed(2))
  }

  private engagementRate(message: Api.Message) {
    const reactions = Number(message.reactions?.results.length);
    const views = Number(message.views)
    
    return reactions / views
  }
}