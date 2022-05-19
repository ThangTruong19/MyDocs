import { Component, Input, OnInit } from '@angular/core';
import { TableHeader, TableMergeColumn } from 'app/types/common';
import * as _ from 'lodash';

/**
 * 現在カスタマイズ送信要求確認モーダル
 */
@Component({
    selector: 'app-cd-current-request-comfirm',
    templateUrl: './cd-current-request-comfirm.component.html',
    styleUrls: ['./cd-current-request-comfirm.component.scss']
})
export class CdCurrentRequestComfirmComponent implements OnInit {

    @Input() data: any;
    @Input() thList: any;
    @Input() labels: any;
    @Input() resource: any;

    lists = {
        visibleList: [] as any[],
        originList: [] as any[],
    };

    sortingParams = {
        sort: '',
        sortLabel: '',
    };
    sortableThList: string[] = [];

    constructor() { }

    ngOnInit(): void {
        console.log("data", this.data);
        console.log("thList", this.thList);

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
        var item = _.filter(this.resource.request_number_definition_id_kind.values, function (o) {
            if (o.value == value) return o;
        });
        if (item) {
            result = item[0].name;
        }
        return result;
    }
}
