import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from './User'

@Entity()
export class TelegramChannel {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    title: string

  @Column()
    tgChannelId: string

  @Column()
    tgAccessHash: string

  @Column()
    tgUsername: string

  @Column()
    link: string

  @CreateDateColumn()
    created_at: Date

  @UpdateDateColumn()
    updated_at: Date

  @ManyToOne(() => User, (user) => user.telegramChannels)
  @JoinColumn()
    user: User
}
