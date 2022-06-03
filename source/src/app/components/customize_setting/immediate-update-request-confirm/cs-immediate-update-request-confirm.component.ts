import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { CsDetailService } from 'app/services/customize_setting/cs-detail.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { ModalService } from 'app/services/shared/modal.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { Resources, TableHeader } from 'app/types/common';
import * as _ from 'lodash';

enum EditStatus {
    デフォルト = '0',
    追加 = '1',
    変更 = '2',
    削除 = '3',
}

/**
 * カスタマイズ設定即時更新要求確認
 */
@Component({
    selector: 'app-cs-immediate-update-request-confirm',
    templateUrl: './cs-immediate-update-request-confirm.component.html',
    styleUrls: ['./cs-immediate-update-request-confirm.component.scss']
})
export class CsImmediateUpdateRequestConfirmComponent extends AbstractIndexComponent implements OnInit {
    @Input()
    public carId: string;
    @Input()
    public tableData: any;
    @Input()
    public resources: Resources;
    @Input()
    public initThList: TableHeader[];

    public continuousLabel: string;
    public continuousValue: string;
    public discontinuousLabel: string;
    public discontinousValue: string;

    public isContinued: string = "";
    public showErr: boolean = false;

    private arrayColumnPaths: string[] = [
        'customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_name',
        'customize_usage_definitions.customize_usage_definition.customize_definitions.active_name',
        'customize_usage_definitions.customize_usage_definition.customize_definitions.priority_name',
    ];

    constructor(
        nav: NavigationService,
        title: Title,
        header: CommonHeaderService,
        router: Router,
        private modal: ModalService,
        private cdRef: ChangeDetectorRef,
        protected csDetailService: CsDetailService) {
        super(nav, title, router, cdRef, header, modal);
        this.shouldDestroyNavigation = false;
    }

    protected async fetchList(sortKey?: string): Promise<any> {
        // 画面の初期表示で車両カスタマイズ用途定義詳細取得APIからデータ取得
        this.requestHeaderParams['X-Sort'] = this.sortingParams['sort'] || '';
        const res = await this.csDetailService.fetchIndexList(
            this.carId,
            this.requestHeaderParams
        );

        console.log("res: " + res);

        // ボタン制御 ／ エラーメッセージ表示判定
        let enableOkBtn = true;
        this.tableData.forEach((element: any) => {
            element.customize_usage_definitions.customize_usage_definition.customize_definitions.forEach((item: any) => {
                if(element['customize_usage_definitions.edit_status'] == EditStatus.削除 || (element['customize_usage_definitions.edit_status'] == EditStatus.変更 && item.active_kind == "0")){
                    enableOkBtn = false;
                }else if(element['customize_usage_definitions.edit_status'] == EditStatus.変更 && item.active_kind == "1"){
                    res.result_data.customize_usage_definitions.forEach((data: any) => {
                        if(data.customize_usage_definition.customize_usage_definition_id == element['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id']){
                            if(data.customize_usage_definition.start_date != element['customize_usage_definitions.customize_usage_definition.start_date']
                                || data.customize_usage_definition.end_date != element['customize_usage_definitions.customize_usage_definition.end_date']
                                || data.customize_usage_definition.priority != element['customize_usage_definitions.customize_usage_definition.priority']
                                || data.customize_usage_definition.customize_usage_definition_version != element['customize_usage_definitions.customize_usage_definition.customize_usage_definition_version']){
                                    enableOkBtn = false;
                            }
                        }
                    })
                }
            })
        });

        if(enableOkBtn) {
            // OKボタン活性
            // エラーメッセージ非表示
            this.modalService.enableOk = true;
            this.showErr = false;
        }else{
            // OKボタン非活性
            // エラーメッセージ表示
            this.modalService.enableOk = false;
            this.showErr = true;
        }

        this.isFetching = false;
    }

    protected async _fetchDataForInitialize(): Promise<any> {
        this.continuousLabel = this.resources.resource.continuous_kind.values[0].name;
        this.continuousValue = this.resources.resource.continuous_kind.values[0].value;
        this.discontinuousLabel = this.resources.resource.continuous_kind.values[1].name;
        this.discontinousValue = this.resources.resource.continuous_kind.values[1].value;

        this.labels = this.resources.label;
        this.resource = this.resources.resource;
        this.initialize(this.resources);

        this.thList = this.initThList;

        // Format the acquired data to be displayed in the table
        const apiData = this.tableData.reduce((acc: any, cur: any) => {
            acc.push({
                customize_usage_definition: {
                    customize_usage_definition_id: cur['customize_usage_definitions.customize_usage_definition.customize_usage_definition_id'],
                    customize_usage_definition_name: cur['customize_usage_definitions.customize_usage_definition.customize_usage_definition_name'],
                    start_date: cur['customize_usage_definitions.customize_usage_definition.start_date'],
                    end_date: cur['customize_usage_definitions.customize_usage_definition.end_date'],
                },
                edit_status: cur['customize_usage_definitions.edit_status_name']
            })
            return acc;
        },[])

        const formatted = this._formatList(
            apiData,
            this.thList
        )
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
}
