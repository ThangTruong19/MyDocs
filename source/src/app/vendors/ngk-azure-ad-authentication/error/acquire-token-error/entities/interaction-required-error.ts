import { AcquireTokenError } from './acquire-token-error';

export class InteractionRequiredError extends AcquireTokenError {
  public override name: string;

  constructor(public override message: string) {
    super(message);
  }
}
