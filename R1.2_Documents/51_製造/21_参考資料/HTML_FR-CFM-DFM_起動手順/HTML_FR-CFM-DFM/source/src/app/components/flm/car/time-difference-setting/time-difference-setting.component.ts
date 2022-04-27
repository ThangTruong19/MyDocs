import * as _ from 'lodash';
import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { ModalValues, Labels, Field } from '../../../../types/common';
import {
  TimeDifferenceSettingParams,
  CarIdSearchParams,
} from '../../../../types/flm/car';
import { Fields } from '../../../../types/common';
import { DatePickerParams } from '../../../../types/calendar';

import { TimeDifferenceSettingChangeStatus } from '../../../../constants/flm/car';
import { DateFormat } from '../../../../constants/date-format';

import { KbaAbstractIndexComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-index-component';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { CarService } from '../../../../services/flm/car/car.service';
import { KbaDatePickerService } from '../../../../services/shared/kba-date-picker.service';
import { UserSettingService } from '../../../../services/api/user-setting.service';
import { FilterReservedWord } from '../../../../constants/condition';
import { FunctionCode } from '../../../../constants/flm/function-codes/car-management';
import { ApiService } from '../../../../services/api/api.service';

@Component({
  templateUrl: './time-difference-setting.component.html',
  styleUrls: ['./time-difference-setting.component.scss'],
})
export class CarTimeDifferenceSettingComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('retryModalContent', { static: false })
  retryModalContent: TemplateRef<null>;
  @ViewChild('deleteModalContent', { static: false })
  deleteModalContent: TemplateRef<null>;

  checkIdName = 'cars.car_identification.id';
  uniqIdName = 'cars.car_identification.id';
  fields: Fields;
  deleteFields: Fields;
  retryFields: Fields;
  editFields: Fields;
  editConfirmFields: Fields;
  deleteModalValues: ModalValues;
  retryModalValues: ModalValues;
  params = {
    common: {
      support_distributor: {},
      car_identification: {},
    },
    car_management: {
      terminal_use_start_kinds: '4',
      time_difference_setting_change_start_none_kind: '0',
    },
  };
  initParams;
  datePickerParams: DatePickerParams;
  isOpenSettingChange = false;
  timeDifferenceSettingChangeStatusKey =
    'cars.car_management_attribute.time_difference_setting_change_status';
  stringParamList = [
    'car_management.time_difference',
    'car_management.change_after_time_difference',
    'car_management.time_difference_setting_kind',
    'car_management.time_difference_setting_change_status',
    'car_management.time_difference_setting_change_start_date_from',
    'car_management.time_difference_setting_change_start_date_to',
    'car_management.time_difference_setting_change_start_none_kind',
  ];
  _dateFormat = '';
  timeZone = '';
  enableDateRange: string[] = [];
  beginningWday: number;
  excludeSearchParams: string[] = [
    'car_management.date_from_formatted',
    'car_management.date_to_formatted',
  ];
  enableTimeDifferenceSetting: boolean;
  datePickerLabels: Labels;
  fieldSelectPopoverVisible = false;
  batchDeleteLimit: number;
  checkedItems: { [key: string]: boolean } = {};
  enableDeleteFunctionCode =
    'flm_car_mgt_time_difference_setting_delete_function';

  get selectedList() {
    return _.map(this.checkedItems, (value, key) =>
      value ? key : null
    ).filter(Boolean);
  }

  get retryOverCars() {
    return _.filter(this.lists.originList, data => this.isRetryOver(data));
  }

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modalService: KbaModalService,
    private carService: CarService,
    private datePickerService: KbaDatePickerService,
    private userSettingService: UserSettingService,
    private api: ApiService
  ) {
    super(navigationService, title, router, ref, header, modalService);
    this.batchDeleteLimit = (window as any).settings.carBatchDeleteLimit;
  }

  /**
   * 検索処理
   */
  onClickSearch(): void {
    super.onClickSearch();
    this.fetchList(this.sortingParams['sort']);
    this.checkedItems = {};
  }

  /**
   *  一括リトライボタン押下時コールバック
   */
  onClickBatchRetry(): void {
    this._openRetryModal(this.retryOverCars);
  }

  /**
   * リトライボタン押下時コールバック
   * @param data 車両情報
   */
  onClickRetry(data: object): void {
    this._openRetryModal([data]);
  }

  /**
   * 時差設定変更ボタン押下時コールバック
   */
  onClickSettingChange(): void {
    if (_.isEmpty(this.selectedList)) {
      return;
    }

    this.isOpenSettingChange = true;
  }

  /**
   * 一括削除ボタン押下コールバック
   *
   * 一括削除APIをリクエストする
   */
  async onClickDeleteAll(): Promise<void> {
    const res = await this.carService.fetchCarIndexList(
      this._carIdsParams(this.selectedList),
      this.deleteModalValues.requestHeaderParams
    );
    this.deleteModalValues.listVal = this._formatList(
      res.result_data.cars,
      this.deleteModalValues.listDesc
    );

    const params = {
      car: res.result_data.cars.map(
        ({ car_identification: { id, update_datetime } }) =>
          `${id},${update_datetime}`
      ),
    };
    this._openDeleteConfirmModal(params);
  }

  /**
   * 時差設定変更画面（変更）画面の変更完了時の処理
   */
  onSubmit(): void {
    this.isOpenSettingChange = false;
    this.checkedItems = {};
    this.params = _.cloneDeep(this.initParams);
    this.safeDetectChanges();
    this.kbaPaginationComponent.initOptions();
    this.kbaPaginationComponent.onChangePageNo(true);
  }

  /**
   * 時差設定変更画面（変更）から戻る時の処理
   */
  returnFromSettingChange(): void {
    this.isOpenSettingChange = false;
    this.checkedItems = {};
    this.safeDetectChanges();
    this.kbaPaginationComponent.buildOptions();
  }

  async fetchList(sort_key?: string): Promise<void> {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    const nestedKeys = this._getNestedKeys(this.params);
    const searchParams = _.omit(this.searchParams, this.excludeSearchParams);
    const params = this._validateTimeDifferenceParams(
      this._transrateSearchParams(searchParams, nestedKeys)
    );
    const res = await this.carService.fetchCarIndexList(
      params,
      this.requestHeaderParams
    );
    const list = this._formatList(res.result_data.cars, this.thList);
    this._fillLists(res.result_header, list);
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 車両の状態がリトライオーバーであるかの判定
   * @param data 車両情報
   */
  isRetryOver(data: object): boolean {
    return (
      data[this.timeDifferenceSettingChangeStatusKey] ===
      TimeDifferenceSettingChangeStatus.retryOver
    );
  }

  /**
   * 車両の状態が未/完了であるかの判定
   * @param data 車両情報
   */
  isChanged(data: object): boolean {
    return (
      data[this.timeDifferenceSettingChangeStatusKey] ===
      TimeDifferenceSettingChangeStatus.changed
    );
  }

  /**
   * チェックボックスを非表示にするかどうかを返却します。
   * @return true:非表示/false:表示
   */
  checkBoxHidden(data: object[]): boolean {
    return !this.isChanged(data);
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
      .updateField(FunctionCode.timeDifferenceSettingFunction, event.fields)
      .then((res: any) => {
        return new Promise(resolve => {
          this.api
            .fetchFields(FunctionCode.timeDifferenceSettingFunction)
            .subscribe(_res => resolve(_res));
        });
      })
      .then((res: any) => {
        this._updateFields(res);
        this.safeDetectChanges();
        this.fetchList(this.sortingParams['sort']);
      });
  }

  /**
   * 「これまで移管したことのない車両も含める」変更時の処理
   * @param checked チェック状態
   */
  handleChangeChangeStartNoneKind(checked) {
    this.params.car_management.time_difference_setting_change_start_none_kind =
      checked ? '1' : '0';
  }

  protected async _fetchDataForInitialize(): Promise<void> {
    const res = await this.carService.fetchTimeDifferenceSettingInitData();
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.initialize(res);
    this._updateFields(res.fields);
    this.fieldResources = res.fieldResources;
    this.retryFields = res.retryFields;
    this.editFields = res.editFields;
    this.editConfirmFields = res.editConfirmFields;
    if (this.functions.find(f => f.code === this.enableDeleteFunctionCode)) {
      const deleteFields = await new Promise(resolve =>
        this.api
          .fetchFields(FunctionCode.timeDifferenceSettingDeleteFunction)
          .subscribe(_res => resolve(_res))
      );
      this.deletable = res.deletable;
      this.deleteFields = deleteFields as Field[];
      this.deleteModalValues = this._getModalValues(this.deleteFields);
    }
    this.enableTimeDifferenceSetting = res.enableTimeDifferenceSetting;
    this.selectable = this.deletable || this.enableTimeDifferenceSetting;
    this.retryModalValues = this._getModalValues(this.retryFields);
    await this._datePickerInitialize();
    this.initParams = _.cloneDeep(this.params);
  }

  /**
   * 検索欄データの値を配列形式に変換する
   * @param 検索欄データ
   */
  protected _transrateSearchParams(params: any, nestedKeys: string[]): object {
    const result = {};
    let value;
    _.each(nestedKeys, path => {
      if ((value = _.get(params, path))) {
        if (_.includes(this.stringParamList, path)) {
          _.set(result, path, value);
        } else {
          _.set(result, path, _.split(value, ','));
        }
      }
    });
    return result;
  }

  /**
   * 車両を対象とした時差設定リトライ確認モーダルを開く
   * @param cars 対象の車両
   */
  private async _openRetryModal(cars: object[]): Promise<any> {
    const ids = _.map(cars, t => _.get(t, this.uniqIdName));
    const res = await this.carService.fetchCarIndexList(
      this._carIdsParams(ids),
      this.retryModalValues.requestHeaderParams
    );
    this.retryModalValues.listVal = this._formatList(
      res.result_data.cars,
      this.retryModalValues.listDesc
    );
    // 時差の成形処理
    this.retryModalValues.listVal.forEach(list => {
      list[
        'cars.car_management_attribute.time_difference'
      ] = this.formatTimeDifference(
        list['cars.car_management_attribute.time_difference']
      );
      list[
        'cars.car_management_attribute.change_after_time_difference'
      ] = this.formatTimeDifference(
        list['cars.car_management_attribute.change_after_time_difference']
      );
    });
    this.modalService.open({
      title: this.labels.time_difference_setting_retry_modal_title,
      labels: this.labels,
      content: this.retryModalContent,
      closeBtnLabel: this.labels.cancel,
      ok: async () => {
        const _res = await this.carService.updataTimeDifferenceSetting(
          this._createTimeDifferenceSettingParams(cars),
          FunctionCode.timeDifferenceSettingRetryFunction
        );

        this._resultModalOpen(
          this.labels.time_difference_setting_retry_result_label,
          this.retryModalValues.listDesc,
          this.retryModalValues.listVal,
          _res.responses,
          () => this.fetchList(this.sortingParams['sort']),
          { size: 'lg' }
        );
      },
    });
  }

  /**
   * 削除確認モーダルを開きます.
   * @param cars 車両情報
   */
  private _openDeleteConfirmModal(params) {
    this.modalService.open({
      title: this.labels.delete_modal_body,
      labels: this.labels,
      content: this.deleteModalContent,
      okBtnLabel: this.labels.delete,
      okBtnClass: 'btn-delete',
      closeBtnLabel: this.labels.cancel,
      ok: () => {
        this.carService
          .deleteCars(params, FunctionCode.bulkDeleteFunctioon)
          .then(res => {
            this._resultModalOpen(
              this.labels.delete_result_label,
              this.deleteModalValues.listDesc,
              this.deleteModalValues.listVal,
              res.responses,
              () => {
                this.pageParams.pageNo = 1;
                this.pageParams.dispPageNo = 1;
                this._reflectPageParams();
                this.fetchList(this.sortingParams['sort']);
                this.checkedItems = {};
              },
              { size: 'lg' }
            );
          });
      },
    });
  }

  /**
   * 指定項目を更新
   * @param fields 指定項目
   */
  private _updateFields(fields: Fields): void {
    this.fields = fields;
    this.thList = this._createThList(fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this._reflectXFields(fields);
  }

  /**
   * 車両一覧取得パラメータの作成
   * @param carIds 車両ID
   */
  private _carIdsParams(carIds: string[]): CarIdSearchParams {
    return { common: { car_identification: { car_ids: carIds } } };
  }

  /**
   * 時差設定更新要求API用のパラメータを作成
   * @param cars 車両情報
   */
  private _createTimeDifferenceSettingParams(
    cars: object[]
  ): TimeDifferenceSettingParams {
    return {
      cars: _.map(cars, car => ({
        update_datetime: car['cars.car_identification.update_datetime'],
        time_difference:
          car['cars.car_management_attribute.change_after_time_difference'],
        car_id: car['cars.car_identification.id'],
      })),
    };
  }

  /**
   * リトライの完了時の処理
   */
  private _successOperation(): void {
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * デートピッカーの初期化
   */
  private async _datePickerInitialize(): Promise<any> {
    const datePickerConfig = this.userSettingService.getDatePickerConfig();
    this.beginningWday = datePickerConfig.first_day_of_week_kind;
    const _window = window as any;
    this.enableDateRange = _window.settings.datePickerRange.other;
    this._dateFormat = datePickerConfig.date_format_code;
    this.timeZone = datePickerConfig.time_difference;

    this.datePickerParams = {
      timeZone: this.timeZone,
      dateFormat: this._dateFormat,
    };

    this.datePickerService.initialize(this.datePickerParams);

    const today = this.datePickerService.toMoment();

    _.set(
      this.params,
      'car_management.time_difference_setting_change_start_date_from',
      today
        .clone()
        .subtract(1, 'month')
        .format(DateFormat.hyphen)
    );
    _.set(
      this.params,
      'car_management.date_from_formatted',
      today
        .clone()
        .subtract(1, 'month')
        .format(this.datePickerService.inputDateFormat(this._dateFormat))
    );
    _.set(
      this.params,
      'car_management.time_difference_setting_change_start_date_to',
      today.format(DateFormat.hyphen)
    );
    _.set(
      this.params,
      'car_management.date_to_formatted',
      today.format(this.datePickerService.inputDateFormat(this._dateFormat))
    );
  }

  /**
   * 時差・変更中時差の値によってパラメータを整形する
   * @param params パラメータ
   */
  private _validateTimeDifferenceParams(params) {
    return {
      common: params.common,
      car_management: {
        ...params.car_management,
        time_difference:
          params.car_management.time_difference === FilterReservedWord.selectAll
            ? null
            : params.car_management.time_difference,
        change_after_time_difference:
          params.car_management.change_after_time_difference ===
          FilterReservedWord.selectAll
            ? null
            : params.car_management.change_after_time_difference,
      },
    };
  }
}
