export type TTelegramChannel = {
  title: string;
  channelId: string;
  accessHash: string;
  username: string;
  about?: string;
  link?: string;
  photo?: string;
  addedToPlatform?: boolean;
}