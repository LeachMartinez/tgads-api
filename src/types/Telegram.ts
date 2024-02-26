export interface TTelegramChannel {
  title: string
  channelId: string
  accessHash: string
  username: string
  about?: string
  link?: string
  photo?: string
  addedToPlatform?: boolean
  participants?: number
  statistics?: TTelegramStatistics
}

export interface TTelegramStatistics {
  averageEngagementRate: number
  viewsAverage: number
  period?: 'all' | 'month' | 'day' | 'year'
}
