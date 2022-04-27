import { ApplicationError } from '../../application-error';

export class AcquireTokenError extends ApplicationError {
  public name: string;

  constructor(public message: string) {
    super(message);
  }
}
