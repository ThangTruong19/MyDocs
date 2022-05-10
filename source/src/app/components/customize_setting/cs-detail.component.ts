import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
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

// モーダルからの返却値
interface CustomizeUsageDefinitionResponseData {
  customize_usage_definition_id?: string;
  customize_usage_definition_name?: string;
  customize_usage_definition_version?: number;
  start_date?: string;
  end_date?: string;
  priority_name?: string;
  customize_definitions?: CustomizeDefinitionResponseData[]
}
interface CustomizeDefinitionResponseData {
  customize_definition_id?: string;
  customize_definition_name?: string;
  assumption_data_value?: number;
  active_name?: string;
  latest_operation_code_name?: string;
  status_name?: string;
  start_date?: string;
  end_date?: string;
  first_receive_datetime?: string;
  latest_receive_datetime?: string;
  aggregation_condition_name?: string;
  send_condition_name?: string;
}

// APIからの返却値
interface ResultData {
  customize_usage_definitions?: CustomizeUsageDefinition[]
}

interface CustomizeUsageDefinition {
  customize_usage_definition?: CustomizeUsageDefinitionContent
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
  assumption_data_value?: number;
  active_name?: string;
  latest_operation_code_name?: string;
  status_name?: string;
  start_date?: string;
  end_date?: string;
  first_receive_datetime?: string;
  latest_receive_datetime?: string;
  aggregation_condition_name?: string;
  send_condition_name?: string;
  customize_definition_name?: string;
}

class EditStatus {
  static default = 0;
  static add = 1;
  static edit = 2;
  static delete = 3;
}
// TODO:
class EditStatusName {
  static default = '';
  static add = '追加';
  static edit = '変更';
  static delete = '削除';
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
  @ViewChild(CsNewComponent) newChildComponent: CsNewComponent;
  @ViewChild(CsEditComponent) editChildComponent: CsEditComponent;
  @ViewChild(CsImmediateUpdateRequestConfirmComponent) csImmediateUpdateRequestConfirmComponent: CsImmediateUpdateRequestConfirmComponent;

  @Output() public sort: EventEmitter<any> = new EventEmitter<any>();

  fields: Fields;
  fixedThList: TableHeader[];
  scrollableThList: TableHeader[];
  lineBreakColumns = [
    'customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_id',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_name',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.assumption_data_value',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.active_name',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.latest_operation_code_name',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.status_name',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.start_date',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.end_date',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.first_receive_datetime',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.latest_receive_datetime',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.aggregation_condition_name',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.send_condition_name',
  ];
  checkIdName = 'customize_usage_definitions.customize_usage_definition.customize_usage_definition_id';
  checkedItems: { [key: string]: boolean } = {};
  checkAll = false;
  get selectedList() {
    return _.map(this.checkedItems, (value, key) =>
      value ? key : null
    ).filter(Boolean);
  }

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

  data = {
    resource: {}
  };

  inputParams = {
    customize_usage_definition_id: '',
    regist_customize_usage_definition_version: 0,
    regist_customize_usage_definition_name: '',
    edit_start_date_ymd: '',
    edit_end_date_ymd: '',
    regist_priority_name: '',
    // TODO:
    // active_name: '',
  };

  requestParams = {
    "cars": [
      {
        "car_id": "",
        "request_route_kind": "0"
      }
    ]
  };

