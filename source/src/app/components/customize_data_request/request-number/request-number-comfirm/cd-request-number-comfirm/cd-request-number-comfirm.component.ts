import { Component, Input, OnInit } from '@angular/core';
import { Apis } from 'app/constants/apis';
import { ApiService } from 'app/services/api/api.service';
import { Resources, TableHeader } from 'app/types/common';

/**
 * カスタマイズデータ送信要求確認（送信番号指定）
 * @author chau-phu
 */
@Component({
    selector: 'app-cd-request-number-comfirm',
    templateUrl: './cd-request-number-comfirm.component.html',
    styleUrls: ['./cd-request-number-comfirm.component.scss']
})
export class CdRequestNumberComfirmComponent implements OnInit {

    @Input()
    public resources: Resources;
    @Input()
    public initThList: TableHeader[];
    @Input()
    public tableData: any;

    public labels: any;
    public thList: TableHeader[] = [];

    lists = {
        visibleList: [] as any[],
        originList: [] as any[],
    };

    sortingParams = {
        sort: '',
        sortLabel: '',
    };

    constructor() { }

    ngOnInit(): void {
        this.labels = this.resources.label;
        this.thList = this.initThList;
        console.log(this.thList);
        console.log(this.tableData);
    }

}
