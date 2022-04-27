import { OnInit, ViewChild, ChangeDetectorRef, Component } from '@angular/core';
import * as $ from 'jquery';
import * as _ from 'lodash';
import { RequestHeaderParams } from 'app/types/request';
import {
    AbstractModalContentComponent
} from 'app/components/shared/abstract-component/abstract-modal-content.component';
import { PaginationComponent } from 'app/components/shared/pagination/pagination.component';
import { ModalService } from 'app/services/shared/modal.service';

@Component({ template: '' })
export abstract class AbstractModalContentWithPaginationComponent
    extends AbstractModalContentComponent
    implements OnInit {

    @ViewChild(PaginationComponent, { static: false })
    public paginationComponent: PaginationComponent;

    // パラメータ関連
    public params: any = {};
    public searchParams: any;
    public requestHeaderParams: RequestHeaderParams = {};

    // 要素情報関連
    public isSearching = false;
    public isAcquired = false;

    // ページネーション関連
    public count: number;
    public pageParams: {
        pageNo: number;
        dispPageNo: number;
        pageCount: number;
    } = {
        pageNo: 1,
        dispPageNo: 1,
        pageCount: 10
    };

    public pageCountEl: { pageCount: { values: string[] } } = {
        pageCount: { values: [] }
    };

    constructor(
        protected override modalService: ModalService,
        protected ref: ChangeDetectorRef
    ) {
        super(modalService);
    }

    ngOnInit(): void {
        if (this.paginationComponent) {
            this._reflectPageParams();
        }

        this.searchParams = this._getSearchParams(this.params);
        this.initialize();
    }

    /**
     * 検索ボタン押下時の処理
     */
    public onClickSearch(): void {
        this.pageParams.pageNo = 1;
        this.pageParams.dispPageNo = 1;
        this._reflectPageParams();

        this.searchParams = this._getSearchParams(this.params);
    }

    /**
     * ページネーションの onChange イベントで呼ばれる処理です。
     */
    public onPaginationChange(): void {
        this._reflectPageParams();
        this.fetchList();

        const tbody: JQuery<HTMLElement> = $('.app-table-tbody');

        if (tbody != null) {
            tbody.animate({ scrollTop: 0 }, 0);
        }
    }

    /**
     * 初期処理
     */
    abstract initialize(): void;

    /**
     * テーブル表示のためのデータを取得します。
     */
    abstract fetchList(): Promise<any>;

    /**
     * ページネーションの状態を API コールに使用するパラメータに反映します。
     */
    protected _reflectPageParams(): void {
        this.requestHeaderParams['X-From'] =
            (this.pageParams.pageNo - 1) * this.pageParams.pageCount + 1;
        this.requestHeaderParams['X-Count'] = this.pageParams.pageCount;
    }

    /**
     * ページングに必要な値を生成する
     * @param resultHeader API のレスポンスヘッダ
     */
    protected _buildOptions(resultHeader: any): void {
        this.count = resultHeader['X-TotalCount'];
        this.ref.detectChanges();
        if (this.paginationComponent) {
            this.paginationComponent.buildOptions();
        }
    }

    protected _afterFetchList(): void {
        const tbody: JQuery<HTMLElement> = $('.app-table-tbody');

        if (tbody != null) {
            tbody.animate({ scrollTop: 0 }, 0);
        }

        this.isAcquired = true;
    }

    /**
     * 検索条件パラメータを取得する
     * @param params パラメータ
     */
    protected _getSearchParams<T>(params: T): T {
        return _.clone(params);
    }
}
