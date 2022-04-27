import { Injectable } from '@angular/core';

import { ScreenCode } from '../../../constants/flm/screen-codes/history-management';
import { ScreenCode as CommonScreenCode } from '../../../constants/flm/screen-codes/common';
import { FunctionCode } from '../../../constants/flm/function-codes/history-management';

import { ResourceService } from '../../../services/api/resource.service';
import { ApiService } from '../../api/api.service';
import { KbaHistoryCommonService } from '../../shared/Kba-history-common.service';

@Injectable()
export class HistoryService extends KbaHistoryCommonService {
  screenCode = ScreenCode;
  functionCode = FunctionCode;
  datePickerScreenCode = CommonScreenCode.common;

  constructor(api: ApiService, resource: ResourceService) {
    super(api, resource);
  }
}
