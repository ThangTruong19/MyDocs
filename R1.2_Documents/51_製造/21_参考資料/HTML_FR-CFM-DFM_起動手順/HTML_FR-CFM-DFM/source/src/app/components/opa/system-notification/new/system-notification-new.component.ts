import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { Title } from '@angular/platform-browser';

import { SystemNotificationParams } from '../../../../types/opa/system-notification';

import { DateFormat } from '../../../../constants/date-format';

import { KbaAbstractRegisterComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-register-component';
import { SystemNotificationFormComponent } from '../shared/form/system-notification-form.component';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { SystemNotificationService } from '../../../../services/opa/system-notification/system-notification.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaDatePickerService } from '../../../../services/shared/kba-date-picker.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';
import { ApiService } from '../../../../services/api/api.service';

@Component({
  selector: 'app-system-notification-new',
  templateUrl: '../shared/form/system-notification-form.component.html',
  styleUrls: ['../shared/form/system-notification-form.component.scss'],
  providers: [SystemNotificationService],
})
export class SystemNotificationNewComponent extends SystemNotificationFormComponent {
  isUpdate = false;

  constructor(
    nav: KbaNavigationService,
    title: Title,
    router: Router,
    header: CommonHeaderService,
    alert: KbaAlertService,
    modal: KbaModalService,
    systemNotificationService: SystemNotificationService,
    datePickerService: KbaDatePickerService,
    userSettingService: UserSettingService,
    api: ApiService
  ) {
    super(
      nav,
      title,
      header,
      router,
      alert,
      modal,
      systemNotificationService,
      datePickerService,
      userSettingService,
      api
    );
  }

  protected _fetchDataForInitialize() {
    return new Promise(resolve => {
      this.systemNotificationService.fetchInitNew().then(async res => {
        this.initialize(res);
        this.labels = res.label;
        this.resource = res.resource;
        this._groupItems();
        this._setTitle();
        await this._afterInitialize();
        _.set(this.params, 'content', '');
        await this._datePickerInitialize();
        this._refreshTimeInput();
        this.loading = false;
        resolve();
      });
    });
  }

  /**
  * システム通知登録処理
  *
  * @param params システム通知情報
  * @param path 登録後遷移先のパス
  */
  protected _register(params: SystemNotificationParams, path: string): void {
    this._showLoadingSpinner();

    this._clearError();
    this.systemNotificationService.createSystemNotification(params).then(
      res => {
        this.router.navigateByUrl(path).then(e => {
          this._reset();

          this._hideLoadingSpinner();
          this.alertService.show(this.labels.finish_message);
        });
      },
      errorData => this._setError(errorData, this.alertService)
    );
  }

  /**
   * フォームに入力された内容をリセットする
   */
  protected _reset() {
    this.selectedAppCodes.length = 0;
    if (this.isRegionAdmin()) {
      this.groupSelectComponent.reset();
    }
    this.params = _.cloneDeep(this.initialParams);
    const contentControl = this.systemNotificationForm.get(
      'notification.content'
    );
    contentControl.setValue('');
    this._refreshTimeInput();
    contentControl.markAsPristine();
  }

  /**
   * デートピッカーの初期化
   */
  private async _datePickerInitialize(): Promise<any> {
    const today = this.datePickerService.toMoment();

    _.set(this.params, 'start_datetime', today.format(DateFormat.hyphen));
    _.set(this.params, 'start_datetime_hh', '00');
    _.set(this.params, 'start_datetime_mm', '00');
    _.set(
      this.params,
      'start_datetime_formatted',
      today.format(this.datePickerService.inputDateFormat(this.dateFormat))
    );
    _.set(
      this.params,
      'end_datetime',
      today
        .clone()
        .add(1, 'month')
        .format(DateFormat.hyphen)
    );
    _.set(
      this.params,
      'end_datetime_formatted',
      today
        .clone()
        .add(1, 'month')
        .format(this.datePickerService.inputDateFormat(this.dateFormat))
    );
    _.set(this.params, 'end_datetime_hh', '23');
    _.set(this.params, 'end_datetime_mm', '59');

    this.initialParams = _.cloneDeep(this.params);
  }
}
