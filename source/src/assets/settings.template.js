window.appVersion = 'exe.0.0.0001';
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
  autoLoadCount: {
    close: 20,
    open: 10
  },
  datePickerRange: {
    car: ['19800101', ''],
    information: ['-10y', '10y'],
    other: ['-10y', '']
  },
};
