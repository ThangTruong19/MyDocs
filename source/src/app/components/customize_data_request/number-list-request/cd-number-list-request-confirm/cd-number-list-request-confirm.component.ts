import { Component, Input, OnInit } from '@angular/core';
import { TableMergeColumn } from 'app/types/common';
import * as _ from 'lodash';

/**
 * 送信番号一覧要求確認モーダル
 * @author chau-phu
 */
@Component({
    selector: 'app-cd-number-list-request-confirm',
    templateUrl: './cd-number-list-request-confirm.component.html',
    styleUrls: ['./cd-number-list-request-confirm.component.scss']
})
export class CdNumberListRequestConfirmComponent implements OnInit {

    lists = {
        visibleList: [] as any[],
        originList: [] as any[],
    };

    @Input() data: any;
    @Input() labels: any;
    @Input() thList: any;
    @Input() resource: any;

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

        // if (this.data && this.data.length > 0) {
        //   for (let i = 0; i < this.data.length; i++) {
        //     // 要求種別 / 要求単位
        //     if (this.data[i]["current_customize_request.car.kind"] == '1') {
        //       this.data[i]["current_customize_request.car.kind"] = "用途定義単位";
        //     } else {
        //       this.data[i]["current_customize_request.car.kind"] = "定義単位";
        //     }
        //   }
        // }

        // this.isFetching = false;
        // this.mergeColumns = [
        //   {
        //     groupByColumns: ['number_list_request.car.kind'],
        //     targetColumn: 'number_list_request.car.kind'
        //   },  // 「要求単位」列のマージ設定
        //   {
        //     groupByColumns: ['number_list_request.car.customize_usage_definition'],
        //     targetColumn: 'number_list_request.car.customize_usage_definition'
        //   },  // 「カスタマイズ用途定義」列のマージ設定
        //   {
        //     groupByColumns: ['number_list_request.car.start_date'],
        //     targetColumn: 'number_list_request.car.start_date'
        //   },  // 「開始日」列のマージ設定
        //   {
        //     groupByColumns: ['number_list_request.car.end_date'],
        //     targetColumn: 'number_list_request.car.end_date'
        //   },  // 「終了日」列のマージ設定
        // ];

        this.lists.originList = this.data;
        this.lists.visibleList = this.lists.originList;
    }

    /**
     * 要求種別の名前を取得する
     * @param value
     * @returns 用途定義単位/定義単位
     */
    getKind(value: string): string {
        let result = "";
        var item = _.filter(this.resource.send_number_list_request_definition_id_kind.values, function (o) {
            if (o.value == value) return o;
        });
        if (item) {
            result = item[0].name;
        }
        return result;
    }
}
