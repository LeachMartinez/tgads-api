import moment from 'moment'
import { type Api } from 'telegram'

export default class TelegramMessageAnalyzeService {
  messages: Api.Message[]

  constructor (messages: Api.Message[]) {
    this.messages = messages
  }

  get viewsAverage () {
    const messagesCount = this.messages.length
    const allMessagesViews = this.messages.flatMap(message => Number(message.views)).reduce((prev, current) => {
      return prev + current
    })

    this.engagementRate(this.messages[3])
    return allMessagesViews / messagesCount
  }

  get averageEngagementRate () {
    const engagementRates = this.messages.map(message => this.engagementRate(message))

    return Number((engagementRates.reduce((prev, current) => prev + current) / engagementRates.length).toFixed(2))
  }

  get messagesPerDay () {
    const sortedMessages = {}

    for (let i = 0; i < this.messages.length; i++) {
      const date = moment(this.messages[i].date * 1000)
      const month = date.format('MM.DD.YYYY')
      if (sortedMessages[month]) {
        sortedMessages[month] = [date, ...sortedMessages[month]]
      } else {
        sortedMessages[month] = [date]
      }
    }

    return sortedMessages
  }

  private engagementRate (message: Api.Message) {
    const reactions = Number(message.reactions?.results.length)
    const views = Number(message.views)

    return reactions / views
  }
}
