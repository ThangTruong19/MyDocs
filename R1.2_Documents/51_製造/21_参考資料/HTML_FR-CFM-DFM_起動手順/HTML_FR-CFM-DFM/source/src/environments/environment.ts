// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { adminMapWrapper } from './shared/admin_map_wrapper';

export declare const environment: {
  production: boolean;
  settings: {
    adminMapWrapper: typeof adminMapWrapper;
    navigation: {
      menu: string;
      sideMenu: string;
    };
    commonHeaderScreenCode: string;
    userSearchModalScreenCode: string;
    companySearchModalScreenCode: string;
    userSearchModalFunctionCode: string;
    companySearchModalFunctionCode: string;
    useEntranceForDevelop: boolean;
    appPrefix: string;
    skipAuthentication: boolean;
  };
};
