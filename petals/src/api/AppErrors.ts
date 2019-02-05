class ApplicationError implements Error {
  public name = 'ApplicationError';

  constructor(public message: string) {}

  public toString() {
    return this.name + ': ' + this.message;
  }
}

export class BadRequestError extends ApplicationError {}
export class UnAuthorizedError extends ApplicationError {}
export class InternalServerError extends ApplicationError {}
export class BadGateWayError extends ApplicationError {}
export class NotFoundError extends ApplicationError {}
export class UnhandledError extends ApplicationError {}
