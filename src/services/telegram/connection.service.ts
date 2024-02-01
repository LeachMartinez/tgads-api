import { Api } from "telegram";
import Telegram from "./telegram.service";

export default class TelegramConnection extends Telegram {
  constructor(userId: number, session?: string) {
    super(userId, session)
  }

  async sendCode (phoneNumber: string) {
    await this.client.connect()
    const res = await this.client.sendCode(
      {
        apiId: this.API_ID,
        apiHash: this.API_HASH
      },
      phoneNumber
    )
    return {res, session: this.stringSession.save()}
  }

  async auth (phoneNumber: string, phoneCode: string, phoneCodeHash: string) {
    await this.client.connect()

    const result = await this.client.invoke(
      new Api.auth.SignIn({
        phoneNumber: phoneNumber,
        phoneCodeHash: phoneCodeHash,
        phoneCode: phoneCode,
      })
    );
    
    console.log(2);
    console.log("You should now be connected.");
    // return console.log(this.stringSession.save());
    console.log(result);
    return result
  }

  async getChats() {
    await this.client.connect(); // This assumes you have already authenticated with .start()

    let result: Api.messages.TypeDialogs = await this.client.invoke(
      new Api.messages.GetDialogs({
        offsetDate: 0,
        offsetId: 0,
        offsetPeer: "username",
        limit: 100,
        hash: -4026531050890828461n
      })
    );
    const dialogs = result as Api.messages.Dialogs;
    const channelIds = dialogs.dialogs.flatMap(dialog => {
      const peer = dialog.peer as Api.PeerChannel
      return peer.channelId ? peer.channelId.toString() : [];
    })


    const res: Api.messages.TypeChats = await this.client.invoke(
      new Api.channels.GetChannels({
        id: channelIds,
      })
    );

    const channels = res as Api.messages.Chats

    const myChannelsIds = channels.chats.filter(chat => {
      chat = chat as Api.Channel
      return chat.adminRights
    }).flatMap((channel: Api.Channel) => {
      return channel.id!
    })
    
    const fullChannelRes = await this.client.invoke(
      new Api.channels.GetFullChannel({
          channel: myChannelsIds[0].toString(),
      })
    );

    const fullChannel = fullChannelRes.fullChat as Api.ChannelFull

    const sender = await this.client.getSender(fullChannel.statsDc!);
    // console.log(fullChannel);
    
    const channelsStatsResult: Api.stats.BroadcastStats = await this.client.invoke(
      new Api.stats.GetBroadcastStats({
        channel: fullChannel.id.toString(),
        dark: true,
      }), fullChannel.statsDc
    );
      
    console.log(channelsStatsResult);
    
    // console.log(result.originalArgs); // prints the result
    // console.log(result.dialogs.length); // prints the result
    return "OK"
  }
}