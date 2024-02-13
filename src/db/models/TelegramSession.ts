import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from './User'

@Entity()
export class TelegramSession {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    session: string

  @CreateDateColumn()
    created_at: Date

  @UpdateDateColumn()
    updated_at: Date

  @OneToOne(() => User, (user) => user.telegramSession)
  @JoinColumn()
    user: User
}
