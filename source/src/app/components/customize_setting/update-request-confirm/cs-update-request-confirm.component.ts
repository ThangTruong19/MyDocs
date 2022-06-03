import { Component, Input, OnInit } from '@angular/core';
import { TableHeader } from 'app/types/common';
import * as _ from 'lodash';

/**
 * カスタマイズ設定更新要求確認
 */
@Component({
    selector: 'app-cs-update-request-confirm',
    templateUrl: './cs-update-request-confirm.component.html',
    styleUrls: ['./cs-update-request-confirm.component.scss']
})
export class CsUpdateRequestConfirmComponent implements OnInit {
    @Input()
    public tableData: any;
    @Input()
    public labels: Object;
    @Input()
    public initThList: TableHeader[];

    thList: TableHeader[] = [];

    private arrayColumnPaths: string[] = [
        'customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_name',
        'customize_usage_definitions.customize_usage_definition.customize_definitions.active_name',
        'customize_usage_definitions.customize_usage_definition.customize_definitions.priority_name',
    ];

    public lists: { visibleList: any[]; originList: any[] } = {
        visibleList: [],
        originList: []
    };

    public sortingParams: { sort: string; sortLabel: string; } = {
        sort: '',
        sortLabel: ''
    };
    public sortableThList: string[] = [];

    public isFetching = false;

    constructor() { }

    ngOnInit(): void {
        this.thList = this.initThList;

        // Format the acquired data to be displayed in the table
        const apiData = this.tableData.reduce((acc: any, cur: any) => {
            acc.push({
                customize_usage_definition: {
                    customize_usage_definition_id: cur['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
                    customize_usage_definition_name: cur['customize_usage_definitions.customize_usage_definition.customize_usage_definition_name'],
                    start_date: cur['customize_usage_definitions.customize_usage_definition.start_date'],
                    end_date: cur['customize_usage_definitions.customize_usage_definition.end_date']
                },
                edit_status: cur['customize_usage_definitions.edit_status_name']
            })
            return acc;
        },[])

        const formatted = this._formatList(
            apiData,
            this.thList
        );
        formatted.forEach((element: any, index: any) => {
            _.set(element, 'customize_usage_definitions.customize_usage_definition.customize_definitions',
                this.tableData[index].customize_usage_definitions.customize_usage_definition.customize_definitions);
        });

        // Sorting the displayed data
        let sortKey = "customize_usage_definitions.customize_usage_definition.customize_usage_definition_id";
        formatted.sort((a: any,b: any) => {
            if(a[sortKey] > b[sortKey]){
                return 1;
            }else if(a[sortKey] == b[sortKey]){
                return 0;
            }else{
                return -1;
            }
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
     * Setting column width
     * @param col Column Information
     */
    public setTableWidth(col: TableHeader): string{
        switch (col.name) {
            case "customize_usage_definitions.customize_usage_definition.customize_usage_definition_id":
                return "width:5%; text-align: center;"
            case "customize_usage_definitions.customize_usage_definition.customize_usage_definition_name":
                return "width:20%; text-align: center;"
            case "customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_name":
                return "width:25%; text-align: center;"
            case "customize_usage_definitions.customize_usage_definition.customize_definitions.active_name":
                return "width:12%; text-align: center;"
            case "customize_usage_definitions.customize_usage_definition.customize_definitions.priority_name":
                return "width:9%; text-align: center;"
            case "customize_usage_definitions.edit_status":
                return "width:9%; text-align: center;"
            case "customize_usage_definitions.customize_usage_definition.start_date":
                return "width:10%; text-align: center;"
            case "customize_usage_definitions.customize_usage_definition.end_date":
                return "width:10%; text-align: center;"
            default:
                return "width:5%; text-align: center;"
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
