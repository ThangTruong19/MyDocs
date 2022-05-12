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
import { AuthoritySelectComponent } from 'app/components/authority/authority-select/authority-select.component';

import { OperatorInitSearchParams } from 'app/types/car';
import { SelectTypeComponent } from 'app/components/shared/select-type/select-type.component';
import { CustomizeSettingService } from 'app/services/customize_setting/customize-setting.service';

import { KbaModalService } from 'app/services/customize-setting-upload/upload-result/app-modal.service';
import { ModalValues } from 'app/types/common'

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

    @ViewChildren(AuthoritySelectComponent)
    authoritySelectComponentList: QueryList<AuthoritySelectComponent>;

    @ViewChild('resetModalContent', { static: false })
    resetModalContent: TemplateRef<null>;
    @ViewChildren(SelectedComponent)
    selectors: QueryList<SelectedComponent>;
    @ViewChildren(SelectTypeComponent)
    selectTypers: QueryList<SelectTypeComponent>;

    @ViewChild('initModalContent', { static: false })
    initModalContent: TemplateRef<null>;

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

    selectedList: any[] = [];
    checkedItems: boolean[] = [];
    checkAll: boolean = false;

    checkAllDisabled: boolean = false;
    isDisabled: boolean = false;
    terminalModeType: string;
    transmissionType: string;
    otherThanNextGenValue = '3'; // TODO:
    iridiumValue = '3'; // TODO:

    showCloseBtn: boolean = true;
    initModalValues: ModalValues;

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
      protected userSettingService: UserSettingService

      ,protected tempModalService: KbaModalService = null
      ,private csDetailService: CsDetailService
    ) {
      super(navigationService, title, router, ref, header);
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

      this.selectedList = res.result_data.operation_histories;
      for (let i = 1; i <= this.selectedList.length; i++) {
        this.checkedItems[i] = this.checkAll;
      }

      const list = this._formatList(
        res.result_data.operation_histories,
        this.thList
      );
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
   * 対象画面のプルダウン変更時の処理
   * @param value 対象画面
   */
  // handleAppCodeChange(value: any) { }

  /**
   * 大分類変更時の処理
   * @param value 選択値
   */
  // async onCategoryCodeChange(value: any) {
  //   // const res = await this.carListService.fetchBelongingCategoryCode(value);
  //   const res = await this.carListService.fetchAllDropdownSelection(value);
  //   console.log('throw breaks');console.log(res);

  //   _.set(
  //     this.resource,
  //     'operation_history.code',
  //     _.get(res, 'operation_history.code')
  //   );
  //   if (this.belongingCategoryCode) {
  //     this.belongingCategoryCode.reset();
  //     this.belongingCategoryCode.refresh();
  //   }
  // }

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
      this.initialize(res); console.log('labels');console.log(res.label);
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

      this.initModalValues = this._getModalValues(res.initFields);
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
      this.router.navigated = false;
      this.router.navigateByUrl("/customize_data_request");
    }

    /**
     * 一括設定取得要求へ遷移
     */
    public handleEditClick(): void {
      this.router.navigated = false;
      this.router.navigateByUrl("/customize_setting");
    }

    /**
      * 選択チェックボックス全部チェック付ける
      * @param value 値
      */
    toggleCheckAll() {
      this.checkAll = !this.checkAll;
      for (let i = 0; i <= this.selectedList.length; i++) {
        this.checkedItems[i] = this.checkAll;
      }
    }

    /**
      * 選択チェックボックス変更時コールバック
      * @param value 値
      */
    onCheckSelect(checked: boolean, index: any): void {
        this.checkedItems[index] = !checked;
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
     * 端末モード区分が次世代以外の場合、3つボタンを非活性にする。
     * @param event
     */
    disableButtonsHandler(event: any): void {
      this.terminalModeType = event;
      if (this.terminalModeType == this.otherThanNextGenValue) {
        this.checkAllDisabled = true;
        this.isDisabled = true;
      } else {
        if (this.transmissionType == this.iridiumValue) {
          this.checkAllDisabled = true;
          this.isDisabled = false;
        } else {
          this.checkAllDisabled = false;
          this.isDisabled = false;
        }
      }
    }

    /**
     * 通信機種がIridiumの場合、2つボタンを非活性にする。
     * @param event
     */
    disableButtonHandler(event: any): void {
      this.transmissionType = event;
      if (this.transmissionType == this.iridiumValue) {
        this.checkAllDisabled = true;
      } else {
        if (this.terminalModeType == this.otherThanNextGenValue) {
          this.checkAllDisabled = true;
        } else {
          this.checkAllDisabled = false;
        }
      }
    }

          /**
 * 権限リンク押下コールバック
 * @param user ユーザ情報
 */
  async onClickSelect(user: any, index: number) {

    const authoritySelect = this.authoritySelectComponentList.toArray()[1];

    // authoritySelect.reset();
    // await this._authorities(user);
    authoritySelect.onClickSelect();

  }











  /**
   * 設定取得要求ボタン押下コールバック
   */
  openCsGetRequestDialog() { console.log('child');console.log(this.csGetRequestModalContent);
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





  test: { [key: string]: boolean } = {['2']:true};
  get selectedMystery() { //console.log('mystery no');console.log(this.test);
  return _.map(this.test, (value, key) =>
    value ? key : null
  ).filter(Boolean);
}

  // TODO:
  /**
   * temporary カスタマイズ一括設定アップロード結果確認(モーダル)
   */
   async onClickInit(): Promise<void> {
    // const carList = await this.carService.fetchCarIndexList(
    //   { common: { car_identification: { car_ids: this.selectedList } } },
    //   this.initModalValues.requestHeaderParams
    // );
    // this.initModalValues.listVal = this._formatList(
    //   carList.result_data.cars,
    //   this.initModalValues.listDesc
    // );

    // const carList = await this.carService.fetchCarIndexList(
    //   { common: { car_identification: { car_ids: this.selectedList } } },
    //   this.initModalValues.requestHeaderParams
    // );console.log('header');console.log(this.initModalValues.requestHeaderParams);

    // const params: HistoryMgtListIndexParams = {
    //   customize_operation_history: _.omit(
    //     this.searchParams,
    //     this.excludeSearchParams
    //   )
    // };
    // const res = await this.carListService.fetchIndexList(
    //   params,
    //   this.requestHeaderParams
    // );console.log('header');console.log(this.requestHeaderParams);

  //   const testing = new Map<string, string>([
  //     ["0", "2"]
  // ]);
      // const testing =
      // ["0", "2"];
  //     const testing: { [key: string]: boolean } = {['2']:true};
  // console.log('testing');console.log(testing);

  console.log('fook this');console.log(this.selectedMystery);

    const carList = await this.carListService.fetchCarIndexList(
      { common: { car_identification: { car_ids: this.selectedMystery } } },
      this.initModalValues.requestHeaderParams
    );console.log('header');console.log(this.initModalValues.requestHeaderParams);

    this.initModalValues.listVal = this._formatList(
      // carList.result_data.operation_histories,
      carList.result_data.cars,
      // this.thList
      this.initModalValues.listDesc
    );

    console.log('wealth');
    console.log(this.initModalValues.listVal);

    this.tempModalService.open({
      title: this.labels.car_operator_init,
      labels: this.labels,
      content: this.initModalContent,//list,//null,//this.initModalContent,
      closeBtnLabel: this.labels.cancel,
      ok: () => {
        // this.operatorService
        //   .disableOperatorIdentification({ car_id: this.selectedList })
        //   .then(res => {
        //     this._resultModalOpen(
        //       this.labels.init_result_label,
        //       this.initModalValues.listDesc,
        //       this.initModalValues.listVal,
        //       res['responses'],
        //       () => {
        //         this.pageParams.pageNo = 1;
        //         this.pageParams.dispPageNo = 1;
        //         this._reflectPageParams();
        //         this.fetchList(this.sortingParams['sort']);
        //         this.checkedItems = {};
        //       },
        //       { size: 'lg' }
        //     );
        //   });
      },
    });
  }
}
