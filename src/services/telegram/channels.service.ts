import { Api } from 'telegram'
import Telegram from './telegram.service'
import { UserService } from '../user.service'
import { type TTelegramChannel } from 'src/types/Telegram'

export default class TelegramChannels extends Telegram {
  async getUserChannels () {
    await this.client.connect()
    const userDialogs = await this.getUserDailogs() as Api.messages.Dialogs
    const channelIds = this.getChannelIds(userDialogs)
    const channels = await this.getChannelsInfo(channelIds) as Api.messages.Chats
    const userChannels = await this.getUserChannelsList(channels)
    return await this.getUserChannelsInfo(userChannels)
  }

  async saveChannels (userId: number, channels: TTelegramChannel[]) {
    const user = await new UserService().findUser(userId)
    if (!user) return

    for (let i = 0; i < channels.length; i++) {
      const findedChannel = await this.telegramChannelsRepository.findOne({
        where: [
          { tgUsername: channels[i].username },
          { title: channels[i].title }
        ]
      })
      if (findedChannel) return 'nope'

      const createdChannel = this.telegramChannelsRepository.create({
        link: channels[i].link,
        title: channels[i].title,
        tgAccessHash: channels[i].accessHash,
        tgChannelId: channels[i].channelId,
        tgUsername: channels[i].username,
        about: channels[i].about,
        user
      })

      await this.telegramChannelsRepository.save(createdChannel)
    }

    return 'ok'
  }

  private getChannelIds (dialogs: Api.messages.Dialogs) {
    return dialogs.dialogs.flatMap(dialog => {
      const peer = dialog.peer as Api.PeerChannel
      return peer.channelId ? peer.channelId.toString() : []
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
    const userChannels = channels.chats.filter(chat => {
      chat = chat as Api.Channel
      return chat.adminRights
    }) as Api.Channel[]

    const userChannelsInfo: TTelegramChannel[] = []
    for (let i = 0; i < userChannels.length; i++) {
      const findedChannel = await this.telegramChannelsRepository.exists({
        where: [
          { tgUsername: userChannels[i].username, user: { id: this.userId } },
          { tgChannelId: userChannels[i].id.toString(), user: { id: this.userId } }
        ]
      })

      const accessHash = userChannels[i].accessHash
      const username = userChannels[i].username

      if (!accessHash || !username) return
      userChannelsInfo.push({
        title: userChannels[i].title,
        channelId: userChannels[i].id.toString(),
        accessHash: accessHash.toString(),
        username,
        addedToPlatform: findedChannel
      })
    }
    return userChannelsInfo
  }

  private async getUserChannelsInfo (channels: TTelegramChannel[] | undefined) {
    if (!channels) return

    const channelsInfo: TTelegramChannel[] = []
    for (let i = 0; i < channels.length; i++) {
      const channelInfo = await this.client.invoke(
        new Api.channels.GetFullChannel({
          channel: channels[i].username
        })
      )
      // const photo = channelInfo.fullChat.chatPhoto?.className === "PhotoEmpty" ? undefined : channelInfo.fullChat.chatPhoto as Api.Photo
      const expInvite = channelInfo.fullChat.exportedInvite as Api.ChatInviteExported
      channelsInfo.push({ link: expInvite.link, about: channelInfo.fullChat.about, ...channels[i] })
    }

    return channelsInfo
  }

  // private getChannelPhoto (photo: Api.Photo | undefined) {

  //   if (!photo) return;
  //   const size = photo.sizes.at(-1) as Api.PhotoStrippedSize;
  //   return btoa(String.fromCharCode(...new Uint8Array(size.bytes)))
  // }
}
