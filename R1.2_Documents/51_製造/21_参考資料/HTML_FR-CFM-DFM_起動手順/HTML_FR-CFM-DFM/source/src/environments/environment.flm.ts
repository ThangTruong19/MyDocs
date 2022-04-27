// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { adminMapWrapper } from './shared/admin_map_wrapper';
import { FunctionCode } from '../app/constants/flm/function-codes/common';
import { ScreenCode } from '../app/constants/flm/screen-codes/common';

export const environment = {
  production: false,
  settings: {
    adminMapWrapper,
    navigation: {
      menu: FunctionCode.managementDashboardMenu,
      sideMenu: FunctionCode.managementSideMenu,
    },
    commonHeaderScreenCode: ScreenCode.common,
    userSearchModalScreenCode: ScreenCode.commonAuthenticationUser,
    companySearchModalScreenCode: ScreenCode.commonAuthenticationCompany,
    userSearchModalFunctionCode: FunctionCode.commonAuthenticationUser,
    companySearchModalFunctionCode: FunctionCode.commonAuthenticationCompany,
    useEntranceForDevelop: true,
    appPrefix: 'flm',
    skipAuthentication: false,
  },
};
