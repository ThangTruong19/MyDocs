import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { KbaNavigationService } from '../../../../services/shared/kba-navigation.service';
import { KbaAbstractIndexComponent } from '../../../shared/kba-abstract-component/kba-abstract-index-component';
import { KbaModalService } from '../../../../services/shared/kba-modal.service';
import { ClassIndexParams } from '../../../../types/flm/class';
import { KbaAlertService } from '../../../../services/shared/kba-alert.service';
import { Api } from '../../../../types/common';
import { Title } from '@angular/platform-browser';
import { CommonHeaderService } from '../../../../services/shared/common-header.service';
import { ClassService } from '../../../../services/flm/class/class.service';

@Component({
  selector: 'app-class-index',
  templateUrl: './class-index.component.html',
  providers: [ClassService, KbaModalService],
  styleUrls: ['./class-index.component.scss'],
})
export class ClassIndexComponent extends KbaAbstractIndexComponent
  implements OnInit {
  @ViewChild('deleteModalContent', { static: false })
  deleteModalContent: TemplateRef<null>;

  params: ClassIndexParams;
  // 分類一覧取得に適応中の検索条件のパラメータ情報を保持
  currentParams;

  sortableThList: string[];

  deleteModalValues: {
    requestHeaderParams: any;
    listDesc: string[];
    listVal: any;
  };

  constructor(
    navigationService: KbaNavigationService,
    title: Title,
    router: Router,
    ref: ChangeDetectorRef,
    header: CommonHeaderService,
    private classService: ClassService,
    protected modalService: KbaModalService,
    private alertService: KbaAlertService
  ) {
    super(navigationService, title, router, ref, header);
  }

  /**
   * 現在のパラメータを一覧取得APIに引き渡し、一覧画面に表示するリストを取得する
   */
  fetchList(sort_key?: string) {
    return new Promise(resolve => {
      this.isFetching = true;
      this.requestHeaderParams['X-Sort'] = sort_key || '';
      this.classService
        .fetchIndexList(this.currentParams, this.requestHeaderParams)
        .then((res: Api) => {
          this._setClassIndexList(res.result_data);
          this.isFetching = false;
          this._afterFetchList();
          resolve();
        });
    });
  }

  /**
   * ページネーションを適用しないため、オーバーライドする
   */
  ngOnInit() {
    this._fetchDataForInitialize()
      .then(async () => {
        await this.header.setHeader(this.labels, this.resource, this.functions);
        this.safeDetectChanges();
        this.currentParams = _.cloneDeep(this.params);
        return this.fetchList();
      })
      .then(() => {
        this.safeDetectChanges();
        this.onLoad();
      });
  }

  /**
   * 削除処理
   * @param {any} item     削除対象
   */
  async onClickDelete(item) {
    const { id, update_datetime } = item;
    let support_distributor_id = null;

    if (this.exists('support_distributor_id')) {
      support_distributor_id = item.support_distributor_id;
    }

    const res = await this.classService.fetchIndexList(
      { support_distributor_id, class_id: id },
      this.deleteModalValues.requestHeaderParams
    );

    this.deleteModalValues.listVal = this._formatList(
      res.result_data.classes,
      this.deleteModalValues.listDesc
    )[0];

    this.modalService.open({
      title: this.labels.delete_confirm_message,
      labels: this.labels,
      content: this.deleteModalContent,
      okBtnLabel: this.labels.delete,
      okBtnClass: 'btn-delete',
      ok: async () => {
        await this.classService.deleteClassItem(id, update_datetime);
        this.fetchList();
        this.alertService.show(this.labels.complete_message);
      },
    });
  }

  /**
   * 検索ボタン押下時の処理
   * 現在のパラメータを更新してリストを取得する
   */
  onClickSearch() {
    super.onClickSearch();
    this.currentParams = _.cloneDeep(this.params);
    this.fetchList(this.sortingParams['sort']);
  }

  /**
   * 変更画面遷移
   * @param {any} item 変更対象
   *
   */
  onClickEdit(item): void {
    const class_id = item.id;
    const queryParams = this.exists('support_distributor_id')
      ? { support_distributor_id: this.params.support_distributor_id }
      : null;

    this.router.navigate(['classes', class_id, 'edit'], { queryParams });
  }

  protected _fetchDataForInitialize() {
    return new Promise(resolve => {
      this.classService.fetchIndexInitData().then((res: any) => {
        this.initialize(res);
        this.resource = res.resource;
        this.labels = res.label;
        this._setTitle();
        this.updatable = res.updatable;
        this.deletable = res.deletable;
        this.thList = this._createThList(res.fields);
        this.sortableThList = this.sortableThLists(this.thList);
        const xFields = this._createXFields(res.fields);
        this._setXFields(xFields);
        this.deleteModalValues = this._getModalValues(res.deleteFields, 1);
        resolve();
      });
    });
  }

  protected _dataKey(key: string): string {
    return key;
  }

  /**
   * 一覧画面に表示するデータを挿入する
   * @param resultData APIのレスポンスデータ
   */
  private _setClassIndexList(resultData: any) {
    this.lists.originList = resultData.classes;
    this.lists.visibleList = resultData.classes;
  }
}
