import { Column, Entity, OneToMany } from "typeorm";
import { User } from "./User";

@Entity()
export class AuthToken {
  @Column()
  refreshToken: string;

  @OneToMany(() => User, (user) => user.authTokens)
  user: User;
}