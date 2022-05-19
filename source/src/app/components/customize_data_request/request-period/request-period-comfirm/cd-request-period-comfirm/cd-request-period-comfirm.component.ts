import { Component, Input, OnInit } from '@angular/core';
import { TableHeader, TableMergeColumn } from 'app/types/common';
import * as _ from 'lodash';

/**
 * カスタマイズデータ送信要求確認（期間指定）モーダル
 */
@Component({
    selector: 'app-cd-request-period-comfirm',
    templateUrl: './cd-request-period-comfirm.component.html',
    styleUrls: ['./cd-request-period-comfirm.component.scss']
})
export class CdRequestPeriodComfirmComponent implements OnInit {

    @Input() data: any;
    @Input() thList: any;
    @Input() labels: any;
    @Input() resource: any;

    lists = {
        visibleList: [] as any[],
        originList: [] as any[],
    };

    sortableThList: string[] = [];
    sortingParams = {
        sort: '',
        sortLabel: '',
    };

    public mergeColumns: TableMergeColumn[] = [];
    public isFetching = false;

    constructor() { }

    ngOnInit(): void {
        console.log("data", this.data);
        console.log("thList", this.thList);
        console.log("resource", this.resource);

        // if (this.data && this.data.length > 0) {
        //   for (let i = 0; i < this.data.length; i++) {
        //     // 通信量上限設定
        //     if (this.data[i]["request_period.car.data_amount_upper_limit_active_kind"] == '1') {
        //       this.data[i]["request_period.car.data_amount_upper_limit_active_kind"] = "有効";
        //     } else {
        //       this.data[i]["request_period.car.data_amount_upper_limit_active_kind"] = "無効";
        //     }
        //     // 要求種別 / 要求単位
        //     if (this.data[i]["request_period.car.kind"] == '1') {
        //       this.data[i]["request_period.car.kind"] = "用途定義単位";
        //     } else {
        //       this.data[i]["request_period.car.kind"] = "定義単位";
        //     }
        //   }
        // }

        this.isFetching = false;
        // this.mergeColumns = [
        //   {
        //     groupByColumns: ['request_period.car.data_amount_upper_limit_active_kind'],
        //     targetColumn: 'request_period.car.data_amount_upper_limit_active_kind'
        //   },  // 「通信量上限設定」列のマージ設定
        //   {
        //     groupByColumns: ['request_period.car.data_amount_upper_limit'],
        //     targetColumn: 'request_period.car.data_amount_upper_limit'
        //   },  // 「上限通信量[KB]」列のマージ設定
        //   {
        //     groupByColumns: ['request_period.car.kind'],
        //     targetColumn: 'request_period.car.kind'
        //   },  // 「要求単位」列のマージ設定
        //   {
        //     groupByColumns: ['request_period.car.start_date'],
        //     targetColumn: 'request_period.car.start_date'
        //   },  // 「開始日]」列のマージ設定
        //   {
        //     groupByColumns: ['request_period.car.end_date'],
        //     targetColumn: 'request_period.car.end_date'
        //   },  // 「終了日]」列のマージ設定
        // ];

        this.lists.originList = this.data;
        this.lists.visibleList = this.lists.originList;
    }

    /**
     * 通信量上限設定の名前を取得する
     * @param value
     * @returns 有効/無効
     */
    getDataAmountUpperLimitActiveKindName(value: string): string {
        let result = "";
        var item = _.filter(this.resource.car_data_amount_upper_limit_active_kind.values, function (o) {
            if (o.value == value) return o;
        });
        if (item) {
            result = item[0].name;
        }
        return result;
    }

    /**
     * 要求種別の名前を取得する
     * @param value
     * @returns 用途定義単位/定義単位
     */
    getKind(value: string): string {
        let result = "";
        var item = _.filter(this.resource.request_number_definition_id_kind.values, function (o) {
            if (o.value == value) return o;
        });
        if (item) {
            result = item[0].name;
        }
        return result;
    }
}
