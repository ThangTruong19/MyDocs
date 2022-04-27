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

import { ModalValues, Fields, TableHeader } from '../../../../types/common';
import { CarAssignsSearchParams } from '../../../../types/flm/support-distributor-change';

import { KbaAbstractIndexComponent } from '../../../shared/kba-abstract-component/kba-abstract-index-component';

import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { SupportDistributorChangeService } from '../../../../services/flm/support-distributor-change/support-distributor-change.service';

@Component({
  selector: 'app-support-distributor-change-consignee',
  templateUrl: './support-distributor-change-consignee.component.html',
  styleUrls: ['./support-distributor-change-consignee.component.scss'],
})
export class SupportDistributorChangeConsigneeComponent
  extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('assignModalContent', { static: false })
  assignModalContent: TemplateRef<null>;

  params: CarAssignsSearchParams = { assigned_group_id: '' };
  checkIdName = 'car_assigns.id';
  fields: Fields;
  assignFields: Fields;
  assignsModalValues: ModalValues;
  commaSeparated = ['models', 'type_revs', 'serials'];
  enableAssigns: boolean;
  checkedItems: { [key: string]: boolean } = {};

  get selectedList() {
    return _.map(this.checkedItems, (value, key) =>
      value ? key : null
    ).filter(Boolean);
  }

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    modalService: KbaModalService,
    private supportDistributorChangeService: SupportDistributorChangeService
  ) {
    super(navigationService, title, router, ref, header, modalService);
  }

  /**
   * 検索ボタン押下時の処理
   */
  onClickSearch(): void {
    super.onClickSearch();
    this.fetchList(this.sortingParams['sort']);
    this.checkedItems = {};
  }

  /**
   * 引き当てボタン押下時の処理
   */
  async onClickAssign(): Promise<void> {
    this.assignsModalValues = this._getModalValues(
      this.assignFields,
      this.count
    );

    const searchParams = this._transrateSearchParams(
      this.searchParams,
      this._getNestedKeys(this.params)
    );
    const res = await this.supportDistributorChangeService.fetchSupportDistributorChangeConsigneeList(
      searchParams,
      this.assignsModalValues.requestHeaderParams
    );
    this.assignsModalValues.listVal = _.filter(
      this._formatList(
        res.result_data.car_assigns,
        this.assignsModalValues.listDesc
      ),
      list => this.isChecked(list[this.checkIdName])
    );

    this.modalService.open({
      title: this.labels.assigns_modal_title,
      labels: this.labels,
      content: this.assignModalContent,
      closeBtnLabel: this.labels.cancel,
      ok: async () => {
        const carAssigns = this.assignsModalValues.listVal.map(list => ({
          id: list[this.checkIdName],
          update_datetime: list['car_assigns.update_datetime'],
        }));
        const _res = await this.supportDistributorChangeService.updateSupportDistributorChangeConsignee(
          { car_assigns: carAssigns }
        );
        this._resultModalOpen(
          this.labels.assigns_result_label,
          this.assignsModalValues.listDesc,
          this.assignsModalValues.listVal,
          _res.responses,
          () => this._successOperation(),
          { size: 'lg' }
        );
      },
    });
  }

  /**
   * 該当行がチェックされているかを返却します。
   * @param id 車両引き当てID
   * @return true: チェック済/ false: 未チェック
   */
  isChecked(id: string): boolean {
    return _.includes(this.selectedList, id);
  }

  async fetchList(sort_key?: string): Promise<void> {
    this.isFetching = true;
    this.requestHeaderParams['X-Sort'] = sort_key || '';
    const nestedKeys = this._getNestedKeys(this.params);
    const searchParams = this._transrateSearchParams(
      this.searchParams,
      nestedKeys
    );
    const res = await this.supportDistributorChangeService.fetchSupportDistributorChangeConsigneeList(
      searchParams,
      this.requestHeaderParams
    );
    this._fillLists(
      res.result_header,
      this._formatList(res.result_data.car_assigns, this.thList)
    );
    this.isFetching = false;
    this._afterFetchList();
  }

  protected async _fetchDataForInitialize(): Promise<void> {
    const res = await this.supportDistributorChangeService.fetchSupportDistributorChangeConsigneeInitData();
    this.initialize(res);
    this.labels = res.label;
    this.resource = res.resource;
    this._setTitle();
    this.enableAssigns = res.enableAssigns;
    this.selectable = this.enableAssigns;
    this.assignFields = res.assignFields;
    this._updateFields(res.fields);
  }

  /**
   * 検索欄データの値を配列形式に変換する
   * @param 検索欄データ
   */
  protected _transrateSearchParams(
    params: CarAssignsSearchParams,
    nestedKeys: string[]
  ): CarAssignsSearchParams {
    const result = { assigned_group_id: '' };
    let value;
    _.each(nestedKeys, path => {
      if ((value = _.get(params, path))) {
        if (_.includes(this.commaSeparated, path)) {
          _.set(result, path, _.split(value, ','));
        } else if (_.includes(this.stringParamList, path)) {
          _.set(result, path, value);
        } else {
          _.set(result, path, [value]);
        }
      }
    });
    return result;
  }

  /**
   * 一括操作結果モーダルのオープン
   *
   * 一括操作系では、確認モーダルOK後のAPIリクエストに対するレスポンス内容を一括操作結果モーダルで表示する。
   *
   * @param title モーダルのタイトル
   * @param desc 確認モーダルのヘッダ情報
   * @param requestData リクエストデータ詳細（確認モーダルの内容）
   * @param responseData レスポンスデータ
   * @param closeCallback 一括操作結果モーダルを閉じた時のコールバック
   * @param modalOption NgbModalに渡すオプション
   */
  protected _resultModalOpen(
    title: string,
    desc: TableHeader[],
    requestData: any[],
    responseData: any[],
    closeCallback: () => void,
    modalOption = {}
  ) {
    if (!this.resultModalContent) {
      return;
    }

    [
      this.resultDesc,
      this.resultVal,
      this.resultCountMessage,
    ] = this.modalService.createResultModalResource(
      this.labels,
      desc,
      requestData,
      responseData,
      this.resource
    );
    this.resultVal = this.resultVal.map((val, index) => {
      const value = val;
      const res = responseData[index];
      const warningData = _.get(res, 'result_data.warning_data');

      if (warningData != null && warningData.length > 0) {
        value.result.warning = true;
        value.message = warningData.map(warning => warning.message).join('\n');
        value.css_class = 'has-warning-data';
      }

      return value;
    });

    this.modalService.open(
      {
        title: title,
        labels: this.labels,
        content: this.resultModalContent,
        close: closeCallback,
      },
      modalOption
    );
  }

  /**
   * 指定項目を更新
   * @param fields 指定項目
   */
  private _updateFields(fields): void {
    this.fields = fields;
    this.thList = this._createThList(fields);
    this.sortableThList = this.sortableThLists(this.thList);
    this._reflectXFields(fields);
  }

  /**
   * 車両引き当ての完了時の処理
   */
  private _successOperation(): void {
    this.onClickSearch();
  }
}
