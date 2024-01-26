import { IsEmail, Length } from "class-validator"
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm"
import { AuthToken } from "./AuthToken"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @Length(3, 64)
    name: string

    @Column()
    @Length(3, 64)
    login: string

    @Column()
    @IsEmail()
    email: string

    @Column()
    password: string

    @OneToMany(() => AuthToken, (authToken) => authToken.user)
    authTokens: AuthToken[];
}