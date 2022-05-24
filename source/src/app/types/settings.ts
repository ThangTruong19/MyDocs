export interface AppSettings {
    protocol: string;
    hostname: string;
    userSettingsEndpoint: string;
    azureAdAuthenticationInfo: AppSettingsAzureAdAuthenticationInfo;
    azureAdAttributeKeyUserName: string;
    azureAdAttributeKeyUserId: string;
    entranceUrl: string;
    reconsentUrl: string;
    autoLoadCount?: {
        close?: number;
        open?: number;
    };
    datePickerRange?: {
        car?: string[];
        other?: string[];
    };
    notificationDisplayTime?: number;

    appCode?: string;

    skipAuthentication?: boolean;
    useEntranceForDevelop?: boolean;
    develop?: AppSettingsDevelop

}

export interface AppSettingsAzureAdAuthenticationInfo {
    clientId: string;
    tenant: string;
    redirectUrl: string;
    logoutRedirectUrl: string;
}

export interface AppSettingsDevelop {
    accessToken?: string;
    groupId?: string;
    userId?: string;
    userName?: string;
}

export interface AppVersion {
    appVersion?: string;
    appVendorVersion?: string;
}