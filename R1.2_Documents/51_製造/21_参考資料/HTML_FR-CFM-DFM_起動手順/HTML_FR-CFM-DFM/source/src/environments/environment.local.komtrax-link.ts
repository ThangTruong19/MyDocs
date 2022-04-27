// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { ScreenCode } from '../app/constants/komtrax-link/screen-codes/common';

export const environment = {
  production: false,
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
    skipAuthentication: true,
  },
};
