import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild, Output, EventEmitter } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { ActivatedRoute, Router } from '@angular/router'
import { UserSettingService } from 'app/services/api/user-setting.service'
import { CommonHeaderService } from 'app/services/shared/common-header.service'
import { DatePickerService } from 'app/services/shared/date-picker.service'
import { ModalService } from 'app/services/shared/modal.service'
import { NavigationService } from 'app/services/shared/navigation.service'
import { AlertService } from 'app/services/shared/alert.service'
import { CsDetailService } from 'app/services/customize_setting/cs-detail.service'
import { Fields, TableHeader, TableOptions } from 'app/types/common'
import * as _ from 'lodash'
import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component'
import { CsNewComponent } from 'app/components/customize_setting/new/cs-new.component'
import { CsEditComponent } from 'app/components/customize_setting/edit/cs-edit.component'
import { CsImmediateUpdateRequestConfirmComponent } from 'app/components/customize_setting/immediate-update-request-confirm/cs-immediate-update-request-confirm.component'
// TODO:
// import { RequestHeaderParams } from 'app/types/request'
import {
  CustomizeUsageDefinition,
  RequestHeaderParams,
  RequestBodyParamsKOM00110120,
  RequestBodyParamsKOM00110130,
  RequestBodyParamsKOM00110XXX,
} from 'app/types/cs-detail'

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

  @ViewChild('csNewModalContent', { static: false }) csNewModalContent: TemplateRef<null>
  @ViewChild('csEditModalContent', { static: false }) csEditModalContent: TemplateRef<null>
  @ViewChild('csGetRequestModalContent', { static: false }) csGetRequestModalContent: TemplateRef<null>
  @ViewChild('csUpdateRequestConfirmModalContent', { static: false }) csUpdateRequestConfirmModalContent: TemplateRef<null>
  @ViewChild('csImmediateUpdateRequestConfirmModalContent', { static: false }) csImmediateUpdateRequestConfirmModalContent: TemplateRef<null>
  @ViewChild('csInputDataCancelConfirmModalContent', { static: false }) csInputDataCancelConfirmModalContent: TemplateRef<null>
  @ViewChild('csRequestResendConfirmModalContent', { static: false }) csRequestResendConfirmModalContent: TemplateRef<null>
  @ViewChild('csExpectedTrafficConfirmModalContent', { static: false }) csExpectedTrafficConfirmModalContent: TemplateRef<null>
  @ViewChild(CsNewComponent) newChildComponent: CsNewComponent
  @ViewChild(CsEditComponent) editChildComponent: CsEditComponent
  @ViewChild(CsImmediateUpdateRequestConfirmComponent) csImmediateUpdateRequestConfirmComponent: CsImmediateUpdateRequestConfirmComponent

  @Output() public sort: EventEmitter<any> = new EventEmitter<any>()

  fields: Fields
  fixedThList: TableHeader[]
  scrollableThList: TableHeader[]

  csUpdateRequestConfirmThList: TableHeader[]
  csImmediateUpdateRequestConfirmThList: TableHeader[]
  csRequestResendConfirmThList: TableHeader[]
  csNewThList: TableHeader[]
  csEditThList: TableHeader[]
  csExpectedTrafficConfirmThList1: TableHeader[]
  csExpectedTrafficConfirmThList2: TableHeader[]

  statusKey = 'customize_usage_definitions.customize_usage_definition.customize_definitions.status'
  customizeUsageDefinitionIdKey = 'customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'

  checkIdName = 'customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'
  checkedItems: { [key: string]: boolean } = {}
  checkAll = false

  disabled = true

  override lists: {
    visibleList: any[]
    originList: any[]
    addList: any[]
    editList: any[]
    hiddenList: any[]
  } = {
      visibleList: [],
      originList: [],
      addList: [],
      editList: [],
      hiddenList: [],
    }

  initialLists: {
    visibleList: any[]
    originList: any[]
    addList: any[]
    editList: any[]
    hiddenList: any[]
  } = {
      visibleList: [],
      originList: [],
      addList: [],
      editList: [],
      hiddenList: [],
    }

  carId: string
  model: string
  typeRev: string
  serial: string

  resources: {}
  tableData: any[] = []

  inputParams = {
    edit_customize_usage_definition_id: '',
    edit_customize_usage_definition_version: '',
    edit_customize_usage_definition_name: '',
    edit_start_date: '',
    edit_end_date: '',
    edit_priority_name: '',
    edit_active_name: '',
  }

  private arrayColumnPaths: string[] = [
    'customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_id',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_name',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.priority_name',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.assumption_data_value',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.active_name',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.latest_operation_code_name',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.status_name',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.start_date',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.end_date',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.first_receive_datetime',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.latest_receive_datetime',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.aggregation_condition_name',
    'customize_usage_definitions.customize_usage_definition.customize_definitions.send_condition_name'
  ]

  constructor(
    nav: NavigationService,
    title: Title,
    header: CommonHeaderService,
    router: Router,
    protected activatedRoute: ActivatedRoute,
    protected modal: ModalService,
    protected cdRef: ChangeDetectorRef,
    protected userSettingService: UserSettingService,
    protected datePickerService: DatePickerService,
    protected alertService: AlertService,
    protected csDetailService: CsDetailService) {
    super(nav, title, router, cdRef, header, modal)
  }

  ngDoCheck(): void {
    this.disabled = !Object.values(this.checkedItems).some(item => item)
  }

  /**
   * 現在のパラメータを一覧取得APIに引き渡し、一覧画面に表示するリストを取得する
   * @param sort_key ソートキー
   */
  async fetchList(sort_key?: string): Promise<void> {
    this.isFetching = true
    this.requestHeaderParams['X-Sort'] = sort_key || ''
    const res = await this.csDetailService.fetchIndexList(
      this.carId,
      this.requestHeaderParams
    )
    const data = res.result_data.customize_usage_definitions
    const list = this._formatList(
      data,
      this.thList
    )
    Object.keys(list).forEach((i: any) => {
      if (!list[i].customize_usage_definitions) {
        list[i].customize_usage_definitions = {}
      }
      if (!list[i].customize_usage_definitions.customize_usage_definition) {
        list[i].customize_usage_definitions.customize_usage_definition = {}
      }
      list[i].customize_usage_definitions.customize_usage_definition.customize_definitions = data[i].customize_usage_definition.customize_definitions
    })
    this._fillLists(res.result_header, list)
    this.isFetching = false
    this._afterFetchList()
  }

  /**
   * 1行の高さを設定する。
   * @param data 対象の行データ
   * @returns 1行の高さ
   */
  public getTblRowHeight(data: any): string {
    let rowSize = 0
    if (data && data['customize_usage_definitions']
      && data['customize_usage_definitions']['customize_usage_definition']
      && data['customize_usage_definitions']['customize_usage_definition']['customize_definitions']) {
      const targetArray: any[] = data['customize_usage_definitions']['customize_usage_definition']['customize_definitions']
      rowSize = targetArray.length
    }
    const height = 23 * rowSize
    return 'height:' + height + 'px'
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
   * データ取得後、リストにデータを挿入します。
   * @param resultHeader API のレスポンスヘッダ
   * @param resultData API のレスポンスデータ
   */
  override  _fillLists(resultHeader: any, resultData: any) {
    super._fillLists(resultHeader, resultData)
    this.lists.originList.forEach(element => {
      _.set(element, 'edit_status', EditStatus.デフォルト)
      _.set(element, 'edit_status_name', '')
    })
    this.lists.visibleList.forEach(element => {
      _.set(element, 'edit_status', EditStatus.デフォルト)
      _.set(element, 'edit_status_name', '')
    })
    this.initialLists.originList = _.cloneDeep(this.lists.originList)
    this.initialLists.visibleList = _.cloneDeep(this.lists.visibleList)
    const ids = this.lists.originList.map(element => element[this.customizeUsageDefinitionIdKey])
    this.lists.hiddenList = this.lists.editList.filter((element: any) =>
      !ids.includes(element[this.customizeUsageDefinitionIdKey])
    )
    // 追加項目設定
    const addList = _.cloneDeep(this.lists.addList)
    if (this.lists.originList.length === this.lists.visibleList.length) {
      this.lists.originList.push(...addList)
      this.lists.visibleList.push(...addList)
    } else {
      this.lists.originList.push(...addList)
    }
    // 編集項目設定
    const editList = _.cloneDeep(this.lists.editList)
    editList.forEach(element => {
      const originListIndex = this.lists.originList.findIndex(target =>
        element[this.customizeUsageDefinitionIdKey] === target[this.customizeUsageDefinitionIdKey]
      )
      const visibleListIndex = this.lists.visibleList.findIndex(target =>
        element[this.customizeUsageDefinitionIdKey] === target[this.customizeUsageDefinitionIdKey]
      )
      if (originListIndex !== -1) {
        this.lists.originList.splice(originListIndex, 1, element)
      }
      if (visibleListIndex !== -1) {
        this.lists.visibleList.splice(visibleListIndex, 1, element)
      }
    })
  }

  /**
   * 初期化 API を呼ぶ
   */
  protected async _fetchDataForInitialize(): Promise<void> {
    this.activatedRoute.queryParams.subscribe(params => (console.log('queryParams', params)))
    this.activatedRoute.queryParams.subscribe(params => (this.carId = params.carId))
    this.activatedRoute.queryParams.subscribe(params => (this.model = params.model))
    this.activatedRoute.queryParams.subscribe(params => (this.typeRev = params.typeRev))
    this.activatedRoute.queryParams.subscribe(params => (this.serial = params.serial))

    const res: any = await this.csDetailService.fetchIndexInitData()
    this.initialize(res)
    this.labels = res.label
    this.resource = res.resource
    this._setTitle()
    this._updateFields(res.csDetailFields)
    this.csUpdateRequestConfirmThList = this._createThList(res.csUpdateRequestConfirmFields)
    this.csImmediateUpdateRequestConfirmThList = this._createThList(res.csImmediateUpdateRequestConfirmFields)
    this.csRequestResendConfirmThList = this._createThList(res.csRequestResendConfirmFields)
    this.csNewThList = this._createThList(res.csNewFields)
    this.csEditThList = this._createThList(res.csEditFields)
    this.csExpectedTrafficConfirmThList1 = this._createThList(res.csExpectedTrafficConfirmFields1)
    this.csExpectedTrafficConfirmThList2 = this._createThList(res.csExpectedTrafficConfirmFields2)
    this.resources = res
  }

  /**
   * 指定項目を更新
   * @param fields 指定項目
   */
  protected _updateFields(fields: Fields): void {
    this.fields = fields
    this.thList = this._createThList(fields)
    const xFields = this._createXFields(fields)
    this.sortableThList = this.sortableThLists(this.thList)
    this._setXFields(xFields)
    const opt: TableOptions = { scrollable: true }
    const thLists = this._createThList(fields, opt)
    this.fixedThList = thLists.fixed
    this.scrollableThList = thLists.scrollable
  }

  /**
   * ラベル表示の判定
   * @param data 対象データ
   * @return true:非表示/false:表示
   */
  checkBoxHiddenFunction(data: any): boolean {
    return data['edit_status'] === EditStatus.デフォルト
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
    return data[this.statusKey] === Status.送信失敗
      || data['edit_status'] !== EditStatus.デフォルト
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
    this.openCsImmediateUpdateRequestConfirmDialog()
  }

  /**
   * 編集内容破棄ボタン押下コールバック
   * @param data 対象データ
   */
  onClickDiscard(data: any) {
    this.openCsInputDataCancelConfirmDialog(data)
  }

  /**
   * 編集内容全破棄ボタン押下コールバック
   */
  onClickDiscardAll() {
    this.openCsInputDataCancelAllConfirmDialog()
  }

  /**
   * 再送ボタン押下コールバック
   * @param data 対象データ
   */
  onClickRetry(data: any) {
    this.openCsRequestResendConfirmDialog(data)
  }

  /**
   * 追加モーダル呼出し
   */
  openCsNewDialog() {
    this.modalService.open(
      {
        title: this.labels.addition_title,
        labels: this.labels,
        content: this.csNewModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          this.newChildComponent.closeNewDialog()
          // 一覧画面に表示するリスト設定
          const contents: CustomizeUsageDefinition[] =
            [
              {
                customize_usage_definition: this.newChildComponent.modalResponse
              }
            ]
          const list = this._formatList(
            contents,
            this.thList
          )
          Object.keys(list).forEach((i: any) => {
            if (!list[i].customize_usage_definitions) {
              list[i].customize_usage_definitions = {}
            }
            if (!list[i].customize_usage_definitions.customize_usage_definition) {
              list[i].customize_usage_definitions.customize_usage_definition = {}
            }
            list[i].customize_usage_definitions.customize_usage_definition.customize_definitions = contents[i].customize_usage_definition.customize_definitions
          })
          list.forEach((element: any) => {
            _.set(element, 'edit_status', EditStatus.追加)
            _.set(element, 'edit_status_name', this.labels.regist_body_label)
            this.lists.addList.push(element)
            this.pageParams.pageAdditionalCount = this.lists.addList.length
            if (this.lists.originList.length === this.lists.visibleList.length) {
              this.lists.originList.push(element)
              this.lists.visibleList.push(element)
            } else {
              this.lists.originList.push(element)
            }
            this.checkedItems[element[this.checkIdName]] = true
          })
          // チェックボックス設定
          this.check()
          console.log('newChildComponent', this.newChildComponent.modalResponse)
        },
      },
      {
        size: 'lg',
      }
    )
  }

  /**
   * 編集モーダル呼出し
   * @param data 対象データ
   */
  openCsEditDialog(data: any) {
    const content: CustomizeUsageDefinition = this.thList.reduce((acc, cur) => {
      const item = _.get(data, cur.name)
      _.set(acc, cur.formatKey, item)
      return acc
    }, {})
    content.customize_usage_definition.customize_definitions
      = _.get(data, 'customize_usage_definitions.customize_usage_definition.customize_definitions')

    this.inputParams.edit_customize_usage_definition_id = content.customize_usage_definition.customize_usage_definition_id
    this.inputParams.edit_customize_usage_definition_name = content.customize_usage_definition.customize_usage_definition_name
    this.inputParams.edit_customize_usage_definition_version = String(content.customize_usage_definition.customize_usage_definition_version)
    this.inputParams.edit_start_date = content.customize_usage_definition.start_date
    this.inputParams.edit_end_date = content.customize_usage_definition.end_date
    this.inputParams.edit_priority_name = content.customize_usage_definition.priority_name
    this.inputParams.edit_active_name = content.customize_usage_definition.customize_definitions[0].active_name
    console.log('inputParams', this.inputParams)
    this.modalService.open(
      {
        title: this.labels.edit_title,
        labels: this.labels,
        content: this.csEditModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          this.editChildComponent.closeEditDialog()
          // 一覧画面に表示するリスト設定
          const contents: CustomizeUsageDefinition[] =
            [
              {
                customize_usage_definition: this.editChildComponent.modalResponse
              }
            ]
          const list = this._formatList(
            contents,
            this.thList
          )
          Object.keys(list).forEach((i: any) => {
            if (!list[i].customize_usage_definitions) {
              list[i].customize_usage_definitions = {}
            }
            if (!list[i].customize_usage_definitions.customize_usage_definition) {
              list[i].customize_usage_definitions.customize_usage_definition = {}
            }
            list[i].customize_usage_definitions.customize_usage_definition.customize_definitions = contents[i].customize_usage_definition.customize_definitions
          })
          const originListIndex = this.lists.originList.findIndex(element => {
            return data[this.customizeUsageDefinitionIdKey]
              === element[this.customizeUsageDefinitionIdKey]
          })
          const visibleListIndex = this.lists.visibleList.findIndex(element => {
            return data[this.customizeUsageDefinitionIdKey]
              === element[this.customizeUsageDefinitionIdKey]
          })
          list.forEach((element: any, index: number) => {
            switch (this.editChildComponent.modalResponse.edit_mode) {
              case 'update':
                _.set(element, 'edit_status', EditStatus.変更)
                _.set(element, 'edit_status_name', this.labels.edit_body_label)
                break
              case 'delete':
                _.set(element, 'edit_status', EditStatus.削除)
                _.set(element, 'edit_status_name', this.labels.delete_body_label)
                break
              default:
                break
            }
            if (originListIndex !== -1) {
              this.lists.originList.splice(originListIndex + index, 1, element)
            }
            if (visibleListIndex !== -1) {
              this.lists.visibleList.splice(visibleListIndex + index, 1, element)
            }
            this.lists.editList.push(element)
            this.checkedItems[element[this.checkIdName]] = true
          })
          // チェックボックス設定
          this.check()
          console.log('editChildComponent', this.editChildComponent.modalResponse)
        },
      },
      {
        size: 'lg',
      }
    )
  }

  /**
   * 設定取得要求モーダル呼出し
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
          // TODO:
          const requestHeaderParams: RequestHeaderParams = {}
          const cars = [{ car_id: this.carId, }]
          const params: RequestBodyParamsKOM00110120 =
          {
            cars: cars,
            request_route_kind: '0'
          }
          console.log(`params（設定取得）`, params)
          this.csDetailService.postCarsRequestSetsCustomizeUsageDefinitionsM2s(params, requestHeaderParams)
            .then(res => {
              // 一覧画面に表示するリスト設定
              this.lists = _.cloneDeep(this.initialLists)
              this.pageParams.pageAdditionalCount = 0
              this.pageParams.pageNo = 1
              this.pageParams.dispPageNo = 1
              this._reflectPageParams()
              this.fetchList(this.sortingParams['sort'])
              // チェックボックス設定
              this.checkedItems = {}
              this.checkAll = false
              // メッセージ出力
              this.alertService.show(this.labels.finish_message, false, 'success')
              console.log(`res（設定取得）`, res)
            }).catch((error) => {
              this._setError(error)
            })
        },
      },
      {
        size: 'lg',
      }
    )
  }

  /**
   * 設定更新要求モーダル呼出し
   */
  openCsUpdateRequestConfirmDialog() {
    const keys: String[] = []
    Object.keys(this.checkedItems).forEach((key) => {
      if (this.checkedItems[key]) keys.push(key)
    });
    this.tableData = [...this.lists.addList, ...this.lists.editList].filter(
      (element: any) => {
        const id = element[this.customizeUsageDefinitionIdKey]
        return keys.includes(String(id))
      }
    )
    console.log('tableData', this.tableData)
    this.modalService.open(
      {
        title: this.labels.confirmation_title,
        labels: this.labels,
        content: this.csUpdateRequestConfirmModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          // TODO:
          const requestHeaderParams: RequestHeaderParams = {}
          const customizeUsageDefinitions
            = this.tableData.map(data => {
              return {
                customize_usage_definition_id: data['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
                version: data['customize_usage_definitions.customize_usage_definition.customize_usage_definition_version'],
                request_kind: '2',
                priority: data['customize_usage_definitions.customize_usage_definition.priority'],
                date_to: data['customize_usage_definitions.customize_usage_definition.end_date'],
                date_from: data['customize_usage_definitions.customize_usage_definition.start_date'],
                active_kind: data['customize_usage_definitions.customize_usage_definition.active_kind']
              }
            })
          const params: RequestBodyParamsKOM00110130 =
          {
            car_id: this.carId,
            request_route_kind: '0',
            instant_kind: '0',
            customize_usage_definition: customizeUsageDefinitions
          }
          console.log(`params（設定更新）`, params)
          this.csDetailService.postCarsRequestsCustomizeUsageDefinitionsS2m(params, requestHeaderParams)
            .then(res => {
              // 一覧画面に表示するリスト設定
              this.lists = _.cloneDeep(this.initialLists)
              this.pageParams.pageAdditionalCount = 0
              this.pageParams.pageNo = 1
              this.pageParams.dispPageNo = 1
              this._reflectPageParams()
              this.fetchList(this.sortingParams['sort'])
              // チェックボックス設定
              this.checkedItems = {}
              this.checkAll = false
              // メッセージ出力
              this.alertService.show(this.labels.finish_message, false, 'success')
              console.log(`res（設定更新）`, res)
            }).catch((error) => {
              this._setError(error)
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
    )
  }

  /**
   * 設定即時更新要求モーダル呼出し
   */
  openCsImmediateUpdateRequestConfirmDialog() {
    const keys: String[] = []
    Object.keys(this.checkedItems).forEach((key) => {
      if (this.checkedItems[key]) keys.push(key)
    });
    this.tableData = [...this.lists.addList, ...this.lists.editList].filter(
      (element: any) => {
        const id = element[this.customizeUsageDefinitionIdKey]
        return keys.includes(String(id))
      }
    )
    console.log(this.tableData)
    this.modalService.open(
      {
        title: this.labels.confirmation_title,
        labels: this.labels,
        content: this.csImmediateUpdateRequestConfirmModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          // TODO:
          const requestHeaderParams: RequestHeaderParams = {}
          const customizeUsageDefinitions
            = this.tableData.map(data => {
              return {
                customize_usage_definition_id: data['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
                version: data['customize_usage_definitions.customize_usage_definition.customize_usage_definition_version'],
                request_kind: '2',
                priority: data['customize_usage_definitions.customize_usage_definition.priority'],
                date_to: data['customize_usage_definitions.customize_usage_definition.end_date'],
                date_from: data['customize_usage_definitions.customize_usage_definition.start_date'],
                active_kind: data['customize_usage_definitions.customize_usage_definition.active_kind']
              }
            })
          const params: RequestBodyParamsKOM00110130 =
          {
            car_id: this.carId,
            request_route_kind: '0',
            instant_kind: '1',
            continuous_kind: this.csImmediateUpdateRequestConfirmComponent.isContinued,
            customize_usage_definition: customizeUsageDefinitions
          }
          console.log(`params（設定即時更新）`, params)
          this.csDetailService.postCarsRequestsCustomizeUsageDefinitionsS2m(params, requestHeaderParams)
            .then(res => {
              // 一覧画面に表示するリスト設定
              this.lists = _.cloneDeep(this.initialLists)
              this.pageParams.pageAdditionalCount = 0
              this.pageParams.pageNo = 1
              this.pageParams.dispPageNo = 1
              this._reflectPageParams()
              this.fetchList(this.sortingParams['sort'])
              // チェックボックス設定
              this.checkedItems = {}
              this.checkAll = false
              // メッセージ出力
              this.alertService.show(this.labels.finish_message, false, 'success')
              console.log(`res（設定即時更新）`, res)
            }).catch((error) => {
              this._setError(error)
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
    )
  }

  /**
   * 編集内容破棄モーダル呼出し
   * @param data 対象データ
   */
  openCsInputDataCancelConfirmDialog(data: any) {
    this.modalService.open(
      {
        title: this.labels.confirmation_title,
        labels: this.labels,
        content: this.csInputDataCancelConfirmModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          // 一覧画面に表示するリスト設定
          const originListIndex = this.lists.originList.findIndex(element => {
            return data[this.customizeUsageDefinitionIdKey]
              === element[this.customizeUsageDefinitionIdKey]
          })
          const initialOrigin = this.initialLists.originList.find(element => {
            return data[this.customizeUsageDefinitionIdKey]
              === element[this.customizeUsageDefinitionIdKey]
          })
          if (initialOrigin) {
            this.lists.originList.splice(originListIndex, 1, initialOrigin)
          } else {
            this.lists.originList.splice(originListIndex, 1)
          }
          const visibleListIndex = this.lists.visibleList.findIndex(element => {
            return data[this.customizeUsageDefinitionIdKey]
              === element[this.customizeUsageDefinitionIdKey]
          })
          const initialVisible = this.initialLists.visibleList.find(element => {
            return data[this.customizeUsageDefinitionIdKey]
              === element[this.customizeUsageDefinitionIdKey]
          })
          if (initialVisible) {
            this.lists.visibleList.splice(visibleListIndex, 1, initialVisible)
          } else {
            this.lists.visibleList.splice(visibleListIndex, 1)
          }
          this.lists.addList = this.lists.addList.filter(target => {
            return data[this.customizeUsageDefinitionIdKey] !== target[this.customizeUsageDefinitionIdKey]
          })
          this.lists.editList = this.lists.editList.filter(target => {
            return data[this.customizeUsageDefinitionIdKey] !== target[this.customizeUsageDefinitionIdKey]
          })
          // チェックボックス設定
          delete this.checkedItems[data[this.customizeUsageDefinitionIdKey]]
          this.check()
        },
      },
      {
        size: 'lg',
      }
    )
  }

  /**
   * 編集内容全破棄モーダル呼出し
   */
  openCsInputDataCancelAllConfirmDialog() {
    this.modalService.open(
      {
        title: this.labels.confirmation_title,
        labels: this.labels,
        content: this.csInputDataCancelConfirmModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
        ok: () => {
          // 一覧画面に表示するリスト設定
          this.lists = _.cloneDeep(this.initialLists)
          this.pageParams.pageAdditionalCount = 0
          // チェックボックス設定
          this.checkedItems = {}
          this.checkAll = false
        }
      },
      {
        size: 'lg',
      }
    )
  }

  /**
   * 再送モーダル呼出し
   * @param data 対象データ
   */
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
          // TODO:
          const requestHeaderParams: RequestHeaderParams = {}
          const customizeDefinitions
            = this.tableData.map(data => {
              return {
                customize_definition_id: data['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
              }
            })
          const params: RequestBodyParamsKOM00110XXX =
          {
            car_id: this.carId,
            customize_definition: customizeDefinitions
          }
          console.log(`params（再送）`, params)
          this.csDetailService.postCarsRequestsCustomizeSettingsRetryS2m(params, requestHeaderParams)
            .then((res) => {
              // 一覧画面に表示するリスト設定
              this.fetchList(this.sortingParams['sort'])
              // メッセージ出力
              this.alertService.show(this.labels.finish_message, false, 'success')
              console.log(`res（再送）`, res)
            }).catch((error) => {
              this._setError(error)
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
    )
  }

  // TODO:
  onClickExpectedTrafficConfirm() {
    const keys: String[] = []
    Object.keys(this.checkedItems).forEach((key) => {
      if (this.checkedItems[key]) keys.push(key)
    });
    this.tableData = [...this.lists.addList, ...this.lists.editList].filter(
      (element: any) => {
        const id = element[this.customizeUsageDefinitionIdKey]
        return keys.includes(String(id))
      }
    )
    console.log("tableData", this.tableData)
    _.set(this.labels, 'vehicleInfo', this.model + '-' + this.typeRev + '-' + this.serial)

    this.modalService.open(
      {
        title: this.labels.communication_charge_confirmation,
        labels: this.labels,
        content: this.csExpectedTrafficConfirmModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
      },
      {
        size: 'lg',
      }
    )
  }

  check() {
    const targetItems: any[] =
      [...this.lists.originList, ...this.lists.hiddenList].filter((element: any) =>
        !this.checkBoxHiddenFunction(element)
      )
    this.checkAll =
      targetItems.length > 0 &&
      targetItems.every((item: any) => this.checkedItems[_.get(item, this.checkIdName)])
  }
}
