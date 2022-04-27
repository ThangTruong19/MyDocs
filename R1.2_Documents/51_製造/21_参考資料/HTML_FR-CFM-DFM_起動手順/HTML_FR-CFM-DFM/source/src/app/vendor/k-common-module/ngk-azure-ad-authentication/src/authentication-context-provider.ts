import { EventEmitter } from 'events';

import { msGraphApi } from './graph-client-provider';
import { IdTokenVerifier } from './verifier/id-token-verifier';
import { makeAcquireTokenError } from './error/acquire-token-error/make-acquire-token-error';
import { LoginRequiredError } from './error/acquire-token-error/entities/login-required-error';
import { InteractionRequiredError } from './error/acquire-token-error/entities/interaction-required-error';

declare var require: any;
const AuthenticationContext = require('adal-angular');

/**
 * Azure 仕様の resource を指定する。
 * このオブジェクトは adal.js の初期設定として渡され、
 * adal.js 内部で resource として振る舞う。
 * キーと値には共に、使用する外部APIのURLを指定する。
 */
const endpoints = {
  [msGraphApi]: msGraphApi,
};

/**
 * adal.js のメソッドやプロパティを隠蔽し、
 * AzureAdAuthentication で扱いやすいようにして提供する。
 */
export class AuthenticationContextProvider {
  /**
   * インスタンスの初期化によって発生する可能性のあるイベントの監視を、
   * 初期化前に開始できるように EventEmitter を static として定義する。
   */
  static events = new EventEmitter();

  private readonly authenticationContext: any;
  private readonly resource = msGraphApi;

  constructor(private clientId: string, private tenant: string, redirectUri?: string) {
    this.authenticationContext = this.getAuthenticationContext(clientId, tenant, redirectUri);
    this.initialize();
  }

  isLoggedIn(): boolean {
    return !!this.authenticationContext.getCachedToken(this.clientId);
  }

  getIdToken(): Promise<string> {
    return this.acquireToken(this.clientId).catch(() => {
      throw Error('IDトークンの取得に失敗しました。');
    });
  }

  getAccessToken(): Promise<string> {
    return this.acquireToken(this.resource).catch(() => {
      throw Error('アクセストークンの取得に失敗しました。');
    });
  }

  renewAccessToken(): Promise<string> {
    if (this.authenticationContext.getCachedToken(this.resource)) {
      this.authenticationContext.clearCacheForResource(this.resource);
    }

    return this.getAccessToken();
  }

  /**
   * リダイレクトを含むので戻り値はなし
   */
  login() {
    this.authenticationContext.login();
  }

  /**
   * テストでの stub 差し替え用
   */
  getAuthenticationContext(clientId: string, tenant: string, redirectUri?: string): any {
    const redirectUriConfig = redirectUri
      ? {
          redirectUri,
        }
      : null;

    const config = Object.assign(
      {},
      {
        clientId,
        tenant,
        endpoints,
        navigateToLoginRequestUrl: false,
        cacheLocation: 'localStorage',
        extraQueryParameter: 'prompt=select_account',
      },
      redirectUriConfig,
    );

    return new AuthenticationContext(config as any);
  }

  verifyIdToken(): Promise<void | never> {
    const token = this.authenticationContext.getCachedToken(this.clientId);
    const verifier = new IdTokenVerifier(this.clientId, this.tenant);
    return verifier.verify(token);
  }

  /**
   * 現在ログインしているユーザーの情報をadal.jsの内部キャッシュに復元する。
   * ユーザー情報自体は目的ではなく、iframe内でトークンの更新を行う条件として事前の呼び出しが必要。
   *
   * adal.jsは内部キャッシュにユーザー情報を保持しているか、
   * SDKの初期化時に login_hint を渡されているか、どちらかの条件が欠けると
   * トークンの更新を行わずにエラーを返す。
   *
   * 想定されるエラーは未ログイン時におけるユーザー情報の取得失敗というケースのみ。
   * この場合は acquireToken 実行時の LoginRequired エラーがアプリに伝わることが期待されるので、
   * このメソッドにおけるエラーは送らない。
   */
  restoreUserCache(): Promise<void> {
    return new Promise((resolve) => {
      this.authenticationContext.getUser(() => resolve());
    });
  }

  /**
   * 初期化時の処理
   *
   * AuthenticationContext#handleWindowCallback
   *   OAuth2 Implicit flowに基づきURLハッシュで受け取ったトークンをキャッシュした後にURLハッシュを削除する
   */
  private initialize() {
    /**
     * handleWindowCallback() によって URL ハッシュが削除される前に、
     * 今回のサイト訪問がログイン後のリダイレクトによるものかを判定して
     * イベントを発生させるかどうかを分岐させる必要があるため
     * handleWindowCallback() よりも先に行う。
     */
    if (this.isLoggedInWithLoginScreen()) {
      AuthenticationContextProvider.events.emit('loggedInWithLoginScreen');
    }
    this.authenticationContext.handleWindowCallback();
  }

  /**
   * token を取得する。
   * @param {string} resource
   *   IdToken 取得時には clientId を、AccessToken 取得時には対象APIのURL（ endpoints のキー）を指定する。
   * @return {Promise<string>}
   */
  private acquireToken(resource: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.authenticationContext.acquireToken(
        resource,
        (errDesc: string | null | undefined, token: string, err?: string | null) => {
          /**
           * acquireToken() のコールバック関数内では、第1引数と第3引数でエラー情報を受け取る。
           * @see https://github.com/AzureAD/azure-activedirectory-library-for-js/blob/1.0.16/lib/adal.js#L624-L629
           */
          if (errDesc != null || err != null) {
            const acquireTokenError = makeAcquireTokenError(err, errDesc);
            reject(acquireTokenError);
            return;
          }
          resolve(token);
        },
      );
    }).catch((error) => {
      if (error instanceof LoginRequiredError) {
        this.authenticationContext.login();
      } else if (error instanceof InteractionRequiredError) {
        /**
         * interaction_required エラー時には acquireTokenRedirect() によるトークン取得を試みる
         * @see https://docs.microsoft.com/ja-jp/azure/active-directory/develop/conditional-access-dev-guide
         */
        this.authenticationContext.acquireTokenRedirect(resource);
      }
      return Promise.reject(error);
    });
  }

  /**
   * Azure ADのログイン画面を経由して認証コールバック画面に帰ってきたかどうか。
   *
   * 具体的な条件としては、有効なトークンもAzure ADセッションもない状態でログインが行われたかどうか。
   *
   * これを判別するためにIDトークンかアクセストークンをURLハッシュに持った状態でのリダイレクトが
   * iframe内ではない通常の遷移で行われたかどうかを判定する。
   *
   * Azure ADセッションがある場合はiframe内でトークンを更新するのでこのメソッドはtrueを返さない。
   */
  private isLoggedInWithLoginScreen(): boolean {
    const isCallback = this.authenticationContext.isCallback(window.location.hash);
    const isNotIframe = window.parent === window;
    return isCallback && isNotIframe;
  }
}
