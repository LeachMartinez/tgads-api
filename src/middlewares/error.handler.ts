export class ErrorHandler<T> extends Error {
  status: number
  body: T

  constructor (status: number, body: T) {
    super()
    this.status = status
    this.body = body
  }
}

export function CatchError (target: any, propertyName: any, descriptor: any) {
  const method = descriptor.value

  console.log('TARGET', target)
  console.log('propertyName', propertyName)
  console.log('descriptor', descriptor.value)

  descriptor.value = function (...args: any) {
    try {
      return method.apply(target, args)
    } catch (error) {
      if (error instanceof ErrorHandler) {
        return error
        // return response.status(error.status).send(error.body)
      }
      console.log(error)
      return error
    }
  }
}
