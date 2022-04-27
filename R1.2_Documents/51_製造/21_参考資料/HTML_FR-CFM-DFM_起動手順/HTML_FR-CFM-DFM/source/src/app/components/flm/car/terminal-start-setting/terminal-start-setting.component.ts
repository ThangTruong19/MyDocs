import * as _ from 'lodash';
import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ModalValues, Fields } from '../../../../types/common';
import {
  OrbcommApplyParams,
} from '../../../../types/flm/car';

import { TerminalUseStartKind, OrbcommRequestStatus, OrbcommRequestTargetKind } from '../../../../constants/flm/car';

import { KbaAbstractIndexComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-index-component';
import { FilterReservedWord } from '../../../../constants/condition';
import { FunctionCode } from '../../../../constants/flm/function-codes/car-management';

import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { CarService } from '../../../../services/flm/car/car.service';
import { ApiService } from '../../../../services/api/api.service';
import { ScreenCode } from '../../../../constants/flm/screen-codes/car-management';
import { KbaSelectTypeComponent } from '../../../shared/kba-select-type/kba-select-type.component';

@Component({
  selector: 'app-car-start-set',
  templateUrl: './terminal-start-setting.component.html',
  styleUrls: ['./terminal-start-setting.component.scss'],
})
export class CarTerminalStartSettingComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('operationModalContent', { static: false })
  operationModalContent: TemplateRef<null>;
  @ViewChild('orbcommApplyModalContent', { static: false })
  orbcommApplyModalContent: TemplateRef<null>;
  @ViewChild('subGroupSelect', { static: false })
  subGroupSelect: KbaSelectTypeComponent;

  fields: Fields;
  startSettingFields: Fields;
  orbcommApplyFields: Fields;
  modalValues: ModalValues;
  startSettingModalValues: ModalValues;
  orbcommApplyModalValues: ModalValues;
  terminalUseStartKind = TerminalUseStartKind;
  orbcommRequestStatus = OrbcommRequestStatus;
  orbcommRequestTargetKind = OrbcommRequestTargetKind;
  checkIdName = 'cars.car_identification.id';
  uniqIdName = 'cars.car_identification.id';
  params = {
    common: {
      user_permission_sub_group_ids: [],
      support_distributor: {},
      car_identification: {},
      komtrax_unit: {},
    },
    car_management: {
      komtrax_unit: {
        terminal_component: {},
      },
    },
  };
  stringParamList = [
    'car_management.komtrax_unit.terminal_component.part',
    'car_management.komtrax_unit.terminal_component.serial',
    'car_management.terminal_use_start_kind',
    'car_management.orbcomm_request_status',
  ];
  terminalComponentPart = 'car_management.komtrax_unit.terminal_component.part';
  terminalUseStartKindKey =
    'cars.car_management_attribute.terminal_use_start_kind';
  enableOrbcomm: boolean;
  enableStartSetting: boolean;
  orbcommApplyParams = {
    orbcomm_request: {
      nation_id: '',
    },
  };
  fieldSelectPopoverVisible = false;
  checkedItems: { [key: string]: boolean } = {};

  get selectedList() {
    return _.map(this.checkedItems, (value, key) =>
      value ? key : null
    ).filter(Boolean);
  }

  get retryOverTerminals() {
    return _.filter(
      this.lists.originList,
      data =>
        data[this.terminalUseStartKindKey] ===
        this.terminalUseStartKind.retryOver
    );
  }

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modalService: KbaModalService,
    private alertService: KbaAlertService,
    private carService: CarService,
    private api: ApiService
  ) {
    super(navigationService, title, router, ref, header, modalService);
  }

  async fetchList(sort_key?: string): Promise<any> {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    const nestedKeys = this._getNestedKeys(this.params);
    const searchParams = this._transrateSearchParams(
      this.searchParams,
      nestedKeys
    );
    const res = await this.carService.fetchCarIndexList(
      searchParams,
      this.requestHeaderParams
    );
    const list = this._formatList(res.result_data.cars, this.thList);
    this._fillLists(res.result_header, list);
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 検索処理
   * @return
   */
  onClickSearch(): void {
    this._updateSubGroupIds();
    super.onClickSearch();
    this.fetchList(this.sortingParams['sort']);
    this.checkedItems = {};
  }

  /**
   * 一括開始ボタン押下時コールバック
   */
  onClickBatchStart(): void {
    this._openStartModal(this.selectedList);
  }

  /**
   *  一括リトライボタン押下時コールバック
   */
  onClickBatchRetry(): void {
    this._openStartModal(
      _.map(this.retryOverTerminals, t => _.get(t, this.uniqIdName)),
      FunctionCode.terminalStartSettingRetryFunction
    );
  }

  /**
   * 開始ボタン押下時コールバック
   * @param data 車両情報
   */
  onClickDeviceStart(data, retry?: boolean): void {
    this._openStartModal(
      [_.get(data, this.uniqIdName)],
      retry ? FunctionCode.terminalStartSettingRetryFunction : null
    );
  }

  /**
   * 申請ボタン押下時コールバック
   * @param data 車両情報
   */
  async onClickOrbcommApply(data): Promise<any> {
    const targetId = _.get(data, this.uniqIdName);
    const res = await this.carService.fetchCarIndexList(
      this._createModalParams([targetId]),
      this.orbcommApplyModalValues.requestHeaderParams
    );
    const resource = await this.carService.getApplyOrbcommResourceByCarId(
      _.get(res, 'result_data.cars[0].car_identification.id'),
      ScreenCode.terminalStartSetting
    );
    this.resource.orbcomm_request.nation_id = _.get(
      resource,
      'orbcomm_request.nation_id',
      []
    );
    this.modalValues = this.orbcommApplyModalValues;
    this.modalValues.listVal = this._formatList(
      res.result_data.cars,
      this.modalValues.listDesc
    );
    this.orbcommApplyParams = this._createOrbcommApplyParams(data);
    this.modalService.open(
      {
        title: this.labels.orbcomm_apply_modal_title,
        labels: this.labels,
        content: this.orbcommApplyModalContent,
        closeBtnLabel: this.labels.cancel,
        ok: async () => {
          await this.carService.applyOrbcomm(targetId, this.orbcommApplyParams);
          this.alertService.show(this.labels.complete_message);
          this._successOperation();
        },
      },
      { size: 'lg' }
    );
  }

  /**
   * チェックボックスを非表示にするかどうかを返却します。
   * @return true:非表示/false:表示
   */
  checkBoxHidden(data: object[]): boolean {
    return !this.isNotStarted(data);
  }

  /**
   * 未開始かどうかの判定
   * @param data 車両情報
   */
  isNotStarted(data: object[]): boolean {
    return (
      data[this.terminalUseStartKindKey] ===
      this.terminalUseStartKind.notStarted
    );
  }

  /**
   * 日付を画面表示形式に変換して返す
   * @param dateTime 日付
   */
  displayDateTime(dateTime: string): string {
    return dateTime && dateTime.replace(/\s+/, '\n');
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
      .updateField(FunctionCode.terminalStartSettingFunction, event.fields)
      .then((res: any) => {
        return new Promise(resolve => {
          this.api
            .fetchFields(FunctionCode.terminalStartSettingFunction)
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
   * ORBCOMM申請使用国変更時の処理
   * @param value 選択値
   */
  handleNationIdChange(value: string) {
    this.modalService.enableOk = value !== FilterReservedWord.isNull;
  }

  protected async _fetchDataForInitialize(): Promise<any> {
    const res: any = await this.carService.fetchStartSettingInitData();
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.initialize(res);
    this.enableOrbcomm = res.enableOrbcomm;
    this.enableStartSetting = res.enableStartSetting;
    this.selectable = res.enableStartSetting;
    this._updateFields(res.fields);
    this.fields = res.fields;
    this.fieldResources = res.fieldResources;
    this.startSettingFields = res.startSettingFields;
    this.orbcommApplyFields = res.orbcommApplyFields;
    this.startSettingModalValues = this._getModalValues(
      this.startSettingFields
    );
    this.orbcommApplyModalValues = this._getModalValues(
      this.orbcommApplyFields
    );

    if (this.exists('orbcomm_request.nation_id')) {
      this.orbcommApplyModalValues.listDesc.push({
        name: 'orbcomm_request.nation_id',
        label: this.resource.orbcomm_request.nation_id.name,
        displayable: true,
      });
    }
    this._updateSubGroupIds();
  }

  /**
   * 検索欄データの値を配列形式に変換する
   * @param 検索欄データ
   */
  protected _transrateSearchParams(params, nestedKeys: string[]): object {
    const result = {};
    let value;
    _.each(nestedKeys, path => {
      if ((value = _.get(params, path))) {
        if (_.includes(this.stringParamList, path)) {
          // 端末品番が'-99'の場合、リクエストに含めない
          if (
            path === this.terminalComponentPart &&
            value === FilterReservedWord.selectAll
          ) {
            return;
          }
          _.set(result, path, value);
        } else {
          _.set(result, path, _.split(value, ','));
        }
      }
    });
    return result;
  }

  /**
   * IDを対象とした端末開始設定確認モーダルを開く
   * @param ids 対象のID
   */
  private async _openStartModal(
    ids: string[],
    screenCode?: string
  ): Promise<any> {
    const res = await this.carService.fetchCarIndexList(
      this._createModalParams(ids),
      this.startSettingModalValues.requestHeaderParams
    );
    const { cars } = res.result_data;
    this.modalValues = this.startSettingModalValues;
    this.modalValues.listVal = this._formatList(
      cars,
      this.modalValues.listDesc
    );
    this.modalService.open({
      title: this.labels.start_setting_modal_title,
      labels: this.labels,
      content: this.operationModalContent,
      closeBtnLabel: this.labels.cancel,
      ok: async () => {
        const params = {
          cars: cars.map(car =>
            _.pick(car, [
              'car_identification.id',
              'car_identification.update_datetime',
            ])
          ),
        };

        const _res = await this.carService.updataTerminalStartSetting(
          params,
          screenCode
        );

        this._resultModalOpen(
          this.labels.terminal_start_result_label,
          this.modalValues.listDesc,
          this.modalValues.listVal,
          _res.responses,
          () => this._successOperation(),
          { size: 'lg' }
        );
      },
    });
  }

  /**
   * サブグループIDのパラメータを更新する
   */
  private _updateSubGroupIds() {
    this.safeDetectChanges();

    if (this.subGroupSelect == null) {
      return;
    }

    _.set(
      this.params,
      'common.user_permission_sub_group_ids',
      this.subGroupSelect.getSelectedParam()
    );
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
   * 一覧データからモーダル内容用のパスを取得
   * @param fields 指定項目データ
   */
  private _createModalValPaths(fields: Fields): string[] {
    return _.map(fields, f => f.path.replace('cars.', ''));
  }

  /**
   * 確認モーダル表示データ用のパラメータを取得
   * @param ids 対象のID
   */
  private _createModalParams(ids: string[]): object {
    return {
      common: {
        car_identification: {
          car_ids: ids,
        },
      },
    };
  }

  /**
   * ORBCOMM申請API用のパラメータを取得
   * @param data 車両情報
   */
  private _createOrbcommApplyParams(data): OrbcommApplyParams {
    return {
      orbcomm_request: {
        nation_id: data['cars.car_management_attribute.nation_id'],
      },
    };
  }

  /**
   * 端末設定開始、ORBCOMM申請の完了時の処理
   */
  private _successOperation(): void {
    this.pageParams.pageNo = 1;
    this.pageParams.dispPageNo = 1;
    this._reflectPageParams();
    this.fetchList(this.sortingParams['sort']);
    this.checkedItems = {};
  }
}
