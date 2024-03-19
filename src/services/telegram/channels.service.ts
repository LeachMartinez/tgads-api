import { Api } from 'telegram'
import Telegram from './telegram.service'
import { UserService } from '../user.service'
import { type TTelegramChannel } from 'src/types/Telegram'
// import { ErrorHandler } from '../../middlewares/error.handler'

export default class TelegramChannels extends Telegram {
  async getUserChannels () {
    await this.client.connect()
    const userDialogs = await this.getUserDailogs() as Api.messages.Dialogs
    const channelIds = this.getChannelIds(userDialogs)
    const channels = await this.getChannelsInfo(channelIds) as Api.messages.Chats
    const userChannels = await this.getUserChannelsList(channels)
    return await this.getUserChannelsInfo(userChannels)
  }

  async saveChannels (userId: number, channel: TTelegramChannel) {
    const user = await new UserService().findUser(userId)
    if (!user) return 'user not found'

    const findedChannel = await this.telegramChannelsRepository.findOne({
      where: [
        { tgUsername: channel.username },
        { title: channel.title }
      ]
    })
    if (findedChannel) return 'nope'

    const createdChannel = this.telegramChannelsRepository.create({
      price: channel.price,
      adFormat: channel.adFormat,
      priceOnFixedPost: channel.priceOnFixedPost,
      categories: channel.categories,
      slotsCount: channel.slotsCount,
      link: channel.link,
      title: channel.title,
      tgAccessHash: channel.accessHash,
      tgChannelId: channel.channelId,
      tgUsername: channel.username,
      about: channel.about,
      user
    })

    await this.telegramChannelsRepository.save(createdChannel)

    return 'ok'
  }

  async getSavedUserChannels (userId: number) {
    // throw new ErrorHandler(422, 'eee')

    const savedChannels = await this.telegramChannelsRepository.findBy({
      user: { id: userId }
    })
    return savedChannels
  }

  private getChannelIds (dialogs: Api.messages.Dialogs) {
    return dialogs.dialogs.flatMap(dialog => {
      if (dialog.peer.className !== 'PeerChannel') return []

      return dialog.peer.channelId ? dialog.peer.channelId.toString() : []
    })
  }

  private async getChannelsInfo (channelIds: string[]) {
    return await this.client.invoke(
      new Api.channels.GetChannels({
        id: channelIds
      })
    )
  }

  private async getUserDailogs (): Promise<Api.messages.TypeDialogs> {
    return await this.client.invoke(
      new Api.messages.GetDialogs({
        offsetDate: 0,
        offsetId: 0,
        offsetPeer: 'username',
        limit: 100,
        // @ts-expect-error api erorr
        hash: -4026531050890828461n
      })
    )
  }

  private async getUserChannelsList (channels: Api.messages.Chats) {
    const userChannels = channels.chats.filter(chat => chat.className === 'Channel' && chat.adminRights) as Api.Channel[]

    return await Promise.all(userChannels.map(async (channel) => {
      const findedChannel = await this.telegramChannelsRepository.exists({
        relations: { user: true },
        where: { tgChannelId: channel.id.toString(), user: { id: this.userId } }
      })

      return {
        title: channel.title,
        channelId: channel.id.toString(),
        accessHash: channel.accessHash?.toString(),
        username: channel.username ?? '',
        addedToPlatform: findedChannel
      }
    })) satisfies TTelegramChannel[]
  }

  private async getUserChannelsInfo (channels: TTelegramChannel[]) {
    return await Promise.all(channels.map(async channel => {
      const channelInfo = await this.client.invoke(
        new Api.channels.GetFullChannel({
          channel: channel.username || channel.title
        })
      )

      if (channelInfo.fullChat.className !== 'ChannelFull') return null

      let link = ''
      if (channelInfo.fullChat.exportedInvite?.className === 'ChatInviteExported') {
        link = channelInfo.fullChat.exportedInvite?.link
      }

      return {
        ...channel,
        photo: await this.getChannelPhoto(channelInfo),
        link,
        about: channelInfo.fullChat.about,
        participants: channelInfo.fullChat.participantsCount
      }
    }))
  }

  private async getChannelPhoto (channel: Api.messages.ChatFull) {
    if (channel.chats[0].className !== 'Channel') return undefined

    const result = await this.client.downloadProfilePhoto(channel.chats[0])

    if (!result) return undefined

    return Buffer.from(result).toString('base64')
  }
}
