import { type Action } from 'routing-controllers'
import { AppDataSource } from '../db/data-source'
import { User } from '../db/models/User'
import { AuthorizationService } from '../services/authorization.service'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'

export default async (action: Action, roles: string[]) => {
  if (action.request.method === 'OPTIONS') {
    action.next?.()
  }
  try {
    const authorizationHeader = action.request.headers.authorization

    if (!authorizationHeader) return false

    const accessToken = authorizationHeader.split(' ')[1] as string
    if (!accessToken) return false
    const userData = await new AuthorizationService().validateAccessToken(accessToken)

    if (userData instanceof JsonWebTokenError) return false
    if (userData instanceof TokenExpiredError) return false
    if (typeof userData === 'string') return false

    const user = AppDataSource.getRepository(User)
    const authUser = await user.findOneBy({ id: userData.id })

    if (!authUser) return false

    return true
  } catch (e) {
    return false
  }
}
