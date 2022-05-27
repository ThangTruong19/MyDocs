import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild, Output, EventEmitter } from '@angular/core'
import { Title } from '@angular/platform-browser'
import { ActivatedRoute, Router } from '@angular/router'
import { UserSettingService } from 'app/services/api/user-setting.service'
import { CommonHeaderService } from 'app/services/shared/common-header.service'
import { DatePickerService } from 'app/services/shared/date-picker.service'
import { ModalService } from 'app/services/shared/modal.service'
import { NavigationService } from 'app/services/shared/navigation.service'
import { AlertService } from 'app/services/shared/alert.service'
import { CommonTableService } from 'app/services/shared/common-table.service'
import { CsDetailService } from 'app/services/customize_setting/cs-detail.service'
import { Fields, TableHeader, TableOptions } from 'app/types/common'
import * as _ from 'lodash'
import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component'
import { CsNewComponent } from 'app/components/customize_setting/new/cs-new.component'
import { CsEditComponent } from 'app/components/customize_setting/edit/cs-edit.component'
import { CsImmediateUpdateRequestConfirmComponent } from 'app/components/customize_setting/immediate-update-request-confirm/cs-immediate-update-request-confirm.component'
import { RequestHeaderParams } from 'app/types/request'
import {
  CustomizeUsageDefinition,
  RequestBodyParamsKOM00110120,
  RequestBodyParamsKOM00110130,
  RequestBodyParamsKOM00110XXX
} from 'app/types/cs-detail'

enum Status {
  送信中 = '10',
  送信済 = '20',
  車両反映中 = '30',
  送信失敗 = '40',
  削除済 = '90',
}

