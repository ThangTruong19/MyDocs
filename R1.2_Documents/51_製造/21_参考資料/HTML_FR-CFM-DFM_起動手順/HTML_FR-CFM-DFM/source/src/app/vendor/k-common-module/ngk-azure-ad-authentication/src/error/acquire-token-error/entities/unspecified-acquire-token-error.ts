import { AcquireTokenError } from './acquire-token-error';

export class UnspecifiedAcquireTokenError extends AcquireTokenError {
  public name: string;

  constructor(public message: string) {
    super(message);
  }
}
