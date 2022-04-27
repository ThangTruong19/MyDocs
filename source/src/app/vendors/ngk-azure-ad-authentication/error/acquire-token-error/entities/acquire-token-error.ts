import { ApplicationError } from '../../application-error';

export class AcquireTokenError extends ApplicationError {
  public override name: string;

  constructor(public override message: string) {
    super(message);
  }
}
