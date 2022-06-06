import { Component, Input, OnInit } from '@angular/core';
import { Apis } from 'app/constants/apis';
import { ApiService } from 'app/services/api/api.service';
import { CdRequestNumberConfirmService } from 'app/services/customize_data_request/request-number/cd-request-number-tab/cd-request-number-confirm.service';
import { Resources, TableHeader } from 'app/types/common';
import { RequestHeaderParams } from 'app/types/request';
import * as _ from 'lodash';

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
    @Input()
    public maxTraffic: string;

    public labels: any;
    public thList: TableHeader[] = [];
    public isFetching: boolean = false;
    public formatted: any;

    lists = {
        visibleList: [] as any[],
        originList: [] as any[],
    };

    sortingParams = {
        sort: '',
        sortLabel: '',
    };

    public sortableThList: string[] = [];

    private arrayColumnPaths: string[] = [
        'cars.customize_usage_definitions',
        'cars.customize_usage_definitions.customize_definitions',
        'cars.customize_usage_definitions.customize_definitions.sends_no',
    ];

    rowHeight: number = 35;

    constructor(private cdRequestNumberConfirmService: CdRequestNumberConfirmService) { }

    ngOnInit(): void {
        this.labels = this.resources.label;
        this.thList = this.initThList;

        // Format the acquired data to be displayed in the table
        const listData = this.tableData.reduce((acc: any, cur: any) => {
            acc.push({
                data_amount_upper_limit: this.maxTraffic? this.maxTraffic : "",
                model_type_rev_serial: cur.car_identification.model + "-" + cur.car_identification.type_rev + "-" + cur.car_identification.serial
            })
            return acc;
        },[]);

        this.formatted = this._formatList(
            listData,
            this.thList
        );
        this.formatted.forEach((element: any, index: any) => {
            _.set(element, 'cars.customize_usage_definitions',
                this.tableData[index].customize_usage_definitions);
        });

        _.set(this.lists, 'originList', this.formatted);
        _.set(this.lists, 'visibleList', this.formatted);

        this.isFetching = false;
    }

    /**
     * カスタマイズデータ送信要求（送信番号指定）
     */
    public customizedDataTransmissionRequest(): void {
        const requestHeaderParams: RequestHeaderParams = {};
        let cars: any = [];
        this.formatted.forEach((element: any) => {
            let car: any = {
                model_type_rev_serial: element['cars.model_type_rev_serial'],
                customize_definitions: []
            }
            element['cars.customize_usage_definitions'].forEach((usageDefinition: any) => {
                usageDefinition.customize_definitions.forEach((definition: any) => {
                    let sendNos: any = [];
                    definition.sends_no.forEach((sendNo: any) => {
                        sendNos.push(sendNo);
                    });
                    car.customize_definitions.push({
                        customize_definition_id: definition.id,
                        send_nos: sendNos
                    });
                });
            });
            cars.push(car);
        });
        const params = {
            data_amount_upper_limit: this.maxTraffic,
            cars: cars
        };
        this.cdRequestNumberConfirmService.postCustomizeDataTransmissionRequest(params,requestHeaderParams)
            .then((response) => {
                console.log("Response: " + JSON.stringify(response));
            }).catch((error) => {
                throw error;
            });
    }

    /**
     * 対象列が配列形式かどうかを判断する。
     * @param pathName 対象列のパス名
     * @returns true：配列、false：配列ではない。
     */
     public isArrayColumnData(pathName: string): boolean {
        return this.arrayColumnPaths.indexOf(pathName) !== -1
    }

    /**
     * Calculate the height of column [カスタマイズ定義]
     * @param item Column information
     * @returns The calculated height
     */
    public customizeDefinitionHeight(item: any): number{
        if(this.checkKey(item,'sends_no')){
            return item.sends_no.length;
        }else{
            return 1;
        }
    }

    /**
     * Calculate the height of column [カスタマイズ用途定義]
     * @param item Column information
     * @returns The calculated height
     */
    public customizeUsageDefinitionHeight(item: any): number{
        let height = 0;

        if(item.customize_definitions.length > 0){
            item.customize_definitions.forEach((element: any) => {
                if(this.checkKey(element,'sends_no')){
                    height += element.sends_no.length;
                }else{
                    height += 1;
                }
            })
        }else{
            height = 1;
        }
        return height;
    }

    /**
     * Checking whether the specified key exist in the given item
     * @param item Item to be checked
     * @param key Key value
     * @returns True: Key exist / False: Key not exist
     */
    public checkKey(item: Object, key: string): boolean{
        return key in item;
    }

    /**
     * Setting column width
     * @param col Column Information
     */
     public setTableWidth(col: TableHeader): string{
        switch (col.name) {
            case "cars.model_type_rev_serial":
                return "width:20%"
            case "cars.data_amount_upper_limit":
                return "width:15%"
            case "cars.customize_usage_definitions":
                return "width:20%"
            case "cars.customize_usage_definitions.customize_definitions":
                return "width:20%"
            case "cars.customize_usage_definitions.customize_definitions.sends_no":
                return "width:25%"
            default:
                return "width:25%"
        }
    }

    /**
     * API から取得したデータをテーブルで表示できる形に成形して返す。
     *
     * ネストしたオブジェクトをデータを指定項目のパス（ネスト関係をドット区切りの文字列で表現したもの）を
     * キーとしたオブジェクトに成形する。
     *
     * @param listBody APIから取得したリストデータ
     * @param thList テーブルヘッダ情報
     */
     private _formatList(listBody: any[], thList: TableHeader[]): any {
        return listBody.map(data => {
            return _.reduce(
                thList,
                (result: any, th: TableHeader) => {
                    if (!th.optional) {
                        result[th.name] = this._listDisplayData(data, th);
                    }
                    return result;
                },
                {}
            );
        });
    }

    private _listDisplayData(data: any, th: TableHeader): any {
        return _.get(data, th.formatKey);
    }

}
