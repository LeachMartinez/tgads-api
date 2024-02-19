import { Api } from 'telegram'
import Telegram from './telegram.service'

export default class TelegramConnection extends Telegram {
  async sendCode (phoneNumber: string) {
    await this.client.connect()
    const res = await this.client.sendCode(
      {
        apiId: this.API_ID,
        apiHash: this.API_HASH
      },
      phoneNumber
    )
    return { res, session: this.stringSession.save() }
  }

  async auth (phoneNumber: string, phoneCode: string, phoneCodeHash: string) {
    await this.client.connect()

    await this.client.invoke(
      new Api.auth.SignIn({
        phoneNumber,
        phoneCodeHash,
        phoneCode
      })
    )

    const session = await this.telegramSessionRepository.findOneBy({
      id: this.userId
    })

    if (!session) {
      const session = this.telegramSessionRepository.create({
        session: this.stringSession.save(),
        user: {
          id: this.userId
        }
      })
      await this.telegramSessionRepository.save(session)
    } else {
      this.telegramSessionRepository.update(session, {
        session: this.stringSession.save()
      }).catch(e => {
        console.log(e)
      })
    }

    return 'ok'
  }
}
