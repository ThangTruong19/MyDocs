import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';

import {
  FlagConditionIndexParams,
  FlagConditionDeleteParams,
} from '../../../../types/opa/flag-condition';
import { Api } from '../../../../types/common';

import { FlagConditionKinds } from '../../../../constants/opa/flag-condition-kinds';
import { FlagCodes } from '../../../../constants/opa/flag-codes';
import { FunctionCode } from '../../../../constants/opa/function-codes/flag-condition-management';
import { ProcessingType } from '../../../../constants/download';
import { DisplayCode } from '../../../../constants/display-code';

import { Mixin } from '../../../../decorators/mixin-decorator';

import { KbaAbstractIndexComponent } from '../../../../components/shared/kba-abstract-component/kba-abstract-index-component';
import { KbaSelectedComponent } from '../../../shared/kba-selected/kba-selected.component';

import { ApiService } from '../../../../services/api/api.service';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { FlagConditionService } from '../../../../services/opa/flag-condition/flag-condition.service';

import { CautionIcon } from '../../../../mixins/caution-icon';

@Mixin([CautionIcon])
@Component({
  selector: 'app-flag-condition-index',
  templateUrl: './flag-condition-index.component.html',
  styleUrls: [
    './flag-condition-index.component.scss',
    '../shared/caution-icon.scss',
  ],
})
export class FlagConditionIndexComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild(KbaSelectedComponent, { static: false })
  groupSelect: KbaSelectedComponent;
  @ViewChild('deleteModalContent', { static: false })
  deleteModalContent: TemplateRef<null>;

  kind = FlagConditionKinds;
  flagCode = FlagCodes;

  params: FlagConditionIndexParams;
  deleteParams: FlagConditionDeleteParams;
  thList: {
    name: string;
    label: string;
    sortKey: string;
    sortable: boolean;
    displayable: boolean;
  }[];
  fields = null;
  repFields = null;
  cauXFields = null;
  repXFields = null;
  repLists = {
    originList: [],
    visibleList: [],
  };
  repSortingParams = {
    sort: '',
    sortLabel: '',
  };
  repSortableThList: string[];
  repThList: {
    name: string;
    label: string;
    sortKey: string;
    sortable: boolean;
    displayable: boolean;
  }[];
  descItem: any;
  valItem: any;
  repFieldResources;
  reqDisplayableFields;
  downloadFields;
  downloadFieldResources;
  repDownloadFields;
  repDownloadFieldResources;
  downloadPopoverVisible = false;
  fieldSelectPopoverVisible = false;
  deleteModalValues: {
    requestHeaderParams: any;
    listDesc: string[];
    listVal: any;
  };
  deleteCauModalValues: {
    requestHeaderParams: any;
    listDesc: string[];
    listVal: any;
  };
  deleteRepModalValues: {
    requestHeaderParams: any;
    listDesc: string[];
    listVal: any;
  };
  valuesAtKey = 'name';
  isRegionUser: boolean;

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    header: CommonHeaderService,
    modalService: KbaModalService,
    private flagConditionService: FlagConditionService,
    private alertService: KbaAlertService,
    ref: ChangeDetectorRef,
    private api: ApiService
  ) {
    super(navigationService, title, router, ref, header, modalService);
    this.params.flag_kind_code = FlagConditionKinds.caution;
  }

  /**
   * テーブルに表示するデータを取得
   */
  fetchList(sort_key?: string) {
    return new Promise(resolve => {
      this.requestHeaderParams['X-Sort'] = sort_key || '';
      this.isFetching = true;
      this.flagConditionService
        .fetchIndexList(this.searchParams, this.requestHeaderParams)
        .then((res: any) => {
          this._fillLists(res.result_header, res.result_data.flag_conditions);

          this.isFetching = false;
          this._afterFetchList();
          resolve();
        });
    });
  }

  /**
   * 編集ボタン押下コールバック
   * @param target 編集対象のオブジェクト
   */
  onClickEdit(target) {
    this.router.navigate(['/flag_conditions/', target.id, 'edit'], {
      queryParams: { flag_kind_code: target.flag_kind_code },
    });
  }

  /**
   * 検索処理
   */
  onClickSearch() {
    const sortKey = this._isCaution()
      ? this.sortingParams['sort']
      : this.repSortingParams['sort'];
    super.onClickSearch();
    this.fetchList(sortKey);
  }

  /**
   * 削除ボタン押下コールバック
   *
   * 確認モーダルを表示し、確認後に削除APIをリクエストする。
   * リクエスト成功時にアラートメッセージを表示し、一覧を初期化する。
   *
   * @param flagCondition フラグ条件
   */
  async onClickDelete(flagCondition: object) {
    this._showLoadingSpinner();

    const id = flagCondition['id'];
    const searchParams = {
      flag_condition_id: id,
      flag_kind_code: flagCondition['flag_kind_code'],
    };
    this.deleteParams = {
      update_datetime: flagCondition['update_datetime'],
    };

    await this._fetchListId(searchParams);

    this._hideLoadingSpinner();

    this.modalService.open({
      title: this.labels.delete_modal_title,
      labels: this.labels,
      content: this.deleteModalContent,
      okBtnLabel: this.labels.delete,
      okBtnClass: 'btn-delete',
      ok: () => {
        this._showLoadingSpinner();

        this.flagConditionService
          .deleteFlagConditions(id, this.deleteParams)
          .then(res => {
            this.fetchList(this.sortingParams['sort']);

            this._hideLoadingSpinner();
            this.alertService.show(this.labels.finish_message);
          });

      },
    });
  }

  /**
   * 表示するフラグ種別を設定します。
   */
  setVisibleFlagKind(kind) {
    this.params.flag_kind_code = kind;
    this._resetSearchParams();
    this.sortingParams.sort = '';
    this.repSortingParams.sort = '';
    this.pageParams.pageNo = 1;
    this.pageParams.dispPageNo = 1;
    this._reflectPageParams();

    if (this._isReplacementTime() && !this.repThList) {
      this.flagConditionService.fetchInitReplacementTimeData().then(res => {
        this.repThList = this._createThList(res.fields);
        this.repXFields = this._createXFields(res.fields);
        this._setXFields(this.repXFields);
        this.repSortableThList = this.sortableThLists(this.repThList);
        this.repFields = res.fields;
        this.repFieldResources = res.fieldResources;
        // 表示項目設定に表示される項目を取得
        this.reqDisplayableFields = this.repFieldResources
          .filter(field => field.display_code !== DisplayCode.none)
          .map(field => field.path);
        this.repDownloadFields = res.downloadFields;
        this.repDownloadFieldResources = res.downloadFieldResources;
        this.deleteModalValues = this.deleteRepModalValues = this._getModalValues(
          res.deleteFields,
          1
        );
        this.fetchList();
      });
    } else {
      this._setXFields(this._getCurrentFlagKindXField());
      this.deleteModalValues = this._isReplacementTime()
        ? this.deleteRepModalValues
        : this.deleteCauModalValues;
      this.fetchList();
    }
  }

  /**
   * ページネーションの onChange イベントで呼ばれる処理です。
   */
  onPaginationChange() {
    this._reflectPageParams();

    if (this._isCaution()) {
      this.fetchList(this.sortingParams['sort']);
    } else {
      this.fetchList(this.repSortingParams['sort']);
    }

    const tbody = document.querySelector('.kba-scroll-load');

    if (tbody != null) {
      tbody.scrollTop = 0;
    }
  }

  /**
   * 一括ダウンロードボタン押下コールバック
   */
  onClickAllDownload(event) {
    this.downloadPopoverVisible = !this.downloadPopoverVisible;
  }

  /**
   * ダウンロードポップアップの OK ボタン押下時の処理
   * @param args.fields ダウンロード対象項目
   * @param args.fileType ダウンロード形式
   */
  async onDownloadOk(event) {
    const funcCode = this._isCaution()
      ? FunctionCode.listCautionDownloadFunction
      : FunctionCode.listReplaceDownloadFunction;
    await this.api.updateField(funcCode, event.fields);
    await this._downloadTemplate(event.fields.map(f => f.path), event.fileType);
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
    if (this._isCaution()) {
      this.api
        .updateField(FunctionCode.listCautionFunction, event.fields)
        .then((res: any) => {
          return new Promise(resolve => {
            this.api
              .fetchFields(FunctionCode.listCautionFunction)
              .subscribe(_res => resolve(_res));
          });
        })
        .then((res: any) => {
          this._updateFields(res);
          this.fetchList(this.sortingParams['sort']);
        });
    } else {
      this.api
        .updateField(FunctionCode.listReplaceFunction, event.fields)
        .then((res: any) => {
          return new Promise(resolve => {
            this.api
              .fetchFields(FunctionCode.listReplaceFunction)
              .subscribe(_res => resolve(_res));
          });
        })
        .then((res: any) => {
          this._updateFields(res);
          this.fetchList(this.repSortingParams['sort']);
        });
    }
  }

  /**
   * 変更アイコンを非表示にするかどうかを返却します。
   */
  editIconHidden(data) {
    return !this._isConfigurable(data);
  }

  /**
   * 削除アイコンを非表示にするかどうかを返却します。
   */
  deleteIconHidden(data) {
    return !this._isConfigurable(data);
  }

  /**
   * テーブルの初期化に必要なデータを取得
   */
  protected _fetchDataForInitialize() {
    return new Promise(resolve => {
      this.flagConditionService.fetchInitData().then((res: any) => {
        this.initialize(res);
        this.labels = res.label;
        this.resource = res.resource;
        this._setTitle();
        this.cauXFields = this._createXFields(res.fields);
        this.updatable = res.updatable;
        this.deletable = res.deletable;
        this._updateFields(res.fields);
        this.fieldResources = res.fieldResources;
        this.downloadFieldResources = res.downloadFieldResources;
        this.downloadFields = res.downloadFields;
        this.deleteModalValues = this.deleteCauModalValues = this._getModalValues(
          res.deleteFields,
          1
        );
        this.isRegionUser = this.exists('group_id');
        resolve();
      });
    });
  }

  /**
   * データ取得後、リストにデータを挿入します。
   * @param resultHeader API のレスポンスヘッダ
   * @param resultData API のレスポンスデータ
   */
  protected _fillLists(resultHeader, resultData) {
    this.count = resultHeader['X-TotalCount'];
    if (this._isReplacementTime()) {
      this.repSortingParams['sortLabel'] = this._getReqSortLabelKey(
        resultHeader['X-Sort']
      );
    } else {
      this.sortingParams['sortLabel'] = this._getSortLabelKey(
        resultHeader['X-Sort']
      );
    }
    this.safeDetectChanges();
    this.kbaPaginationComponent.buildOptions();
    // 検索条件アコーディオンが閉じており、表示件数が 20 件以上の場合は自動ロード件数を 20 件に変更する
    this.pageParams.autoLoadCount =
      this.collapsed && this.pageParams.pageCount >= 20
        ? this.autoLoadCountClose
        : this.autoLoadCountOpen;
    this.pageParams.lastIndexList = this.pageParams.autoLoadCount;

    const formatted = this._fillListsAdditional(resultData);

    if (this._isCaution()) {
      this.lists.originList = formatted;
      this.lists.visibleList = this.lists.originList.slice(
        0,
        this.pageParams.autoLoadCount
      );
    } else {
      this.repLists.originList = formatted;
      this.repLists.visibleList = this.repLists.originList.slice(
        0,
        this.pageParams.autoLoadCount
      );
    }
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
   * レスポンスヘッダーからソートラベルを設定するキーを取得する
   */
  protected _getReqSortLabelKey(xSort: any): string {
    if (
      !!this.repSortingParams['sort'] ||
      !this.requestHeaderParams['X-Fields']
    ) {
      return this.repSortingParams['sort'];
    }

    const sortKeys = xSort.split(',');
    let fields;
    if (this.reqDisplayableFields && this.reqDisplayableFields.length > 0) {
      fields = this.reqDisplayableFields;
    } else {
      fields = this.requestHeaderParams['X-Fields'].split(',');
    }
    const sortKey =
      sortKeys.find(key =>
        fields.includes(key.replace(/^-/, '').replace(/:.*$/, ''))
      ) || '';

    return this.notSortingColumns.includes(
      sortKey.replace(/^-/, '').replace(/:.*$/, '')
    )
      ? ''
      : sortKey;
  }

  /**
   * 一覧取得の結果を加工する
   * @param resultData 一覧取得結果
   * @return 加工後の一覧取得結果
   */
  private _fillListsAdditional(resultData: object[], prefix = ''): object[] {
    return resultData.map(data => {
      data[`${prefix}latest_update_datetime`] = this.dateFormat(
        data[`${prefix}latest_update_datetime`]
      );
      return data;
    });
  }

  /**
   * 指定項目取得 API の結果を反映
   * @param fields 指定項目
   */
  private _updateFields(fields) {
    if (this._isCaution()) {
      this.fields = fields;
      this.thList = this._createThList(fields);
      this.sortableThList = this.sortableThLists(this.thList);
    } else {
      this.repFields = fields;
      this.repThList = this._createThList(fields);
      this.repSortableThList = this.sortableThLists(this.repThList);
    }
    this._setXFields(this._createXFields(fields));
  }

  /**
   * テンプレートダウンロード
   * @param args[0] ダウンロード対象項目
   * @param args[1] ダウンロード形式
   */
  private async _downloadTemplate(fields, accept) {
    const header = _.clone(this.requestHeaderParams);
    const sortKey = this._isCaution()
      ? this.sortingParams['sort']
      : this.repSortingParams['sort'];
    header['X-Sort'] = sortKey;
    header['X-Fields'] = fields;
    this._showLoadingSpinner();
    try {
      const res: any = await this.flagConditionService.createFile(
        {
          ...this.searchParams,
          file_content_type: accept,
          processing_type: ProcessingType.sync,
        },
        header
      );

      await this.api.downloadFile(res.result_data.file_id, accept);
    } finally {
      this._hideLoadingSpinner();
    }
  }

  /**
   * フラグ種別によるX-Fieldデータの取得
   */
  private _getCurrentFlagKindXField() {
    if (this._isReplacementTime()) {
      return this.repXFields;
    } else {
      return this.cauXFields;
    }
  }

  /**
   * フラグ種別がコーションかどうかを返却する
   *
   * @return true: コーション / false: 交換時期
   */
  private _isCaution(): boolean {
    return this.params.flag_kind_code === this.kind.caution;
  }

  /**
   * フラグ種別が交換時期かどうかを返却する
   *
   * @return true: 交換時期 / false: コーション
   */
  private _isReplacementTime(): boolean {
    return this.params.flag_kind_code === this.kind.replacementTime;
  }

  /**
   * 検索条件リセット
   */
  private _resetSearchParams() {
    if (this.groupSelect) {
      this.groupSelect.reset();
    }
    this.searchParams = _.cloneDeep(this.params);
  }

  /**
   * フラグ条件IDで一覧を取得する
   * @param params フラグ条件
   */
  private _fetchListId(params: FlagConditionIndexParams): Promise<any> {
    return this.flagConditionService
      .fetchIndexList(params, this.deleteModalValues.requestHeaderParams)
      .then((res: Api) => {
        const resultData = this._formatList(
          res.result_data.flag_conditions,
          this.deleteModalValues.listDesc
        );

        this.deleteModalValues.listVal = this._fillListsAdditional(
          resultData,
          'flag_conditions.'
        )[0];
      });
  }

  /**
   * 変更アイコン・削除アイコンの表示制御
   */
  private _isConfigurable(data) {
    if (this.isRegionUser) {
      return true;
    }

    return data.group_id === this.api.getGroupId();
  }
}
