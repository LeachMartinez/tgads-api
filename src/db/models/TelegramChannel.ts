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

  @Column({ nullable: false, unique: true })
    link: string

  @Column()
    about: string

  @Column('text', {
    array: true,
    default: []
  })
    categories: string[]

  @Column()
    adFormat: string

  @Column()
    slotsCount: number

  @Column()
    price: number

  @Column()
    priceOnFixedPost: number

  @CreateDateColumn()
    created_at: Date

  @UpdateDateColumn()
    updated_at: Date

  @ManyToOne(() => User, (user) => user.telegramChannels)
  @JoinColumn()
    user: User
}
