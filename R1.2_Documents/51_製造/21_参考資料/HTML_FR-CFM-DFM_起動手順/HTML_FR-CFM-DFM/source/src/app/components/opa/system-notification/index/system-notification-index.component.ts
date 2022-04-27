import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import {
  SystemNotificationIndexParams,
  SystemNotificationDeleteParams,
} from '../../../../types/opa/system-notification';
import { RequestHeaderParams } from '../../../../types/request';
import { Api, Labels } from '../../../../types/common';
import { ModalValues } from '../../../../types/common';
import { DatePickerParams } from '../../../../types/calendar';

import { PublishGroupKind } from '../../../../constants/publish-group-kind';
import { FunctionCode } from '../../../../constants/opa/function-codes/system-notification-management';
import { DateFormat } from '../../../../constants/date-format';

import { KbaAbstractIndexComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-index-component';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { ApiService } from '../../../../services/api/api.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { SystemNotificationService } from '../../../../services/opa/system-notification/system-notification.service';
import { KbaDatePickerService } from '../../../../services/shared/kba-date-picker.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';

@Component({
  selector: 'app-system-notification-index',
  templateUrl: './system-notification-index.component.html',
  styleUrls: ['./system-notification-index.component.scss'],
})
export class SystemNotificationIndexComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('deleteModalContent', { static: false })
  deleteModalContent: TemplateRef<null>;
  @ViewChild('detailModalContent', { static: false })
  detailModalContent: TemplateRef<null>;

  params: SystemNotificationIndexParams;
  deleteParams: SystemNotificationDeleteParams;
  datePickerParams: DatePickerParams;
  thList: {
    name: string;
    label: string;
    sortKey: string;
    sortable: boolean;
    displayable: boolean;
    shortName: string;
    dataKey: string;
  }[];
  BLOCK_LABEL_KEY = 'publish_group';
  PUBLISH_APPLICATION_KEY = 'publish_applications.name';
  REGIST_DATETIME_KEY = 'registration_datetime';
  NOTIFICATION_START_DATETIME_KEY = 'notification.start_datetime';
  NOTIFICATION_END_DATETIME_KEY = 'notification.end_datetime';
  NOTIFICATION_CONTENT_KEY = 'notification.content';
  NOTIFICATION_KIND_NAME_KEY = 'publish_group.kind_name';
  notSortingColumns = [
    'applications_system_notifications.publish_applications.name',
  ];
  fields = null;
  fieldSelectPopoverVisible = false;
  isBlockKind = false;
  _dateFormat = '';
  timeZone = '';
  enableDateRange: string[] = [];
  beginningWday: number;
  excludeSearchParams: string[] = ['date_from_formatted', 'date_to_formatted'];
  datePickerLabels: Labels;
  systemNotifications;

  deleteModalPromise: Promise<void>;
  detailModalPromise: Promise<void>;
  fieldResourcesPromise: Promise<void>;

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    header: CommonHeaderService,
    modalService: KbaModalService,
    private systemNotificationService: SystemNotificationService,
    private alertService: KbaAlertService,
    ref: ChangeDetectorRef,
    private api: ApiService,
    private datePickerService: KbaDatePickerService,
    private userSettingService: UserSettingService
  ) {
    super(navigationService, title, router, ref, header, modalService);
  }

  /**
   * テーブルに表示するデータを取得
   */
  fetchList(sort_key?: string) {
    return new Promise(resolve => {
      this.requestHeaderParams['X-Sort'] = sort_key || '';
      this.isFetching = true;
      const searchParams = _.omit(this.searchParams, this.excludeSearchParams);
      this.systemNotificationService
        .fetchIndexList(searchParams, this.requestHeaderParams)
        .then((res: any) => {
          this.systemNotifications = _.cloneDeep(
            res.result_data.applications_system_notifications
          );
          const formatted = this._formatList(
            res.result_data.applications_system_notifications,
            this.thList
          );
          this._fillLists(res.result_header, formatted);

          this.isFetching = false;
          this._afterFetchList();
          resolve();
        });
    });
  }

  /**
   * 編集ボタン押下コールバック
   * @param target 編集対象のオブジェクト
   */
  onClickEdit(target) {
    this.router.navigate([
      '/system_notifications/',
      _.get(target, 'id'),
      'edit',
    ]);
  }

  /**
   * 検索処理
   */
  onClickSearch() {
    super.onClickSearch();
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * 詳細ボタン押下コールバック
   *
   * 確認モーダルを表示する。
   *
   * @param system_notification システム通知
   */
  async onClickDetail(system_notification: object) {
    this._showLoadingSpinner();

    if (this.detailModalValues == null) {
      await this.detailModalPromise;
    }

    this.isBlockKind =
      _.get(system_notification, 'publish_group.kind_id') ===
      PublishGroupKind['block'];

    await this._fetchListId(system_notification['id'], this.detailModalValues);

    this._hideLoadingSpinner();

    this.modalService.open({
      title: this.labels.detail_modal_title,
      labels: this.labels,
      content: this.detailModalContent,
    });
  }

  /**
   * 削除ボタン押下コールバック
   *
   * 確認モーダルを表示し、確認後に削除APIをリクエストする。
   * リクエスト成功時にアラートメッセージを表示し、一覧を初期化する。
   *
   * @param system_notification システム通知
   */
  async onClickDelete(system_notification: object) {
    this._showLoadingSpinner();

    if (this.deleteModalValues == null) {
      await this.deleteModalPromise;
    }

    const id = system_notification['id'];
    this.deleteParams = {
      update_datetime: system_notification['update_datetime'],
    };
    this.isBlockKind =
      _.get(system_notification, 'publish_group.kind_id') ===
      PublishGroupKind['block'];

    await this._fetchListId(id, this.deleteModalValues);

    this._hideLoadingSpinner();

    this.modalService.open({
      title: this.labels.delete_modal_title,
      labels: this.labels,
      content: this.deleteModalContent,
      okBtnLabel: this.labels.delete,
      okBtnClass: 'btn-delete',
      closeBtnLabel: this.labels.cancel,
      ok: () => {
        this._showLoadingSpinner();

        this.systemNotificationService
          .deleteSystemNotifications(id, this.deleteParams)
          .then(res => {
            this.fetchList(this.sortingParams['sort']);

            this._hideLoadingSpinner();
            this.alertService.show(this.labels.finish_message);
          });
      },
    });
  }

  /**
   * 表示項目設定ボタン押下時の処理
   */
  onClickFieldSelect() {
    this.fieldSelectPopoverVisible = !this.fieldSelectPopoverVisible;
  }

  /**
   * 指定項目設定ボタン押下時の処理
   * @param event イベント
   */
  onFieldSelectOk(event) {
    this.api
      .updateField(FunctionCode.listFunction, event.fields)
      .then((res: any) => {
        return new Promise(resolve => {
          this.api
            .fetchFields(FunctionCode.listFunction)
            .subscribe(_res => resolve(_res));
        });
      })
      .then((res: any) => {
        this._updateFields(res);
        this.fetchList(this.sortingParams['sort']);
      });
  }

  /**
   * 編集ボタンの表示可否
   * @param data データ
   */
  editIconHidden(data) {
    return this._isModifyIconsHidden(data);
  }

  /**
   * 削除ボタンの表示可否
   * @param data データ
   */
  deleteIconHidden(data) {
    return this._isModifyIconsHidden(data);
  }

  /**
   * テーブルの初期化に必要なデータを取得
   */
  protected async _fetchDataForInitialize() {
    const res = await this.systemNotificationService.fetchInitData();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this._reflectXFields(res.fields);
    this.thList = this._createThList(res.fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this.updatable = res.updatable;
    this.deletable = res.deletable;
    this._updateFields(res.fields);
    await this._datePickerInitialize();
  }

  protected _afterInitFetchList() {
    this.deleteModalPromise = this._buildDeleteModalValues();
    this.detailModalPromise = this._buildDetailModalValues();
    this.fieldResourcesPromise = this._buildFieldResources();
  }

  protected _formatList(listBody: any[], thList: any[]) {
    const formattedItemKeys = [
      this.PUBLISH_APPLICATION_KEY,
      this.BLOCK_LABEL_KEY,
      this.REGIST_DATETIME_KEY,
      this.NOTIFICATION_START_DATETIME_KEY,
      this.NOTIFICATION_END_DATETIME_KEY,
    ];
    return listBody.map(data =>
      _.reduce(
        thList,
        (result, th) => {
          const value = _.get(data, th.formatKey);
          if (!th.optional) {
            result[th.dataKey] = _.includes(formattedItemKeys, th.dataKey)
              ? this._getFormatData(data, th.dataKey, value)
              : value;
          }
          return result;
        },
        {}
      )
    );
  }

  /**
   * データキー取得
   * @param key キー（指定項目のパス）
   * @override
   */
  protected _dataKey(key: string): string {
    return key
      .split('.')
      .slice(1)
      .join('.');
  }

  /**
   * 各オブジェクトの値を加工する
   * @param data 行データ
   * @param itemPath 項目パス
   * @param value 加工前の値
   */
  private _getFormatData(data, itemPath, value) {
    let result: any = '';
    switch (itemPath) {
      case this.PUBLISH_APPLICATION_KEY:
        result = _.chain(data['publish_applications'])
          .map('name')
          .join(' / ')
          .value();
        break;
      case this.BLOCK_LABEL_KEY:
        const blocks = data['publish_group']
          ? data['publish_group']['blocks']
          : [];
        result = {
          kind_name: data.publish_group.kind_name,
          blocks: {
            label: _.chain(blocks)
              .map('label')
              .join(' / ')
              .value(),
          },
        };
        break;
      case this.REGIST_DATETIME_KEY:
      case this.NOTIFICATION_START_DATETIME_KEY:
      case this.NOTIFICATION_END_DATETIME_KEY:
        result = this.dateTimeFormat(value);
    }
    return result;
  }

  /**
   * 指定項目取得 API の結果を反映
   * @param fields 指定項目
   */
  private _updateFields(fields) {
    this.fields = fields;
    this.thList = this._createThList(fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this._setXFields(this._createXFields(fields));
  }

  /**
   * システム通知IDで一覧を取得する
   * @param id システム通知ID
   * @param modalValues モーダル表示用
   */
  private _fetchListId(id: string, modalValues: ModalValues): Promise<any> {
    return this.systemNotificationService
      .fetchIndexList(
        { system_notification_id: id },
        modalValues.requestHeaderParams
      )
      .then((res: Api) => {
        const resultData = this._formatList(
          res.result_data.applications_system_notifications,
          modalValues.listDesc
        );

        modalValues.listVal = resultData[0];
      });
  }

  /**
   * デートピッカーの初期化
   */
  private async _datePickerInitialize(): Promise<any> {
    const datePickerConfig = this.userSettingService.getDatePickerConfig();
    this.beginningWday = datePickerConfig.first_day_of_week_kind;
    const _window = window as any;
    this.enableDateRange = _window.settings.datePickerRange.information;
    this._dateFormat = datePickerConfig.date_format_code;
    this.timeZone = datePickerConfig.time_difference;

    this.datePickerParams = {
      timeZone: this.timeZone,
      dateFormat: this._dateFormat,
    };

    this.datePickerService.initialize(this.datePickerParams);

    const today = this.datePickerService.toMoment();

    _.set(this.params, 'date_from', today.format(DateFormat.hyphen));
    _.set(
      this.params,
      'date_from_formatted',
      today.format(this.datePickerService.inputDateFormat(this._dateFormat))
    );
    _.set(
      this.params,
      'date_to',
      today
        .clone()
        .add(1, 'month')
        .format(DateFormat.hyphen)
    );
    _.set(
      this.params,
      'date_to_formatted',
      today
        .clone()
        .add(1, 'month')
        .format(this.datePickerService.inputDateFormat(this._dateFormat))
    );
  }

  /**
   * 編集・削除ボタンの表示可否を返す
   * @param data データ
   */
  private _isModifyIconsHidden(data) {
    const systemNotification = this.systemNotifications.find(
      sf => sf.id === data['id']
    );
    return (
      !this.exists('block_id') &&
      _.get(systemNotification, 'owner_group.kind_id') ===
        PublishGroupKind.region
    );
  }

  /**
   * 削除モーダル用ヘッダ項目生成
   */
  private _buildDeleteModalValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.systemNotificationService.fetchIndexDeleteFields();
      this.deleteModalValues = this._getModalValues(res);
      resolve();
    });
  }

  /**
   * 詳細モーダル用ヘッダ項目生成
   */
  private _buildDetailModalValues() {
    return new Promise<void>(async (resolve) => {
      const res = await this.systemNotificationService.fetchIndexDetailFields();
      this.detailModalValues = this._getModalValues(res);
      resolve();
    });
  }

  /**
   * 指定項目リソース取得
   */
  private _buildFieldResources() {
    return new Promise<void>(async (resolve) => {
      const res = await this.systemNotificationService.fetchIndexFieldResources();
      this.fieldResources = res;
      resolve();
    });
  }
}
