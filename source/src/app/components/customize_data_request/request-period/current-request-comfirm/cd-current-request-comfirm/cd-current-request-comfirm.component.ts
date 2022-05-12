import { Component, Input, OnInit } from '@angular/core';
import { TableHeader, TableMergeColumn } from 'app/types/common';

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

}
