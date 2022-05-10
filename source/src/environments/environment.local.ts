import { ScreenCodeConst } from '../app/constants/api/screen-code-const';

export const environment = {
    production: false, // ローカル以外で実行する時のプロダクション・モード設定
    settings: {
        navigation: {
            menu: 'cdsm_mgt_menu',
            sideMenu: 'cdsm_side_menu',
        },
        commonHeaderScreenCode: 'cdsm_common',
        userSearchModalScreenCode: '',
        companySearchModalScreenCode: '',
        userSearchModalFunctionCode: '',
        companySearchModalFunctionCode: '',
        appPrefix: 'cdsm',
        useEntranceForDevelop: false,
        skipAuthentication: true,
    },
};
