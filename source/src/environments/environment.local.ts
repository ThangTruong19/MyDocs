import { FunctionCodeConst } from 'app/constants/api/function-code-const';
import { ScreenCodeConst } from 'app/constants/api/screen-code-const';

export const environment = {
    production: false, // ローカル以外で実行する時のプロダクション・モード設定
    settings: {
        navigation: {
            menu: FunctionCodeConst.MENU_FUNCTION,
            sideMenu: FunctionCodeConst.SIDE_MENU_FUNCTION
        },
        commonHeaderScreenCode: ScreenCodeConst.CDSM_COMMON_CODE,
        appPrefix: 'cdsm'
    },
};
