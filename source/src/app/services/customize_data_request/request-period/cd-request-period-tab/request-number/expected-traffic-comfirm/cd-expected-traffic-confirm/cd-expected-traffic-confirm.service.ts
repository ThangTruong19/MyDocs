import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { Apis } from 'app/constants/apis';
import { ResourceKind } from 'app/constants/resource-type';
import { Fields } from 'app/types/common';
import { RequestHeaderParams } from 'app/types/request';
import { SearchItems } from 'app/types/search';
import { FunctionCodeConst } from 'app/constants/api/function-code-const';
import { ScreenCodeConst } from 'app/constants/api/screen-code-const';
import { ApiService } from 'app/services/api/api.service';
import { ResourceService } from 'app/services/api/resource.service';



@Injectable()
export class CdExpectedTrafficComfirmService {
  constructor(private api: ApiService, private resource: ResourceService) { }

  /**
   * 車両管理一覧画面の初期表示に必要な情報を取得
   */
  fetchCarInitData() {
    this.api.currentScreenCode = ScreenCodeConst.CS_EXPECTED_TRAFFIC_CONFIRM_LIST;
    return this.api.callApisForInitialize(ScreenCodeConst.CS_EXPECTED_TRAFFIC_CONFIRM_LIST, 'fetchCarInitData', {
      fields: () => this.api.fetchFields(FunctionCodeConst.CS_EXPECTED_TRAFFIC_CONFIRM_LISTFUNCTION),
      downloadFields: () =>
        this.api.fetchFields(FunctionCodeConst.CS_EXPECTED_TRAFFIC_CONFIRM_LISTDOWNLOADFUNCTION),
      // updatable: Apis.putCars_carId_,
      // deletable: Apis.deleteCars,
      fieldResources: () =>
        this.api.fetchFieldResources(FunctionCodeConst.CS_EXPECTED_TRAFFIC_CONFIRM_LISTFUNCTION),
      searchCondition: () => this.api.fetchSearchCondition(ScreenCodeConst.CS_EXPECTED_TRAFFIC_CONFIRM_LIST),
    });
  }



}
