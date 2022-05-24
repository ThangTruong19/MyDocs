import { Component, Input, OnInit } from '@angular/core';
import { ModalService } from 'app/services/shared/modal.service';
import { Resources, TableHeader, TableMergeColumn } from 'app/types/common';
import * as _ from 'lodash';

/**
 * カスタマイズ設定即時更新要求確認
 */
@Component({
    selector: 'app-cs-immediate-update-request-confirm',
    templateUrl: './cs-immediate-update-request-confirm.component.html',
    styleUrls: ['./cs-immediate-update-request-confirm.component.scss']
})
export class CsImmediateUpdateRequestConfirmComponent implements OnInit {
    @Input()
    public tableData: any;
    @Input()
    public labels: Object;
    @Input()
    public resources: Resources;
    @Input()
    public initThList: TableHeader[];

    public continuousLabel: string;
    public continuousValue: string;
    public discontinuousLabel: string;
    public discontinousValue: string;

    public lists: { visibleList: any[]; originList: any[] } = {
        visibleList: [],
        originList: []
    };

    public sortingParams: { sort: string; sortLabel: string; } = {
        sort: '',
        sortLabel: ''
    };
    public sortableThList: string[] = [];

    public isContinued: string = "";
    thList: TableHeader[] = [];
    public mergeColumns: TableMergeColumn[] = [];
    public isFetching = false;

    constructor(private modalService: ModalService) { }

    ngOnInit(): void {
        this.continuousLabel = this.resources.resource.continuous_kind.values[0].name;
        this.continuousValue = this.resources.resource.continuous_kind.values[0].value;
        this.discontinuousLabel = this.resources.resource.continuous_kind.values[1].name;
        this.discontinousValue = this.resources.resource.continuous_kind.values[1].value;

        this.thList = this.initThList;
        // FORMAT TABLE
        this.thList.forEach((element: TableHeader) => {
            switch (element.name) {
                case "customize_usage_definitions.customize_usage_definition.customize_usage_definition_id":
                    element.columnStyle = "width:5%; text-align: center;"
                    break;
                case "customize_usage_definitions.customize_usage_definition.customize_usage_definition_name":
                    element.columnStyle = "width:20%; text-align: center;"
                    break;
                case "customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_name":
                    element.columnStyle = "width:20%; text-align: center;"
                    break;
                case "customize_usage_definitions.customize_usage_definition.customize_definitions.active_name":
                    element.columnStyle = "width:8%; text-align: center;"
                    break;
                case "customize_usage_definitions.customize_usage_definition.customize_definitions.priority_name":
                    element.columnStyle = "width:9%; text-align: center;"
                    break;
                case "customize_usage_definitions.customize_usage_definition.customize_definitions.latest_operation_code_name":
                    element.columnStyle = "width:9%; text-align: center;"
                    break;
                case "customize_usage_definitions.customize_usage_definition.start_date":
                    element.columnStyle = "width:9%; text-align: center;"
                    break;
                case "customize_usage_definitions.customize_usage_definition.end_date":
                    element.columnStyle = "width:9%; text-align: center;"
                    break;
            }
        })

        this.sortableThList = this._sortableThLists(this.thList);

        const data = this.tableData.reduce((acc: any, cur: any) => {
            const contents = _.get(cur, 'customize_usage_definitions.customize_usage_definition.customize_definitions').map((element: any) => {
                return {
                    customize_usage_definition: {
                        customize_usage_definition_id: cur['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
                        customize_usage_definition_name: cur['customize_usage_definitions.customize_usage_definition.customize_usage_definition_name'],
                        start_date: cur['customize_usage_definitions.customize_usage_definition.start_date'],
                        end_date: cur['customize_usage_definitions.customize_usage_definition.end_date'],
                        customize_definitions: {
                            customize_definition_name: element.customize_definition_name,
                            priority_name: element.priority_name,
                            active_name: element.active_name,
                            latest_operation_code_name: element.latest_operation_code_name,
                        }
                    }
                }
            })
            acc.push(...contents)
            return acc
        }, [])

        const list = this._formatList(
            data,
            this.thList
        )

        _.set(this.lists, 'originList', list);
        _.set(this.lists, 'visibleList', list);

        this.isFetching = false;
        this.mergeColumns = [
            {
                groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
                targetColumn: 'customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'
            },
            {
                groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
                targetColumn: 'customize_usage_definitions.customize_usage_definition.customize_usage_definition_name'
            },
            {
                groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
                targetColumn: 'customize_usage_definitions.customize_usage_definition.customize_definitions.active_name'
            },
            {
                groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
                targetColumn: 'customize_usage_definitions.customize_usage_definition.customize_definitions.priority_name'
            },
            {
                groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
                targetColumn: 'customize_usage_definitions.customize_usage_definition.customize_definitions.latest_operation_code_name'
            },
            {
                groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
                targetColumn: 'customize_usage_definitions.customize_usage_definition.start_date'
            },
            {
                groupByColumns: ['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
                targetColumn: 'customize_usage_definitions.customize_usage_definition.end_date'
            }
        ]

    }

    changeRadioValue(): void{
        this.modalService.enableOk = true;
    }

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

    /**
     * ソート項目リストを返却します。
     * @param thList テーブル項目リスト
     * @return ソート項目リスト
     */
     private _sortableThLists(thList: TableHeader[]): string[] {
        return _.reduce(
            thList,
            (array: any[], th: TableHeader) => {
                if (th.sortable) {
                    array.push(th.name);
                }
                return array;
            },
            []
        );
    }
}