enum LatestOperationCode {
  追加 = '1',
  更新 = '2',
  削除 = '3',
  即時追加 = '11',
  即時更新 = '12',
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
    protected commonTableService: CommonTableService,
    protected csDetailService: CsDetailService) {
    super(nav, title, router, cdRef, header, modal)
    this.isCheckedItemsAllPageHold = true
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
    const data: CustomizeUsageDefinition[] = res.result_data.customize_usage_definitions
    data.forEach(element => {
      element.edit_status = EditStatus.デフォルト
      element.edit_status_name = ""
    })
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
    const height = 35 * rowSize
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
    this.initialLists.originList = _.cloneDeep(this.lists.originList)
    this.initialLists.visibleList = _.cloneDeep(this.lists.visibleList)
    const ids = this.lists.originList.map(element => {
      const content: CustomizeUsageDefinition = this.convert(element)
      return content.customize_usage_definition.customize_usage_definition_id
    })
    this.lists.hiddenList = this.lists.editList.filter((element: any) => {
      const content: CustomizeUsageDefinition = this.convert(element)
      return !ids.includes(content.customize_usage_definition.customize_usage_definition_id)
    }
    )
    // 編集項目設定
    const editList = _.cloneDeep(this.lists.editList)
    editList.forEach(element => {
      const content: CustomizeUsageDefinition = this.convert(element)
      const originListIndex = this.lists.originList.findIndex(element => {
        const target: CustomizeUsageDefinition = this.convert(element)
        return content.customize_usage_definition.customize_usage_definition_id
          === target.customize_usage_definition.customize_usage_definition_id
      }
      )
      const visibleListIndex = this.lists.visibleList.findIndex(element => {
        const target: CustomizeUsageDefinition = this.convert(element)
        return content.customize_usage_definition.customize_usage_definition_id
          === target.customize_usage_definition.customize_usage_definition_id
      })
      if (originListIndex !== -1) {
        this.lists.originList.splice(originListIndex, 1, element)
      }
      if (visibleListIndex !== -1) {
        this.lists.visibleList.splice(visibleListIndex, 1, element)
      }
    })
    // 追加項目設定
    const addList = _.cloneDeep(this.lists.addList)
    if (this.lists.originList.length === this.lists.visibleList.length) {
      this.lists.originList.push(...addList)
      this.lists.visibleList.push(...addList)
    } else {
      this.lists.originList.push(...addList)
    }
    // 削除項目設定
    this.lists.originList.forEach(element => {
      const content: CustomizeUsageDefinition = element.customize_usage_definitions
      const latestOperationCode =
        content.customize_usage_definition.customize_definitions[0].latest_operation_code
      if (latestOperationCode === LatestOperationCode.削除) {
        const targetRowData = element
        this.commonTableService.setDisabledRowStyle(targetRowData)
      }
    })
  }

  /**
   * 初期化 API を呼ぶ
   */
  protected async _fetchDataForInitialize(): Promise<void> {
    this.activatedRoute.queryParams.subscribe(params => (this.carId = params.carId))
    this.activatedRoute.queryParams.subscribe(params => (this.model = params.model))
    this.activatedRoute.queryParams.subscribe(params => (this.typeRev = params.typeRev))
    this.activatedRoute.queryParams.subscribe(params => (this.serial = params.serial))

    const res: any = await this.csDetailService.fetchIndexInitData()
    this.initialize(res)
    this.labels = res.label
    this.labels['vehicleInfo'] = this.model + '-' + this.typeRev + '-' + this.serial
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
    this.thList.push(
      {
        label: "",
        name: "customize_usage_definitions.edit_status",
        formatKey: "edit_status",
      }
    )
    this.thList.push(
      {
        label: "",
        name: "customize_usage_definitions.edit_status_name",
        formatKey: "edit_status_name",
      }
    )
    const xFields = this._createXFields(fields)
    this.sortableThList = this.sortableThLists(this.thList)
    this._setXFields(xFields)
    const opt: TableOptions = { scrollable: true }
    const thLists = this._createThList(fields, opt)
    this.fixedThList = thLists.fixed
    this.scrollableThList = thLists.scrollable
  }

  /**
   * チェックボックスのキーとなる値を取得する
   * @param data 対象データ
   * @return チェックボックスのキーとなる値
   */
  checkIdFunction(data: any): string {
    const customizeUsageDefinitionId = data['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id']
    const editStatus = data['customize_usage_definitions.edit_status']
    return customizeUsageDefinitionId + '-' + editStatus
  }

  /**
   * ラベル表示の判定
   * @param data 対象データ
   * @return true:非表示/false:表示
   */
  checkBoxHiddenFunction(data: any): boolean {
    const editStatus = data['customize_usage_definitions.edit_status']
    return editStatus === EditStatus.デフォルト
  }

  /**
   * ラベル表示の判定
   * @param data 対象データ
   * @return true:非表示/false:表示
   */
  checkBoxDefaultHiddenFunction(data: any): boolean {
    const editStatus = data['customize_usage_definitions.edit_status']
    return editStatus !== EditStatus.デフォルト
  }

  /**
   * ラベル表示の判定
   * @param data 対象データ
   * @return true:非表示/false:表示
   */
  public editIconHidden(data: any): boolean {
    const content: CustomizeUsageDefinition = this.convert(data)
    const editStatus = content.edit_status
    const latestOperationCode = content.customize_usage_definition.customize_definitions[0].latest_operation_code
    return editStatus === EditStatus.追加
      || latestOperationCode === LatestOperationCode.削除
  }

  /**
   * ラベル表示の判定
   * @param data 対象データ
   * @return true:非表示/false:表示
   */
  public discardIconHidden(data: any): boolean {
    const content: CustomizeUsageDefinition = this.convert(data)
    const editStatus = content.edit_status
    const latestOperationCode = content.customize_usage_definition.customize_definitions[0].latest_operation_code
    return editStatus === EditStatus.デフォルト
      || latestOperationCode === LatestOperationCode.削除
  }

  /**
   * ラベル表示の判定
   * @param data 対象データ
   * @return true:非表示/false:表示
   */
  public retryIconHidden(data: any): boolean {
    const content: CustomizeUsageDefinition = this.convert(data)
    const editStatus = content.edit_status
    const status = content.customize_usage_definition.customize_definitions[0].status
    const latestOperationCode = content.customize_usage_definition.customize_definitions[0].latest_operation_code
    return status === Status.送信失敗
      || editStatus !== EditStatus.デフォルト
      || latestOperationCode === LatestOperationCode.削除
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
          // 一覧画面データ取得
          const contents: CustomizeUsageDefinition[] =
            [{ customize_usage_definition: this.newChildComponent.modalResponse }]
          contents.forEach(element => {
            element.edit_status = EditStatus.追加
            element.edit_status_name = this.labels.regist_body_label
            // チェックボックス設定
            const customizeUsageDefinitionId = element.customize_usage_definition.customize_usage_definition_id
            const checkIdName = customizeUsageDefinitionId + '-' + EditStatus.追加
            this.checkedItems[checkIdName] = true
          })
          // リスト作成
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
          const key: string = this.newChildComponent.modalResponse.customize_usage_definition_id
          const addListIndex = this.lists.addList.findIndex((element: any) => {
            const content: CustomizeUsageDefinition = this.convert(element)
            const id = content.customize_usage_definition.customize_usage_definition_id
            return key === String(id) && content.edit_status === EditStatus.追加
          })
          list.forEach((element: any) => {
            if (addListIndex !== -1) {
              // 更新
              list.forEach((element: any, index: number) => {
                this.lists.addList.splice(addListIndex + index, 1, element)
                this.pageParams.pageAdditionalCount = this.lists.addList.length
                const originListIndex = this.lists.originList.findIndex((element: any) => {
                  const content: CustomizeUsageDefinition = this.convert(element)
                  const id = content.customize_usage_definition.customize_usage_definition_id
                  return key === String(id) && content.edit_status === EditStatus.追加
                })
                const visibleListIndex = this.lists.visibleList.findIndex((element: any) => {
                  const content: CustomizeUsageDefinition = this.convert(element)
                  const id = content.customize_usage_definition.customize_usage_definition_id
                  return key === String(id) && content.edit_status === EditStatus.追加
                })
                if (originListIndex !== -1) {
                  this.lists.originList.splice(originListIndex + index, 1, element)
                }
                if (visibleListIndex !== -1) {
                  this.lists.visibleList.splice(visibleListIndex + index, 1, element)
                }
              })
            } else {
              // 新規追加
              this.lists.addList.push(element)
              this.pageParams.pageAdditionalCount = this.lists.addList.length
              if (this.lists.originList.length === this.lists.visibleList.length) {
                this.lists.originList.push(element)
                this.lists.visibleList.push(element)
              } else {
                this.lists.originList.push(element)
              }
            }
          })
          // チェックボックス設定
          this.check()
          // ボタン表示設定
          this.disabled = !Object.values(this.checkedItems).some(item => item)
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
    const content: CustomizeUsageDefinition = this.convert(data)
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
          // 一覧画面データ取得
          const contents: CustomizeUsageDefinition[] =
            [
              { customize_usage_definition: this.editChildComponent.modalResponse }
            ]
          contents.forEach((element: CustomizeUsageDefinition) => {
            element.customize_usage_definition.use_kind = content.customize_usage_definition.use_kind
            element.customize_usage_definition.use_name = content.customize_usage_definition.use_name
            element.customize_usage_definition.customize_definitions.forEach((data, index) => {
              const customizeDefinition = content.customize_usage_definition.customize_definitions[index]
              data.status = customizeDefinition.status
              data.status_name = customizeDefinition.status_name
              data.latest_operation_code = customizeDefinition.latest_operation_code
              data.latest_operation_code_name = customizeDefinition.latest_operation_code_name
              data.first_receive_datetime = customizeDefinition.first_receive_datetime
              data.latest_receive_datetime = customizeDefinition.latest_receive_datetime
            })
            let checkIdName = ''
            const customizeUsageDefinitionId =
              element.customize_usage_definition.customize_usage_definition_id
            switch (this.editChildComponent.modalResponse.edit_mode) {
              case 'update':
                element.edit_status = EditStatus.変更
                element.edit_status_name = this.labels.edit_body_label
                // チェックボックス設定
                checkIdName = customizeUsageDefinitionId + '-' + EditStatus.変更
                this.checkedItems[checkIdName] = true
                break
              case 'delete':
                element.edit_status = EditStatus.削除
                element.edit_status_name = this.labels.delete_body_label
                // チェックボックス設定
                checkIdName = customizeUsageDefinitionId + '-' + EditStatus.削除
                this.checkedItems[checkIdName] = true
                break
              default:
                break
            }
          })
          // リスト作成
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
            const target: CustomizeUsageDefinition = this.convert(element)
            return content.customize_usage_definition.customize_usage_definition_id
              === target.customize_usage_definition.customize_usage_definition_id
          })
          const visibleListIndex = this.lists.visibleList.findIndex(element => {
            const target: CustomizeUsageDefinition = this.convert(element)
            return content.customize_usage_definition.customize_usage_definition_id
              === target.customize_usage_definition.customize_usage_definition_id
          })
          list.forEach((element: any, index: number) => {
            if (originListIndex !== -1) {
              this.lists.originList.splice(originListIndex + index, 1, element)
            }
            if (visibleListIndex !== -1) {
              this.lists.visibleList.splice(visibleListIndex + index, 1, element)
            }
            this.lists.editList.push(element)
          })
          // チェックボックス設定
          this.check()
          // ボタン表示設定
          this.disabled = !Object.values(this.checkedItems).some(item => item)
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
              // リスト設定
              this.lists = _.cloneDeep(this.initialLists)
              this.pageParams.pageAdditionalCount = 0
              this.pageParams.pageNo = 1
              this.pageParams.dispPageNo = 1
              this._reflectPageParams()
              this.fetchList(this.sortingParams['sort'])
              // チェックボックス設定
              this.checkedItems = {}
              this.checkAll = false
              // ボタン表示設定
              this.disabled = !Object.values(this.checkedItems).some(item => item)
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
    })
    this.tableData = [...this.lists.addList, ...this.lists.editList].filter((element: any) => {
      const content: CustomizeUsageDefinition = this.convert(element)
      const customizeUsageDefinitionId = content.customize_usage_definition.customize_usage_definition_id
      const editStatus = content.edit_status
      const id = customizeUsageDefinitionId + '-' + editStatus
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
          const requestHeaderParams: RequestHeaderParams = {}
          const customizeUsageDefinitions
            = this.tableData.map(data => {
              const content: CustomizeUsageDefinition = this.convert(data)
              return {
                customize_usage_definition_id: content.customize_usage_definition.customize_usage_definition_id,
                version: String(content.customize_usage_definition.customize_usage_definition_version),
                request_kind: '2',
                date_to: content.customize_usage_definition.end_date,
                date_from: content.customize_usage_definition.start_date,
                priority: content.customize_usage_definition.customize_definitions[0].priority,
                active_kind: content.customize_usage_definition.customize_definitions[0].active_kind
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
              // リスト設定
              this.lists = _.cloneDeep(this.initialLists)
              this.pageParams.pageAdditionalCount = 0
              this.pageParams.pageNo = 1
              this.pageParams.dispPageNo = 1
              this._reflectPageParams()
              this.fetchList(this.sortingParams['sort'])
              // チェックボックス設定
              this.checkedItems = {}
              this.checkAll = false
              // ボタン表示設定
              this.disabled = !Object.values(this.checkedItems).some(item => item)
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
    })
    this.tableData = [...this.lists.addList, ...this.lists.editList].filter(
      (element: any) => {
        const content: CustomizeUsageDefinition = this.convert(element)
        const customizeUsageDefinitionId = content.customize_usage_definition.customize_usage_definition_id
        const editStatus = content.edit_status
        const id = customizeUsageDefinitionId + '-' + editStatus
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
        enableOk: false,
        ok: () => {
          const requestHeaderParams: RequestHeaderParams = {}
          const customizeUsageDefinitions
            = this.tableData.map(data => {
              const content: CustomizeUsageDefinition = this.convert(data)
              return {
                customize_usage_definition_id: content.customize_usage_definition.customize_usage_definition_id,
                version: String(content.customize_usage_definition.customize_usage_definition_version),
                request_kind: '2',
                date_to: content.customize_usage_definition.end_date,
                date_from: content.customize_usage_definition.start_date,
                priority: content.customize_usage_definition.customize_definitions[0].priority,
                active_kind: content.customize_usage_definition.customize_definitions[0].active_kind
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
              // リスト設定
              this.lists = _.cloneDeep(this.initialLists)
              this.pageParams.pageAdditionalCount = 0
              this.pageParams.pageNo = 1
              this.pageParams.dispPageNo = 1
              this._reflectPageParams()
              this.fetchList(this.sortingParams['sort'])
              // チェックボックス設定
              this.checkedItems = {}
              this.checkAll = false
              // ボタン表示設定
              this.disabled = !Object.values(this.checkedItems).some(item => item)
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
          // 一覧画面データ取得
          const content: CustomizeUsageDefinition = this.convert(data)
          // リスト設定
          const originListIndex = this.lists.originList.findIndex(element => {
            const target: CustomizeUsageDefinition = this.convert(element)
            return content.customize_usage_definition.customize_usage_definition_id
              === target.customize_usage_definition.customize_usage_definition_id
              && (content.edit_status === EditStatus.変更
                || content.edit_status === EditStatus.削除)
          })
          const initialOrigin = this.initialLists.originList.find(element => {
            const target: CustomizeUsageDefinition = this.convert(element)
            return content.customize_usage_definition.customize_usage_definition_id
              === target.customize_usage_definition.customize_usage_definition_id
              && (content.edit_status === EditStatus.変更
                || content.edit_status === EditStatus.削除)
          })
          if (initialOrigin) {
            this.lists.originList.splice(originListIndex, 1, initialOrigin)
          } else {
            this.lists.originList.splice(originListIndex, 1)
          }
          const visibleListIndex = this.lists.visibleList.findIndex(element => {
            const target: CustomizeUsageDefinition = this.convert(element)
            return content.customize_usage_definition.customize_usage_definition_id
              === target.customize_usage_definition.customize_usage_definition_id
              && (content.edit_status === EditStatus.変更
                || content.edit_status === EditStatus.削除)
          })
          const initialVisible = this.initialLists.visibleList.find(element => {
            const target: CustomizeUsageDefinition = this.convert(element)
            return content.customize_usage_definition.customize_usage_definition_id
              === target.customize_usage_definition.customize_usage_definition_id
              && (content.edit_status === EditStatus.変更
                || content.edit_status === EditStatus.削除)
          })
          if (initialVisible) {
            this.lists.visibleList.splice(visibleListIndex, 1, initialVisible)
          } else {
            this.lists.visibleList.splice(visibleListIndex, 1)
          }
          this.lists.addList = this.lists.addList.filter(element => {
            const target: CustomizeUsageDefinition = this.convert(element)
            return content.customize_usage_definition.customize_usage_definition_id
              !== target.customize_usage_definition.customize_usage_definition_id
              && content.edit_status
              === EditStatus.追加
          })
          this.lists.editList = this.lists.editList.filter(element => {
            const target: CustomizeUsageDefinition = this.convert(element)
            return content.customize_usage_definition.customize_usage_definition_id
              !== target.customize_usage_definition.customize_usage_definition_id
              && (content.edit_status === EditStatus.変更
                || content.edit_status === EditStatus.削除)
          })
          // チェックボックス設定
          const customizeUsageDefinitionId = content.customize_usage_definition.customize_usage_definition_id
          const editStatus = content.edit_status
          const checkIdName = customizeUsageDefinitionId + '-' + editStatus
          delete this.checkedItems[checkIdName]
          this.check()
          // ボタン表示設定
          this.disabled = !Object.values(this.checkedItems).some(item => item)
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
          // リスト設定
          this.lists = _.cloneDeep(this.initialLists)
          this.pageParams.pageAdditionalCount = 0
          // チェックボックス設定
          this.checkedItems = {}
          this.checkAll = false
          // ボタン表示設定
          this.disabled = !Object.values(this.checkedItems).some(item => item)
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
          const requestHeaderParams: RequestHeaderParams = {}
          const customizeDefinitions
            = this.tableData.map(data => {
              const content: CustomizeUsageDefinition = this.convert(data)
              return {
                customize_definition_id: content.customize_usage_definition.customize_usage_definition_id,
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
              // リスト設定
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

  /**
   * 通信量確認モーダル呼出し
   */
  onClickExpectedTrafficConfirm() {
    const keys: String[] = []
    Object.keys(this.checkedItems).forEach((key) => {
      if (this.checkedItems[key]) keys.push(key)
    })
    const list = _.cloneDeep([...this.lists.addList, ...this.lists.editList])
    this.tableData = list.reduce((acc, cur) => {
      const content: CustomizeUsageDefinition = this.convert(cur)
      const customizeUsageDefinitionId = content.customize_usage_definition.customize_usage_definition_id
      const editStatus = content.edit_status
      const id = customizeUsageDefinitionId + '-' + editStatus
      if (keys.includes(String(id))) {
        acc.push(content)
      }
      return acc
    }, [])
    console.log("tableData", this.tableData)
    this.modalService.open(
      {
        title: this.labels.communication_charge_confirmation,
        labels: this.labels,
        content: this.csExpectedTrafficConfirmModalContent,
        closeBtnLabel: this.labels.cancel,
        okBtnLabel: this.labels.ok_btn,
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
   * 対象データ変換
   * @param data 対象データ
   */
  convert(data: any) {
    const content: CustomizeUsageDefinition = this.thList.reduce((acc, cur) => {
      const item = _.get(data, cur.name)
      _.set(acc, cur.formatKey, item)
      return acc
    }, {})
    content.customize_usage_definition.customize_definitions
      = _.get(data, 'customize_usage_definitions.customize_usage_definition.customize_definitions')
    return content
  }

  /**
   * チェックボックス押下時の処理
   */
  onChangeSelect() {
    this.check()
    this.disabled = !Object.values(this.checkedItems).some(item => item)
  }

  /**
   * チェックボックス押下時の処理
   */
  onChangeSelectAll() {
    this.check()
    this.disabled = !Object.values(this.checkedItems).some(item => item)
  }

  /**
   * チェックボックスの更新処理
   */
  check() {
    const targetItems: any[] =
      [...this.lists.originList, ...this.lists.hiddenList].filter((element: any) =>
        !this.checkBoxHiddenFunction(element)
      )
    this.checkAll =
      targetItems.length > 0 &&
      targetItems.every((item: any) => {
        const content: CustomizeUsageDefinition = this.convert(item)
        const customizeUsageDefinitionId = content.customize_usage_definition.customize_usage_definition_id
        const editStatus = content.edit_status
        const checkIdName = customizeUsageDefinitionId + '-' + editStatus
        return this.checkedItems[checkIdName]
      })
  }
}
