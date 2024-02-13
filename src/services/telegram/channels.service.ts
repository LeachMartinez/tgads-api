import { Api } from "telegram";
import Telegram from "./telegram.service";
import { UserService } from "../user.service";
import { TTelegramChannel } from "src/types/Telegram";

export default class TelegramChannels extends Telegram {

  constructor(userId: number, session: string) {
    super(userId, session);
  }

  async getUserChannels() {
    await this.client.connect();
    const userDialogs = await this.getUserDailogs();
    const channelIds = this.getChannelIds(userDialogs as Api.messages.Dialogs);
    const channels = await this.getChannelsInfo(channelIds) as Api.messages.Chats;
    const userChannels = this.getUserChannelsList(channels);
    const getChannelsInfo = await this.getUserChannelsInfo(userChannels);
    return getChannelsInfo;
  }

  async saveChannels(userId: number, channels: TTelegramChannel[]) {
    const user = await new UserService().findUser(userId);
    if (!user) return;
    
    channels.forEach(async (channel) => {
      const findedChannel = await this.telegramChannelsRepository.findOne({
        where: [
          { tgUsername: channel.username },
          { title: channel.title },
        ]
      })
 
      if (findedChannel) return;

      const createdChannel = this.telegramChannelsRepository.create({...channel, user });
      return await this.telegramChannelsRepository.save(createdChannel);
    })

  }

  private getChannelIds (dialogs: Api.messages.Dialogs) {
    return dialogs.dialogs.flatMap(dialog => {
      const peer = dialog.peer as Api.PeerChannel
      return peer.channelId ? peer.channelId.toString() : [];
    })
  }

  private async getChannelsInfo (channelIds: string[]) {
    return await this.client.invoke(
      new Api.channels.GetChannels({
        id: channelIds,
      })
    );
  }

  private async getUserDailogs(): Promise<Api.messages.TypeDialogs> {
    return await this.client.invoke(
      new Api.messages.GetDialogs({
        offsetDate: 0,
        offsetId: 0,
        offsetPeer: "username",
        limit: 100,
        hash: -4026531050890828461n
      })
    );
  }

  private getUserChannelsList (channels: Api.messages.Chats) {
    return channels.chats.filter(chat => {
      chat = chat as Api.Channel
      return chat.adminRights
    }).flatMap((channel: Api.Channel) => {
      return {
        title: channel.title,
        channelId: channel.id,
        accessHash: channel.accessHash!,
        username: channel.username!,
      }
    })
  }

  private async getUserChannelsInfo (channels: TTelegramChannel[]) {
    if (!channels) return;
    const channelsInfo: TTelegramChannel[] = [];
    for (let i = 0; i < channels.length; i++) {
      const channelInfo = await this.client.invoke(
        new Api.channels.GetFullChannel({
          channel: channels[i].username
        })
      );
      const expInvite = channelInfo.fullChat.exportedInvite as Api.ChatInviteExported;
      channelsInfo.push({ link: expInvite.link, ...channels[i] })
    }
    return channelsInfo;
  }
}