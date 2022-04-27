console.log("mgmt.1.0.3"); /* コマツ管理のバージョン　mgmtは管理メニューを指す */

window.appVersion = 'fr.0.1.0168';
window.settings = {
  protocol: 'https',
  hostname: '#{apiHostName}#',
  userSettingsEndpoint: '#{userSettingsEndpoint}#',
  azureAdAuthenticationInfo: {
    clientId: '#{clientId}#',
    tenant: '#{tenantId}#',
    redirectUrl: '#{redirectUrl}#',
    logoutRedirectUrl: '#{logoutRedirectUrl}#',
  },
  azureAdAttributeKeyUserName: '#{azureAdAttributeKeyUserName}#',
  azureAdAttributeKeyUserId: '#{azureAdAttributeKeyUserId}#',
  entranceUrl: '#{entranceUrl}#',
  reconsentUrl: '#{reconsentUrl}#',
  googleMapKey: '#{googleMapKey}#',
  notificationDisplayTime: 3000,
  autoLoadCount: {
    close: 20,
    open: 10
  },
  maxMapArea: 3,
  maxMapPoint: 8,

  datePickerRange: {
    car: ['19800101', ''],
    information: ['-10y', '10y'],
    other: ['-10y', '']
  },
  showRentalCarCheckbox: false,
  mapPerformanceThreshold: 1000,
  jobSiteMapMaxZoomLevel: 16,
  carBatchDeleteLimit: 50,
  maxClusterZoom: 10,
  detailCarRedirectUrl: '#{detailCarRedirectUrl}#',

  /* 車両登録/変更画面パラメータ設定 */
  carParams: {
    debitKind: '0', // 債権（0: 無）
    intendedUseCode: '99', // 使用目的（99: 未選択）
    dataPublishKind: '1', // 顧客へのデータ公開（1: 納入日以降のみ公開)
  },
};
