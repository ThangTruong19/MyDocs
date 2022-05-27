import { JsonPipe } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AbstractIndexComponent } from 'app/components/shared/abstract-component/abstract-index.component';
import { DateTimeFormat } from 'app/constants/date-format';
import { UserSettingService } from 'app/services/api/user-setting.service';
import { CdRequestNumberListService } from 'app/services/customize_data_request/request-number/cd-request-number-tab/cd-request-number-list.service';
import { CdRequestNumberTabService } from 'app/services/customize_data_request/request-number/cd-request-number-tab/cd-request-number-tab.service';
import { CommonHeaderService } from 'app/services/shared/common-header.service';
import { DatePickerService } from 'app/services/shared/date-picker.service';
import { ModalService } from 'app/services/shared/modal.service';
import { NavigationService } from 'app/services/shared/navigation.service';
import { Fields, Resources } from 'app/types/common';
import * as _ from 'lodash';

@Component({
    selector: 'app-cd-request-number-list',
    templateUrl: './cd-request-number-list.component.html',
    styleUrls: ['./cd-request-number-list.component.scss']
})
export class CdRequestNumberListComponent extends AbstractIndexComponent implements OnInit {

    @Input()
    public resources: any;
    @Input()
    public carId: string;

    beginningWday: number;
    _dateFormat: string;
    timeZone: string;
    enableDateRange: string[];
    datePickerParams: any;

    _searchParams = {
        car_id: "",
        customize_definition_id: "",
        datetime_from: "",
        datetime_to: "",
        status: ""
    };

    customize_definition_id: string;
    customize_definition_name: string;
    assumption_data_value: string;

    private arrayColumnPaths: string[] = [
        'request_number.car_customized_definition.car_customize_data_performances.customized_data_achievement_details.car_data_creation_time',
        'request_number.car_customized_definition.car_customize_data_performances.customized_data_achievement_details.server_registration_time',
    ];

    constructor(
        nav: NavigationService,
        title: Title,
        header: CommonHeaderService,
        router: Router,
        private modal: ModalService,
        private cdRef: ChangeDetectorRef,
        private cdRequestNumberTabService: CdRequestNumberTabService,
        private cdRequestNumberListService: CdRequestNumberListService,
        protected userSettingService: UserSettingService,
        private datePickerService: DatePickerService) {
        super(nav, title, router, cdRef, header, modal);
    }

    protected async fetchList(sortKey?: string): Promise<any> {
        this._refreshDataTable();
    }

    protected async _fetchDataForInitialize(): Promise<any> {
        this.labels = this.resources.label;
        this.resource = this.resources.resource;
        this.initialize(this.resources);
        this.thList = this._createThList(this.resources.cdRequestNumberListFields);
        this._afterInitialize();
    }

    public override onClickSearch(): void {
        this._refreshDataTable();
    }

    /**
     * 対象列が配列形式かどうかを判断する。
     * @param pathName 対象列のパス名
     * @returns true：配列、false：配列ではない。
     */
     public isArrayColumnData(pathName: string): boolean {
        return this.arrayColumnPaths.indexOf(pathName) !== -1
    }

    protected async _afterInitialize(): Promise<any> {
        const datePickerConfig = this.userSettingService.getDatePickerConfig();
        this.beginningWday = datePickerConfig.first_day_of_week_kind;
        const _window = window as any;
        this.enableDateRange = _window.settings.datePickerRange.car;

        let dateFormat = datePickerConfig.date_format_code;
        this.timeZone = datePickerConfig.time_difference;

        this.datePickerParams = {
            timeZone: this.timeZone,
            dateFormat: dateFormat,
        };
        this.datePickerService.initialize(this.datePickerParams);
        this._datePickerInitialize();
    }

    /**
     * デートピッカーの初期化
     */
    private async _datePickerInitialize(): Promise<any> {
        const datePickerConfig = this.userSettingService.getDatePickerConfig();
        this.beginningWday = datePickerConfig.first_day_of_week_kind;
        const _window = window as any;
        this.enableDateRange = _window.settings.datePickerRange.other;
        this._dateFormat = datePickerConfig.date_format_code;
        this.timeZone = datePickerConfig.time_difference;

        this.datePickerParams = {
            timeZone: this.timeZone,
            dateFormat: this._dateFormat,
        };

        this.datePickerService.initialize(this.datePickerParams);

        const today = this.datePickerService.toMoment();

        _.set(this.params, 'request_number_datetime_from', today.subtract(1, 'days').format(DateTimeFormat.slash));
        _.set(this.params, 'request_number_datetime_to', today
            .add(23, 'hours')
            .add(59, 'minutes')
            .add(59, 'seconds')
            .format(DateTimeFormat.slash));
    }

    private async _refreshDataTable(): Promise<void> {
        this.isFetching = true;
        // TODO: GETTING CarId FROM THE PARENT SCREEN
        //this._searchParams.car_id = this.carId;

        this._searchParams.car_id = '1';
        this._searchParams.customize_definition_id = this.params.request_number_definition_ids,
            this._searchParams.datetime_from = this.params.request_number_datetime_from;
        this._searchParams.datetime_to = this.params.request_number_datetime_to;
        this._searchParams.status = this.params.request_number_status;

        // Call & fetch data from API
        this.requestHeaderParams['X-Sort'] = this.sortingParams['sort'] || '';
        let apiResult = await this.cdRequestNumberListService.fetchCarTransmissionNumbers(
            this._searchParams,
            this.requestHeaderParams
        );

        this.customize_definition_id = apiResult.result_data.car_customized_definition.customize_definition_id;
        this.customize_definition_name = apiResult.result_data.car_customized_definition.customize_definition_name;
        this.assumption_data_value = apiResult.result_data.car_customized_definition.assumption_data_value;

        // Format the acquired data to be displayed in the table
        const data: any[] = (apiResult.result_data.car_customized_definition.car_customize_data_performances).reduce((acc: any, cur: any) => {
            acc.push({
                car_customized_definition: {
                    car_customize_data_performances: {
                        send_no: cur.send_no,
                        status: cur.status,
                        status_name: cur.status_name,
                        customized_data_achievement_details: cur.customized_data_achievement_details
                    }
                }
            });
            return acc;
        }, []);

        const formatted = this._formatList(data, this.thList);
        formatted.forEach((element: any, index: any) => {
            _.set(element,'request_number.car_customized_definition.car_customize_data_performances.customized_data_achievement_details',
                data[index].car_customized_definition.car_customize_data_performances.customized_data_achievement_details);
        });
        this._fillLists(apiResult.result_header, formatted);

        this.isFetching = false;
    }

}