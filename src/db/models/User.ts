import { IsEmail, Length } from "class-validator"
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Unique, UpdateDateColumn, CreateDateColumn } from "typeorm"
import { AuthToken } from "./AuthToken"

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: false })
  @Length(3, 64)
  name: string

  @Column({ unique: true, nullable: false })
  @Length(3, 64)
  login: string

  @Column({ unique: true, nullable: false})
  @IsEmail()
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