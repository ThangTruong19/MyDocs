import { Component, Input, OnInit } from '@angular/core';
import { Apis } from 'app/constants/apis';
import { ApiService } from 'app/services/api/api.service';

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

    lists = {
        visibleList: [] as any[],
        originList: [] as any[],
    };

    thList = [
        {
            label: '車両',
            name: 'columnName1',
            displayable: true,
        },
        {
            label: '通信量上限設定',
            name: 'columnName2',
            displayable: true,
        },
        {
            label: '上限通信量[KB]',
            name: 'columnName3',
            displayable: true,
        },
        {
            label: 'カスタマイズ用途定義',
            name: 'columnName4',
            displayable: true,
        },
        {
            label: 'カスタマイズ定義',
            name: 'columnName5',
            displayable: true,
        },
        {
            label: '送信番号',
            name: 'columnName6',
            displayable: true,
        },
    ];

    sortingParams = {
        sort: '',
        sortLabel: '',
    };

    constructor(private apiService: ApiService,) { }

    ngOnInit(): void {
        console.log(this.lists);
        this.lists.originList = [{
            columnName1: 'PC200-8-1234',
            columnName2: '有効',
            columnName3: 'XXXX',
            columnName4: 'BBB',
            columnName5: 'CCC',
            columnName6: 'DDD',
            columnName1Rowspan: 2,
        }, {
            columnName1: 'columnName1',
            columnName2: 'columnName2',
            columnName3: 'columnName3',
            columnName4: 'columnName4',
            columnName5: 'columnName5',
            columnName6: 'columnName6',
            columnName1Rowspan: 0,
        }];
        this.lists.visibleList = this.lists.originList;

    }

    cancel(): void {
        console.log("Cancel");
    }

    async ok(): Promise<void> {
        console.log("OK");
        let params: any = {
            request_route_kind: "0",
            data_amount_upper_limit: "D85PX-15E0-A12345", //上限通信量[KB]
            cars: [
                {
                    "model_type_rev_serial": "D85PX-15E0-A12345",
                    "customize_definitions": [
                        {
                            "customize_definition_id": "1234567890123456789",
                            "send_nos": [
                                "20170124T045040Z000001"
                            ]
                        }
                    ]
                }
            ]
        };
        // TODO
        // const res = await this.apiService.post("Apis.postCars", params);

        const res = await this.apiService.post('/v1/applications/views/resources/search', params);
        console.log("res", res);
    }

}
