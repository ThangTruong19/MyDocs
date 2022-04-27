import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild } from '@angular/router';

import AzureAdAuthentication from '../../vendor/k-common-module/ngk-azure-ad-authentication/src/main';
import { AzureAdAuthenticationResult } from '../../vendor/k-common-module/ngk-azure-ad-authentication/src/authentication-result';

import { AuthenticationStatus } from '../../constants/authentication-status';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthenticationService implements CanActivate, CanActivateChild {
  azureAdAuthenticationInfo = (window as any).settings
    .azureAdAuthenticationInfo;

  azureAdAuthentication = environment.settings.skipAuthentication
    ? {
        run: () => Promise.resolve(null),
        getUserAttribute: (accessToken: string, params: string[]) =>
          Promise.resolve(null),
        clearCache: () => null,
      }
    : new AzureAdAuthentication(
        this.azureAdAuthenticationInfo.clientId,
        this.azureAdAuthenticationInfo.tenant,
        this.azureAdAuthenticationInfo.redirectUrl
      );

  token: string | null = null;
  currentUserId: string;
  currentUserName: string;

  constructor() {}

  /**
   * 画面遷移制御
   */
  async canActivate() {
    return this.authentication();
  }

  async canActivateChild() {
    return this.canActivate();
  }

  /**
   * 認証処理
   */
  authentication(): Promise<boolean> {
    if (environment.settings.skipAuthentication) {
      return Promise.resolve(true);
    }

    return new Promise((resolve, reject) => {
      this.azureAdAuthentication
        .run()
        .then(async (res: AzureAdAuthenticationResult) => {
          const isLoggedIn =
            res.status !== AuthenticationStatus.hasNotYetAcquired;
          this.token = isLoggedIn ? res.data : null;
          if (!isLoggedIn) {
            this.currentUserId = null;
            this.currentUserName = null;
          } else if (this.currentUserId == null) {
            const { userId, userName } = await this._getUserAttribute(res.data);
            this.currentUserId = userId;
            this.currentUserName = userName;
          }

          resolve(isLoggedIn);
        })
        .catch(err => reject(err));
    });
  }

  /**
   * ユーザーの属性値を取得する
   */
  private _getUserAttribute(
    token
  ): Promise<{ userId: string; userName: string }> {
    const _window = window as any;
    const userIdKey = _window.settings.azureAdAttributeKeyUserId;
    const userNameKey = _window.settings.azureAdAttributeKeyUserName;

    return new Promise((resolve, reject) => {
      this.azureAdAuthentication
        .getUserAttribute(token, [userIdKey, userNameKey])
        .then(res => {
          resolve({ userId: res[userIdKey], userName: res[userNameKey] });
        })
        .catch(err => reject(err));
    });
  }
}
