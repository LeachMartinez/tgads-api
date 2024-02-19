export interface TTelegramChannel {
  title: string
  channelId: string
  accessHash: string
  username: string
  about?: string
  link?: string
  photo?: string
  addedToPlatform?: boolean
  statistics?: TTelegramStatistics
}

export interface TTelegramStatistics {
  participants: number
  averageEngagementRate: number
  viewsAverage: number
  period?: 'all' | 'month' | 'day' | 'year'
}
