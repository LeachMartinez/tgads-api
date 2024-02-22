import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from './User'

@Entity()
export class TelegramChannel {
  @PrimaryGeneratedColumn()
    id: number

  @Column({ nullable: false })
    title: string

  @Column({ nullable: false })
    tgChannelId: string

  @Column({ unique: true })
    tgAccessHash: string

  @Column({ nullable: false, unique: true })
    tgUsername: string

  @Column({ nullable: false })
    category: string

  @Column({ nullable: false, unique: true })
    link: string

  @Column()
    about: string

  @CreateDateColumn()
    created_at: Date

  @UpdateDateColumn()
    updated_at: Date

  @ManyToOne(() => User, (user) => user.telegramChannels)
  @JoinColumn()
    user: User
}
