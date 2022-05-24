import * as _ from 'lodash';
import { Component, ChangeDetectorRef, ViewChild, ViewChildren, QueryList, TemplateRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { HistoryMgtListIndexParams, HistoryMgtListFileCreateParams } from 'app/types/history-mgt-list';
import { DatePickerParams } from 'app/types/calendar';
import { Fields, Labels } from 'app/types/common';

import { ProcessingType } from 'app/constants/download';
import { DateFormat } from 'app/constants/date-format';
import { FunctionCodeConst } from 'app/constants/api/function-code-const';

import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { SelectedComponent } from 'app/components/shared/selected/selected.component';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { ModalService } from 'app/services/shared/modal.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { AlertService } from 'app/services/shared/alert.service';
import { ApiService } from 'app/services/api/api.service';
import { CarListService } from 'app/services/car-list/car-list.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { UserSettingService } from 'app/services/api/user-setting.service';

import { MimeType } from 'app/constants/mime-types';
import { OperatorInitSearchParams } from 'app/types/car';
import { SelectTypeComponent } from 'app/components/shared/select-type/select-type.component';
import { CsDetailService } from 'app/services/customize_setting/cs-detail.service';

interface RequestHeaderParams {
  'X-Lang'?: string;
  'X-AppCode'?: string;
  'X-GroupId'?: string;
  'X-DateFormat'?: string;
  'X-ScreenCode'?: string;
  'X-WebApiKey'?: string;
}

@Component({
  selector: 'app-car-mgt-list',
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.scss'],
})
export class CarListComponent extends AbstractIndexComponent {
    @ViewChild('belongingCategoryCode', { static: false })
    belongingCategoryCode: SelectedComponent;
    @ViewChild('belongingCustomizeUsageDefinitionId', { static: false })
    belongingCustomizeUsageDefinitionId: SelectedComponent;

    @ViewChild('resetModalContent', { static: false })
    resetModalContent: TemplateRef<null>;
    @ViewChildren(SelectedComponent)
    selectors: QueryList<SelectedComponent>;
    @ViewChildren(SelectTypeComponent)
    selectTypers: QueryList<SelectTypeComponent>;

    @ViewChild('csGetRequestModalContent', { static: false }) csGetRequestModalContent: TemplateRef<null>;

    datePickerParams: DatePickerParams;
    fields: Fields;
    downloadFields: Fields;
    downloadFieldResources: Fields;
    fieldSelectPopoverVisible = false;
    downloadPopoverVisible = false;
    testing = false;
    _dateFormat = '';
    timeZone = '';
    enableDateRange: string[] = [];
    beginningWday: number;
    excludeSearchParams: string[] = ['date_from_formatted', 'date_to_formatted'];
    datePickerLabels: Labels;
    override commaSeparated: string[] = ['serials'];

    // selectedList: any[] = [];
    // checkedItems: boolean[] = [];
    // checkedItems: { [key: string]: boolean } = {}
    checkAll: boolean = false;

    // get selectedList() {
    //   return _.map(this.checkedItems, (value, key) =>
    //     value ? key : null
    //   ).filter(Boolean);
    // }

    checkAllDisabled: boolean = true;
    isDisabled: boolean = true;
    terminalModeType: string;
    transmissionType: string;
    otherThanNextGenValue = '3'; // TODO:
    iridiumValue = '3'; // TODO:

    showCloseBtn: boolean = true;

    initParams: OperatorInitSearchParams = {
      common: {
        support_distributor: {},
        service_distributor: {},
        customer: {},
        car_identification: {
          models: '',
          type_revs: '',
          serials: '',
        },
        customer_attribute: {
          customer_management_no: '',
        },
      },
      car_management: {},
    };

    carId: string;


    public checkIdName = 'cars.car_identification.id';

    private arrayColumnPaths: string[] = [
      'cars.customize_usage_definitions.name',
      'cars.customize_usage_definitions.setting_change_status',
      'cars.customize_usage_definitions.setting_change_status_name',
    ];

    constructor(
      navigationService: NavigationService,
      title: Title,
      router: Router,
      ref: ChangeDetectorRef,
      header: CommonHeaderService,
      protected carListService: CarListService,
      protected api: ApiService,
      protected override modalService: ModalService,
      protected alertService: AlertService,
      protected datePickerService: DatePickerService,
      protected userSettingService: UserSettingService,
      private csDetailService: CsDetailService
    ) {
      super(navigationService, title, router, ref, header);
      this.isCheckedItemsAllPageHold = true;
    }

    /**
     * 現在のパラメータを一覧取得APIに引き渡し、一覧画面に表示するリストを取得する
     * @param sort_key ソートキー
     */
    async fetchList(sort_key?: string): Promise<void> {
      this.isFetching = true;
      this.requestHeaderParams['X-Sort'] = sort_key || '';
      const params: HistoryMgtListIndexParams = {
        customize_operation_history: _.omit(
          this.searchParams,
          this.excludeSearchParams
        )
      };
      const res = await this.carListService.fetchIndexList(
        params,
        this.requestHeaderParams
      );

      const list = this._formatList(
        res.result_data.cars,
        this.thList
      );
      Object.keys(list).forEach((i: any) => {
        if (!list[i].cars) {
          list[i].cars = {}
        }
        list[i].cars.customize_usage_definitions = res.result_data.cars[i].customize_usage_definitions
      })
      this._fillLists(res.result_header, list);
      this.isFetching = false;
      this._afterFetchList();
    }

    /**
     * 検索ボタン押下時の処理
     * 現在のパラメータを更新してリストを取得する
     */
    override onClickSearch(): void {
      super.onClickSearch();
      this.fetchList(this.sortingParams['sort']);
    }

    /**
     * ダウンロードOKボタン押下時の処理
     * @param event イベント
     */
    async onDownloadOk(event: any): Promise<void> {
      await this.api.updateField(
        FunctionCodeConst.CAR_LIST_FUNCTION,
        this.fields
      );
      await this._downloadTemplate(
        this.fields.map((f: { path: string }) => f.path),
        MimeType.excel
      );
    }

    /**
     * 初期化 API を呼ぶ
     */
    protected async _fetchDataForInitialize(): Promise<void> {
      const res: any = await this.carListService.fetchIndexInitData();
      this.initialize(res);
      this.labels = res.label;
      this.resource = res.resource;
      this._setTitle();
      this.updatable = res.updatable;
      this.deletable = res.deletable;
      this._updateFields(res.fields);
      this.fieldResources = res.fieldResources;
      this.downloadFields = res.downloadFields;
      this.downloadFieldResources = res.downloadFieldResources;
      this._datePickerInitialize();
    }

    /**
     * 指定項目を更新
     * @param fields 指定項目
     */
    protected _updateFields(fields: any): void {
      this.fields = fields;
      this.thList = this._createThList(fields);
      this.sortableThList = this.sortableThLists(this.thList);
      this._reflectXFields(fields);
    }

    /**
     * テンプレートダウンロード
     * @param fields ダウンロード対象項目
     * @param accept ダウンロード形式
     */
    protected async _downloadTemplate(fields: any, accept: any): Promise<void> {
      const params: HistoryMgtListFileCreateParams = {
        operation_history: _.omit(this.searchParams, this.excludeSearchParams),
        file_create_condition: {
          file_content_type: accept,
          processing_type: ProcessingType.sync,
        },
      };
      const header = _.cloneDeep(this.requestHeaderParams);
      header['X-Sort'] = this.sortingParams['sort'];
      header['X-Fields'] = fields;
      this._showLoadingSpinner();
      try {
        const res: any = await this.carListService.createFile(params, header);
        await this.api.downloadFile(res.result_data.file_id, accept);
      } finally {
        this._hideLoadingSpinner();
      }
    }

  /**
   * 初期検索前の処理
   * 依存するリソースを更新する
   */
  // protected override async _beforeInitFetchList(): Promise<any> {
  //   if (this.exists('operation_history.category_code')) {
  //     await this.onCategoryCodeChange(
  //       _.get(this.resource, 'operation_history.category_code.values[0].value')
  //     );
  //   }
  // }

  // protected override _getSearchParams(params: any): HistoryMgtListIndexParams {
  //   return _.reduce(
  //     params,
  //     (res: any, val, key) => {
  //       res[key] = this.commaSeparated.includes(key) ? val.split(',') : val;
  //       return res;
  //     },
  //     {}
  //   );
  // }

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
        'date_from',
        today.clone().subtract(1, 'month').format(DateFormat.hyphen)
      );
      _.set(
        this.params,
        'date_from_formatted',
        today
          .clone()
          .subtract(1, 'month')
          .format(this.datePickerService.inputDateFormat(this._dateFormat))
      );
      _.set(this.params, 'date_to', today.format(DateFormat.hyphen));
      _.set(
        this.params,
        'date_to_formatted',
        today.format(this.datePickerService.inputDateFormat(this._dateFormat))
      );
    }

    /**
     * データ送信要求画面へ遷移
     */
    public handleClick(): void {
      const params: any[] = [];

      this.selectedList.forEach((index) => {
        const car = this.lists.originList[(parseInt(index) - 1)];
        const param = {
          carId: car['cars.car_identification.id'],
          model: car['cars.car_identification.model'],
          typeRev: car['cars.car_identification.type_rev'],
          serial: car['cars.car_identification.serial']
        }
        params.push(param);
      });

      this.router.navigated = false;
      this.router.navigate(
        ["/customize_data_request"],
        {
          queryParams: params
        }
      )
    }

    /**
     * 一括設定取得要求へ遷移
     */
    public handleEditClick(data: any): void {
      this.router.navigated = false;
      this.router.navigate(
        ["/customize_setting"],
        {
          queryParams: {
            carId: data['cars.car_identification.id'],
            model: data['cars.car_identification.model'],
            typeRev: data['cars.car_identification.type_rev'],
            serial: data['cars.car_identification.serial']
          }
        }
      )
    }

    /**
      * 選択チェックボックス全部チェック付ける
      * @param value 値
      */
    toggleCheckAll() {alert('yo');
      // this.checkAll = !this.checkAll;
      // for (let i = 0; i <= this.selectedList.length; i++) {
      //   this.checkedItems[i] = this.checkAll;
      // }
    }

    /**
     * 選ばれたデータにより、ボタンの活性・非活性化を行う
     */
    onCheckSelect() {let isNonNextGen = false;
      let isIridium = false;

      for (let index of this.selectedList) {
        const car = this.lists.originList[(parseInt(index) - 1)];

        // 端末モード区分が次世代以外の場合
        if (car['cars.terminal_mode.kind'] !== '0') {
          isNonNextGen = true;
          break;
        }

        // 通信機種がiridiumの場合
        if (car['cars.communication_channel.code'] === '5') {
          isIridium = true;
        }
      }

      if (isNonNextGen) {
        this.isDisabled = true;
        this.checkAllDisabled = true;
      } else if (isIridium) {
        this.checkAllDisabled = true;
        this.isDisabled = false;
      } else if (this.selectedList.length > 0) {
        this.checkAllDisabled = false;
        this.isDisabled = false;
      } else {
        this.checkAllDisabled = true;
        this.isDisabled = true;
      }
    }

    /**
     * リセット押下時の処理
     */
    onClickReset(): void {
      this.modalService.open({
        title: this.labels.reset_modal_title,
        labels: this.labels,
        content: this.resetModalContent,
        closeBtnLabel: this.labels.cancel,
        ok: () => {
          this.carListService.initCarOperatorSearchCondition();
          this.params = _.cloneDeep(this.initParams);
          this.safeDetectChanges();
          this.selectors.forEach((s: SelectedComponent) => {
            if (s) {
              s.refresh();
            }
          });
          this.selectTypers.forEach((s: SelectTypeComponent) => {
            if (s) {
              s.initSelectedParam();
            }
          });
        },
      });
    }

    /**
     * 設定取得要求ボタン押下コールバック
     */
    openCsGetRequestDialog() {
      this.modalService.open(
        {
          title: this.labels.confirmation_title,
          labels: this.labels,
          content: this.csGetRequestModalContent,
          closeBtnLabel: this.labels.cancel,
          okBtnLabel: this.labels.ok_btn,
          ok: () => {
            const requestHeaderParams: RequestHeaderParams = {}
            const params =
            {
              cars: [
                {
                  car_id: this.carId,
                  request_route_kind: '0'
                }
              ]
            }
            this.csDetailService.postCarsRequestSetsCustomizeUsageDefinitionsM2s(params, requestHeaderParams)
              .then(res => {
                // TODO:
                console.log("postCarsRequestSetsCustomizeUsageDefinitionsM2s", res);
              })
          },
        },
        {
          size: 'lg',
        }
      );
    }

    /**
     * 対象列が配列形式かどうかを判断する。
     * @param pathName 対象列のパス名
     * @returns true：配列、false：配列ではない。
     */
    public isArrayColumnData(pathName: string): boolean {
      return this.arrayColumnPaths.indexOf(pathName) !== -1
    }

    /**
     * 対象列が編集列かどうかを判断する。
     * @param colIndex 対象列のindex
     * @returns true：編集列、false：編集列ではない。
     */
    public isEditColumn(colIndex: number): boolean {
      return colIndex === 4;
    }

    /**
     * 次世代モードの車両のみボタンが表示される。
     * @param data
     * @returns
     */
    public isNextGen(data: any): boolean {
      return data['cars.terminal_mode.kind'] === '0';
    }

}
