import { OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';
import * as moment from 'moment';

import { SystemNotificationParams } from '../../../../../types/opa/system-notification';
import { DatePickerParams } from '../../../../../types/calendar';

import { PublishGroupKind } from '../../../../../constants/publish-group-kind';
import { DateTimeFormatKind } from '../../../../../constants/date-format';

import { KbaAbstractRegisterComponent } from '../../../../../components/shared/kba-abstract-component/kba-abstract-register-component';
import { KbaGroupSelectComponent } from '../../../../shared/kba-group-select/kba-group-select.component';

import { KbaNavigationService } from '../../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../../services/shared/kba-modal.service';
import { SystemNotificationService } from '../../../../../services/opa/system-notification/system-notification.service';
import { KbaAlertService } from '../../../../../services/shared/kba-alert.service';
import { KbaDatePickerService } from '../../../../../services/shared/kba-date-picker.service';
import { Labels } from '../../../../../types/common';
import { UserSettingService } from '../../../../../services/api/user-setting.service';
import { ApiService } from '../../../../../services/api/api.service';

export abstract class SystemNotificationFormComponent
  extends KbaAbstractRegisterComponent
  implements OnInit {
  @ViewChild(KbaGroupSelectComponent, { static: false })
  groupSelectComponent: KbaGroupSelectComponent;
  @ViewChild('submitModalContent', { static: false })
  submitModalContent: TemplateRef<null>;

  loading = true;

  initialParams: {
    applications_system_notification: SystemNotificationParams;
  } = {
      applications_system_notification: {
        publish_application_codes: [],
        publish_group: null,
        notification: {
          content: '',
          start_datetime: '',
          end_datetime: '',
        },
      },
    };

  params: {
    applications_system_notification: SystemNotificationParams;
    start_datetime_hh?: string;
    start_datetime_mm?: string;
    end_datetime_hh?: string;
    end_datetime_mm?: string;
  } = {
      applications_system_notification: {
        publish_application_codes: [],
        publish_group: null,
        notification: {
          content: '',
          start_datetime: '',
          end_datetime: '',
        },
      },
    };

  datePickerParams: DatePickerParams;
  datePickerLabels: Labels;

  systemNotificationForm: FormGroup = new FormGroup({});

  excludeParams = [
    'content',
    'start_datetime',
    'start_datetime_hh',
    'start_datetime_mm',
    'start_datetime_formatted',
    'end_datetime',
    'end_datetime_hh',
    'end_datetime_mm',
    'end_datetime_formatted',
  ];

  groupItems = [];
  selectAllGroupKind = PublishGroupKind['region'];
  initGroupKind = PublishGroupKind['block'];
  descItem: any[] = [];
  valItem: any;
  selectedAppCodes: string[] = [];
  rowspan: number;
  selectedGroup = '';
  selectedGroupItems: any[] = [];

  dateFormat = '';
  timeZone = '';
  enableDateRange: string[] = [];
  isUsedKind = false;
  beginningWday: number;
  invalidDateString = moment.invalid().format();

  /**
   * 公開先グループ選択モーダルの選択結果が有効かどうか
   * @return true: 有効 / false: 無効
   */
  get isModalGroupSelectOk() {
    if (_.isUndefined(this.groupSelectComponent)) {
      return true;
    }

    return this.isRegionAdmin()
      ? this.groupSelectComponent.isGroupSelectOk()
      : true;
  }

  /**
   * 表示開始日時を返却します。
   */
  get start_date_time() {
    const start_datetime = _.get(this.params, 'start_datetime');
    const start_datetime_hh = _.get(this.params, 'start_datetime_hh');
    const start_datetime_mm = _.get(this.params, 'start_datetime_mm');

    return `${start_datetime}T${start_datetime_hh}:${start_datetime_mm}:00`;
  }

  /**
   * 表示終了日時を返却します。
   */
  get end_date_time() {
    const end_datetime = _.get(this.params, 'end_datetime');
    const end_datetime_hh = _.get(this.params, 'end_datetime_hh');
    const end_datetime_mm = _.get(this.params, 'end_datetime_mm');

    return `${end_datetime}T${end_datetime_hh}:${end_datetime_mm}:00`;
  }

  /**
   * 公開先グループが「ブロック」かどうか
   * @return true: ブロック / false: リージョン
   */
  get isBlockKind(): boolean {
    return (
      _.get(
        this.params,
        'applications_system_notification.publish_group.kind_id'
      ) === PublishGroupKind['block']
    );
  }

  constructor(
    nav: KbaNavigationService,
    title: Title,
    header: CommonHeaderService,
    protected router: Router,
    protected alertService: KbaAlertService,
    protected modalService: KbaModalService,
    protected systemNotificationService: SystemNotificationService,
    protected datePickerService: KbaDatePickerService,
    protected userSettingService: UserSettingService,
    protected api: ApiService
  ) {
    super(nav, title, header);
  }

  /**
   * 入力内容リセットコールバック
   *
   * 入力内容リセット確認モーダルを表示する。
   * 確認後、入力内容をリセットする。
   */
  onClickReset(): void {
    this.modalService.open({
      title: this.labels.reset_modal_title,
      labels: this.labels,
      content: this.resetModalContent,
      ok: async () => await this._reset(),
    });
  }

  /**
   * 登録/変更ボタン押下コールバック
   */
  onClickSubmit(): void {
    const path = this.isUpdate ? '/system_notifications' : '/';
    this._registerModalOpen(path);
  }

  /**
   * 続けて登録ボタン押下コールバック
   */
  onClickContinue() {
    this._registerModalOpen('/system_notifications/new');
  }

  /**
   * リージョン管理者かどうかを返却する
   *
   * @return true: リージョン管理者 / false: ブロック管理者
   */
  isRegionAdmin(): boolean {
    return _.has(
      this.resource,
      'applications_system_notification.publish_group.kind_id'
    );
  }

  /**
   * 公開先選択モーダルが閉じられた際のコールバック
   * @param selectedData 選択済み情報
   */
  onCloseGroupSelectModal(selectedData) {
    this.selectedGroup = selectedData['group'];
    this.selectedGroupItems = selectedData['items'];
  }

  /**
   * 既に該当のチェックボックスがチェック済みかどうかを返却する。
   *
   * @param value 値
   * @return true: チェック済み / false: 未チェック
   */
  isChecked(value) {
    return _.includes(this.selectedAppCodes, value);
  }

  /**
   * フォームグループを取得
   * @param path パス
   */
  getFormGroup(path) {
    return (
      this.systemNotificationForm.get(path) ||
      path
        .split('.')
        .reduce(
          (fg, p) => fg.get(p) || this._initializeFormGroup(fg, p),
          this.systemNotificationForm
        )
    );
  }

  /**
   * 時刻の値が正確な形式であることを判定する
   * @param value 値
   */
  isTimeValueValid(value: string) {
    return /^\d+$/.test(value);
  }

  /**
   * 時刻の値が正確な形式であることを判定する
   * @param hour 時
   * @param minute 分
   */
  isStartDateTimeFormatValid() {
    return (
      this._formatDatetime(
        this.start_date_time,
        DateTimeFormatKind.withTimeZone
      ) !== this.invalidDateString &&
      (this.params as any).start_datetime_hh !== '24'
    );
  }

  /**
   * 時刻の値が正確な形式であることを判定する
   * @param hour 時
   * @param minute 分
   */
  isEndDateTimeFormatValid() {
    return (
      this._formatDatetime(
        this.end_date_time,
        DateTimeFormatKind.withTimeZone
      ) !== this.invalidDateString &&
      (this.params as any).end_datetime_hh !== '24'
    );
  }

  /**
   * 時刻の値が正確な形式であることを判定する
   * @param hour 時
   * @param minute 分
   */
  isStartDateTimeValid() {
    const p = this.params as any;
    return (
      this.isStartDateTimeFormatValid() &&
      this.isTimeValueValid(p.start_datetime_hh) &&
      this.isTimeValueValid(p.start_datetime_mm)
    );
  }

  /**
   * 時刻の値が正確な形式であることを判定する
   * @param hour 時
   * @param minute 分
   */
  isEndDateTimeValid() {
    const p = this.params as any;
    return (
      this.isEndDateTimeFormatValid() &&
      this.isTimeValueValid(p.end_datetime_hh) &&
      this.isTimeValueValid(p.end_datetime_mm)
    );
  }

  /**
   * 入力された内容を API に渡し登録を行う
   * @param params パラメータ
   * @param path 遷移後のパス
   */
  protected abstract _register(params: SystemNotificationParams, path: string);

  /**
   * フォームに入力された内容をリセットする
   */
  protected abstract _reset();

  /**
   * 公開先アプリのチェックボックス押下時のコールバック
   * @param event イベント
   * @param trueValue チェックされた際に設定する値
   */
  protected onChangePublishAppCode(event, trueValue: string) {
    if (event.target.checked) {
      if (!_.includes(this.selectedAppCodes, trueValue)) {
        this.selectedAppCodes.push(trueValue);
      }
    } else {
      _.pull(this.selectedAppCodes, trueValue);
    }
  }

  /**
   * 公開先グループ選択モーダルのブロックの選択肢を生成する
   */
  protected _groupItems() {
    if (
      _.get(
        this.resource,
        'applications_system_notification.publish_group.block_ids'
      )
    ) {
      this.groupItems = _.get(
        this.resource,
        'applications_system_notification.publish_group.block_ids'
      ).values;
    } else {
      this.groupItems = [];
    }
  }

  /**
   * 初期化完了後に行う処理
   */
  protected async _afterInitialize(): Promise<any> {
    const datePickerConfig = this.userSettingService.getDatePickerConfig();
    this.beginningWday = datePickerConfig.first_day_of_week_kind;
    const _window = window as any;
    this.enableDateRange = _window.settings.datePickerRange.information;
    this.dateFormat = datePickerConfig.date_format_code;
    this.timeZone = datePickerConfig.time_difference;

    this.datePickerParams = {
      timeZone: this.timeZone,
      dateFormat: this.dateFormat,
    };

    this.datePickerService.initialize(this.datePickerParams);

    await this._buildFormControls();
  }

  /**
   * フォームの部品を angular の form に登録します。
   */
  protected async _buildFormControls() {
    // 表示開始日時(GMT), 表示終了日時(GMT), 通知内容
    this.systemNotificationForm.addControl(
      'notification',
      new FormGroup({
        start_datetime: new FormControl('', Validators.required),
        start_datetime_hh: new FormControl('', Validators.required),
        start_datetime_mm: new FormControl('', Validators.required),
        end_datetime: new FormControl('', Validators.required),
        end_datetime_hh: new FormControl('', Validators.required),
        end_datetime_mm: new FormControl('', Validators.required),
        content: new FormControl('', Validators.required),
      })
    );
  }

  /**
   * 日時を整形して返却します。
   *
   * @param dateTime 日時
   * @param dateFormat 日付フォーマット
   */
  protected _formatDatetime(dateTime, dateFormat) {
    return this.datePickerService.getInputDatetimeText(
      this.datePickerService.toMoment(dateTime, false),
      dateFormat
    );
  }

  /**
   * ngFormにパラメータを
   */
  protected _refreshTimeInput() {
    const {
      start_datetime_hh,
      start_datetime_mm,
      end_datetime_hh,
      end_datetime_mm,
    } = this.params;

    this.systemNotificationForm.patchValue({
      notification: {
        start_datetime_hh,
        start_datetime_mm,
        end_datetime_hh,
        end_datetime_mm,
      },
    });
  }

  /**
   * 日付文字列から秒数を除く
   * @param date 日付
   */
  private _removeSecond(date: string): string {
    const idx = date.lastIndexOf(':');
    return idx ? date.substring(0, idx) : date;
  }

  /**
   * 登録確認画面オープン
   *
   * 登録/変更確認モーダルを表示する。
   * 確認後、登録/変更処理をおこない、指定画面に遷移する
   *
   * @param path 確認後遷移先のパス
   */
  private _registerModalOpen(path: string) {
    this._reflectRegistParams();
    this.descItem = this._createDescItem();
    this.valItem = this._createValItem();
    this.rowspan = this.isBlockKind ? 2 : 1;
    this.modalService.open({
      title: this.labels.submit_modal_title,
      labels: this.labels,
      content: this.submitModalContent,
      ok: () => this._register(_.omit(this.params, this.excludeParams), path),
    });
  }

  /**
   * 登録用のパラメタを反映する
   */
  private _reflectRegistParams() {
    const resultParams = {
      applications_system_notification: {
        publish_application_codes: this.selectedAppCodes,
        notification: {
          content: this.params['content'],
          start_datetime: this._formatDatetime(
            this.start_date_time,
            DateTimeFormatKind.withTimeZone
          ),
          end_datetime: this._formatDatetime(
            this.end_date_time,
            DateTimeFormatKind.withTimeZone
          ),
        },
      },
    };

    if (this.isRegionAdmin()) {
      _.set(
        resultParams,
        'applications_system_notification.publish_group',
        this.groupSelectComponent.getSelectedParam()
      );
    } else {
      _.set(
        resultParams,
        'applications_system_notification.publish_group.block_ids',
        [this.api.getGroupId()]
      );
    }
    _.assignIn(this.params, resultParams);
  }

  /**
   * 登録確認モーダル用の項目を作成する
   * @return 加工後の表示用項目
   */
  private _createValItem(): SystemNotificationParams {
    const val = _.cloneDeep(this.params.applications_system_notification);
    if (this.isRegionAdmin()) {
      _.set(
        val,
        'publish_group.kind_name',
        this.groupSelectComponent.selectedGroupName()
      );
      _.set(
        val,
        'publish_group.blocks.label',
        _.map(
          this.groupSelectComponent.getGroupItems(
            _.chain(
              _.get(
                this.params,
                'applications_system_notification.publish_group.block_ids'
              )
            )
              .orderBy()
              .value()
          ),
          'name'
        ).join(' / ')
      );
    }
    _.set(
      val,
      'notification.start_datetime_formatted',
      this._removeSecond(
        this._formatDatetime(
          this.start_date_time,
          this.datePickerParams.dateFormat
        )
      )
    );
    _.set(
      val,
      'notification.end_datetime_formatted',
      this._removeSecond(
        this._formatDatetime(
          this.end_date_time,
          this.datePickerParams.dateFormat
        )
      )
    );
    _.set(
      val,
      'publish_applications.name',
      _.chain(
        _.get(
          this.params,
          'applications_system_notification.publish_application_codes'
        )
      )
        .orderBy()
        .map(code => {
          return this._getResourceValueName(
            'applications_system_notification.publish_application_codes',
            code
          );
        })
        .value()
        .join(' / ')
    );

    return val;
  }

  /**
   * 登録確認モーダル用のヘッダを作成する
   * @return 表示用項目
   */
  private _createDescItem(): object[] {
    const desc = [];
    const thList = [
      {
        path: 'applications_system_notification.publish_group.kind_id',
        dataKey: 'publish_group.kind_name',
      },
      {
        path: 'applications_system_notification.publish_application_codes',
        dataKey: 'publish_applications.name',
      },
      {
        path: 'applications_system_notification.notification.start_datetime',
        dataKey: 'notification.start_datetime_formatted',
      },
      {
        path: 'applications_system_notification.notification.end_datetime',
        dataKey: 'notification.end_datetime_formatted',
      },
      {
        path: 'applications_system_notification.notification.content',
        dataKey: 'notification.content',
      },
    ];

    // リソースおよびラベルからヘッダを作成
    _.each(thList, th => {
      const tmpResource = _.get(this.resource, th.path);
      if (tmpResource) {
        desc.push({
          label: tmpResource.name,
          dataKey: th.dataKey,
          displayable: true,
        });
      } else {
        const tmpLabel = _.get(this.labels, th.path);
        if (tmpLabel) {
          desc.push({
            label: tmpLabel,
            dataKey: th.dataKey,
            displayable: true,
          });
        }
      }
    });

    return desc;
  }

  /**
   * フォームグループを初期化
   * @param fg フォームグループ
   * @param path パス
   */
  private _initializeFormGroup(fg: FormGroup, path: string) {
    fg.addControl(path, new FormGroup({}));
    return fg.get(path);
  }
}
