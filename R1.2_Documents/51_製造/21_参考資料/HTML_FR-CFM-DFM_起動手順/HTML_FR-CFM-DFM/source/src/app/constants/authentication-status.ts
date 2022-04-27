export class AuthenticationStatus {
  static hasNotYetAcquired = 0; // 未ログイン
  static verified = 1; // ログイン成功
  static alreadyLoggedIn = 2; // ログイン済み
}
