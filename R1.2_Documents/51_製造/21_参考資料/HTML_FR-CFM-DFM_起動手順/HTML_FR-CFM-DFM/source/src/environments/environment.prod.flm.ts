import { adminMapWrapper } from './shared/admin_map_wrapper';
import { FunctionCode } from '../app/constants/flm/function-codes/common';
import { ScreenCode } from '../app/constants/flm/screen-codes/common';

export const environment = {
  production: true, // ローカル以外で実行する時のプロダクション・モード設定
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
    appPrefix: 'flm',
    useEntranceForDevelop: false,
    skipAuthentication: false,
  },
};
