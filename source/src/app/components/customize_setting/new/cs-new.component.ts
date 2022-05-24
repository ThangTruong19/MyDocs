import { ChangeDetectorRef, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { DateFormat } from 'app/constants/date-format';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { CustomizeSettingService } from 'app/services/customize_setting/customize-setting.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { ModalService } from 'app/services/shared/modal.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { Resources, TableHeader } from 'app/types/common';
import * as _ from 'lodash';

// モーダルからの返却値
interface CustomizeUsageDefinitionResponseData {
    customize_usage_definition_id?: string;
    customize_usage_definition_name?: string;
    customize_usage_definition_version?: number;
    start_date?: string;
    end_date?: string;
    priority?: string;
    priority_name?: string;
    use_kind?: string;
    use_name?: string;
    customize_definitions?: CustomizeDefinitionResponseData[]
}
interface CustomizeDefinitionResponseData {
    customize_definition_id?: string;
    customize_definition_name?: string;
    customize_definition_version?: number;
    priority?: string;
    priority_name?: string;
    active_kind?: string;
    active_name?: string;
    latest_operation_code?: string;
    latest_operation_code_name?: string;
    status?: string;
    status_name?: string;
    assumption_data_value?: number;
    assumption_data_value_header?: number;
    start_date?: string;
    end_date?: string;
    first_receive_datetime?: string;
    latest_receive_datetime?: string;
    aggregation_condition_id?: string;
    aggregation_condition_name?: string;
    aggregation_opportunity_kind?: string;
    aggregation_opportunity_kind_name?: string;
    send_condition_id?: string;
    send_condition_name?: string;
    send_opportunity_kind?: string;
    send_opportunity_kind_name?: string;
    customize_access_level?: string;
    customize_access_level_name?: string;
    process_type?: string;
    process_type_name?: string;
}

/**
 * カスタマイズ設定追加
 */
@Component({
    selector: 'app-cs-new',
    templateUrl: './cs-new.component.html',
    styleUrls: ['./cs-new.component.scss']
})
export class CsNewComponent extends AbstractIndexComponent implements OnInit {
    @Input()
    public carId: string;
    @Input()
    public resources: Resources;
    @Input()
    public initThList: TableHeader[];

    private apiResult: any;
    public modalResponse: CustomizeUsageDefinitionResponseData;

    @ViewChild('customizeDefinitionName') customizeDefinitionName: ElementRef;
    @ViewChild('customizeDefinitionVersion') customizeDefinitionVersion: ElementRef;
    @ViewChild('fromToDatePicker') fromToDatePicker: ElementRef;
    @ViewChild('isEnabled') isEnabled: ElementRef;
    @ViewChild('priority') priority: ElementRef;

    // デートピッカー関連
    beginningWday: number;
    enableDateRange: string[];
    _dateFormat: string;
    timeZone: string;
    datePickerParams: Object;

    _searchParams = {
        car_id: "",
        customize_usage_definition_id: "",
        customize_usage_definition_version: ""
    };
    isInitialize: boolean = true;
    displayDefinitionName: string = '';

    constructor(
        nav: NavigationService,
        title: Title,
        header: CommonHeaderService,
        router: Router,
        private modal: ModalService,
        private cdRef: ChangeDetectorRef,
        private customSettingService: CustomizeSettingService,
        protected userSettingService: UserSettingService,
        protected datePickerService: DatePickerService,
    ) {
        super(nav, title, router, cdRef, header, modal);
        this.shouldDestroyNavigation = false;
    }

    /**
     * Fetching list data for the table in the screen
     */
    protected async fetchList(): Promise<any> {
        // Setting the request parameters before calling API
        this._searchParams.customize_usage_definition_id = (this.customizeDefinitionName as any).itemParams.regist_customize_usage_definition_name;
        this._searchParams.customize_usage_definition_version = (this.customizeDefinitionVersion as any).itemParams.regist_customize_usage_definition_version;
        // Call & fetch data from API
        this.fetchCustomizeSettingData();
        (this.customizeDefinitionName as any).items.forEach((element: any) => {
            if (element.id == this.params.regist_customize_usage_definition_name) this.displayDefinitionName = element.name;
        })
        this.isInitialize = false;
    }

    /**
     * Fetching labels, resources to be displayed in the screen
     */
    protected async _fetchDataForInitialize(): Promise<any> {
        this.labels = this.resources.label;
        this.resource = this.resources.resource;
        this.initialize(this.resources);

        if (this.resource.regist_priority_control_flg.values[0].value) {
            _.set(this.params, 'regist_priority_name', 'high');
        } else {
            _.set(this.params, 'regist_priority_name', 'low');
        }
        this._initializeDatePicker();

        this.thList = this.initThList;

        // FORMAT TABLE
        this.thList.forEach((element: TableHeader) => {
            switch (element.name) {
                case "customize_usage_definitions.customize_usage_definition.customize_definitions.customize_definition_name":
                    element.columnStyle = "width:25%"
                    break;
                case "customize_usage_definitions.customize_usage_definition.customize_definitions.assumption_data_value":
                    element.columnStyle = "width:25%"
                    break;
                case "customize_usage_definitions.customize_usage_definition.customize_definitions.aggregation_condition_name":
                    element.columnStyle = "width:25%"
                    break;
                case "customize_usage_definitions.customize_usage_definition.customize_definitions.send_condition_name":
                    element.columnStyle = "width:25%"
                    break;
            }
        })

        this.sortableThList = this.sortableThLists(this.thList)
    }

    /**
     * デートピッカーを初期化する
     */
    private _initializeDatePicker(): void {
        const datePickerConfig = this.userSettingService.getDatePickerConfig();
        this.beginningWday = datePickerConfig.first_day_of_week_kind;
        const _window = window as any;
        this.enableDateRange = _window.settings.datePickerRange.other;
        this._dateFormat = datePickerConfig.date_format_code;
        this.timeZone = datePickerConfig.time_difference;

        let datePickerParams = {
            timeZone: this.timeZone,
            dateFormat: this._dateFormat,
        };
        this.datePickerService.initialize(datePickerParams);

        _.set(
            this.params,
            'regist_start_date',
            this.datePickerService.toMoment().format(
                DateFormat.slash
            ));
        _.set(
            this.params,
            'regist_end_date',
            this.datePickerService.toMoment().add(1, 'month').format(
                DateFormat.slash
            ));

        const today = this.datePickerService.toMoment();

        _.set(
            this.params,
            'date_from_formatted',
            today
                .clone()
                .subtract(1, 'month')
                .format(this.datePickerService.inputDateFormat(this._dateFormat))
        );
        _.set(this.params, 'date_to', today.format(DateFormat.hyphen));
        _.set(
            this.params,
            'date_to_formatted',
            today.format(this.datePickerService.inputDateFormat(this._dateFormat))
        );
    }

    /**
     * Refresh table's data in case the dropdown [カスタマイズ用途定義名] changes its value
     * @param data New selected option of the dropdown
     */
    refreshCustomizeDefinitionName(data: any): void {
        if (!this.isInitialize) {
            // Setting the request parameters before calling API
            this._searchParams.customize_usage_definition_id = data;
            // Call & fetch data from API
            this.fetchCustomizeSettingData();
            (this.customizeDefinitionName as any).items.forEach((element: any) => {
                if (element.id == this.params.regist_customize_usage_definition_name) this.displayDefinitionName = element.name;
            })
        }
    }

    /**
     * Refresh table's data in case the dropdown [バージョン] changes its value
     * @param data New selected option of the dropdown
     */
    refreshCustomizeDefinitionVersion(data: any): void {
        if (!this.isInitialize) {
            // Setting the request parameters before calling API
            this._searchParams.customize_usage_definition_version = data;
            // Call & fetch data from API
            this.fetchCustomizeSettingData();
        }
    }

    /**
     * Get list data from the API
     */
    async fetchCustomizeSettingData(): Promise<any> {
        this._searchParams.car_id = this.carId;
        // Call & fetch data from API
        this.requestHeaderParams['X-Sort'] = this.sortingParams['sort'] || '';
        this.apiResult = await this.customSettingService.fetchCustomizeSettingList(
            this._searchParams,
            this.requestHeaderParams
        );
        // Format the acquired data to be displayed in the table
        let contents = (this.apiResult.result_data.customize_definitions as any[]).map((cur: any) => {
            return {
                customize_usage_definition: {
                    customize_definitions: {
                        customize_definition_name: cur.customize_definition.customize_definition_name,
                        assumption_data_value: cur.customize_definition.assumption_data_value,
                        aggregation_condition_name: cur.customize_definition.aggregation_condition_name,
                        send_condition_name: cur.customize_definition.send_condition_name,
                    }
                }
            }
        })

        const formatted = this._formatList(contents, this.thList);
        this._fillLists(this.apiResult.result_header, formatted);
    }

    /**
     * Closing dialog callback function
     */
    public closeNewDialog(): void {
        this.modalResponse = {
            customize_usage_definition_id: this.params.regist_customize_usage_definition_name,
            customize_usage_definition_name: (this.customizeDefinitionName as any).items.filter((element: { id: any; }) => element.id == this.params.regist_customize_usage_definition_name)[0].name,
            customize_usage_definition_version: this.params.regist_customize_usage_definition_version,
            start_date: this.datePickerService.convertDateString(this.params.regist_start_date, DateFormat.hyphen, DateFormat.slash),
            end_date: this.datePickerService.convertDateString(this.params.regist_end_date, DateFormat.hyphen, DateFormat.slash),
            priority: this.params.regist_priority_name,
            priority_name: (this.priority as any).items.filter((element: { id: any; }) => element.id == this.params.regist_priority_name)[0].name,
            use_kind: "",
            use_name: "",
            customize_definitions: this._formatListData(this.apiResult.result_data.customize_definitions)
        }
    }

    /**
     * Format list data to be displayed in the caller screen
     * @param List data to be formatted
     * @returns The formatted list data
     */
    private _formatListData(list: any[]): any[] {
        let resultLst: any[] = [];
        list.forEach(element => {
            resultLst.push({
                customize_definition_id: element.customize_definition.customize_definition_id,
                customize_definition_name: element.customize_definition.customize_definition_name,
                customize_definition_version: element.customize_definition.customize_definition_version,
                priority: this.params.regist_priority_name,
                priority_name: (this.priority as any).items.filter((element: { id: any; }) => element.id == this.params.regist_priority_name)[0].name,
                active_kind: this.params.regist_active_name,
                active_name: (this.isEnabled as any).items.filter((element: { id: any; }) => element.id == this.params.regist_active_name)[0].name,
                latest_operation_code: "",
                latest_operation_code_name: "",
                status: "",
                status_name: "",
                assumption_data_value: element.customize_definition.assumption_data_value,
                assumption_data_value_header: element.customize_definition.assumption_data_value_header,
                start_date: this.datePickerService.convertDateString(this.params.regist_start_date, DateFormat.hyphen, DateFormat.slash),
                end_date: this.datePickerService.convertDateString(this.params.regist_end_date, DateFormat.hyphen, DateFormat.slash),
                first_receive_datetime: "",
                latest_receive_datetime: "",
                aggregation_condition_id: element.customize_definition.aggregation_condition_id,
                aggregation_condition_name: element.customize_definition.aggregation_condition_name,
                aggregation_opportunity_kind: element.customize_definition.aggregation_opportunity_kind,
                aggregation_opportunity_kind_name: element.customize_definition.aggregation_opportunity_kind_name,
                send_condition_id: element.customize_definition.send_condition_id,
                send_condition_name: element.customize_definition.send_condition_name,
                send_opportunity_kind: element.customize_definition.send_opportunity_kind,
                send_opportunity_kind_name: element.customize_definition.send_opportunity_kind_name,
                customize_access_level: element.customize_definition.customize_access_level,
                customize_access_level_name: element.customize_definition.customize_access_level_name,
                process_type: element.customize_definition.process_type,
                process_type_name: element.customize_definition.process_type_name
            })
        });
        return resultLst;
    }
}
