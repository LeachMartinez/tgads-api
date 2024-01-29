import { IsEmail, Length } from "class-validator"
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, UpdateDateColumn, CreateDateColumn } from "typeorm"
import { AuthToken } from "./AuthToken"

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: false })
  @Length(3, 64, {
    message: "Неверное кол-во символов (от 3 до 64)"
  })
  name: string

  @Column({ unique: true, nullable: false })
  @Length(3, 64, {
    message: "Неверное кол-во символов (от 3 до 64)"
  })
  login: string

  @Column({ unique: true, nullable: false})
  @IsEmail({}, {
    message: "Невреный e-mail!"
  })
  email: string

  @Column({ nullable: false})
  password: string

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => AuthToken, (authToken) => authToken.user)
  authTokens: AuthToken[];
}