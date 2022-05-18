import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { AbstractBaseComponent } from 'app/components/shared/abstract-component/abstract-base.component';
import { ApiService } from 'app/services/api/api.service';
import { CdExpectedTrafficComfirmService } from 'app/services/customize_data_request/request-period/cd-request-period-tab/request-number/expected-traffic-comfirm/cd-expected-traffic-confirm/cd-expected-traffic-confirm.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { TableMergeColumn } from 'app/types/common';
import * as _ from 'lodash';

/**
 * 想定通信量確認
 * @author chau-phu
 */
@Component({
    selector: 'app-cd-expected-traffic-confirm',
    templateUrl: './cd-expected-traffic-confirm.component.html',
    styleUrls: ['./cd-expected-traffic-confirm.component.scss']
})
export class CdExpectedTrafficConfirmComponent implements OnInit {

    lists = {
        visibleList: [] as any[],
        originList: [] as any[],
    };

    @Input() data: any;
    @Input() thList: any;
    @Input() labels: any;

    public mergeColumns: TableMergeColumn[] = [];
    public isFetching = false;

    sortingParams = {
        sort: '',
        sortLabel: '',
    };

    constructor() { }

    ngOnInit(): void {
        console.log("cd-expected-traffic-confirm:lists", this.data);
        console.log("cd-expected-traffic-confirm:thList", this.thList);

        this.isFetching = false;
        this.mergeColumns = [
            {
                groupByColumns: ['request_number.cars.car_identification.model_type_rev_serial'],
                targetColumn: 'request_number.cars.car_identification.model_type_rev_serial'
            },  // 「車両」列のマージ設定
            {
                groupByColumns: ['request_number.cars.communication_channel.name'],
                targetColumn: 'request_number.cars.communication_channel.name'
            },  // 「通信機種類」列のマージ設定
            // {
            //   groupByColumns: ['request_period.car.kind'],
            //   targetColumn: 'request_period.car.kind'
            // },  // 「要求単位」列のマージ設定
            // {
            //   groupByColumns: ['request_period.car.start_date'],
            //   targetColumn: 'request_period.car.start_date'
            // },  // 「開始日]」列のマージ設定
            // {
            //   groupByColumns: ['request_period.car.end_date'],
            //   targetColumn: 'request_period.car.end_date'
            // },  // 「終了日]」列のマージ設定
        ];

        this.lists.originList = this.data;
        this.lists.visibleList = this.lists.originList;
    }

}
