import { ScreenCode } from '../app/constants/komtrax-link/screen-codes/common';

export const environment = {
  production: true,
  settings: {
    adminMapWrapper: {},
    navigation: {
      menu: '',
      sideMenu: '',
    },
    commonHeaderScreenCode: ScreenCode.common,
    userSearchModalScreenCode: '',
    companySearchModalScreenCode: '',
    userSearchModalFunctionCode: '',
    companySearchModalFunctionCode: '',
    appPrefix: 'flm',
    useEntranceForDevelop: true,
    skipAuthentication: false,
  },
};
