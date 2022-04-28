import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild } from '@angular/router';
import { AzureAdAuthentication } from 'app/vendors/ngk-azure-ad-authentication/azure-ad-authentication';
import { AzureAdAuthenticationResult } from 'app/vendors/ngk-azure-ad-authentication/authentication-result';
import { AuthenticationStatus } from 'app/constants/authentication-status';
import { environment } from 'environments/environment';
import { AuthData } from 'app/types/auth-data';

/**
 * ログインユーザ情報のサービス
 */
@Injectable()
export class AuthenticationService implements CanActivate, CanActivateChild {

    private azureAdAuthenticationInfo = (window as any).settings
        .azureAdAuthenticationInfo;
    private appCode = (window as any).settings.azureAdAuthenticationInfo.clientId;
    private azureAdAuthentication: AzureAdAuthentication;

    private token: string | null = null;
    private currentUserId: string;
    private currentUserName: string;

    constructor() {
        this.init();
    }

    private init() {
        const isSkipAuthentication: boolean = environment.settings.skipAuthentication;
        this.azureAdAuthentication = isSkipAuthentication
            ? <AzureAdAuthentication>{
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
    }

    /**
     * 画面遷移制御
     */
    public async canActivate() {
        return this.authentication();
    }

    public async canActivateChild() {
        return this.canActivate();
    }

    /**
     * 認証処理
     */
    public authentication(): Promise<boolean> {
        if (environment.settings.skipAuthentication) {
            this.setDummyUserData();
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
                        const { userId, userName } = await this.getUserAttribute(res.data);
                        this.currentUserId = userId;
                        this.currentUserName = userName;
                    }

                    resolve(isLoggedIn);
                })
                .catch(err => reject(err));
        });
    }

    public getAuthData(): AuthData {
        const authData: AuthData = {
            userName: this.currentUserId,
            userId: this.currentUserName,
            accessToken: this.token
        };
        return authData;
    }

    public clearCache(): void {
        return this.azureAdAuthentication.clearCache();
    }

    public auth(): AzureAdAuthentication {
        return this.azureAdAuthentication;
    }

    /**
     * ユーザーの属性値を取得する
     */
    private getUserAttribute(
        token: string
    ): Promise<{ userId: string; userName: string }> {
        const _window: any = window as any;
        const userIdKey: string = _window.settings.azureAdAttributeKeyUserId;
        const userNameKey: string = _window.settings.azureAdAttributeKeyUserName;

        return new Promise((resolve, reject) => {
            this.azureAdAuthentication
                .getUserAttribute(token, [userIdKey, userNameKey])
                .then(res => {
                    resolve({ userId: res[userIdKey], userName: res[userNameKey] });
                })
                .catch(err => reject(err));
        });
    }

    private setDummyUserData(): void {
        if (!this.token) {
            this.currentUserId = 'DevUser001';
            this.currentUserName = 'DevUser001';
            this.token = 'dummy123';

            if (!environment.settings.useEntranceForDevelop) {
                const dummyGroupId = '2';
                localStorage.setItem(`group_id.${this.appCode}`, dummyGroupId);
            }
        }
    }

}