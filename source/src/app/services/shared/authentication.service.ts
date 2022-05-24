import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild } from '@angular/router';
import { AzureAdAuthentication } from 'app/vendors/ngk-azure-ad-authentication/azure-ad-authentication';
import { AzureAdAuthenticationResult } from 'app/vendors/ngk-azure-ad-authentication/authentication-result';
import { AuthenticationStatus } from 'app/constants/authentication-status';
import { AuthData } from 'app/types/auth-data';
import { StorageService } from 'app/services/shared/storage.service';
import { SettingsService } from 'app/services/shared/settings.service';
import { AppSettings, AppSettingsAzureAdAuthenticationInfo, AppSettingsDevelop } from 'app/types/settings';

/**
 * ログインユーザ情報のサービス
 */
@Injectable()
export class AuthenticationService implements CanActivate, CanActivateChild {

    private azureAdAuthenticationInfo: AppSettingsAzureAdAuthenticationInfo;
    private userIdKey: string;
    private userNameKey: string;
    private isSkipAuthentication: boolean;
    private isUseEntranceForDevelop: boolean;
    private develop: AppSettingsDevelop;
    private azureAdAuthentication: AzureAdAuthentication;
    private token: string | null = null;
    private currentUserId: string;
    private currentUserName: string;

    constructor(
        private settingsService: SettingsService,
        private storageService: StorageService
    ) {
        this.init();
    }

    /**
     * 初期処理を行う。
     */
    private init() {

        const appSettings: AppSettings = this.settingsService.getAppSettings();
        this.userIdKey = appSettings.azureAdAttributeKeyUserId;
        this.userNameKey = appSettings.azureAdAttributeKeyUserName;
        this.azureAdAuthenticationInfo = this.settingsService.getAzureAdAuthenticationInfo();
        this.isSkipAuthentication = this.settingsService.isSkipAuthentication();
        this.isUseEntranceForDevelop = this.settingsService.isUseEntranceForDevelop();
        this.develop = this.settingsService.getDevelop();

        this.azureAdAuthentication = this.isSkipAuthentication
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
     * 画面遷移時の認証処理を行う。
     */
    public async canActivate() {
        return this.authentication();
    }

    /**
     * 画面遷移時の認証処理を行う。
     */
    public async canActivateChild() {
        return this.canActivate();
    }

    /**
     * 認証処理
     */
    public authentication(): Promise<boolean> {

        if (this.isSkipAuthentication) {
            // 認証スキップモード(ローカル環境用)の場合

            this.setDummyUserData();
            return Promise.resolve(true);
        } else {
            // 通常モード(認証処理を行う)の場合

            return new Promise((resolve, reject) => {
                this.azureAdAuthentication
                    .run()
                    .then(async (res: AzureAdAuthenticationResult) => {
                        const isLoggedIn: boolean =
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

    }

    public getAuthData(): AuthData {
        const authData: AuthData = {
            accessToken: this.token,
            userName: this.currentUserName,
            userId: this.currentUserId
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

        return new Promise((resolve, reject) => {
            this.azureAdAuthentication
                .getUserAttribute(token, [this.userIdKey, this.userNameKey])
                .then(res => {
                    resolve({ userId: res[this.userIdKey], userName: res[this.userNameKey] });
                })
                .catch(err => reject(err));
        });
    }

    private setDummyUserData(): void {
        if (!this.token) {
            if (this.develop) {
                this.currentUserId = this.develop.userId ? this.develop.userId : null;
                this.currentUserName = this.develop.userName ? this.develop.userName : null;
                this.token = this.develop.accessToken ? this.develop.accessToken : null;

                if (!this.isUseEntranceForDevelop) {
                    const dummyGroupId = this.develop.groupId ? this.develop.groupId : null;
                    this.storageService.setGroupId(dummyGroupId);
                }
            }
        }
    }

}