import { LoginRequiredError } from './entities/login-required-error';
import { AcquireTokenError } from './entities/acquire-token-error';
import { InteractionRequiredError } from './entities/interaction-required-error';
import { UnspecifiedAcquireTokenError } from './entities/unspecified-acquire-token-error';

/**
 * LoginRequiredError かどうかを返す。
 *
 * ログインが必要なケースでのエラー名は定まっておらず、現状 "login required" と "login_required" の2種類を確認済み。
 *
 * ソースコード中では "login required" のエラー名を返すケースが登場する。
 * https://github.com/AzureAD/azure-activedirectory-library-for-js/blob/1.0.17/lib/adal.js#L652-L656
 *
 * Azure AD のセッションが切れている状態でトークンのサイレント更新を行った場合には "login_required" のエラー名となる。
 * https://blogs.msdn.microsoft.com/aaddevsup/2018/11/07/receiving-error-aadsts50058-in-javascript-setting/
 */
const isLoginRequired = (name: string | null): boolean => {
  const rLoginRequired = /login(\s|_)required/;
  return rLoginRequired.test(name);
};

/**
 * InteractionRequiredError かどうかを返す。
 *
 * ユーザーに追加の認証が必要な場合に発生して、このモジュールでは acquireTokenRedirect() によるトークン取得を試みる
 * @see https://docs.microsoft.com/ja-jp/azure/active-directory/develop/conditional-access-dev-guide
 */
const isInteractionRequired = (name: string | null): boolean => {
  return name.indexOf('interaction_required') !== -1;
};

export const makeAcquireTokenError = (name = '', message = ''): AcquireTokenError => {
  if (isLoginRequired(name)) {
    return new LoginRequiredError(message);
  }
  if (isInteractionRequired(name)) {
    return new InteractionRequiredError(message);
  }
  return new UnspecifiedAcquireTokenError(message);
};
