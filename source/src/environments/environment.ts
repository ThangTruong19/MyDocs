// import { adminMapWrapper } from './shared/admin_map_wrapper';

export declare const environment: {
    production: boolean;
    settings: {
//      adminMapWrapper: typeof adminMapWrapper;
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
