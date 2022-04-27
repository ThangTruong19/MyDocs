import {
  Component,
  ChangeDetectorRef,
  ViewChild,
  ViewChildren,
  QueryList,
  TemplateRef,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { TableHeader, Fields, Field } from '../../../types/common';
import {
  ServiceContractIndexParams,
  ServiceContractEditParams,
  CarIdSearchParams,
} from '../../../types/opa/service-contract';

import { CustomSelectItem } from '../../../constants/form';
import { FunctionCode } from '../../../constants/opa/function-codes/service-contract-management';
import { ProcessingType } from '../../../constants/download';
import { KbaMimeType } from '../../../constants/mime-types';
import { FilterReservedWord } from '../../../constants/condition';

import { KbaAbstractIndexComponent } from '../../shared/kba-abstract-component/kba-abstract-index-component';
import { KbaTableComponent } from '../../shared/kba-table/kba-table.component';
import { KbaSelectedComponent } from '../../shared/kba-selected/kba-selected.component';
import { KbaPaginationComponent } from '../../shared/kba-pagination/kba-pagination.component';

import { KbaNavigationService } from '../../../services/shared/kba-navigation.service';
import { CommonHeaderService } from '../../../services/shared/common-header.service';
import { KbaModalService } from '../../../services/shared/kba-modal.service';
import { KbaAlertService } from '../../../services/shared/kba-alert.service';
import { ServiceContractService } from '../../../services/opa/service-contract/service-contract.service';
import { ApiService } from '../../../services/api/api.service';
import { Apis } from '../../../constants/apis';

@Component({
  selector: 'app-service-contract',
  templateUrl: './service-contract.component.html',
  styleUrls: ['./service-contract.component.scss'],
})
export class ServiceContractComponent extends KbaAbstractIndexComponent {
  @ViewChild(KbaTableComponent, { static: false })
  table: KbaTableComponent;
  @ViewChild(KbaPaginationComponent, { static: false })
  pagination: KbaPaginationComponent;
  @ViewChild('allEditSelect', { static: false })
  allEditSelect: KbaSelectedComponent;
  @ViewChild('confirmResultModalContent', { static: false })
  confirmResultModalContent: TemplateRef<any>;
  @ViewChild('supportDBBelongingSelect', { static: false })
  supportDBBelongingSelect: KbaSelectedComponent;
  @ViewChildren('serviceDBSelect')
  serviceDBSelections: QueryList<KbaSelectedComponent>;
  @ViewChildren('blockBelongingSelect')
  blockBelongingSelects: QueryList<KbaSelectedComponent>;

  pollingInterval;
  uploadPath = Apis.postCarsServiceContractUpload;
  params: ServiceContractIndexParams;
  _params: ServiceContractIndexParams = {
    common: {
      support_distributor: {},
      service_distributor: {},
      customer: {},
      car_identification: {},
    },
  };
  initParams: ServiceContractIndexParams;
  checkAll = false;
  fieldSelectPopoverVisible = false;
  fields: Fields;
  editFields: Fields;
  downloadFields: Fields;
  confirmFields: Fields;
  fixedThList;
  scrollableThList;
  templateName: 'index' | 'edit';
  editThList;
  editList;
  editParams: ServiceContractEditParams;
  originalEditParams;
  modalHeader;
  modalItems;
  confirmModalHeader: TableHeader[];
  resultModalHeader: TableHeader[];
  originalList: any[];
  fixedColumns;
  isEditReady: boolean;
  wideColumns;
  checkedItems: { [key: string]: boolean } = {};
  finishedInitialSearch = false;

  uploadJSON = JSON.stringify({
    file_upload_condition: {
      processing_type: ProcessingType.sync,
    },
  });
  uploadResultModalHeader;
  modalIdentifier: 'name' | 'dataKey';
  handleScroll: () => void;

  get isEditValid() {
    return (
      this.editParams &&
      this.originalEditParams &&
      this.editParams.cars.every(
        (car, i) => !this.isServiceDistributorInvalid(i)
      )
    );
  }

  get editLists() {
    return {
      originList: this.editList,
      visibleList: this.editList,
    };
  }

  get selectedList() {
    return _.map(this.checkedItems, (value, key) =>
      value ? key : null
    ).filter(Boolean);
  }

  constructor(
    nav: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modal: KbaModalService,
    private serviceContractService: ServiceContractService,
    private alertService: KbaAlertService,
    private api: ApiService
  ) {
    super(nav, title, router, ref, header, modal);
    this.handleScroll = _.throttle(() => {
      this.kbaSelectBoxes.forEach(kbaSelect => kbaSelect.select.close());
    }, 200);
  }

  /**
   * リスト表示処理
   * @param sort_key ソートキー
   * @override
   */
  async fetchList(sort_key?: string): Promise<void> {
    this._reflectXFields(this.fields);
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';

    const res: any = await this.serviceContractService.fetchIndexList(
      this.params,
      this.requestHeaderParams
    );

    this.originalList = res.result_data.cars;
    this._fillLists(
      res.result_header,
      res.result_data.cars.map(car => this.flattenObj(car))
    );
    this.isFetching = false;
    this._afterFetchList();
  }

  /**
   * 検索ボタン押下時の処理
   */
  onClickSearch() {
    this._updateParams();
    super.onClickSearch();
    this.fetchList(this.sortingParams['sort']);
    this.checkedItems = {};
  }

  /**
   * アップロード終了時の処理
   * @param res レスポンス
   */
  onUploadEnd(res) {
    this._hideLoadingSpinner();
    this._openResultModal(res, this.uploadResultModalHeader, 'name');
  }

  /**
   * アップロード失敗時の処理
   * @param error エラー
   */
  onUploadFail(error) {
    this._hideLoadingSpinner();
  }

  /**
   * 表示項目設定ボタン押下時の処理
   */
  onClickFieldSelect() {
    this.fieldSelectPopoverVisible = !this.fieldSelectPopoverVisible;
  }

  /**
   * テンプレートDLボタン押下時の処理
   */
  async onClickDownloadTemplate() {
    this._showLoadingSpinner();
    this._reflectXFields(this.downloadFields);

    try {
      const res: any = await this.serviceContractService.createFile(
        _.merge({}, this.params, {
          file_create_condition: {
            processing_type: ProcessingType.sync,
            file_content_type: KbaMimeType.excel,
          },
        }),
        _.merge({}, this.requestHeaderParams)
      );

      await this.api.downloadFile(res.result_data.file_id, KbaMimeType.excel);
    } finally {
      this._hideLoadingSpinner();
    }
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
   * サービスDB変更ボタン押下時の処理
   */
  async onClickServiceDBEdit() {
    this._reflectXFields(this.editFields);
    this.isFetching = true;

    const res: any = await this.serviceContractService.fetchIndexList(
      this._carIdsParams(this.selectedList),
      _.omit(this.requestHeaderParams, ['X-Count', 'X-From'])
    );

    this.editList = res.result_data.cars;
    this.editParams = this._createServiceDBSelectParams(this.editList);
    this.originalEditParams = _.cloneDeep(this.editParams);
    this.templateName = 'edit';
    this.isEditReady = false;
    this.safeDetectChanges();
    setTimeout(() => (this.isEditReady = true));
  }

  /**
   * サービスID一括設定選択時の処理
   * @param id 選択項目のID
   */
  onSelectServiceIDAllEdit(id) {
    if (!this.isEditReady || id === CustomSelectItem.empty.id) {
      return;
    }

    this.editParams.cars.forEach(car => (car.service_distributor_id = id));
    this.serviceDBSelections.forEach(select => select.refresh());
  }

  /**
   * 戻るボタン押下時の処理
   */
  onClickBack() {
    this.checkedItems = {};
    this.checkAll = false;
    this.templateName = 'index';
    this.allEditSelect.reset();
    this.safeDetectChanges();
    this.pagination.initOptions();
    this.pagination.onChangePageNo();
    setTimeout(() => this.fetchList(this.sortingParams.sort));
  }

  /**
   * 変更ボタン押下時の処理
   */
  onClickSubmit() {
    this._openConfirmModal().then(res =>
      this._openResultModal(
        res,
        this.resultModalHeader,
        'dataKey',
        this.modalItems
      )
    );
  }

  /**
   * サービスDB（英語）のラベルを変更する
   * @param data 対象データ
   * @param id サービスDB ID
   */
  refreshEnglishLabel(data, id) {
    data.service_distributor.label_english = this._getResourceValueName(
      'cars.service_distributor_id_english',
      id
    );
  }

  /**
   * ブロック変更時の処理
   * @param blockId ブロックID
   */
  async onBlockIdChange(blockId: string) {
    const res: any = await this.serviceContractService.fetchBlockBelongingResource(
      blockId
    );
    const paths = [
      'common.support_distributor.ids',
      'common.service_distributor.ids',
    ];

    paths.forEach(path => _.set(this.resource, path, _.get(res, path)));

    if (this.finishedInitialSearch) {
      this.blockBelongingSelects.forEach(select => select.refresh());
    }
  }

  /**
   * 担当DB変更時の処理
   * @param supportDBId 担当DBID
   */
  async onSupportDistributorChange(supportDBId: string) {
    const res: any = await this.serviceContractService.fetchSupportDistributorBelongingResource(
      supportDBId
    );
    const path = 'common.customer.ids';

    _.set(this.resource, path, _.get(res, path));
    if (this.supportDBBelongingSelect) {
      await this.supportDBBelongingSelect.refresh();
    }
  }

  /**
   * サービスDBの選択状態が無効の判定
   */
  isServiceDistributorInvalid(i) {
    return (
      (!this.originalEditParams.cars[i].service_distributor_id &&
        this.editParams.cars[i].service_distributor_id ===
        FilterReservedWord.isNull) ||
      this.editParams.cars[i].service_distributor_id ===
      this.originalEditParams.cars[i].service_distributor_id
    );
  }

  protected async _fetchDataForInitialize(): Promise<void> {
    const res: any = await this.serviceContractService.fetchIndexInitData();
    this.initialize(res);
    this.resource = res.resource;
    this.fieldResources = res.fieldResources;
    this.labels = res.label;
    this.editFields = res.editFields;
    this.downloadFields = res.downloadFields;
    this.confirmFields = res.editConfirmFields;
    this.editThList = this._createThList(res.editFields);
    this._setTitle();
    this._updateFields(res.fields);
    this.templateName = 'index';
    this._updateParams();
    this.initParams = _.cloneDeep(this._params);
    this.confirmModalHeader = this._createThList(res.editConfirmFields);
    this.resultModalHeader = this._createResultModalHeader(
      this._createThList(res.editConfirmFields)
    );
    this.uploadResultModalHeader = this._createUploadModalheader();
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
   * 初期検索前の処理
   * 依存するリソースを更新する
   */
  protected async _beforeInitFetchList() {
    const fn1 = async () => {
      if (this.exists('block_id')) {
        await this.onBlockIdChange(
          _.get(this.resource, 'block_id.values[0].value')
        );
        const paths = [
          'common.support_distributor.ids',
          'common.service_distributor.ids',
        ];
        paths.forEach(path =>
          _.set(this.params, path, [
            _.get(this.resource, path + '.values[0].value'),
          ])
        );
      }
    };

    const fn2 = async () => {
      if (this.exists('common.support_distributor')) {
        await this.onSupportDistributorChange(
          _.get(this.resource, 'common.support_distributor.ids.values[0].value')
        );
        const _path = 'common.customer.ids';
        _.set(this.params, _path, [
          _.get(this.resource, _path + '.values[0].value'),
        ]);
      }
    };

    for (const func of [fn1, fn2]) {
      await func();
      this.finishedInitialSearch = true;
    }
  }

  /**
   * 車両一覧取得パラメータの作成
   * @param carIds 車両ID
   */
  private _carIdsParams(carIds: string[]): CarIdSearchParams {
    return { common: { car_identification: { car_ids: carIds } } };
  }

  /**
   * 確認モーダルを開く
   */
  private _openConfirmModal() {
    return new Promise(async resolve => {
      this._reflectXFields(this.confirmFields);
      const list = (await this.serviceContractService.fetchIndexList(
        this._carIdsParams(this.selectedList),
        _.omit(this.requestHeaderParams, ['X-Count', 'X-From'])
      )).result_data.cars;
      const selections = this.serviceDBSelections.toArray();
      list.forEach((item, i) => {
        item.service_distributor.id = this.editParams.cars[i].service_distributor_id;
        item.service_distributor.label =
          this._getResourceValueName('cars.service_distributor_id', item.service_distributor.id);
      });
      this.modalHeader = this.confirmModalHeader;
      this.modalItems = list.map(item => this.flattenObj(item));
      this.fixedColumns = this.wideColumns = [];
      this.modalIdentifier = 'dataKey';
      this.modalService.open(
        {
          title: this.labels.submit_modal_title,
          labels: this.labels,
          content: this.confirmResultModalContent,
          closeBtnLabel: this.labels.cancel,
          ok: () => {
            const editParams = this._createServiceDBSelectParams(list);
            this.serviceContractService
              .updateServiceDB(editParams)
              .then((res: any) => resolve(res));
          },
        },
        {
          size: 'lg',
        }
      );
    });
  }

  /**
   * 更新結果モーダルを開く
   * @param _res レスポンス
   * @param items 項目リスト
   */
  private _openResultModal(
    _res,
    modalHeader,
    identifier: 'name' | 'dataKey',
    items = []
  ) {
    let result, row;

    this.modalHeader = modalHeader;
    this.modalItems = _res.responses.map((res, i) => {
      result = {
        type: 'result',
        success: res.result_data != null,
      };

      row =
        (res.request && this.flattenObj(res.request)) ||
        (res.result_data && this.flattenObj(res.result_data.car)) ||
        items[i] ||
        null;

      if (res.error_data) {
        row.error_message = this._createErrorMessages(res.error_data);
      }

      row.result = result;
      row.css_class = result.success ? '' : 'warning';

      return row;
    });

    this.wideColumns = ['error_message'];
    this.modalIdentifier = identifier;
    this.resultCountMessage = this.modalService.createResultCountMessage(
      this.labels,
      _res.responses
    );

    this.modalService.open(
      {
        title: this.labels.result_modal_title,
        labels: this.labels,
        content: this.confirmResultModalContent,
        close: () => {
          this.resultCountMessage = null;
          if (this.templateName === 'edit') {
            this._params = _.cloneDeep(this.initParams);
            this._updateParams();
            this.onClickBack();
          } else {
            this.onClickSearch();
          }
        },
      },
      {
        size: 'lg',
      }
    );
  }

  /**
   * サービスDB選択用のパラメータを作成
   * @param list 項目一覧
   */
  private _createServiceDBSelectParams(list) {
    return {
      cars: list.map(item => ({
        id: item.car_identification.id,
        service_distributor_id:
          item.service_distributor.id !== FilterReservedWord.isNull
            ? item.service_distributor.id
            : null,
        update_datetime: item.car_identification.update_datetime,
      })),
    };
  }

  /**
   * 指定項目取得 API の結果を反映
   * @param fields 指定項目
   */
  private _updateFields(fields) {
    this.fields = fields;
    this.thList = this._createThList(fields);
    const lists = this._createThList(fields, { scrollable: true });
    this.fixedThList = lists.fixed;
    this.scrollableThList = lists.scrollable;
    this.sortableThList = this.sortableThLists(this.thList);

    if (this.table) {
      this.safeDetectChanges();
    }
  }

  /**
   * 検索用のパラメータを整形する
   * @param params パラメータ
   * @param temp 一時的に使用
   */
  private _processParams(params, temp = {}) {
    return _.reduce(
      params,
      (result, value, key: string) => {
        if (_.isObject(value)) {
          result[key] = value;
          this._processParams(value, result[key]);
        }

        if (key.endsWith('s')) {
          result[key] = [value];
        } else {
          result[key] = value;
        }

        return result;
      },
      temp
    );
  }

  /**
   * パラメータを更新
   */
  private _updateParams() {
    this.params = this._processParams(_.cloneDeep(this._params));
  }

  /**
   * 結果モーダルのヘッダを作成
   * @param thList ヘッダ
   */
  private _createResultModalHeader(thList) {
    const resultHeader: TableHeader = {
      name: 'result',
      label: this.labels.result,
      sortKey: '',
      sortable: false,
      displayable: true,
      dataKey: 'result',
    };
    const errorMessageHeader: TableHeader = {
      name: 'error_message',
      label: this.labels.error_message,
      sortKey: '',
      sortable: false,
      displayable: true,
      dataKey: 'error_message',
    };

    return [resultHeader].concat(thList).concat([errorMessageHeader]);
  }

  /**
   * アップロード結果モーダルのヘッダを生成する
   */
  private _createUploadModalheader() {
    const wordBreakMark = /##/g;

    return this._createResultModalHeader(
      [
        'car.car_identification.model',
        'car.car_identification.type_rev',
        'car.car_identification.serial',
        'car.service_distributor.label',
      ].map(name => ({
        name,
        label: this.labels[name].replace(wordBreakMark, '\n'),
        displayable: true,
      }))
    );
  }
}
