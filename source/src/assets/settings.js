window.settings = {
  skipAuthentication: true, // ローカル開発用の設定追加（AzureAD認証機能スキップ設定）
  useEntranceForDevelop: false, // ローカル開発用の追加（開発用のダミーのエントランス機能を有効にする）

  protocol: 'http',
  hostname: 'localhost:4201',
  userSettingsEndpoint: 'http://localhost:4201/v1/user_settings',
  azureAdAuthenticationInfo: {
    clientId: 'ba1ef16c-d23b-4e03-b2bc-40239e3f37df',
    tenant: '13180b0c-ea10-4ef0-9d7c-f517a3fad178',
    redirectUrl: 'http//localhost:4200/entrance',
    logoutRedirectUrl: 'http//localhost:4200/',
  },
  datePickerRange: {
    car: ['19800101', ''],
    information: ['-10y', '10y'],
    other: ['-10y', '']
  },
  azureAdAttributeKeyUserName: 'extension_cb99840cc6854095a6e348b12ee93cb3_kmtx_display_name',
  azureAdAttributeKeyUserId: 'extension_cb99840cc6854095a6e348b12ee93cb3_kmtx_user_seq_id',
  entranceUrl: 'http//localhost:4200/dummy/entrance/',
  reconsentUrl: 'http//localhost:4200/dummy/entrance/tos/re-consent',
  autoLoadCount: {
    close: 20,
    open: 10
  },
  datePickerRange: {
    car: ['19800101', ''],
    information: ['-10y', '10y'],
    other: ['-10y', '']
  },
  notificationDisplayTime: 3000,
};
