export enum Status {
  HasNotYetAcquired = 0,
  Verified,
  AlreadyLoggedIn,
  RequestingLogin,
}

export interface AzureAdAuthenticationResult {
  status: Status;
  data?: string;
}
