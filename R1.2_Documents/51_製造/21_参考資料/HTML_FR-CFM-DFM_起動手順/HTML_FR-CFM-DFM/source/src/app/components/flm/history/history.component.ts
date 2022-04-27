import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { FunctionCode } from '../../../constants/flm/function-codes/history-management';

import { KbaHistoryCommonComponent } from '../../shared/Kba-history-common/Kba-history-common.component';

import { CommonHeaderService } from '../../../services/shared/common-header.service';
import { KbaModalService } from '../../../services/shared/kba-modal.service';
import { KbaNavigationService } from '../../../services/shared/kba-navigation.service';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { ApiService } from '../../../services/api/api.service';
import { HistoryService } from '../../../services/flm/history/history.service';
import { KbaDatePickerService } from '../../../services/shared/kba-date-picker.service';
import { UserSettingService } from '../../../services/api/user-setting.service';

@Component({
  selector: 'app-history',
  templateUrl:
    '../../shared/Kba-history-common/Kba-history-common.component.html',
  styleUrls: [
    '../../shared/Kba-history-common/Kba-history-common.component.scss',
  ],
  providers: [HistoryService, KbaModalService],
})
export class HistoryComponent extends KbaHistoryCommonComponent
  implements OnInit {
  functionCode = FunctionCode;

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    historyService: HistoryService,
    api: ApiService,
    modalService: KbaModalService,
    alertService: KbaAlertService,
    datePickerService: KbaDatePickerService,
    userSettingService: UserSettingService
  ) {
    // tslint:disable-next-line:max-line-length
    super(
      navigationService,
      title,
      router,
      ref,
      header,
      historyService,
      api,
      modalService,
      alertService,
      datePickerService,
      userSettingService
    );
  }
}
