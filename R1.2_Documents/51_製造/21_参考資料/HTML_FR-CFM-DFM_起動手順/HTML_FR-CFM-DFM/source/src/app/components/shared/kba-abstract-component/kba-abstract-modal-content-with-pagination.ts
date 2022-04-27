import * as $ from 'jquery';
import * as _ from 'lodash';
import { OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';

import { RequestHeaderParams } from '../../../types/request';

import { KbaAbstractModalContentComponent } from './kba-abstract-modal-content-component';
import { KbaPaginationComponent } from '../../../components/shared/kba-pagination/kba-pagination.component';

import { KbaModalService } from '../../../services/shared/kba-modal.service';

export abstract class KbaAbstractModalContentWithPaginationComponent
  extends KbaAbstractModalContentComponent
  implements OnInit {
  @ViewChild(KbaPaginationComponent, { static: false })
  kbaPaginationComponent: KbaPaginationComponent;

  // パラメータ関連
  params: any = {};
  searchParams: any;
  requestHeaderParams: RequestHeaderParams = {};

  // 要素情報関連
  isSearching = false;
  isAcquired = false;

  // ページネーション関連
  count;
  pageParams = {
    pageNo: 1,
    dispPageNo: 1,
    pageCount: 10,
  };
  pageCountEl = {
    pageCount: { values: [] },
  };

  constructor(
    protected modalService: KbaModalService,
    protected ref: ChangeDetectorRef
  ) {
    super(modalService);
  }

  ngOnInit() {
    if (this.kbaPaginationComponent) {
      this._reflectPageParams();
    }

    this.searchParams = this._getSearchParams(this.params);
    this.initialize();
  }

  /**
   * 検索ボタン押下時の処理
   */
  onClickSearch() {
    this.pageParams.pageNo = 1;
    this.pageParams.dispPageNo = 1;
    this._reflectPageParams();

    this.searchParams = this._getSearchParams(this.params);
  }

  /**
   * ページネーションの onChange イベントで呼ばれる処理です。
   */
  onPaginationChange() {
    this._reflectPageParams();
    this.fetchList();

    const tbody = $('.KBA-table-tbody');

    if (tbody != null) {
      tbody.animate({ scrollTop: 0 }, 0);
    }
  }

  /**
   * 初期処理
   */
  abstract initialize();

  /**
   * テーブル表示のためのデータを取得します。
   */
  abstract fetchList(): Promise<any>;

  /**
   * ページネーションの状態を API コールに使用するパラメータに反映します。
   */
  protected _reflectPageParams() {
    this.requestHeaderParams['X-From'] =
      (this.pageParams.pageNo - 1) * this.pageParams.pageCount + 1;
    this.requestHeaderParams['X-Count'] = this.pageParams.pageCount;
  }

  /**
   * ページングに必要な値を生成する
   * @param resultHeader API のレスポンスヘッダ
   */
  protected _buildOptions(resultHeader: any) {
    this.count = resultHeader['X-TotalCount'];
    this.ref.detectChanges();
    if (this.kbaPaginationComponent) {
      this.kbaPaginationComponent.buildOptions();
    }
  }

  protected _afterFetchList() {
    const tbody = $('.KBA-table-tbody');

    if (tbody != null) {
      tbody.animate({ scrollTop: 0 }, 0);
    }

    this.isAcquired = true;
  }

  /**
   * 検索条件パラメータを取得する
   * @param params パラメータ
   */
  protected _getSearchParams(params) {
    return _.clone(params);
  }
}
