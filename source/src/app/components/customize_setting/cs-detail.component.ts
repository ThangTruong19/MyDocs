import { ChangeDetectorRef, Component, OnInit, DoCheck, TemplateRef, ViewChild, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { CsDetailService } from 'app/services/customize_setting/cs-detail.service';
import { CustomizeSettingService } from 'app/services/customize_setting/customize-setting.service';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { ModalService } from 'app/services/shared/modal.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { Fields, TableHeader, TableMergeColumn, TableOptions } from 'app/types/common';
import * as _ from 'lodash';
import { AbstractIndexComponent } from '../shared/abstract-component/abstract-index.component';
import { CsNewComponent } from './new/cs-new.component';
import { CsEditComponent } from './edit/cs-edit.component';
import { CsImmediateUpdateRequestConfirmComponent } from './immediate-update-request-confirm/cs-immediate-update-request-confirm.component';

interface Format {
  [key: string]: string
}

// モーダル、API呼び出し
interface CustomizeUsageDefinition {
  customize_usage_definition?: CustomizeUsageDefinitionContent
  edit_status?: string;
  edit_status_name?: string
}

interface CustomizeUsageDefinitionContent {
  customize_usage_definition_id?: string;
  customize_usage_definition_name?: string;
  customize_usage_definition_version?: number;
  start_date?: string;
  end_date?: string;
  priority?: string;
  priority_name?: string;
  use_kind?: string;
  use_name?: string;
  customize_definitions?: CustomizeDefinition[]
}

interface CustomizeDefinition {
  customize_definition_id?: string;
  customize_definition_name?: string;
  customize_definition_version?: number;
  priority?: string;
  priority_name?: string;
  active_kind?: string;
  active_name?: string;
  latest_operation_code?: string;
  latest_operation_code_name?: string;
  status?: string;
  status_name?: string;
  assumption_data_value?: number;
  start_date?: string;
  end_date?: string;
  first_receive_datetime?: string;
  latest_receive_datetime?: string;
  aggregation_condition_id?: string;
  aggregation_condition_name?: string;
  send_condition_id?: string;
  send_condition_name?: string;
  customize_access_level?: string;
  customize_access_level_name?: string;
}

interface RequestHeaderParams {
  'X-Lang'?: string;
  'X-AppCode'?: string;
  'X-GroupId'?: string;
  'X-DateFormat'?: string;
  'X-ScreenCode'?: string;
  'X-WebApiKey'?: string;
}

interface KOM00110130 {
  car_id?: string;
  request_route_kind?: string;
  instant_kind?: string;
  continuous_kind?: string;
  customize_usage_definition?: KOM00110130_CustomizeUsageDefinition[]
}

interface KOM00110130_CustomizeUsageDefinition {
  customize_usage_definition_id?: string;
  version?: string;
  request_kind?: string;
  priority?: string;
  date_to?: string;
  date_from?: string;
  // TODO:
  active_kind?: string;
}

interface KOM00110XXX {
  car_id?: string;
  customize_definition: KOM00110XXX_CustomizeDefinition[]
}
interface KOM00110XXX_CustomizeDefinition {
  customize_definition_id?: string;
}

enum Status {
  送信中 = '10',
  送信済 = '20',
  車両反映中 = '30',
  送信失敗 = '40',
  削除済 = '90',
}

enum EditStatus {
  デフォルト = '0',
  追加 = '1',
  変更 = '2',
  削除 = '3',
}

@Component({
  selector: 'app-cs-detail',
  templateUrl: './cs-detail.component.html',
  styleUrls: ['./cs-detail.component.scss']
})

export class CsDetailComponent extends AbstractIndexComponent implements OnInit {

  @ViewChild('csNewModalContent', { static: false }) csNewModalContent: TemplateRef<null>;
  @ViewChild('csEditModalContent', { static: false }) csEditModalContent: TemplateRef<null>;
  @ViewChild('csGetRequestModalContent', { static: false }) csGetRequestModalContent: TemplateRef<null>;
  @ViewChild('csUpdateRequestConfirmModalContent', { static: false }) csUpdateRequestConfirmModalContent: TemplateRef<null>;
  @ViewChild('csImmediateUpdateRequestConfirmModalContent', { static: false }) csImmediateUpdateRequestConfirmModalContent: TemplateRef<null>;
  @ViewChild('csInputDataCancelConfirmModalContent', { static: false }) csInputDataCancelConfirmModalContent: TemplateRef<null>;
  @ViewChild('csRequestResendConfirmModalContent', { static: false }) csRequestResendConfirmModalContent: TemplateRef<null>;
  @ViewChild('csExpectedTrafficConfirmModalContent', { static: false }) csExpectedTrafficConfirmModalContent: TemplateRef<null>;
  @ViewChild(CsNewComponent) newChildComponent: CsNewComponent;
  @ViewChild(CsEditComponent) editChildComponent: CsEditComponent;
  @ViewChild(CsImmediateUpdateRequestConfirmComponent) csImmediateUpdateRequestConfirmComponent: CsImmediateUpdateRequestConfirmComponent;

  @Output() public sort: EventEmitter<any> = new EventEmitter<any>();

  fields: Fields;
  fixedThList: TableHeader[];
  scrollableThList: TableHeader[];

  statusKey = 'customize_usage_definitions.customize_usage_definition.customize_definitions.status'
  customizeUsageDefinitionIdKey = 'customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'

  checkIdName = 'customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'
  checkedItems: { [key: string]: boolean } = {};
  checkAll = false;
  disabled = true

  override lists: {
    visibleList: any[];
    originList: any[];
    initialVisibleList: any[];
    initialOriginList: any[]
  } = {
      visibleList: [],
      originList: [],
      initialVisibleList: [],
      initialOriginList: [],
    };

  carId: string;
  model: string;
  typeRev: string;
  serial: string;

  resources: {}
  tableData: any[] = []

  inputParams = {
    edit_customize_usage_definition_id: '',
    edit_customize_usage_definition_version: '',
    edit_customize_usage_definition_name: '',
    edit_start_date: '',
    edit_end_date: '',
    edit_priority_name: '',
    // TODO:
    edit_active_name: '',
  };

  public mergeColumns: TableMergeColumn[] = [];

  constructor(
    nav: NavigationService,
    title: Title,
    header: CommonHeaderService,
    router: Router,
    private activatedRoute: ActivatedRoute,
    private modal: ModalService,
    private cdRef: ChangeDetectorRef,
    private customSettingService: CustomizeSettingService,
    private csDetailService: CsDetailService,
    protected userSettingService: UserSettingService,
    protected datePickerService: DatePickerService) {
    super(nav, title, router, cdRef, header, modal);
  }

  ngDoCheck(): void {
    this.disabled = !Object.values(this.checkedItems).some(item => item)
  }

  /**
   * 現在のパラメータを一覧取得APIに引き渡し、一覧画面に表示するリストを取得する
   * @param sort_key ソートキー
   */
  async fetchList(sort_key?: string): Promise<void> {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    const res = await this.csDetailService.fetchIndexList(
      this.carId,
      this.requestHeaderParams
    );
    const data = res.result_data.customize_usage_definitions.reduce((acc: any, cur: any) => {
      const item = _.get(cur, 'customize_usage_definition')
      const contents = _.get(cur, 'customize_usage_definition.customize_definitions').map((cur: any) => {
        return {
          customize_usage_definition: {
            customize_usage_definition_id: item.customize_usage_definition_id,
            customize_usage_definition_name: item.customize_usage_definition_name,
            customize_usage_definition_version: item.customize_usage_definition_version,
            start_date: item.start_date,
            end_date: item.end_date,
            priority_name: item.priority_name,
            customize_definitions: {
              customize_definition_id: cur.customize_definition_id,
              customize_definition_name: cur.customize_definition_name,
              assumption_data_value: cur.assumption_data_value,
              active_name: cur.active_name,
              latest_operation_code_name: cur.latest_operation_code_name,
              status_name: cur.status_name,
              start_date: cur.start_date,
              end_date: cur.end_date,
              first_receive_datetime: cur.first_receive_datetime,
              latest_receive_datetime: cur.latest_receive_datetime,
              aggregation_condition_name: cur.aggregation_condition_name,
              send_condition_name: cur.send_condition_name
            }
          }
        }
      })
      acc.push(...contents)
      return acc
    }, [])
    const list = this._formatList(
      data,
      this.thList
    );
    this._fillLists(res.result_header, list);
    this.isFetching = false;
    this._afterFetchList();

    // マージ列の設定
    this.mergeColumns = [
      {
        groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
        targetColumn: 'customize_usage_definitions.customize_usage_definition.customize_usage_definition_id',
        isFixedColumnMerge: true
      },
      {
        groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
        targetColumn: 'customize_usage_definitions.customize_usage_definition.customize_usage_definition_name',
        isFixedColumnMerge: true
      },
      {
        groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
        targetColumn: 'customize_usage_definitions.customize_usage_definition.customize_usage_definition_version',
        isFixedColumnMerge: true
      },
      {
        groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
        targetColumn: 'customize_usage_definitions.customize_usage_definition.start_date',
        isFixedColumnMerge: true
      },
      {
        groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
        targetColumn: 'customize_usage_definitions.customize_usage_definition.end_date',
        isFixedColumnMerge: true
      },
      {
        groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
        targetColumn: 'customize_usage_definitions.customize_usage_definition.priority_name',
        isFixedColumnMerge: true
      }
    ]
  }

  /**
   * データ取得後、リストにデータを挿入します。
   * @param resultHeader API のレスポンスヘッダ
   * @param resultData API のレスポンスデータ
   */
  override  _fillLists(resultHeader: any, resultData: any) {
    super._fillLists(resultHeader, resultData);
    const originList = this.setStatus(this.lists.originList, EditStatus.デフォルト)
    this.lists.initialOriginList =
      _.cloneDeep(originList);
    const visibleList = this.setStatus(this.lists.visibleList, EditStatus.デフォルト)
    this.lists.initialVisibleList =
      _.cloneDeep(visibleList);
  }

  /**
   * 編集状態設定
   * @param list
   * @param editStatus
   * @param editStatusName
   */
  setStatus(list: any[], editStatus: any, editStatusName = '') {
    list.forEach(data => {
      _.set(data, 'edit_status', editStatus)
      _.set(data, 'edit_status_name', editStatusName)
    })
    return list
  }

  /**
   * 初期化 API を呼ぶ
   */
  protected async _fetchDataForInitialize(): Promise<void> {
    // TODO:
    // this.activatedRoute.params.subscribe(params => (this.carId = params.carId));
    // this.activatedRoute.params.subscribe(params => (this.model = params.model));
    // this.activatedRoute.params.subscribe(params => (this.typeRev = params.typeRev));
    // this.activatedRoute.params.subscribe(params => (this.serial = params.serial));
    this.carId = "carId";
    this.model = "model";
    this.typeRev = "typeRev";
    this.serial = "serial";
    // TODO: メーカ

    const res: any = await this.csDetailService.fetchIndexInitData();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this._updateFields(res.fields);
    this.resources = res;
  }

  /**
   * 指定項目を更新
   * @param fields 指定項目
   */
  protected _updateFields(fields: Fields): void {
    this.fields = fields;
    this.thList = this._createThList(fields);
    const xFields = this._createXFields(fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this._setXFields(xFields);
    const opt: TableOptions = {
      scrollable: true,
      columnStyles: [
        'width:2%', 'width:2%', 'width:2%'
        , 'width:5%', 'width:5%', 'width:5%'
        , 'width:5%', 'width:5%', 'width:5%'
        , 'width:5%', 'width:5%', 'width:5%'
        , 'width:5%', 'width:5%', 'width:5%'
        , 'width:5%', 'width:5%', 'width:5%'
        , 'width:5%', 'width:5%', 'width:5%'
        , 'width:2%', 'width:2%'
      ]
    }
    // const opt: TableOptions = {
    //   scrollable: true,
    //   columnStyles: [
    //     'width:10%', 'width:10%', 'width:30%'
    //     , 'width:30%', 'width:10%', 'width:10%'
    //   ]
    // }
    const thLists = this._createThList(fields, opt);
    this.fixedThList = thLists.fixed;
    this.scrollableThList = thLists.scrollable;
  }

  /**
   * ラベル表示の判定
   * @param data 対象データ
   * @return true:非表示/false:表示
   */
  checkBoxHiddenFunction(data: any): boolean {
    return data['edit_status'] === EditStatus.デフォルト;
  }

  /**
   * ラベル表示の判定
   * @param data 対象データ
   * @return true:非表示/false:表示
   */
  checkBoxDefaultHiddenFunction(data: any): boolean {
    return data['edit_status'] !== EditStatus.デフォルト
  }

  /**
   * ラベル表示の判定
   * @param data 対象データ
   * @return true:非表示/false:表示
   */
  public discardIconHiddenFunction(data: any): boolean {
    return data['edit_status'] === EditStatus.デフォルト
  }

  /**
   * ラベル表示の判定
   * @param data 対象データ
   * @return true:非表示/false:表示
   */
  public retryIconHiddenFunction(data: any): boolean {
    // TODO:
    return false
  }

  /**
   * 追加ボタン押下コールバック
   */
  onClickAdd() {
    this.openCsNewDialog()
  }

  /**
   * 編集ボタン押下コールバック
   *
   * @param data 対象データ
   */
  onClickEdit(data: any) {
    this.openCsEditDialog(data)
  }

  /**
   * 設定取得要求ボタン押下コールバック
   */
  onClickGetRequest() {
    this.openCsGetRequestDialog()
  }

  /**
   * 設定更新要求ボタン押下コールバック
   */
  onClickUpdateRequest() {
    this.openCsUpdateRequestConfirmDialog()
  }

  /**
   * 設定即時更新要求ボタン押下コールバック
   */
  onClickImmediateUpdateRequest() {
    this.openCsImmediateUpdateRequestConfirmDialog();
  }

  /**
   * 編集内容破棄ボタン押下コールバック
   *
   * @param data 対象データ
   */
  onClickDiscard(data: any) {
    this.openCsInputDataCancelConfirmDialog(data)
  }

  /**
   * 再送ボタン押下コールバック
   *
   * @param data 対象データ
   */
  onClickRetry(data: any) {
    this.openCsRequestResendConfirmDialog(data)
  }

  /**
   * 編集内容全破棄ボタン押下コールバック
   */
  onClickDiscardAll() {
    // TODO: Dialog
    this.lists.originList = _.cloneDeep(this.lists.initialOriginList);
    this.lists.visibleList = _.cloneDeep(this.lists.initialVisibleList);
    this.checkedItems = {}
    this.checkAll = false
  }

  openCsNewDialog() {
    this.modalService.open(
      {
        title: this.labels.addition_title,
        labels: this.labels,
        content: this.csNewModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          const data = this.lists.originList[this.lists.originList.length - 1]
          this.newChildComponent.closeNewDialog();
          const contents = _.get(this.newChildComponent.modalResponse,'customize_definitions').map((cur: any) => {
            return {
              'customize_usage_definition': {
                'customize_usage_definition_id': data[this.customizeUsageDefinitionIdKey] + 1,
                'customize_usage_definition_name': this.newChildComponent.modalResponse.customize_usage_definition_name,
                'customize_usage_definition_version': this.newChildComponent.modalResponse.customize_usage_definition_version,
                'start_date': this.newChildComponent.modalResponse.start_date,
                'end_date': this.newChildComponent.modalResponse.end_date,
                'priority_name' : this.newChildComponent.modalResponse.priority_name,
                'customize_definitions': {
                  'customize_definition_id': cur.customize_definition_id,
                  'customize_definition_name': cur.customize_definition_name,
                  'assumption_data_value': cur.assumption_data_value,
                  'active_name': cur.active_name,
                  'latest_operation_code_name': cur.latest_operation_code_name,
                  'status_name': cur.status_name,
                  'start_date': cur.start_date,
                  'end_date': cur.end_date,
                  'first_receive_datetime': cur.first_receive_datetime,
                  'latest_receive_datetime': cur.latest_receive_datetime,
                  'aggregation_condition_name': cur.aggregation_condition_name,
                  'send_condition_name': cur.send_condition_name
                }
              }
            }
          });

          const list = this._formatList(
            contents,
            this.thList
          );

          this.setStatus(list,EditStatus.追加,'追加')

          list.forEach((element :any) => {
            this.lists.originList.push(element)
            this.lists.visibleList.push(element)
            this.checkedItems[element[this.checkIdName]] = true;
          })

          const targetItems: any = this.lists.originList.filter(
            (item: any) => !this.checkBoxHiddenFunction(item)
          );
          this.checkAll =
            targetItems.length > 0 &&
            targetItems.every((item: any) => this.checkedItems[_.get(item, this.checkIdName)]);
        },
      },
      {
        size: 'lg',
      }
    );
  }

  openCsEditDialog(data: any) {
    const content: CustomizeUsageDefinition = this.thList.reduce((acc, cur) => {
      const item = _.get(data, cur.name);
      _.set(acc, cur.formatKey, item)
      return acc;
    }, {})

    this.inputParams.edit_customize_usage_definition_id = content.customize_usage_definition.customize_usage_definition_id
    this.inputParams.edit_customize_usage_definition_name = content.customize_usage_definition.customize_usage_definition_name
    this.inputParams.edit_customize_usage_definition_version = String(content.customize_usage_definition.customize_usage_definition_version)
    this.inputParams.edit_start_date = content.customize_usage_definition.start_date
    this.inputParams.edit_end_date = content.customize_usage_definition.end_date
    this.inputParams.edit_priority_name = content.customize_usage_definition.priority_name

    this.modalService.open(
      {
        title: this.labels.edit_title,
        labels: this.labels,
        content: this.csEditModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          this.editChildComponent.closeEditDialog();
          const contents = _.get(this.editChildComponent.modalResponse,'customize_definitions').map((cur: any) => {
            return {
              'customize_usage_definition': {
                'customize_usage_definition_id': data[this.customizeUsageDefinitionIdKey],
                'customize_usage_definition_name': this.editChildComponent.modalResponse.customize_usage_definition_name,
                'customize_usage_definition_version': this.editChildComponent.modalResponse.customize_usage_definition_version,
                'start_date': this.editChildComponent.modalResponse.start_date,
                'end_date': this.editChildComponent.modalResponse.end_date,
                'priority_name' : this.editChildComponent.modalResponse.priority_name,
                'customize_definitions': {
                  'customize_definition_id': cur.customize_definition_id,
                  'customize_definition_name': cur.customize_definition_name,
                  'assumption_data_value': cur.assumption_data_value,
                  'active_name': cur.active_name,
                  'latest_operation_code_name': cur.latest_operation_code_name,
                  'status_name': cur.status_name,
                  'start_date': cur.start_date,
                  'end_date': cur.end_date,
                  'first_receive_datetime': cur.first_receive_datetime,
                  'latest_receive_datetime': cur.latest_receive_datetime,
                  'aggregation_condition_name': cur.aggregation_condition_name,
                  'send_condition_name': cur.send_condition_name
                }
              }
            }
          });

          const list = this._formatList(
            contents,
            this.thList
          );

          switch(this.editChildComponent.modalResponse.edit_mode){
            case "update":
              this.setStatus(list,EditStatus.変更,'変更')
              break;
            case "delete":
              this.setStatus(list,EditStatus.削除,'削除')
              break;
            default:
              break;
          }

          const originListIndex = this.lists.originList.findIndex(origin => {
            return data[this.customizeUsageDefinitionIdKey]
              === origin[this.customizeUsageDefinitionIdKey]
          });
          const visibleListIndex = this.lists.visibleList.findIndex(visible => {
            return data[this.customizeUsageDefinitionIdKey]
              === visible[this.customizeUsageDefinitionIdKey]
          });

          list.forEach((element :any, index: any) => {
            this.lists.originList.splice(originListIndex + index, 1, element);
            this.lists.visibleList.splice(visibleListIndex + index, 1, element);
            this.checkedItems[element[this.checkIdName]] = true;
          })

          const targetItems: any = this.lists.originList.filter(
            (item: any) => !this.checkBoxHiddenFunction(item)
          );
          this.checkAll =
            targetItems.length > 0 &&
            targetItems.every((item: any) => this.checkedItems[_.get(item, this.checkIdName)]);
        },
      },
      {
        size: 'lg',
      }
    );
  }

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

  openCsUpdateRequestConfirmDialog() {
    const keys = Object.keys(this.checkedItems)
    this.tableData = this.lists.visibleList.filter(
      (item: any) => {
        const id = item[this.customizeUsageDefinitionIdKey]
        return keys.includes(String(id))
      }
    )
    this.modalService.open(
      {
        title: this.labels.confirmation_title,
        labels: this.labels,
        content: this.csUpdateRequestConfirmModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          const requestHeaderParams: RequestHeaderParams = {}
          const customizeUsageDefinitions: KOM00110130_CustomizeUsageDefinition[]
            = this.tableData.map(data => {
              return {
                customize_usage_definition_id: data['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
                version: String(data['customize_usage_definitions.customize_usage_definition.customize_usage_definition_version']),
                request_kind: "2",
                priority: data['customize_usage_definitions.customize_usage_definition.priority'],
                date_to: data['customize_usage_definitions.customize_usage_definition.end_date'],
                date_from: data['customize_usage_definitions.customize_usage_definition.start_date'],
                active_kind: data['customize_usage_definitions.customize_usage_definition.active_kind']
              }
            })
          const params: KOM00110130 =
          {
            car_id: this.carId,
            request_route_kind: "0",
            instant_kind: "0",
            // TODO: continuous_kind
            customize_usage_definition: customizeUsageDefinitions
          }
          this.csDetailService.postCarsRequestsCustomizeUsageDefinitionsS2m(params, requestHeaderParams)
            .then(res => {
              this.pageParams.pageNo = 1
              this.pageParams.dispPageNo = 1
              this._reflectPageParams()
              this.fetchList(this.sortingParams['sort']);
              this.checkedItems = {}
              this.checkAll = false
              // TODO:
              console.log("postCarsRequestsCustomizeUsageDefinitionsS2m", res);
            }).catch(() => {
              throw Error('更新に失敗しました。');
            })
          this.tableData = []
        },
        close: () => {
          this.tableData = []
        }
      },
      {
        size: 'lg',
      }
    );
  }

  openCsImmediateUpdateRequestConfirmDialog() {
    const keys = Object.keys(this.checkedItems)
    this.tableData = this.lists.visibleList.filter(
      (item: any) => {
        const id = item[this.customizeUsageDefinitionIdKey]
        return keys.includes(String(id))
      }
    )

    this.modalService.open(
      {
        title: this.labels.confirmation_title,
        labels: this.labels,
        content: this.csImmediateUpdateRequestConfirmModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          const requestHeaderParams: RequestHeaderParams = {}
          const customizeUsageDefinitions: KOM00110130_CustomizeUsageDefinition[]
            = this.tableData.map(data => {
              return {
                customize_usage_definition_id: data['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
                version: String(data['customize_usage_definitions.customize_usage_definition.customize_usage_definition_version']),
                request_kind: "2",
                priority: data['customize_usage_definitions.customize_usage_definition.priority'],
                date_to: data['customize_usage_definitions.customize_usage_definition.end_date'],
                date_from: data['customize_usage_definitions.customize_usage_definition.start_date'],
                active_kind: data['customize_usage_definitions.customize_usage_definition.active_kind']
              }
            })
          const params: KOM00110130 =
          {
            car_id: this.carId,
            request_route_kind: "0",
            instant_kind: "1",
            "continuous_kind": this.csImmediateUpdateRequestConfirmComponent.isContinued,
            customize_usage_definition: customizeUsageDefinitions
          }
          this.csDetailService.postCarsRequestsCustomizeUsageDefinitionsS2m(params, requestHeaderParams)
            .then(res => {
              this.pageParams.pageNo = 1
              this.pageParams.dispPageNo = 1
              this._reflectPageParams()
              this.fetchList(this.sortingParams['sort']);
              this.checkedItems = {}
              this.checkAll = false
              // TODO:
              console.log("postCarsRequestsCustomizeUsageDefinitionsS2m", res);
            }).catch(() => {
              throw Error('更新に失敗しました。');
            })
          this.tableData = []
        },
        close: () => {
          this.tableData = []
        }
      },
      {
        size: 'lg',
      }
    );
  }

  openCsInputDataCancelConfirmDialog(data: any) {
    this.modalService.open(
      {
        title: this.labels.confirmation_title,
        labels: this.labels,
        content: this.csInputDataCancelConfirmModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          const origin = this.lists.originList.find(origin => {
            return data[this.customizeUsageDefinitionIdKey]
              === origin[this.customizeUsageDefinitionIdKey]
          });

          const originListIndex = this.lists.originList.findIndex(origin => {
            return data[this.customizeUsageDefinitionIdKey]
              === origin[this.customizeUsageDefinitionIdKey]
          });
          const initialOrigin = this.lists.initialOriginList.find(initialOrigin => {
            return data[this.customizeUsageDefinitionIdKey]
              === initialOrigin[this.customizeUsageDefinitionIdKey]
          });
          if (initialOrigin) {
            this.lists.originList.splice(originListIndex, 1, initialOrigin);
          } else {
            this.lists.originList.splice(originListIndex, 1);
          }

          const visibleListIndex = this.lists.visibleList.findIndex(visible => {
            return data[this.customizeUsageDefinitionIdKey]
              === visible[this.customizeUsageDefinitionIdKey]
          });
          const initialVisible = this.lists.initialVisibleList.find(initialVisible => {
            return data[this.customizeUsageDefinitionIdKey]
              === initialVisible[this.customizeUsageDefinitionIdKey]
          });
          if (initialVisible) {
            this.lists.visibleList.splice(visibleListIndex, 1, initialVisible);
          } else {
            this.lists.visibleList.splice(visibleListIndex, 1);
          }

          delete this.checkedItems[origin[this.checkIdName]]
          const targetItems: any = this.lists.originList.filter(
            (item: any) => !this.checkBoxHiddenFunction(item)
          );
          this.checkAll =
            targetItems.length > 0 &&
            targetItems.every((item: any) => this.checkedItems[_.get(item, this.checkIdName)]);
        },
      },
      {
        size: 'lg',
      }
    );
  }
  openCsRequestResendConfirmDialog(data: any) {
    this.tableData.push(data)
    this.modalService.open(
      {
        title: this.labels.confirmation_title,
        labels: this.labels,
        content: this.csRequestResendConfirmModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          const requestHeaderParams: RequestHeaderParams = {}
          const customizeDefinitions: KOM00110XXX_CustomizeDefinition[]
            = this.tableData.map(data => {
              return {
                customize_definition_id: data['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
              }
            })
          const params: KOM00110XXX =
          {
            car_id: this.carId,
            customize_definition: customizeDefinitions
          }
          this.csDetailService.postCarsRequestsCustomizeSettingsRetryS2m(params, requestHeaderParams)
            .then(res => {
              this.tableData.forEach((data) => {
                delete this.checkedItems[data[this.checkIdName]]
              })
              const targetItems: any = this.lists.originList.filter(
                (item: any) => !this.checkBoxHiddenFunction(item)
              );
              this.checkAll =
                targetItems.length > 0 &&
                targetItems.every((item: any) => this.checkedItems[_.get(item, this.checkIdName)]);
              // TODO:
              console.log("postCarsRequestsCustomizeSettingsRetryS2m", res);
            }).catch(() => {
              throw Error('再送に失敗しました。');
            })
          this.tableData = []
        },
        close: () => {
          this.tableData = []
        }
      },
      {
        size: 'lg',
      }
    );
  }

  onClickExpectedTrafficConfirm(){
    const keys = Object.keys(this.checkedItems)
    this.tableData = this.lists.visibleList.filter(
      (item: any) => {
        const id = item[this.customizeUsageDefinitionIdKey]
        return keys.includes(String(id))
      }
    )

    this.modalService.open(
      {
        title: '想定通信量確認',
        labels: this.labels,
        content: this.csExpectedTrafficConfirmModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
      },
      {
        size: 'lg',
      }
    );
  }

}
