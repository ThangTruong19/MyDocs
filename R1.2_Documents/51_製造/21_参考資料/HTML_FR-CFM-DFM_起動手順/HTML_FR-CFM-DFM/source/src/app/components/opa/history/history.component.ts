import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import { FunctionCode } from '../../../constants/opa/function-codes/history-management';

import { KbaHistoryCommonComponent } from '../../shared/Kba-history-common/Kba-history-common.component';

import { CommonHeaderService } from '../../../services/shared/common-header.service';
import { KbaModalService } from '../../../services/shared/kba-modal.service';
import { KbaNavigationService } from '../../../services/shared/kba-navigation.service';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { ApiService } from '../../../services/api/api.service';
import { HistoryService } from '../../../services/opa/history/history.service';
import { KbaDatePickerService } from '../../../services/shared/kba-date-picker.service';
import { UserSettingService } from '../../../services/api/user-setting.service';
import { KbaSelectedComponent } from '../../shared/kba-selected/kba-selected.component';
import { FilterReservedWord } from '../../../constants/condition';
import { ResourceValue } from '../../../types/common';

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
  @ViewChild('categoryCodeSelect', { static: false })
  categoryCodeSelect: KbaSelectedComponent;
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

  /**
   * 対象画面のプルダウン変更時の処理
   * @param value 対象画面
   * @override
   */
  async handleAppCodeChange(value) {
    const res = await this.historyService.fetchCategoryResource(value);

    this.resource.operation_history.category_code =
      res.operation_history.category_code;

    if (value === FilterReservedWord.selectAll) {
      this.resource.operation_history.category_code.values =
        this.resource.operation_history.category_code.values
          .filter((val: ResourceValue) => val.value === FilterReservedWord.selectAll);
    }

    if (this.categoryCodeSelect) {
      await this.categoryCodeSelect.refresh();
    }
  }

  /**
   * 初期検索前の処理
   * 依存するリソースを更新する
   */
  protected async _beforeInitFetchList(): Promise<any> {
    if (this.exists('operation_history.group_kind_id')) {
      await this.onGroupKindChange(
        _.get(this.resource, 'operation_history.group_kind_id.values[0].value')
      );
    }
  }
}
