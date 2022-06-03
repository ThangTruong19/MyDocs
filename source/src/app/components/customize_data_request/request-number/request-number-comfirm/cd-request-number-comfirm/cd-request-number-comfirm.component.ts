import { Component, Input, OnInit } from '@angular/core';
import { Apis } from 'app/constants/apis';
import { ApiService } from 'app/services/api/api.service';
import { Resources, TableHeader } from 'app/types/common';
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

    public labels: any;
    public thList: TableHeader[] = [];
    public isFetching: boolean = false;

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

    constructor() { }

    ngOnInit(): void {
        this.labels = this.resources.label;
        this.thList = this.initThList;
        console.log(this.thList);
        console.log(this.tableData);

        // Format the acquired data to be displayed in the table
        const listData = this.tableData.reduce((acc: any, cur: any) => {
            acc.push({
                data_amount_upper_limit: 5000,
                model_type_rev_serial: cur.car_identification.model + "-" + cur.car_identification.type_rev + "-" + cur.car_identification.serial
            })
            return acc;
        },[]);

        const formatted = this._formatList(
            listData,
            this.thList
        );
        formatted.forEach((element: any, index: any) => {
            _.set(element, 'cars.customize_usage_definitions',
                this.tableData[index].customize_usage_definitions);
        });

        _.set(this.lists, 'originList', formatted);
        _.set(this.lists, 'visibleList', formatted);

        this.isFetching = false;
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
        let result = 0;

        item.customize_definitions.forEach((element: any) => {
            if(this.checkKey(element,'sends_no')){
                result += element.sends_no.length;
            }else{
                result += 1;
            }
        })
        return result;
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