  selectedData: any[] = [];

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
    protected datePickerService: DatePickerService,) {
    super(nav, title, router, cdRef, header, modal);
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
    // const list = this._formatList(
    //   res.result_data.customize_usage_definitions,
    //   this.thList
    // );
    const list = this._customFormatList(res.result_data.customize_usage_definitions);
    this._fillLists(res.result_header, list);
    this.isFetching = false;
    this._afterFetchList();
  }

  private _customFormatList(result_data: any): any[]{
    let resultLst : any[] = [];
    result_data.forEach((element : any) => {
      element.customize_usage_definition.customize_definitions.forEach((item : any) => {
        resultLst.push({
          'customize_usage_definitions.customize_usage_definition.customize_definitions.active_kind' : item.active_kind,
          'customize_usage_definitions.customize_usage_definition.customize_definitions.active_name' : item.active_name,
          'customize_usage_definitions.customize_usage_definition.customize_definitions.aggregation_condition_name' : item.aggregation_condition_name,
          'customize_usage_definitions.customize_usage_definition.customize_definitions.assumption_data_value' : item.assumption_data_value,
          'customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_id' : item.customize_definition_id,
          'customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_name' : item.customize_definition_name,
          'customize_usage_definitions.customize_usage_definition.customize_definitions.end_date' : item.end_date,
          'customize_usage_definitions.customize_usage_definition.customize_definitions.first_receive_datetime' : item.first_receive_datetime,
          'customize_usage_definitions.customize_usage_definition.customize_definitions.latest_operation_code_name' : item.latest_operation_code_name,
          'customize_usage_definitions.customize_usage_definition.customize_definitions.latest_receive_datetime' : item.latest_receive_datetime,
          'customize_usage_definitions.customize_usage_definition.customize_definitions.send_condition_name' : item.send_condition_name,
          'customize_usage_definitions.customize_usage_definition.customize_definitions.start_date' : item.start_date,
          'customize_usage_definitions.customize_usage_definition.customize_definitions.status_name' : item.status_name,
          'customize_usage_definitions.customize_usage_definition.customize_usage_definition_id' : element.customize_usage_definition.customize_usage_definition_id,
          'customize_usage_definitions.customize_usage_definition.customize_usage_definition_name' : element.customize_usage_definition.customize_usage_definition_name,
          'customize_usage_definitions.customize_usage_definition.customize_usage_definition_version' : element.customize_usage_definition.customize_usage_definition_version,
          'customize_usage_definitions.customize_usage_definition.end_date' : element.customize_usage_definition.end_date,
          'customize_usage_definitions.customize_usage_definition.priority_name' : element.customize_usage_definition.priority_name,
          'customize_usage_definitions.customize_usage_definition.priority' : element.customize_usage_definition.priority,
          'customize_usage_definitions.customize_usage_definition.start_date' : element.customize_usage_definition.start_date
        })
      })
    })
    return resultLst;
  }

  /**
 * データ取得後、リストにデータを挿入します。
 * @param resultHeader API のレスポンスヘッダ
 * @param resultData API のレスポンスデータ
 */
  override  _fillLists(resultHeader: any, resultData: any) {
    super._fillLists(resultHeader, resultData);
    this.lists.originList.forEach(data => {
      _.set(data, 'edit_status', EditStatus.default)
      _.set(data, 'edit_status_name', EditStatusName.default)
    })
    this.lists.visibleList.forEach(data => {
      _.set(data, 'edit_status', EditStatus.default)
      _.set(data, 'edit_status_name', EditStatusName.default)
    })
    this.lists.initialOriginList = _.cloneDeep(this.lists.originList);
    this.lists.initialVisibleList = _.cloneDeep(this.lists.visibleList);
  }

  /**
   * モーダルのデータを作成する追加処理
   * @param data 行データ
   */
  // override _formatListAdditional(data: any): void {
  //   const items = _.get(data, 'customize_usage_definition.customize_definitions')
  //   // const item = this.format(items)
  //   // _.merge(data.customize_usage_definition.customize_definitions, item)
  // }

  /**
 * @param data 行データ
 */
  format(data: any) {
    // TODO:
    return data.reduce((acc: any, cur: any) => {
      acc.customize_definition_id += '\n' + cur.customize_definition_id
      acc.customize_definition_name += '\n' + cur.customize_definition_name
      acc.assumption_data_value += '\n' + cur.assumption_data_value
      acc.active_name += '\n' + cur.active_name
      acc.latest_operation_code_name += '\n' + cur.latest_operation_code_name
      acc.status_name += '\n' + cur.status_name
      acc.start_date += '\n' + cur.start_date
      acc.end_date += '\n' + cur.end_date
      acc.first_receive_datetime += '\n' + cur.first_receive_datetime
      acc.latest_receive_datetime += '\n' + cur.latest_receive_datetime
      acc.aggregation_condition_name += '\n' + cur.aggregation_condition_name
      acc.send_condition_name += '\n' + cur.send_condition_name
      return acc
    })
  }

  /**
   * 初期化 API を呼ぶ
   */
  protected async _fetchDataForInitialize(): Promise<void> {
    // TODO:
    // this.activatedRoute.params.subscribe(params => (this.id = params.id));
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
    this.data["resource"] = res;
  }

  /**
   * 指定項目を更新
   * @param fields 指定項目
   */
  protected _updateFields(fields: Fields): void {
    this.fields = fields;
    const opt: TableOptions = {
      columnStyles: [
        'width:20%', 'width:10%', 'width:10%'
        , 'width:10%', 'width:10%', 'width:20%'
        , 'width:20%'
      ]
    };
    this.thList = this._createThList(fields,opt);
    const xFields = this._createXFields(fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this._setXFields(xFields);
    const thLists = this._createThList(fields, { scrollable: true });
    this.fixedThList = thLists.fixed;
    this.scrollableThList = thLists.scrollable;
  }

  /**
   * ラベル表示の判定
   * @param data 対象データ
   * @return true:非表示/false:表示
   */
  checkBoxHiddenFunction(data: any): boolean {
    return data["edit_status"] === EditStatus.default;
  }

  /**
   * ラベル表示の判定
   * @param data 対象データ
   * @return true:非表示/false:表示
   */
  checkBoxDefaultHiddenFunction(data: any): boolean {
    return data["edit_status"] !== EditStatus.default
  }

  /**
   * カラムが改行を含むかの判定
   * @param name カラム名
   */
  isLineBreak(name: string): boolean {
    return this.lineBreakColumns.includes(name);
  }

  /**
   * 親側の discardIconHidden() を呼び出す
   * @param data 対象データ
   */
  public discardIconHidden(data: any): boolean {
    return data['edit_status'] === EditStatus.default
  }

  /**
   * 追加ボタン押下コールバック
   */
  onClickAdd() {
    this.openNewDialog()
  }

  /**
   * 編集ボタン押下コールバック
   *
   * @param data 対象データ
   */
  onClickEdit(data: any) {
    this.openEditDialog(data)
  }

  /**
   * 編集内容破棄ボタン押下コールバック
   *
   * @param data 対象データ
   */
  onClickDiscard(data: any) {
    const origin = this.lists.originList.find(origin => {
      return data[this.checkIdName]
        === origin[this.checkIdName]
    });
    const originListIndex = this.lists.originList.findIndex(origin => {
      return data[this.checkIdName]
        === origin[this.checkIdName]
    });
    const initialOrigin = this.lists.initialOriginList.find(initialOrigin => {
      return data[this.checkIdName]
        === initialOrigin[this.checkIdName]
    });
    if (initialOrigin) {
      this.lists.originList.splice(originListIndex, 1, initialOrigin);
    } else {
      this.lists.originList.splice(originListIndex, 1);
    }
    const visibleListIndex = this.lists.visibleList.findIndex(visible => {
      return data[this.checkIdName]
        === visible[this.checkIdName]
    });
    const initialVisible = this.lists.initialVisibleList.find(initialVisible => {
      return data[this.checkIdName]
        === initialVisible[this.checkIdName]
    });
    if (initialVisible) {
      this.lists.visibleList.splice(visibleListIndex, 1, initialVisible);
    } else {
      this.lists.visibleList.splice(visibleListIndex, 1);
    }
    // TODO:
    this.checkedItems[origin[this.checkIdName]] = false;
    const targetItems: any = this.lists.originList.filter(
      (item: any) => !this.checkBoxHiddenFunction(item)
    );
    this.checkAll =
      targetItems.length > 0 &&
      targetItems.every((item: any) => this.checkedItems[_.get(item, this.checkIdName)]);
  }

  /**
    * 編集内容全破棄ボタン押下コールバック
    */
  onClickDiscardAll() {
    // TODO:
    // openDiscardAllDialog();

    this.lists.originList = _.cloneDeep(this.lists.initialOriginList);
    this.lists.visibleList = _.cloneDeep(this.lists.initialVisibleList);
    this.checkedItems = {}
    this.checkAll = false
  }

  /**
   * 設定更新要求ボタン押下コールバック
   */
  onClickUpdateRequest() {

    this.lists.originList.forEach(
      (item: any) => {
        this.selectedList.forEach(element => {
          if(item[this.checkIdName] == element) this.selectedData.push(item);
        })
      }
    );

    this.modalService.open(
      {
        title: this.labels.confirmation_title,
        labels: this.labels,
        content: this.csUpdateRequestConfirmModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          let customUsageDef : any[] = [];
          this.selectedData.forEach(element => {
            customUsageDef.push({
              "customize_usage_definition_id": element["customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_id"],
              "version": element["customize_usage_definitions.customize_usage_definition.customize_usage_definition_version"],
              "request_kind": "2",
              "priority": element["customize_usage_definitions.customize_usage_definition.priority"],
              "date_to": element["customize_usage_definitions.customize_usage_definition.end_date"],
              "date_from": element["customize_usage_definitions.customize_usage_definition.start_date"],
              "active_kind": element["customize_usage_definitions.customize_usage_definition.customize_definitions.active_kind"]
            })
          })
          const requestParam = {
            "car_id": this.carId,
            "request_route_kind": "0",
            "instant_kind": "0",
            "continuous_kind": "0", // Still Q&A
            "customize_usage_definition": customUsageDef
          }
          this.customSettingService.postCustomUsageDefinitionUpdateRequest(requestParam)
            .then(res => {
              console.log("RES", res);
            })
          this.selectedData = [];
        },
        ng: () => {
          this.selectedData = [];
        }
      },
      {
        size: 'lg',
      }
    );
    // TODO:
    // openUpdateRequestDialog();

    // this.pageParams.pageNo = 1;
    // this.pageParams.dispPageNo = 1;
    // this._reflectPageParams();
    // this.fetchList(this.sortingParams['sort']);
    // this.checkedItems = {};
    // this.checkAll = false
  }

  /**
   * 設定即時更新要求ボタン押下コールバック
   */
  onClickImmediateUpdateRequest() {
    // TODO:
    // openImmediateUpdateRequestDialog();

    // this.pageParams.pageNo = 1;
    // this.pageParams.dispPageNo = 1;
    // this._reflectPageParams();
    // this.fetchList(this.sortingParams['sort']);
    // this.checkedItems = {};
    // this.checkAll = false

    this.lists.originList.forEach(
      (item: any) => {
        this.selectedList.forEach(element => {
          if(item[this.checkIdName] == element) this.selectedData.push(item);
        })
      }
    );

    this.modalService.open(
      {
        title: this.labels.confirmation_title,
        labels: this.labels,
        content: this.csImmediateUpdateRequestConfirmModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          let customUsageDef : any[] = [];
          this.selectedData.forEach(element => {
            customUsageDef.push({
              "customize_usage_definition_id": element["customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_id"],
              "version": element["customize_usage_definitions.customize_usage_definition.customize_usage_definition_version"],
              "request_kind": "2",
              "priority": element["customize_usage_definitions.customize_usage_definition.priority"],
              "date_to": element["customize_usage_definitions.customize_usage_definition.end_date"],
              "date_from": element["customize_usage_definitions.customize_usage_definition.start_date"],
              "active_kind": element["customize_usage_definitions.customize_usage_definition.customize_definitions.active_kind"]
            })
          })
          const requestParam = {
            "car_id": this.carId,
            "request_route_kind": "0",
            "instant_kind": "1",
            "continuous_kind": this.csImmediateUpdateRequestConfirmComponent.isContinued,
            "customize_usage_definition": customUsageDef
          }
          this.customSettingService.postCustomUsageDefinitionUpdateRequest(requestParam)
            .then(res => {
              console.log("RES", res);
            })
          this.selectedData = [];
        },
        ng: () => {
          this.selectedData = [];
        }
      },
      {
        size: 'lg',
      }
    );
  }

  openNewDialog() {
    this.modalService.open(
      {
        title: this.labels.addition_title,
        labels: this.labels,
        content: this.csNewModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          this.newChildComponent.closeNewDialog();
          const data = this.lists.visibleList[this.lists.visibleList.length - 1];
          let resultData: CustomizeUsageDefinitionResponseData = _.clone(this.newChildComponent.modalResponse);
          resultData.customize_usage_definition_id = data['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'] + 1;

          // const content: CustomizeUsageDefinition = {
          //   customize_usage_definition: {
          //     customize_usage_definition_id: resultData.customize_usage_definition_id,
          //     customize_usage_definition_name: resultData.customize_usage_definition_name,
          //     customize_usage_definition_version: resultData.customize_usage_definition_version,
          //     start_date: resultData.start_date,
          //     end_date: resultData.end_date,
          //     priority_name: resultData.priority_name,
          //     customize_definitions: this.format(resultData.customize_definitions)
          //   }
          // };
          let returnedData  = {
            customize_usage_definition: resultData
          };
          let lstResultData = [];
          lstResultData.push(returnedData);
          const content = this._customFormatList(lstResultData);

          // const formattedContent = this.thList.reduce((acc: Format, cur) => {
          //   const item = _.get(content, cur.formatKey);
          //   acc[cur.name] = item
          //   return acc;
          // }, {})

          // _.set(formattedContent, 'edit_status', EditStatus.add)
          // _.set(formattedContent, 'edit_status_name', EditStatusName.add)
          content.forEach((element : any) => {
            _.set(element, 'edit_status', EditStatus.add)
            _.set(element, 'edit_status_name', EditStatusName.add)
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

  openEditDialog(data: any) {
    const content: CustomizeUsageDefinition = this.thList.reduce((acc, cur) => {
      const item = _.get(data, cur.name);
      _.set(acc, cur.formatKey, item)
      return acc;
    }, {})

    this.inputParams.customize_usage_definition_id = content.customize_usage_definition.customize_usage_definition_id
    this.inputParams.regist_customize_usage_definition_name = content.customize_usage_definition.customize_usage_definition_name
    this.inputParams.regist_customize_usage_definition_version = content.customize_usage_definition.customize_usage_definition_version
    this.inputParams.edit_start_date_ymd = content.customize_usage_definition.start_date
    this.inputParams.edit_end_date_ymd = content.customize_usage_definition.end_date
    this.inputParams.regist_priority_name = content.customize_usage_definition.priority_name

    this.modalService.open(
      {
        title: this.labels.edit_title,
        labels: this.labels,
        content: this.csEditModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          // TODO: テストデータ
          this.editChildComponent.closeEditDialog();
          let resultData: CustomizeUsageDefinitionResponseData = _.clone(this.editChildComponent.modalResponse);
          resultData.customize_usage_definition_id = data['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'];

          const content: CustomizeUsageDefinition = {
            customize_usage_definition: {
              customize_usage_definition_id: resultData.customize_usage_definition_id,
              customize_usage_definition_name: resultData.customize_usage_definition_name,
              customize_usage_definition_version: resultData.customize_usage_definition_version,
              start_date: resultData.start_date,
              end_date: resultData.end_date,
              priority_name: resultData.priority_name,
              customize_definitions: this.format(resultData.customize_definitions)
            }
          };

          const formattedContent = this.thList.reduce((acc: Format, cur) => {
            const item = _.get(content, cur.formatKey);
            acc[cur.name] = item
            return acc;
          }, {})

          switch(this.editChildComponent.modalResponse.edit_mode){
            case "update":
              _.set(formattedContent, 'edit_status', EditStatus.edit)
              _.set(formattedContent, 'edit_status_name', EditStatusName.edit)
              break;
            case "delete":
              _.set(formattedContent, 'edit_status', EditStatus.delete)
              _.set(formattedContent, 'edit_status_name', EditStatusName.delete)
              break;
            default:
              break;
          }

          const originListIndex = this.lists.originList.findIndex(origin => {
            return data[this.checkIdName]
              === origin[this.checkIdName]
          });
          this.lists.originList.splice(originListIndex, 1, formattedContent);
          const visibleListIndex = this.lists.visibleList.findIndex(visible => {
            return data[this.checkIdName]
              === visible[this.checkIdName]
          });
          this.lists.visibleList.splice(visibleListIndex, 1, formattedContent);
          this.checkedItems[formattedContent[this.checkIdName]] = true;
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

  openGetRequestDialog() {
    this.modalService.open(
      {
        title: this.labels.confirmation_title,
        labels: this.labels,
        content: this.csGetRequestModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          this.requestParams.cars[0].car_id = this.carId;
          this.customSettingService.postCustomUsageDefinitionRequest(this.requestParams)
            .then(res => {
              console.log("RES", res);
            })
        },
      },
      {
        size: 'lg',
      }
    );
  }

  openInputDataCancelConfirmDialog() {
    this.modalService.open(
      {
        title: this.labels.confirmation_title,
        labels: this.labels,
        content: this.csInputDataCancelConfirmModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          this.requestParams.cars[0].car_id = this.carId;
          this.customSettingService.postCustomUsageDefinitionRequest(this.requestParams)
            .then(res => {
              console.log("RES", res);
            })
        },
      },
      {
        size: 'lg',
      }
    );
  }
}
