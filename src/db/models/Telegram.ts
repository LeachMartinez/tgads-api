import { Column, CreateDateColumn, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { User } from './User'

@Entity()
export class Telegram {
  @PrimaryGeneratedColumn()
    id: number

  @Column()
    session: string

  @Column(({type: 'bigint'}))
    accessHash: string

  @Column(({type: 'bigint'}))
    telegramPublicId: string

  @CreateDateColumn()
    created_at: Date

  @UpdateDateColumn()
    updated_at: Date

  @OneToOne(() => User, (user) => user.telegram)
    user: User
}
