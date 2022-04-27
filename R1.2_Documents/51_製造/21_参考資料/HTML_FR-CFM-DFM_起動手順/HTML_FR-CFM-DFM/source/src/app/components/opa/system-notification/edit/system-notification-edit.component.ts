import {
  Component,
  ViewChild,
  ChangeDetectorRef,
  AfterViewChecked,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import * as _ from 'lodash';
import * as moment from 'moment';
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
import { PublishGroupKind } from '../../../../constants/publish-group-kind';

type Moment = moment.Moment;

@Component({
  selector: 'app-system-notification-edit',
  templateUrl: '../shared/form/system-notification-form.component.html',
  styleUrls: ['../shared/form/system-notification-form.component.scss'],
  providers: [SystemNotificationService],
})
export class SystemNotificationEditComponent
  extends SystemNotificationFormComponent
  implements AfterViewChecked {
  isUpdate = true;
  systemNotificationId = '';
  target: any;

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
    api: ApiService,
    private activatedRoute: ActivatedRoute,
    private ref: ChangeDetectorRef
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

  ngAfterViewChecked() {
    this.safeDetectChanges();
  }

  protected async _fetchDataForInitialize() {
    const searchParams = {
      system_notification_id: '',
    };
    this.activatedRoute.params.subscribe(
      p =>
        (this.systemNotificationId = searchParams.system_notification_id = p.id)
    );
    const res = await this.systemNotificationService.fetchEditInitData(
      searchParams
    );
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._groupItems();
    this._setTitle();
    await this._afterInitialize();
    this.target = res.target.result_data.applications_system_notifications[0];

    if (this.target == null) {
      this.params = null;
      this.loading = false;
      return;
    }
    this._restoreData();
    this._refreshTimeInput();
    this.loading = false;
  }

  /**
   * システム通知更新処理
   *
   * @param params システム通知情報
   * @param path 更新後遷移先のパス
   */
  protected _register(params: SystemNotificationParams, path: string): void {
    this._showLoadingSpinner();

    _.set(
      params,
      'applications_system_notification.update_datetime',
      _.get(this.target, 'update_datetime')
    );
    this._clearError();
    this.systemNotificationService
      .updateSystemNotifications(this.systemNotificationId, params)
      .then(
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
    this._restoreData();
    this.refreshFormTextInput();
    this._refreshTimeInput();
  }

  /**
   * 一覧取得より取得したデータで画面の初期状態を復元する
   */
  private _restoreData() {
    _.set(this.params, 'content', _.get(this.target, 'notification.content'));
    this.selectedAppCodes = _.chain(this.target)
      .get('publish_applications')
      .map('code')
      .value();

    const start_datetime = moment(
      _.get(this.target, 'notification.start_datetime'),
      this.datePickerService.inputDateTimeFormat(
        this.datePickerParams.dateFormat
      )
    );

    _.set(
      this.params,
      'start_datetime',
      start_datetime.format(DateFormat.hyphen)
    );
    _.set(
      this.params,
      'start_datetime_formatted',
      start_datetime.format(
        this.datePickerService.inputDateFormat(this.datePickerParams.dateFormat)
      )
    );
    _.set(this.params, 'start_datetime_hh', start_datetime.format('HH'));
    _.set(this.params, 'start_datetime_mm', start_datetime.format('mm'));

    const end_datetime = moment(
      _.get(this.target, 'notification.end_datetime'),
      this.datePickerService.inputDateTimeFormat(
        this.datePickerParams.dateFormat
      )
    );

    _.set(this.params, 'end_datetime', end_datetime.format(DateFormat.hyphen));
    _.set(
      this.params,
      'end_datetime_formatted',
      end_datetime.format(
        this.datePickerService.inputDateFormat(this.datePickerParams.dateFormat)
      )
    );
    _.set(this.params, 'end_datetime_hh', end_datetime.format('HH'));
    _.set(this.params, 'end_datetime_mm', end_datetime.format('mm'));

    if (this.isRegionAdmin()) {
      this.selectedGroup = _.get(this.target, 'publish_group.kind_id');

      if (this.target.publish_group.kind_id === PublishGroupKind.block) {
        this.selectedGroupItems = _.chain(this.target)
          .get('publish_group.blocks')
          .map('id')
          .value();
      }
    }
  }
}
