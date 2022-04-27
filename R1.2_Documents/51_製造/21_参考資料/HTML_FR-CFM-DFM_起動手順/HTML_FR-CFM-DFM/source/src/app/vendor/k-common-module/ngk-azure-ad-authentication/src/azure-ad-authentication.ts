import { EventEmitter } from 'events';

import { AuthenticationContextProvider } from './authentication-context-provider';
import { AzureAdAuthenticationResult, Status } from './authentication-result';
import { GraphClientProvider } from './graph-client-provider';
import { clearAuthenticationCache } from './clear-authentication-chache';

/**
 * このクラスは、 adal.js が提供するメソッドを、
 * アプリ側で必要となるメソッドに限定する Facade としての役割を務める。
 * 実装の詳細は AuthenticationContextProvider にて隠蔽する。
 */
export class AzureAdAuthentication {
  static events = new EventEmitter();

  private readonly authenticationContextProvider: AuthenticationContextProvider;

  /**
   * 認証リクエストを行わない、IDトークンの検証のみ行うケースのために redirectUri は Optinal としている。
   * adal.js 側でもこれは必須ではない。
   */
  constructor(private clientId: string, private tenant: string, private redirectUri?: string) {
    /**
     * AuthenticationContextProvider の初期化によって発生する可能性のあるイベントを監視するため
     * 初期化されるよりも先に、 static で定義された EventEmitter を購読する。
     */
    AuthenticationContextProvider.events.on('loggedInWithLoginScreen', () =>
      this.onLoggedInWithLoginScreen(),
    );
    this.authenticationContextProvider = this.getAuthenticationContextProvider();
  }

  run(): Promise<AzureAdAuthenticationResult> {
    return this.authenticationContextProvider
      .restoreUserCache()
      .then(() => {
        return this.authenticationContextProvider.getIdToken();
      })
      .then(() => {
        return this.authenticationContextProvider.getAccessToken();
      })
      .then((token) => {
        return {
          status: Status.Verified,
          data: token,
        };
      })
      .catch(() => {
        return {
          status: Status.RequestingLogin,
        };
      });
  }

  forceUpdateAccessToken(): Promise<AzureAdAuthenticationResult> {
    return this.authenticationContextProvider.renewAccessToken().then((token) => {
      return {
        status: Status.Verified,
        data: token,
      } as AzureAdAuthenticationResult;
    });
  }

  getUserAttribute(accessToken: string, params: string[]): Promise<any> {
    if (!accessToken) {
      return Promise.reject(new Error('InvalidError: Access token is invalid.'));
    }

    const graphClient = this.getGraphClientProvider(accessToken);
    return graphClient.getUserAttribute(params);
  }

  clearCache() {
    clearAuthenticationCache();
  }

  verifyIdToken(): Promise<void | never> {
    return this.authenticationContextProvider.verifyIdToken();
  }

  /**
   * テストでの stub 差し替え用
   */
  getAuthenticationContextProvider(): AuthenticationContextProvider {
    return new AuthenticationContextProvider(this.clientId, this.tenant, this.redirectUri);
  }

  /**
   * テストでの stub 差し替え用
   */
  getGraphClientProvider(accessToken: string): GraphClientProvider {
    return new GraphClientProvider(accessToken);
  }

  private onLoggedInWithLoginScreen() {
    AzureAdAuthentication.events.emit('loggedInWithLoginScreen');
  }
}
